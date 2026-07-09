'use client';

/**
 * ShootingStar.tsx
 * Renders an occasional shooting star that streaks across the sky.
 * Triggers at random intervals — feels organic, never repetitive.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ShootingStarConfig {
  id: number;
  top: string;
  left: string;
  angle: number; // degrees
}

export default function ShootingStar() {
  const [star, setStar] = useState<ShootingStarConfig | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleStar() {
      // Fire every 6–14 seconds
      const delay = 6000 + Math.random() * 8000;

      timeoutId = setTimeout(() => {
        setStar({
          id:    Date.now(),
          // Originate from upper-left quadrant of sky
          top:   `${5 + Math.random() * 25}%`,
          left:  `${5 + Math.random() * 30}%`,
          angle: 20 + Math.random() * 20, // 20–40° downward angle
        });

        // Remove star after animation completes
        setTimeout(() => {
          setStar(null);
          scheduleStar();
        }, 1000);
      }, delay);
    }

    // Slight initial delay so it doesn't fire immediately on mount
    timeoutId = setTimeout(scheduleStar, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    // aria-hidden: purely decorative
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
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* The streak — a thin gradient line */}
            <div
              style={{
                width:        '100px',
                height:       '1.5px',
                background:   'linear-gradient(to right, transparent, #FFF4C2, transparent)',
                borderRadius: '999px',
                boxShadow:    '0 0 4px 1px rgba(255, 244, 194, 0.6)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
