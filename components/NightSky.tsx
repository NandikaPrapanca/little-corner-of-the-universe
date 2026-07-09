'use client';

/**
 * NightSky.tsx
 * The full animated background layer — fixed behind the entire page.
 *
 * Star reveal sequence:
 * - Stars do NOT all appear instantly.
 * - They are split into 5 batches that fade in at staggered intervals
 *   over roughly 2.5 seconds, giving the sky a "coming alive" feeling.
 *
 * Moon:
 * - ~20% smaller than original (64px disc instead of 80px)
 * - Pushed slightly closer to the corner (right: 8%, top: 5%)
 * - Glow is soft and breathing, not dominant
 */

import { useEffect, useRef } from 'react';
import AnimatedStars    from '@/components/ui/AnimatedStars';
import FloatingParticles from '@/components/ui/FloatingParticles';
import ShootingStar     from '@/components/ui/ShootingStar';

export default function NightSky() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  // ── Subtle parallax on scroll ─────────────────────────────────────────
  useEffect(() => {
    let rafId: number;

    function handleScroll() {
      rafId = requestAnimationFrame(() => {
        if (!parallaxRef.current) return;
        const offset = window.scrollY * 0.04; // very gentle — 4% of scroll
        parallaxRef.current.style.transform = `translateY(${offset}px)`;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      role="presentation"
    >
      {/* ── Base sky gradient ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 15% 0%,   rgba(184,168,227,0.07) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 100%,  rgba(137,207,240,0.05) 0%, transparent 55%),
            #071827
          `,
        }}
      />

      {/* ── Moon — smaller and closer to corner ──────────────────────── */}
      {/*
        Original: 80px disc at top:6% right:12%
        Refined:  64px disc at top:5% right:8%  (≈ −20% size)
      */}
      <div
        className="absolute animate-moon-glow"
        style={{
          top:    '5%',
          right:  '8%',
          width:  '64px',
          height: '64px',
        }}
      >
        {/* Outer diffuse halo */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,248,231,0.10) 0%, transparent 70%)',
            transform:  'scale(3.2)',
          }}
        />
        {/* Moon disc */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 33% 33%, #FFFDF5 0%, #FFF8E7 55%, #EDE0C0 100%)
            `,
            boxShadow: '0 0 22px 8px rgba(255,248,231,0.18)',
          }}
        />
        {/* Crescent shadow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 62% 42%, rgba(7,24,39,0.22) 0%, transparent 52%)',
          }}
        />
      </div>

      {/* ── Stars — staggered reveal via AnimatedStars batches ────────── */}
      {/*
        5 batches × ~26 stars = 130 total.
        Each batch has an increasing CSS animation-delay on its wrapper
        so they appear progressively, not all at once.
      */}
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        {/* Batch 1 — immediate (seed offset 0) */}
        <div
          className="absolute inset-0"
          style={{ animation: 'starBatchFadeIn 1.2s ease-out 0.1s both' }}
        >
          <AnimatedStars count={26} seedOffset={0} />
        </div>

        {/* Batch 2 — 0.5s */}
        <div
          className="absolute inset-0"
          style={{ animation: 'starBatchFadeIn 1.2s ease-out 0.5s both' }}
        >
          <AnimatedStars count={26} seedOffset={1000} />
        </div>

        {/* Batch 3 — 1.0s */}
        <div
          className="absolute inset-0"
          style={{ animation: 'starBatchFadeIn 1.2s ease-out 1.0s both' }}
        >
          <AnimatedStars count={26} seedOffset={2000} />
        </div>

        {/* Batch 4 — 1.5s */}
        <div
          className="absolute inset-0"
          style={{ animation: 'starBatchFadeIn 1.2s ease-out 1.5s both' }}
        >
          <AnimatedStars count={26} seedOffset={3000} />
        </div>

        {/* Batch 5 — 2.0s (last stars fill the sky) */}
        <div
          className="absolute inset-0"
          style={{ animation: 'starBatchFadeIn 1.4s ease-out 2.0s both' }}
        >
          <AnimatedStars count={26} seedOffset={4000} />
        </div>
      </div>

      {/* ── Floating particles ────────────────────────────────────────── */}
      <FloatingParticles count={22} />

      {/* ── Shooting star ─────────────────────────────────────────────── */}
      <ShootingStar />

      {/* ── Bottom horizon vignette ───────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(7,24,39,0.7) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
