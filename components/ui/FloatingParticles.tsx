'use client';

/**
 * FloatingParticles.tsx
 * Softly drifting luminous dust particles across the night sky.
 * Adds atmosphere and depth without competing for attention.
 *
 * Respects prefers-reduced-motion: particles become static when
 * the user has requested reduced motion, preserving the visual
 * texture without any movement.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id:       number;
  top:      string;
  left:     string;
  size:     number;
  duration: number;
  delay:    number;
  xRange:   number;
  yRange:   number;
  opacity:  number;
}

interface FloatingParticlesProps {
  /** Number of particles to render (default: 22) */
  count?: number;
}

/** Deterministic seeded LCG — stable across SSR and client renders */
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function FloatingParticles({ count = 22 }: FloatingParticlesProps) {
  const shouldReduce = useReducedMotion();

  const particles: Particle[] = useMemo(() => {
    const rng = createSeededRng(99);

    return Array.from({ length: count }, (_, i) => ({
      id:       i,
      top:      `${(rng() * 100).toFixed(2)}%`,
      left:     `${(rng() * 100).toFixed(2)}%`,
      size:     1 + rng() * 2,           // 1–3 px
      duration: 14 + rng() * 14,         // 14–28s loop
      delay:    -(rng() * 20),           // pre-offset so they're mid-drift on load
      xRange:   (rng() - 0.5) * 50,     // ±25px horizontal
      yRange:   -(18 + rng() * 38),      // −18 to −56px upward
      opacity:  0.05 + rng() * 0.10,    // very subtle: 0.05–0.15
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            top:        p.top,
            left:       p.left,
            width:      `${p.size}px`,
            height:     `${p.size}px`,
            background: 'radial-gradient(circle, rgba(137,207,240,0.9) 0%, transparent 70%)',
            // When reduced motion: show at resting opacity, no movement
            opacity:    shouldReduce ? p.opacity : undefined,
            willChange: shouldReduce ? undefined : 'transform, opacity',
          }}
          // Suppress all animation when reduced motion is requested
          animate={shouldReduce ? {} : {
            x:       [0, p.xRange, 0],
            y:       [0, p.yRange, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={shouldReduce ? undefined : {
            duration: p.duration,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
