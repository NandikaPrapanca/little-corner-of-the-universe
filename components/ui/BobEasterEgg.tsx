'use client';

/**
 * BobEasterEgg.tsx
 * A small hidden companion — Bob the bear — tucked into five locations
 * across the website.
 *
 * Design intent:
 *   Bob should feel like a quiet discovery, not a UI element.
 *   He does NOT navigate anywhere, trigger modals, or demand attention.
 *   Hover reveals a tiny tooltip and a gentle head-tilt — that's all.
 *
 * Animations (all inactive when prefers-reduced-motion is set):
 *   Idle breathing — scaleY 1 ↔ 1.025, 4s loop
 *   Idle sway      — rotate ±1.5°, 5s loop, offset from breathing
 *   Blink          — random interval 3–7s, 120ms closed
 *   Hover          — scale up 15%, rotate 6°, soft drop-shadow brightens
 *
 * Usage:
 *   <BobEasterEgg style={{ position: 'absolute', bottom: 8, right: -20 }} />
 *
 * The parent element MUST have position: relative (or any non-static
 * position) for Bob to anchor correctly.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion }     from 'framer-motion';

interface BobEasterEggProps {
  /** Inline style for positioning — use absolute/relative offsets */
  style?:        React.CSSProperties;
  /** Extra className on the outer wrapper */
  className?:    string;
  /** Flip horizontally so Bob faces left */
  flipX?:        boolean;
}

export default function BobEasterEgg({
  style,
  className  = '',
  flipX      = false,
}: BobEasterEggProps) {
  const shouldReduce = useReducedMotion() ?? false;

  // ── Blink state ────────────────────────────────────────────────────
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shouldReduce) return;

    function scheduleBlink() {
      const delay = 3000 + Math.random() * 4000; // 3–7s
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 120);
      }, delay);
    }

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [shouldReduce]);

  // ── Hover state ────────────────────────────────────────────────────
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={className}
      style={{
        // Sizing — fluid between mobile (28px) and desktop (52px)
        width:         'clamp(28px, 5.5vw, 52px)',
        height:        'clamp(28px, 5.5vw, 52px)',
        // Flip if facing left
        transform:     flipX ? 'scaleX(-1)' : undefined,
        // Never block story text interactions
        pointerEvents: 'auto',
        cursor:        'default',
        // User-select off so accidental drags don't select "Bob says hi"
        userSelect:    'none',
        position:      'relative',
        zIndex:        2,
        ...style,
      }}
      // Idle breathing — compound animation via children
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={()   => setIsHovered(false)}
      title="Bob says hi! 🧸"
      role="img"
      aria-label="Bob the bear — a hidden companion"
    >
      {/* ── Breathing wrapper ──────────────────────────────────── */}
      <motion.div
        style={{ width: '100%', height: '100%', transformOrigin: '50% 100%' }}
        animate={shouldReduce ? {} : {
          scaleY: isHovered ? 1 : [1, 1.025, 1],
          rotate: isHovered
            ? 6
            : [0, 1.5, 0, -1.5, 0],
        }}
        transition={shouldReduce ? {} : isHovered
          ? { duration: 0.3, ease: 'easeOut' }
          : {
              scaleY: { duration: 4,   repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
              rotate: { duration: 5,   repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.8 },
            }
        }
      >
        {/* ── Scale on hover ──────────────────────────────────── */}
        <motion.div
          style={{ width: '100%', height: '100%' }}
          animate={shouldReduce ? {} : {
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* ── Bob image ─────────────────────────────────────── */}
          {/*
            objectPosition: bottom — anchors at his feet so the
            breathing scale animation looks natural.
            The blink overlay simulates closed eyes — it's a semi-
            transparent strip across the eye area of the image.
            Bob's actual eye position is roughly 35–50% from top.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/characters/bob/bob.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              width:          '100%',
              height:         '100%',
              objectFit:      'contain',
              objectPosition: 'bottom center',
              display:        'block',
              filter:         isHovered
                ? 'drop-shadow(0 2px 8px rgba(137,207,240,0.35)) brightness(1.08)'
                : 'drop-shadow(0 1px 4px rgba(0,0,0,0.4))',
              transition:     'filter 0.25s ease',
            }}
          />

          {/* ── Blink overlay ─────────────────────────────────── */}
          {/*
            A thin translucent strip that covers Bob's approximate
            eye region when isBlinking is true. Uses the navy
            background color at medium opacity — gentle, not harsh.
          */}
          {isBlinking && (
            <div
              aria-hidden="true"
              style={{
                position:   'absolute',
                top:        '34%',
                left:       '15%',
                right:      '15%',
                height:     '12%',
                background: 'rgba(7,24,39,0.55)',
                borderRadius: '40%',
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* ── Tooltip — visible on hover, positioned above Bob ──── */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position:      'absolute',
            bottom:        'calc(100% + 6px)',
            left:          '50%',
            transform:     `translateX(-50%)${flipX ? ' scaleX(-1)' : ''}`,
            whiteSpace:    'nowrap',
            fontFamily:    'var(--font-inter)',
            fontSize:      '0.6875rem',
            fontWeight:    300,
            color:         'rgba(203,213,225,0.85)',
            background:    'rgba(16,37,61,0.88)',
            backdropFilter: 'blur(8px)',
            border:        '1px solid rgba(137,207,240,0.12)',
            borderRadius:  '8px',
            padding:       '4px 10px',
            pointerEvents: 'none',
            zIndex:        10,
          }}
        >
          Bob says hi! 🧸
        </motion.div>
      )}
    </motion.div>
  );
}
