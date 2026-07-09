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
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedStars    from '@/components/ui/AnimatedStars';
import FloatingParticles from '@/components/ui/FloatingParticles';
import ShootingStar     from '@/components/ui/ShootingStar';

// ─── Watercolor Moon ──────────────────────────────────────────────────────
/**
 * A painterly, Studio Ghibli-inspired moon built entirely from SVG
 * gradients and shapes. No external assets required.
 *
 * Layers (back to front):
 *   1. Wide atmospheric corona — very faint, multi-stop radial
 *   2. Mid glow ring — slightly denser warm ivory
 *   3. Moon disc body — layered radials giving off-centre warmth
 *   4. Soft limb darkening — ellipse covering the right/bottom edge
 *   5. Watercolor texture patches — irregular ellipses simulating
 *      paint bleed and subtle crater wash
 *   6. Crescent shadow wash — soft translucent overlay on one side
 *   7. Highlight bloom — tiny bright spot top-left, gives the sense
 *      of light source without a hard specular
 *
 * Animations:
 *   - Breathing glow: opacity keyframes on the corona, 10s loop
 *   - Gentle rotation: 1.5° over 75s, barely perceptible
 *   Both respect prefers-reduced-motion.
 *
 * Position: top 5%, right 8% — same as the previous moon.
 * Size:     SVG viewBox 140×140, rendered at 88px × 88px so the
 *           wide corona doesn't get clipped. The visible disc is ~64px.
 */
function WatercolorMoon() {
  const shouldReduce = useReducedMotion() ?? false;

  const cx = 70;
  const cy = 70;
  const r  = 32;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        // Moon is now 112px rendered (up from 88px, +27%).
        // Corona bleed compensation stays 12px.
        top:      'calc(5% - 12px)',
        right:    'calc(8% - 12px)',
        width:    '112px',
        height:   '112px',
      }}
      animate={shouldReduce ? undefined : { opacity: [0.82, 1, 0.82] }}
      transition={shouldReduce ? undefined : {
        duration: 10, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror',
      }}
    >
      {/* ── Kuromi peeking behind the moon ───────────────────────────── */}
      {/*
        Kuromi is a child of the moon container so she moves with it.
        zIndex 0 puts her behind the SVG moon (zIndex 1).
        She's offset upward so only her head/ears/shoulders are visible
        above the moon's equator — the rest is hidden behind the disc.
        The moon container is 112px; the disc occupies the centre ~80px.
        Kuromi is sized so her shoulders land roughly at disc-centre height.
      */}
      <motion.div
        aria-hidden="true"
        style={{
          position:      'absolute',
          // Centre horizontally, raise so top ~50% of Kuromi is visible
          left:          '50%',
          bottom:        '18%',
          transform:     'translateX(-50%)',
          width:         'clamp(40px, 7vw, 58px)',
          height:        'clamp(40px, 7vw, 58px)',
          zIndex:        0,   // behind the moon SVG (z-index: 1)
          pointerEvents: 'none',
        }}
        animate={shouldReduce ? undefined : {
          y: [0, -4, 0],
        }}
        transition={shouldReduce ? undefined : {
          duration:   3.5,
          ease:       'easeInOut',
          repeat:     Infinity,
          repeatType: 'mirror',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/characters/kuromi/kuromi.webp"
          alt=""
          draggable={false}
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'contain',
            objectPosition: 'top center',
            display:        'block',
            filter:         'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
          }}
        />
      </motion.div>

      {/* Slow rotation wrapper — 1.5° over 75 seconds */}
      <motion.div
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
        animate={shouldReduce ? undefined : { rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={shouldReduce ? undefined : {
          duration:   75,
          ease:       'easeInOut',
          repeat:     Infinity,
          repeatType: 'loop',
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* ── Corona gradient — outermost atmospheric glow ──── */}
            <radialGradient id="moonCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFF8E7" stopOpacity="0.00" />
              <stop offset="38%"  stopColor="#FFF8E7" stopOpacity="0.00" />
              <stop offset="52%"  stopColor="#FFF8E7" stopOpacity="0.06" />
              <stop offset="65%"  stopColor="#FDEFC8" stopOpacity="0.10" />
              <stop offset="78%"  stopColor="#F5E4B0" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#E8D49A" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Mid-glow ring ─────────────────────────────────── */}
            <radialGradient id="moonMidGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFF8E7" stopOpacity="0.00" />
              <stop offset="45%"  stopColor="#FFF8E7" stopOpacity="0.00" />
              <stop offset="56%"  stopColor="#FFFBEF" stopOpacity="0.14" />
              <stop offset="68%"  stopColor="#FFF3D0" stopOpacity="0.12" />
              <stop offset="82%"  stopColor="#F0E2A8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#E8D490" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Moon body — off-centre warm light ─────────────── */}
            <radialGradient id="moonBody" cx="38%" cy="35%" r="62%">
              <stop offset="0%"   stopColor="#FFFCF0" stopOpacity="1"    />
              <stop offset="28%"  stopColor="#FFF8E3" stopOpacity="1"    />
              <stop offset="55%"  stopColor="#F8EDD0" stopOpacity="1"    />
              <stop offset="78%"  stopColor="#EDD9B2" stopOpacity="1"    />
              <stop offset="100%" stopColor="#D9C494" stopOpacity="1"    />
            </radialGradient>

            {/* ── Limb darkening — right-side dim ───────────────── */}
            <radialGradient id="moonLimb" cx="72%" cy="62%" r="55%">
              <stop offset="0%"   stopColor="#8C7A52" stopOpacity="0.18" />
              <stop offset="45%"  stopColor="#8C7A52" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#8C7A52" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Watercolor wash 1 — top-left paint bleed ─────── */}
            <radialGradient id="moonWash1" cx="28%" cy="28%" r="45%">
              <stop offset="0%"   stopColor="#FFFEF8" stopOpacity="0.22" />
              <stop offset="60%"  stopColor="#FFF8E7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFF8E7" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Watercolor wash 2 — lower-right crater tint ──── */}
            <radialGradient id="moonWash2" cx="65%" cy="68%" r="38%">
              <stop offset="0%"   stopColor="#C8B882" stopOpacity="0.16" />
              <stop offset="55%"  stopColor="#C8B882" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#C8B882" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Watercolor wash 3 — mid left subtle patch ────── */}
            <radialGradient id="moonWash3" cx="38%" cy="58%" r="30%">
              <stop offset="0%"   stopColor="#B8A870" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#B8A870" stopOpacity="0.00" />
            </radialGradient>

            {/* ── Highlight bloom — primary light source ────────── */}
            <radialGradient id="moonHighlight" cx="30%" cy="26%" r="28%">
              <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0.38" />
              <stop offset="40%"  stopColor="#FFFEF4"  stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FFFEF4"  stopOpacity="0.00" />
            </radialGradient>

            {/* ── Soft clip for the disc ────────────────────────── */}
            <clipPath id="moonClip">
              {/*
                Slightly irregular ellipse — not a perfect circle.
                rx/ry differ by 1px to give that imperfect painted feel.
              */}
              <ellipse cx={cx} cy={cy} rx={r + 0.8} ry={r - 0.5} />
            </clipPath>
          </defs>

          {/* Layer 1 — Wide corona (full canvas) */}
          <ellipse
            cx={cx} cy={cy}
            rx="68" ry="67"
            fill="url(#moonCorona)"
          />

          {/* Layer 2 — Mid glow ring */}
          <ellipse
            cx={cx} cy={cy}
            rx="54" ry="53"
            fill="url(#moonMidGlow)"
          />

          {/* Layers 3–8 all clipped to the disc shape */}
          <g clipPath="url(#moonClip)">

            {/* Layer 3 — Moon body */}
            <ellipse
              cx={cx} cy={cy}
              rx={r + 0.8} ry={r - 0.5}
              fill="url(#moonBody)"
            />

            {/* Layer 4 — Limb darkening */}
            <ellipse
              cx={cx} cy={cy}
              rx={r + 0.8} ry={r - 0.5}
              fill="url(#moonLimb)"
            />

            {/* Layer 5a — Watercolor wash: top-left bloom */}
            <ellipse
              cx="56" cy="54"
              rx="22" ry="20"
              fill="url(#moonWash1)"
              transform="rotate(-12 56 54)"
            />

            {/* Layer 5b — Watercolor wash: lower-right crater tint */}
            <ellipse
              cx="78" cy="80"
              rx="16" ry="14"
              fill="url(#moonWash2)"
              transform="rotate(8 78 80)"
            />

            {/* Layer 5c — Mid-left subtle patch */}
            <ellipse
              cx="58" cy="72"
              rx="13" ry="11"
              fill="url(#moonWash3)"
              transform="rotate(-5 58 72)"
            />

            {/*
              Layer 5d — Tiny darker patch near centre-right
              Mimics the faint "maria" (dark basalt plains) on real moons
              but rendered as a watercolor bleed, not a crisp shape.
            */}
            <ellipse
              cx="74" cy="65"
              rx="9" ry="7"
              fill="#B0985A"
              opacity="0.07"
              transform="rotate(15 74 65)"
            />

            {/*
              Layer 5e — Faint upper-right edge shadow
              Makes the disc feel three-dimensional without a hard edge.
            */}
            <ellipse
              cx="84" cy="52"
              rx="12" ry="10"
              fill="#8A7248"
              opacity="0.06"
              transform="rotate(20 84 52)"
            />

            {/* Layer 6 — Crescent edge shadow (overall twilight side) */}
            <ellipse
              cx={cx + 14}
              cy={cy + 8}
              rx={r - 2}
              ry={r - 4}
              fill="#071827"
              opacity="0.13"
            />

            {/* Layer 7 — Highlight bloom */}
            <ellipse
              cx={cx} cy={cy}
              rx={r + 0.8} ry={r - 0.5}
              fill="url(#moonHighlight)"
            />

            {/*
              Layer 8 — Paper-grain texture simulation
              A very faint repeating diamond pattern at near-zero opacity
              breaks up the gradient smoothness just enough to read as
              painted rather than digital.
            */}
            <rect
              x={cx - r - 1}
              y={cy - r - 1}
              width={(r + 1) * 2}
              height={(r + 1) * 2}
              fill="none"
              stroke="#D4C080"
              strokeWidth="0.3"
              strokeDasharray="1.5 4"
              opacity="0.06"
            />

          </g>

          {/*
            Edge softening — a thin ring just outside the disc that
            blends the hard clip boundary back into the sky.
            Uses the disc shape stroked slightly larger than the clip.
          */}
          <ellipse
            cx={cx} cy={cy}
            rx={r + 2.5}
            ry={r + 1.5}
            fill="none"
            stroke="#FFF8E7"
            strokeWidth="3"
            opacity="0.06"
          />
          <ellipse
            cx={cx} cy={cy}
            rx={r + 5}
            ry={r + 4}
            fill="none"
            stroke="#FFF0C8"
            strokeWidth="4"
            opacity="0.04"
          />

        </svg>
      </motion.div>
    </motion.div>
  );
}

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

      {/* ── Moon — watercolor illustration style ─────────────────────── */}
      <WatercolorMoon />

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
