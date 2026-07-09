'use client';

/**
 * AnimatedStars.tsx
 * Renders a field of randomly positioned, independently twinkling stars.
 *
 * Uses a seeded LCG for deterministic SSR/client positions.
 * Accepts a seedOffset so NightSky can render multiple non-overlapping batches
 * that fade in at staggered delays to create a "sky coming alive" effect.
 */

import { useMemo } from 'react';

interface Star {
  id:             number;
  top:            string;
  left:           string;
  size:           number;
  animationClass: string;
  animationDelay: string;
  opacity:        number;
}

interface AnimatedStarsProps {
  /** How many stars to render in this batch */
  count?:      number;
  /** Seed offset — use different values per batch to avoid identical positions */
  seedOffset?: number;
}

/** Simple deterministic LCG — stable across SSR and client */
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export default function AnimatedStars({
  count      = 26,
  seedOffset = 0,
}: AnimatedStarsProps) {
  const stars: Star[] = useMemo(() => {
    // Combine a fixed base seed with the offset so each batch is unique
    const rng = createSeededRng(42 + seedOffset);

    return Array.from({ length: count }, (_, i) => {
      const speed = rng();
      let animationClass = 'animate-twinkle';
      if (speed > 0.66) animationClass = 'animate-twinkle-slow';
      else if (speed < 0.33) animationClass = 'animate-twinkle-fast';

      return {
        id:             i + seedOffset,
        top:            `${(rng() * 100).toFixed(2)}%`,
        left:           `${(rng() * 100).toFixed(2)}%`,
        // Distribution: ~15% large (2px), ~35% medium (1.5px), rest tiny (1px)
        size:           rng() < 0.15 ? 2 : rng() < 0.5 ? 1.5 : 1,
        animationClass,
        animationDelay: `${(rng() * 6).toFixed(2)}s`,
        opacity:        0.35 + rng() * 0.6, // 0.35–0.95
      };
    });
  }, [count, seedOffset]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full ${star.animationClass}`}
          style={{
            top:             star.top,
            left:            star.left,
            width:           `${star.size}px`,
            height:          `${star.size}px`,
            backgroundColor: '#FFF4C2',
            opacity:         star.opacity,
            animationDelay:  star.animationDelay,
            willChange:      'opacity, transform',
          }}
        />
      ))}
    </div>
  );
}
