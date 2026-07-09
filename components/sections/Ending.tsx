'use client';

/**
 * Ending.tsx
 * The final section — the closing of the storybook.
 * Content intentionally empty — written in a later pass.
 */

import { motion, useReducedMotion } from 'framer-motion';
import FadeIn     from '@/components/ui/FadeIn';
import Container  from '@/components/ui/Container';
import Divider    from '@/components/ui/Divider';

export default function Ending() {
  const shouldReduce = useReducedMotion();
  return (
    <section
      id="ending"
      className="relative pt-28 sm:pt-36 pb-32 sm:pb-48"
      aria-label="Ending"
    >
      <Container className="flex flex-col items-center text-center gap-10">

        {/* ── Divider before ending ───────────────────────────────────── */}
        <FadeIn className="w-full">
          <Divider showOrnament />
        </FadeIn>

        {/* ── Closing title slot ──────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          <h2
            className="text-glow"
            style={{
              fontFamily:    'var(--font-cormorant)',
              fontSize:      'clamp(2rem, 8vw, 3.5rem)',
              fontWeight:    300,
              letterSpacing: '-0.01em',
              color:         '#F8FAFC',
              lineHeight:    1.2,
            }}
          >
            {/* Closing message will be added here */}
          </h2>
        </FadeIn>

        {/* ── Closing text slot ───────────────────────────────────────── */}
        <FadeIn delay={0.35}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize:   'clamp(0.875rem, 2.5vw, 1rem)',
              fontWeight: 300,
              color:      '#CBD5E1',
              maxWidth:   '400px',
              lineHeight: 1.9,
            }}
          >
            {/* Closing paragraph will be added here */}
          </p>
        </FadeIn>

        {/* ── Pom sitting illustration slot ───────────────────────────── */}
        <FadeIn delay={0.5}>
          <div
            style={{ width: '100px', height: '100px' }}
            aria-label="Pom sitting"
          >
            {/*
              Pom sit illustration: /characters/pom/sit.webp
              Will be placed here.
            */}
          </div>
        </FadeIn>

        {/* ── Quiet footer note ───────────────────────────────────────── */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-1"
          initial={{ opacity: shouldReduce ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={shouldReduce ? { duration: 0 } : { delay: 0.8, duration: 1 }}
        >
          {/* Tiny star ornament */}
          <span
            aria-hidden="true"
            style={{
              fontSize:   '0.625rem',
              color:      'rgba(255,244,194,0.4)',
              letterSpacing: '0.4em',
            }}
          >
            ✦ ✦ ✦
          </span>

          <p
            style={{
              fontFamily:    'var(--font-inter)',
              fontSize:      '0.6875rem',
              fontWeight:    300,
              color:         'rgba(203,213,225,0.35)',
              letterSpacing: '0.05em',
            }}
          >
            {/* Footer note / made with love tag will go here */}
          </p>
        </motion.div>

      </Container>

      {/* ── Final page bottom fade ──────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(7,24,39,0.95))',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
