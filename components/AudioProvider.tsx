'use client';

/**
 * AudioProvider.tsx
 * Shared audio context — single source of truth for all audio state.
 *
 * Audio starts ONLY after an explicit user interaction via playFaded().
 * There is no autoplay.
 *
 * Public interface (AudioContextValue):
 *   isPlaying   — true while playing
 *   isMuted     — true when muted
 *   volume      — user's chosen volume (0–1), default 0.6
 *   isLoaded    — true once 'canplaythrough' fires
 *   hasError    — true if the file failed to load
 *   playFaded   — start playback with a volume fade-in (for first interaction)
 *   requestPlay — start playback at current volume (for button/envelope)
 *   pause       — pause playback
 *   toggleMute  — flip mute state
 *   setVolume   — set volume imperatively (used by PomTransition duck)
 */

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface AudioContextValue {
  isPlaying:   boolean;
  isMuted:     boolean;
  volume:      number;
  isLoaded:    boolean;
  hasError:    boolean;
  /** Start at volume 0 and fade to targetVolume over fadeMs. */
  playFaded:   (targetVolume?: number, fadeMs?: number) => Promise<void>;
  requestPlay: () => Promise<void>;
  pause:       () => void;
  toggleMute:  () => void;
  setVolume:   (v: number) => void;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

const AUDIO_SRC     = '/audio/city-of-stars.mp3';
const TARGET_VOLUME = 0.6;
const VIS_DUCK      = 0.4;

// ─── Smooth volume fade ───────────────────────────────────────────────────

function fadeVolume(
  audio:      HTMLAudioElement,
  target:     number,
  durationMs: number,
  steps:      number,
): () => void {
  const start    = audio.volume;
  const delta    = target - start;
  const stepMs   = durationMs / steps;
  let   step     = 0;
  let   timerId: ReturnType<typeof setTimeout>;
  let   cancelled = false;

  function tick() {
    if (cancelled) return;
    step++;
    audio.volume = Math.min(1, Math.max(0, start + delta * (step / steps)));
    if (step < steps) timerId = setTimeout(tick, stepMs);
  }

  timerId = setTimeout(tick, stepMs);
  return () => { cancelled = true; clearTimeout(timerId); };
}

// ─── Provider ─────────────────────────────────────────────────────────────

interface AudioProviderProps {
  children: ReactNode;
}

export default function AudioProvider({ children }: AudioProviderProps) {
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);
  // Tracks user's intended volume so visibility duck can restore correctly
  const userVolumeRef = useRef<number>(TARGET_VOLUME);

  const [isPlaying,  setIsPlaying]   = useState(false);
  const [isMuted,    setIsMuted]     = useState(false);
  const [volume,     setVolumeState] = useState(TARGET_VOLUME);
  const [isLoaded,   setIsLoaded]    = useState(false);
  const [hasError,   setHasError]    = useState(false);

  // ── Create audio element on mount ─────────────────────────────────────
  useEffect(() => {
    const audio   = new Audio(AUDIO_SRC);
    audio.loop    = true;
    audio.volume  = 0;       // always start silent; playFaded will raise it
    audio.preload = 'auto';

    const onCanPlayThrough = () => setIsLoaded(true);
    const onError = () => { if (audio.error) setHasError(true); };
    const onEnded = () => setIsPlaying(false);
    const onPause = () => { if (!audio.ended) setIsPlaying(false); };
    const onPlay  = () => setIsPlaying(true);

    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('error',          onError);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('play',           onPlay);

    audioRef.current = audio;

    return () => {
      if (cancelFadeRef.current) cancelFadeRef.current();
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('error',          onError);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('play',           onPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // ── Page visibility — duck/restore ────────────────────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;
      if (cancelFadeRef.current) cancelFadeRef.current();

      cancelFadeRef.current = fadeVolume(
        audio,
        document.hidden
          ? userVolumeRef.current * VIS_DUCK
          : userVolumeRef.current,
        document.hidden ? 600 : 800,
        document.hidden ? 12  : 16,
      );
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ── Sync mute state ───────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : userVolumeRef.current;
  }, [isMuted]);

  // ── playFaded — first-interaction entry point ─────────────────────────
  // Starts at volume 0 and fades to targetVolume over fadeMs.
  // This is the correct entry point for FirstInteraction.
  const playFaded = useCallback(async (
    targetVolume = TARGET_VOLUME,
    fadeMs       = 2000,
  ) => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    // Ensure we start at 0 for a clean fade-in
    audio.volume        = 0;
    userVolumeRef.current = targetVolume; // set user intent now

    try {
      await audio.play();
      setIsPlaying(true);
      // Fade from 0 → targetVolume
      if (cancelFadeRef.current) cancelFadeRef.current();
      cancelFadeRef.current = fadeVolume(audio, targetVolume, fadeMs, 40);
      // Sync React state at the end of the fade
      setTimeout(() => setVolumeState(targetVolume), fadeMs);
    } catch {
      // Browser still blocked — leave paused, button works normally
    }
  }, []);

  // ── requestPlay — button / envelope entry point ───────────────────────
  const requestPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    // Restore to intended volume if element is at 0
    if (audio.volume === 0 && !isMuted) {
      audio.volume = userVolumeRef.current;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      // Silently ignore
    }
  }, [isMuted]);

  // ── pause ─────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (cancelFadeRef.current) cancelFadeRef.current();
    audio.pause();
    setIsPlaying(false);
  }, []);

  // ── toggleMute ────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => setIsMuted(p => !p), []);

  // ── setVolume — used by MusicPlayer slider and PomTransition duck ──────
  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    userVolumeRef.current = clamped;
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);

    const audio = audioRef.current;
    if (!audio) return;
    if (cancelFadeRef.current) {
      cancelFadeRef.current();
      cancelFadeRef.current = null;
    }
    audio.volume = clamped;
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying, isMuted, volume, isLoaded, hasError,
      playFaded, requestPlay, pause, toggleMute, setVolume,
    }}>
      {children}
    </AudioContext.Provider>
  );
}
