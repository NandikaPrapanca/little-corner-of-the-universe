'use client';

/**
 * FadeIn.tsx
 * Viewport-aware fade-in animation wrapper using Framer Motion.
 *
 * Respects prefers-reduced-motion — when the user has reduced motion
 * enabled, elements appear instantly without any movement.
 */

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children:   ReactNode;
  /** Delay before animation starts (seconds) */
  delay?:     number;
  /** Extra className on the wrapper div */
  className?: string;
  /** Slide direction (default: 'up') */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

function buildVariants(
  direction: FadeInProps['direction'],
  reduce: boolean,
): Variants {
  // When user prefers reduced motion, skip all translate — just fade
  const distance = reduce ? 0 : 20;

  const offsets: Record<NonNullable<FadeInProps['direction']>, { x: number; y: number }> = {
    up:    { x: 0,         y:  distance },
    down:  { x: 0,         y: -distance },
    left:  { x:  distance, y: 0         },
    right: { x: -distance, y: 0         },
    none:  { x: 0,         y: 0         },
  };

  const { x, y } = offsets[direction ?? 'up'];

  return {
    hidden: {
      opacity: 0,
      x,
      y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        // Reduced motion: instant reveal. Normal: 0.8s smooth ease.
        duration: reduce ? 0.01 : 0.8,
        ease:     [0.25, 0.1, 0.25, 1],
      },
    },
  };
}

export default function FadeIn({
  children,
  delay     = 0,
  className,
  direction = 'up',
}: FadeInProps) {
  const shouldReduce = useReducedMotion() ?? false;
  const variants     = buildVariants(direction, shouldReduce);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      // Skip delay when motion is reduced — don't make screen-reader users wait
      transition={{ delay: shouldReduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
