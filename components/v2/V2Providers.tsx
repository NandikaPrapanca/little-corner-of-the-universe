'use client';

/**
 * components/v2/V2Providers.tsx
 * Lightweight client wrapper for the v2 route group.
 * Provides Framer Motion LazyMotion (domAnimation) for `m.*` components.
 */

import type { ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

export default function V2Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
