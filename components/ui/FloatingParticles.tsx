'use client';

/**
 * FloatingParticles.tsx
 * Renders softly drifting dust particles across the background.
 * Adds depth and atmosphere to the night sky without being distracting.
 * Uses Framer Motion for smooth, looping movement.
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  xRange: number;
  yRange: number;
  opacity: number;
}

interface FloatingParticlesProps {
  /** Number of particles (default: 25) */
  count?: number;
}

/** Deterministic seeded RNG — same as AnimatedStars */
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function FloatingParticles({ count = 25 }: FloatingParticlesProps) {
  const particles: Particle[] = useMemo(() => {
    const rng = createSeededRng(99); // different seed from stars

    return Array.from({ length: count }, (_, i) => ({
      id:       i,
      top:      `${(rng() * 100).toFixed(2)}%`,
      left:     `${(rng() * 100).toFixed(2)}%`,
      size:     1 + rng() * 2,            // 1–3px
      duration: 12 + rng() * 16,          // 12–28s loop
      delay:    -(rng() * 20),            // negative delay = already mid-animation
      xRange:   (rng() - 0.5) * 60,      // ±30px horizontal drift
      yRange:   -(20 + rng() * 40),       // -20 to -60px upward drift
      opacity:  0.06 + rng() * 0.12,      // very subtle: 0.06–0.18
    }));
  }, [count]);

  return (
    // aria-hidden: purely decorative
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            top:    p.top,
            left:   p.left,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            // Soft blue-white dust
            background: 'radial-gradient(circle, rgba(137,207,240,0.9) 0%, transparent 70%)',
          }}
          animate={{
            x:       [0, p.xRange, 0],
            y:       [0, p.yRange, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
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
