'use client';

/**
 * JourneyIndicator.tsx
 * Six tiny fixed stars at the bottom-center of the screen.
 *
 * Each star corresponds to one section of the story:
 *   1 — landing
 *   2 — chapter-one
 *   3 — chapter-two
 *   4 — chapter-three
 *   5 — chapter-four
 *   6 — pom-transition (letter / ending)
 *
 * A star becomes "active" when its section is ≥ 45% visible in the
 * viewport (measured by IntersectionObserver). Scrolling backward
 * correctly de-activates stars — the active index always reflects
 * the highest section that is currently at-or-past the threshold.
 *
 * Visual design:
 *   Active  — warm ivory (#F6F1E8), scale 1, soft glow
 *   Inactive — low-opacity blue tint, scale 0.75, no glow
 *   Activation — scale 0.7 → 1, opacity 0 → 1, brief glow pulse, 500ms
 *
 * This must feel like stars quietly appearing in the night sky.
 * Not a progress bar. Not a nav. Just six patient stars.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion }     from 'framer-motion';

// ─── Section mapping ──────────────────────────────────────────────────────

const SECTIONS: { id: string; label: string }[] = [
  { id: 'landing',         label: 'Opening'       },
  { id: 'chapter-one',     label: 'Chapter One'   },
  { id: 'chapter-two',     label: 'Chapter Two'   },
  { id: 'chapter-three',   label: 'Chapter Three' },
  { id: 'chapter-four',    label: 'Chapter Four'  },
  { id: 'pom-transition',  label: 'The Letter'    },
];

// ─── Single star ──────────────────────────────────────────────────────────

interface StarProps {
  active:       boolean;
  wasActive:    boolean; // true if it was previously inactive and just became active
  shouldReduce: boolean;
  label:        string;
  index:        number;
}

function Star({ active, wasActive, shouldReduce, label, index }: StarProps) {
  // Four-point star SVG path in a 10×10 viewBox
  const starPath = 'M5 0 L5.55 4.45 L10 5 L5.55 5.55 L5 10 L4.45 5.55 L0 5 L4.45 4.45 Z';

  return (
    <motion.div
      // Outer wrapper handles position/spacing — inner handles scale
      style={{
        position:   'relative',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:  '20px',
        height: '20px',
      }}
      // Accessible label for screen readers (visually hidden via SVG aria-hidden)
      role="img"
      aria-label={`${label}: ${active ? 'visited' : 'not yet reached'}`}
    >
      {/* ── Glow halo — only visible when active ───────────────── */}
      {active && (
        <motion.div
          aria-hidden="true"
          style={{
            position:     'absolute',
            inset:        '-6px',
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(246,241,232,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          // Brief pulse when first activating, then settle to a gentle breathe
          initial={wasActive ? false : { opacity: 0, scale: 0.5 }}
          animate={
            shouldReduce
              ? { opacity: 1 }
              : {
                  opacity: [0.6, 1, 0.5],
                  scale:   [0.9, 1.15, 0.95],
                }
          }
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  duration: 0.5,
                  ease:     'easeOut',
                  times:    [0, 0.4, 1],
                  // After initial burst, loop a very slow breathe
                  repeat:      Infinity,
                  repeatDelay: 2.5,
                  repeatType:  'loop',
                }
          }
        />
      )}

      {/* ── The star itself ────────────────────────────────────── */}
      <motion.svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ display: 'block', willChange: 'transform, opacity' }}
        // Entry animation when first becoming active
        initial={
          shouldReduce || wasActive
            ? false
            : active
              ? { opacity: 0, scale: 0.7 }
              : false
        }
        animate={
          active
            ? { opacity: 1,   scale: 1    }
            : { opacity: 0.28, scale: 0.75 }
        }
        transition={
          shouldReduce
            ? { duration: 0 }
            : {
                duration: 0.5,
                ease:     [0.25, 0.1, 0.25, 1],
                delay:    active && !wasActive ? index * 0.02 : 0,
              }
        }
      >
        <path
          d={starPath}
          fill={active ? '#F6F1E8' : '#89AACC'}
        />
      </motion.svg>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function JourneyIndicator() {
  const shouldReduce = useReducedMotion() ?? false;

  // Which sections are currently intersecting at ≥ 45%
  const [intersecting, setIntersecting] = useState<Set<string>>(new Set());

  // Previous active set — used to detect "first activation" for entry anim
  const prevActiveRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Wait for DOM to be ready before querying sections
    const elements: { el: Element; id: string }[] = [];

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) elements.push({ el, id: section.id });
    }

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIntersecting(prev => {
          const next = new Set(prev);
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).id;
            if (entry.isIntersecting) {
              next.add(id);
            } else {
              next.delete(id);
            }
          }
          return next;
        });
      },
      {
        // 45% of the section must be visible to activate
        threshold: 0.45,
        // Use viewport as root
        root: null,
      },
    );

    for (const { el } of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Build per-star state
  const stars = SECTIONS.map(section => {
    const active    = intersecting.has(section.id);
    const wasActive = prevActiveRef.current.has(section.id);
    return { ...section, active, wasActive };
  });

  // Update prev ref after render
  useEffect(() => {
    prevActiveRef.current = new Set(intersecting);
  });

  // Don't render until at least one section exists (avoids SSR/hydration flash)
  // We render the indicator always but with all stars inactive until scroll

  return (
    <div
      aria-label="Story progress — six stars mark your journey through the story"
      role="navigation"
      style={{
        position: 'fixed',
        bottom:   'clamp(18px, 3vw, 28px)',
        left:     '50%',
        transform: 'translateX(-50%)',
        zIndex:   40,
        // Pointer events only on the wrapper, not the space between stars
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '12px',
          // Very subtle pill background so stars are legible over any content
          background: 'rgba(7, 24, 39, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '999px',
          padding: '6px 14px',
          border: '1px solid rgba(137, 207, 240, 0.06)',
        }}
      >
        {stars.map((star, i) => (
          <Star
            key={star.id}
            active={star.active}
            wasActive={star.wasActive}
            shouldReduce={shouldReduce}
            label={star.label}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
