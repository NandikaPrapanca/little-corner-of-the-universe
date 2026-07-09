'use client';

/**
 * AudioProvider.tsx
 * Provides a shared audio context so the Landing envelope button
 * and the MusicPlayer can coordinate a single <audio> element.
 *
 * Design:
 * - One <audio> element, mounted here, referenced via context
 * - requestPlay() is the safe entrypoint — only fires after a user gesture
 * - MusicPlayer reads state from here instead of owning its own audio element
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
  isPlaying:    boolean;
  isMuted:      boolean;
  volume:       number;
  isLoaded:     boolean;
  hasError:     boolean;
  requestPlay:  () => Promise<void>;
  pause:        () => void;
  toggleMute:   () => void;
  setVolume:    (v: number) => void;
}

export const AudioContext = createContext<AudioContextValue | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

// The actual audio file path in /public
// Note: the file was uploaded as city-of-stars.mp3.mp3
const AUDIO_SRC = '/audio/city-of-stars.mp3.mp3';

export default function AudioProvider({ children }: AudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [volume,    setVolumeState] = useState(0.5);
  const [isLoaded,  setIsLoaded]  = useState(false);
  const [hasError,  setHasError]  = useState(false);

  // ── Create audio element once on mount ───────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.src     = AUDIO_SRC;
    audio.loop    = true;
    audio.volume  = 0.5;
    audio.preload = 'metadata';

    audio.addEventListener('canplay', () => setIsLoaded(true));
    audio.addEventListener('ended',   () => setIsPlaying(false));
    audio.addEventListener('error',   () => {
      setHasError(true);
      console.warn(
        '[AudioProvider] Audio file could not be loaded.',
        '\nExpected at: /public' + AUDIO_SRC,
        '\nBrowser autoplay or file-not-found may be the cause.',
      );
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ── Sync volume & mute to the audio element ──────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── requestPlay — only safe to call from a user gesture ──────────────
  const requestPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isPlaying) return;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      // Browser policy blocked play — this is expected without a user gesture
      console.warn('[AudioProvider] Play prevented by browser policy:', err);
    }
  }, [isPlaying]);

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
