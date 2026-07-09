'use client';

/**
 * MusicPlayer.tsx
 * Floating music player — top-right corner.
 *
 * Includes Kuromi as a peeking mascot below the player pill.
 * Kuromi is purely decorative (aria-hidden, pointerEvents none).
 * The player pill and all its buttons remain fully interactive.
 */

import { useContext, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music2 } from 'lucide-react';
import { AudioContext } from '@/components/AudioProvider';

// ─── Kuromi mascot ────────────────────────────────────────────────────────

interface KuroميProps {
  isPlaying:    boolean;
  isHovered:    boolean;
  shouldReduce: boolean;
}

function Kuromi({ isPlaying, isHovered, shouldReduce }: KuroميProps) {
  // Track whether we should play the "happy bounce" and when
  const [happyBounce, setHappyBounce] = useState(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // While playing: trigger a happy bounce every 7–9 seconds
  useEffect(() => {
    if (shouldReduce || !isPlaying) {
      if (bounceIntervalRef.current) clearInterval(bounceIntervalRef.current);
      if (bounceTimerRef.current)    clearTimeout(bounceTimerRef.current);
      setHappyBounce(false);
      return;
    }

    function triggerBounce() {
      setHappyBounce(true);
      bounceTimerRef.current = setTimeout(() => setHappyBounce(false), 600);
    }

    // Initial delay so it doesn't fire immediately on play
    bounceTimerRef.current = setTimeout(() => {
      triggerBounce();
      // Then repeat every 8 seconds ± 1s of jitter
      bounceIntervalRef.current = setInterval(triggerBounce, 8000);
    }, 2500);

    return () => {
      if (bounceIntervalRef.current) clearInterval(bounceIntervalRef.current);
      if (bounceTimerRef.current)    clearTimeout(bounceTimerRef.current);
    };
  }, [isPlaying, shouldReduce]);

  // ── Compute animation state ──────────────────────────────────────────
  // Priority: happyBounce > isHovered > idle float
  const animate = (() => {
    if (shouldReduce) return {};
    if (happyBounce)  return { y: -6, rotate: 0,  scale: 1.06 };
    if (isHovered)    return { y: -2, rotate: 6,  scale: 1.02 };
    // Idle — handled by the looping animation below, return resting state
    return { rotate: 0, scale: 1 };
  })();

  const transition = (() => {
    if (shouldReduce) return { duration: 0 };
    if (happyBounce)  return { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as const };
    if (isHovered)    return { duration: 0.3,  ease: 'easeOut' as const };
    return { duration: 0.4, ease: 'easeOut' as const };
  })();

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position:      'absolute',
        // Sit below the pill, offset left so she peeks from the left-bottom
        // The pill is roughly 36px tall; Kuromi is ~80px tall on desktop.
        // bottom: -80 puts her feet at the bottom of the pill container,
        // with her head peeking up behind the left side of the pill.
        bottom:        '-72px',
        left:          '-8px',
        width:         'clamp(50px, 10vw, 80px)',
        height:        'clamp(50px, 10vw, 80px)',
        pointerEvents: 'none', // never intercepts clicks
        zIndex:        -1,     // sits behind the pill
        display:       'flex',
        alignItems:    'flex-end',
        justifyContent: 'center',
        transformOrigin: '50% 100%', // rotate from feet
        // Idle floating — runs always unless reduced motion
        ...(shouldReduce ? {} : {}),
      }}
      // Idle float — runs continuously; overridden by specific animate states
      animate={shouldReduce ? {} : {
        y: happyBounce
          ? -6
          : isHovered
            ? -2
            : [0, -3, 0],
        rotate: isHovered ? 6 : 0,
        scale:  happyBounce ? 1.06 : 1,
      }}
      transition={
        shouldReduce
          ? { duration: 0 }
          : happyBounce
            ? { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }
            : isHovered
              ? { duration: 0.3, ease: 'easeOut' }
              : {
                  // Idle float — looping
                  y: { duration: 4.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                  rotate: { duration: 0.4, ease: 'easeOut' },
                  scale:  { duration: 0.4, ease: 'easeOut' },
                }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/characters/kuromi/kuromi.webp"
        alt=""
        style={{
          width:          '100%',
          height:         '100%',
          objectFit:      'contain',
          objectPosition: 'bottom center',
          // Soften the image slightly so she feels painted, not pasted
          filter:         'drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
        }}
      />
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const audio        = useContext(AudioContext);
  const shouldReduce = useReducedMotion() ?? false;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered,  setIsHovered]  = useState(false);

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

  if (!audio) return null;

  const { isPlaying, isMuted, volume, isLoaded } = audio;
  const displayVolume = isMuted ? 0 : volume;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      // overflow visible so Kuromi can extend below the fixed container
      style={{ overflow: 'visible' }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
      role="region"
      aria-label="Music player"
      // Hover state propagates to Kuromi
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* ── Kuromi — peeking mascot ──────────────────────────────────── */}
      <Kuromi
        isPlaying={isPlaying}
        isHovered={isHovered}
        shouldReduce={shouldReduce}
      />

      {/* ── Player pill ──────────────────────────────────────────────── */}
      <div
        className="glass-card flex items-center gap-2 px-3 py-2"
        style={{ borderRadius: '999px', position: 'relative', zIndex: 1 }}
      >
        {/* Music icon — toggle expand */}
        <motion.button
          className="music-btn"
          onClick={() => setIsExpanded((p) => !p)}
          aria-label={isExpanded ? 'Collapse music player' : 'Expand music player'}
          aria-expanded={isExpanded}
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={
            isPlaying
              ? { duration: 12, repeat: Infinity, ease: 'linear' }
              : { duration: 0.6, ease: 'easeOut' }
          }
          whileHover={{ filter: 'brightness(1.4)' }}
        >
          <Music2
            size={14}
            style={{
              color:      isPlaying ? '#89CFF0' : 'rgba(203,213,225,0.6)',
              transition: 'color 0.3s ease',
            }}
          />
        </motion.button>

        {/* Expanded controls */}
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
                style={{ opacity: isLoaded ? 1 : 0.55 }}
                title={!isLoaded ? 'Buffering…' : undefined}
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

      {/* Playing pulse dot */}
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
