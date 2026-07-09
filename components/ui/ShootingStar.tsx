'use client';

/**
 * ShootingStar.tsx
 * Renders an occasional shooting star streaking across the sky.
 * Fires at random intervals — organic, never mechanical.
 *
 * Respects prefers-reduced-motion: when enabled, shooting stars are
 * disabled entirely (decorative motion that serves no functional purpose).
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ShootingStarConfig {
  id:    number;
  top:   string;
  left:  string;
  angle: number; // rotation in degrees
}

export default function ShootingStar() {
  const shouldReduce = useReducedMotion();
  const [star, setStar] = useState<ShootingStarConfig | null>(null);

  useEffect(() => {
    // Skip entirely when user prefers reduced motion
    if (shouldReduce) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleStar() {
      // Random interval: 7–16 seconds — feels organic, not mechanical
      const delay = 7000 + Math.random() * 9000;

      timeoutId = setTimeout(() => {
        setStar({
          id:    Date.now(),
          // Originate from upper portion of sky
          top:   `${4 + Math.random() * 28}%`,
          left:  `${4 + Math.random() * 35}%`,
          angle: 18 + Math.random() * 22, // 18–40° downward streak
        });

        // Clear star and reschedule after streak completes
        setTimeout(() => {
          setStar(null);
          scheduleStar();
        }, 1100);
      }, delay);
    }

    // Small initial delay — don't fire on first render
    timeoutId = setTimeout(scheduleStar, 4000);

    return () => clearTimeout(timeoutId);
  }, [shouldReduce]);

  // Nothing rendered when motion is reduced
  if (shouldReduce) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <AnimatePresence>
        {star && (
          <motion.div
            key={star.id}
            className="absolute"
            style={{
              top:       star.top,
              left:      star.left,
              transform: `rotate(${star.angle}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
          >
            {/* Streak — thin gradient line with soft glow */}
            <div
              style={{
                width:        '90px',
                height:       '1.5px',
                background:   'linear-gradient(to right, transparent, #FFF4C2 40%, transparent)',
                borderRadius: '999px',
                boxShadow:    '0 0 3px 1px rgba(255,244,194,0.5)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
