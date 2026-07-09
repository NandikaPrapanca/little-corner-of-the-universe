'use client';

/**
 * AudioProvider.tsx
 * Shared audio context — single source of truth for all audio state.
 *
 * One HTMLAudioElement, created on mount, referenced via React context.
 * Both MusicPlayer and Landing's envelope button read from this same context.
 *
 * Audio only plays after an explicit user gesture (requestPlay).
 * Never autoplays on page load.
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
  requestPlay: () => Promise<void>;
  pause:       () => void;
  toggleMute:  () => void;
  setVolume:   (v: number) => void;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

// Correct path — file is city-of-stars.mp3 (single extension)
const AUDIO_SRC = '/audio/city-of-stars.mp3';

export default function AudioProvider({ children }: AudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isMuted,     setIsMuted]     = useState(false);
  const [volume,      setVolumeState] = useState(0.6);
  const [isLoaded,    setIsLoaded]    = useState(false);
  const [hasError,    setHasError]    = useState(false);

  // ── Create the HTMLAudioElement exactly once on mount ─────────────────
  useEffect(() => {
    console.log('[AudioProvider] Mounting. Audio source:', AUDIO_SRC);

    const audio = new Audio(AUDIO_SRC);
    audio.loop    = true;
    audio.volume  = 0.6;
    audio.preload = 'auto'; // 'auto' so the browser buffers immediately

    const onCanPlay = () => {
      console.log('[AudioProvider] Audio ready to play (canplaythrough)');
      setIsLoaded(true);
    };

    const onError = () => {
      const err = audio.error;
      console.error(
        '[AudioProvider] Failed to load audio.',
        '\n  src :', AUDIO_SRC,
        '\n  code:', err?.code,
        '\n  msg :', err?.message,
      );
      setHasError(true);
    };

    const onEnded = () => setIsPlaying(false);

    // canplaythrough = enough buffered to play without stopping
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error',          onError);
    audio.addEventListener('ended',          onEnded);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error',          onError);
      audio.removeEventListener('ended',          onEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // ── Keep audio element in sync with volume/mute state ────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── requestPlay ───────────────────────────────────────────────────────
  // Does NOT close over `isPlaying` state — reads the audio element's
  // own .paused property instead, which is always current.
  // This avoids the stale-closure bug where the callback captures an
  // outdated value of isPlaying and silently skips the play() call.
  const requestPlay = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      console.warn('[AudioProvider] requestPlay called but audio element is null');
      return;
    }

    // Use the element's own paused state — immune to stale closure
    if (!audio.paused) {
      console.log('[AudioProvider] requestPlay: already playing, skipping');
      return;
    }

    console.log('[AudioProvider] requestPlay: calling audio.play()');

    try {
      await audio.play();
      console.log('[AudioProvider] Playback started successfully');
      setIsPlaying(true);
    } catch (err) {
      // NotAllowedError = browser blocked because no user gesture preceded this
      // NotSupportedError = codec/format issue
      console.error('[AudioProvider] audio.play() rejected:', err);
      setIsPlaying(false);
    }
  }, []); // no dependencies — reads from ref, never stale

  // ── pause ─────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  // ── toggleMute ────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // ── setVolume ─────────────────────────────────────────────────────────
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (v > 0) setIsMuted(false);
  }, []);

  const value: AudioContextValue = {
    isPlaying,
    isMuted,
    volume,
    isLoaded,
    hasError,
    requestPlay,
    pause,
    toggleMute,
    setVolume,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
