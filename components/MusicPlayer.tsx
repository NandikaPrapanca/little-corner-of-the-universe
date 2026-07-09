'use client';

/**
 * MusicPlayer.tsx
 * Floating music player — top-right corner.
 *
 * Now reads from AudioContext (managed by AudioProvider).
 * Audio only starts after a user gesture (envelope click or play button press).
 * Never autoplays.
 *
 * Design:
 * - Pill-shaped, glass surface
 * - Collapsed by default — click the note icon to expand
 * - Minimal and elegant, not a dashboard widget
 */

import { useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music2 } from 'lucide-react';
import { AudioContext } from '@/components/AudioProvider';
import { useState } from 'react';

export default function MusicPlayer() {
  const audio = useContext(AudioContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlayPause = useCallback(async () => {
    if (!audio) return;
    if (audio.isPlaying) {
      audio.pause();
    } else {
      await audio.requestPlay();
    }
  }, [audio]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    audio?.setVolume(parseFloat(e.target.value));
  }, [audio]);

  // If AudioProvider isn't mounted (shouldn't happen, but guard anyway)
  if (!audio) return null;

  const { isPlaying, isMuted, volume, isLoaded } = audio;
  const displayVolume = isMuted ? 0 : volume;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
      role="region"
      aria-label="Music player"
    >
      <div
        className="glass-card flex items-center gap-2 px-3 py-2"
        style={{ borderRadius: '999px' }}
      >
        {/* ── Music icon — toggle expand ──────────────────────────── */}
        <button
          className="music-btn"
          onClick={() => setIsExpanded((p) => !p)}
          aria-label={isExpanded ? 'Collapse music player' : 'Expand music player'}
          aria-expanded={isExpanded}
        >
          <Music2
            size={14}
            style={{
              color: isPlaying ? '#89CFF0' : 'rgba(203,213,225,0.6)',
              transition: 'color 0.3s ease',
            }}
          />
        </button>

        {/* ── Expanded controls ───────────────────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex items-center gap-2 overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Track name */}
              <span
                style={{
                  fontFamily:   'var(--font-inter)',
                  fontSize:     '0.6875rem',
                  fontWeight:   300,
                  color:        'rgba(203,213,225,0.7)',
                  whiteSpace:   'nowrap',
                  maxWidth:     '96px',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  fontStyle:    'italic',
                }}
              >
                City of Stars
              </span>

              {/* Play / Pause */}
              <button
                className="music-btn"
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                disabled={!isLoaded}
                style={{ opacity: isLoaded ? 1 : 0.35 }}
                title={!isLoaded ? 'Loading audio…' : undefined}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>

              {/* Mute toggle */}
              <button
                className="music-btn"
                onClick={audio.toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                aria-pressed={isMuted}
              >
                {isMuted
                  ? <VolumeX size={13} style={{ color: 'rgba(203,213,225,0.35)' }} />
                  : <Volume2 size={13} />
                }
              </button>

              {/* Volume slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={displayVolume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                style={{
                  width:        '52px',
                  accentColor:  '#89CFF0',
                  cursor:       'pointer',
                  height:       '2px',
                  borderRadius: '999px',
                  outline:      'none',
                  background:   `linear-gradient(to right, rgba(137,207,240,0.7) ${displayVolume * 100}%, rgba(203,213,225,0.15) ${displayVolume * 100}%)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Playing pulse dot ──────────────────────────────────────── */}
      {isPlaying && (
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
          style={{ backgroundColor: '#89CFF0' }}
          animate={{ opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}
