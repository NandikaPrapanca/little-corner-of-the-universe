'use client';

/**
 * components/v2/ScrollTulip.tsx
 * Multi-tulip botanical cluster (featuring white & purple tulips) for the V2 editorial desk.
 *
 * Features:
 * - Harmonious cluster of 3 staggered botanical tulips:
 *     1. Center-Tall Purple Tulip (`#8D729E` / `#6F5482` dusty lavender & plum)
 *     2. Left-Mid White Tulip (`#FFFDF9` ivory with `#E8E0D4` warm stone shading & `#8E8479` outline)
 *     3. Right-Low White & Lavender Tulip (`#FFFDF9` / `#8D729E` soft violet-tinted ivory)
 * - Stay-Bloomed Latch: tracks the maximum reached scroll progress via `useMotionValue(0)`
 *   + `useMotionValueEvent(scrollYProgress, 'change', ...)` so once the tulips grow and bloom
 *   as the reader scrolls down, they remain fully bloomed even when scrolling back up.
 * - Respects `useReducedMotion()`: renders statically in full bloom when enabled.
 */

import {
  m,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';

export default function ScrollTulip() {
  const shouldReduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();

  // Latch: monotonically non-decreasing scroll progress (0 → 1)
  const maxProgress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > maxProgress.get()) {
      maxProgress.set(latest);
    }
  });

  // ── 1. Stems growth (0% → 48% max scroll) ─────────────────────────────
  const mainStemLength  = useTransform(maxProgress, [0, 0.42], [0, 1]);
  const leftStemLength  = useTransform(maxProgress, [0.06, 0.46], [0, 1]);
  const rightStemLength = useTransform(maxProgress, [0.10, 0.48], [0, 1]);
  const stemOpacity     = useTransform(maxProgress, [0, 0.08], [0.3, 1]);

  // ── 2. Leaves unfurling (32% → 70% max scroll) ────────────────────────
  const leftLeafScale   = useTransform(maxProgress, [0.32, 0.64], [0, 1]);
  const leftLeafRotate  = useTransform(maxProgress, [0.32, 0.66], [16, 0]);
  const leftLeafOpacity = useTransform(maxProgress, [0.32, 0.45], [0, 1]);

  const midLeafScale    = useTransform(maxProgress, [0.38, 0.68], [0, 1]);
  const midLeafOpacity  = useTransform(maxProgress, [0.38, 0.50], [0, 1]);

  const rightLeafScale   = useTransform(maxProgress, [0.42, 0.70], [0, 1]);
  const rightLeafRotate  = useTransform(maxProgress, [0.42, 0.70], [-16, 0]);
  const rightLeafOpacity = useTransform(maxProgress, [0.42, 0.54], [0, 1]);

  // ── 3. Center Tall Purple Tulip bloom (56% → 96% max scroll) ──────────
  const centerBudScale   = useTransform(maxProgress, [0.56, 0.84], [0, 1]);
  const centerBudOpacity = useTransform(maxProgress, [0.56, 0.68], [0, 1]);
  const centerInnerLRot  = useTransform(maxProgress, [0.64, 0.92], [10, -11]);
  const centerInnerRRot  = useTransform(maxProgress, [0.64, 0.92], [-10, 11]);
  const centerOuterLRot  = useTransform(maxProgress, [0.68, 0.98], [14, -23]);
  const centerOuterRRot  = useTransform(maxProgress, [0.68, 0.98], [-14, 23]);
  const centerPetalScale = useTransform(maxProgress, [0.62, 0.94], [0.2, 1]);

  // ── 4. Left Medium White Tulip bloom (60% → 98% max scroll) ───────────
  const leftBudScale     = useTransform(maxProgress, [0.60, 0.88], [0, 1]);
  const leftBudOpacity   = useTransform(maxProgress, [0.60, 0.72], [0, 1]);
  const leftInnerLRot    = useTransform(maxProgress, [0.68, 0.95], [8, -10]);
  const leftInnerRRot    = useTransform(maxProgress, [0.68, 0.95], [-8, 10]);
  const leftOuterLRot    = useTransform(maxProgress, [0.72, 1.0], [12, -21]);
  const leftOuterRRot    = useTransform(maxProgress, [0.72, 1.0], [-12, 21]);
  const leftPetalScale   = useTransform(maxProgress, [0.66, 0.96], [0.2, 1]);

  // ── 5. Right Lower Purple/White Tulip bloom (64% → 100% max scroll) ───
  const rightBudScale    = useTransform(maxProgress, [0.64, 0.90], [0, 1]);
  const rightBudOpacity  = useTransform(maxProgress, [0.64, 0.76], [0, 1]);
  const rightInnerLRot   = useTransform(maxProgress, [0.72, 0.98], [8, -11]);
  const rightInnerRRot   = useTransform(maxProgress, [0.72, 0.98], [-8, 11]);
  const rightOuterLRot   = useTransform(maxProgress, [0.75, 1.0], [12, -20]);
  const rightOuterRRot   = useTransform(maxProgress, [0.75, 1.0], [-12, 20]);
  const rightPetalScale  = useTransform(maxProgress, [0.70, 0.98], [0.2, 1]);

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 right-2 sm:right-6 md:right-10 z-0 pointer-events-none select-none opacity-30 sm:opacity-40"
    >
      <m.svg
        width="230"
        height="360"
        viewBox="0 0 230 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[155px] h-[245px] sm:w-[195px] sm:h-[305px] md:w-[230px] md:h-[360px] block overflow-visible"
      >
        <defs>
          {/* ── Purple Tulip Gradients (Dusty Lavender & Plum) ────────── */}
          <linearGradient id="purplePetalCore" x1="122" y1="35" x2="122" y2="118" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9B7FAE" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#8D729E" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#6F5482" stopOpacity="0.34" />
          </linearGradient>

          <linearGradient id="purplePetalSide" x1="122" y1="42" x2="122" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B39BC4" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#6F5482" stopOpacity="0.26" />
          </linearGradient>

          {/* ── White Tulip Gradients (Ivory & Warm Stone Shading) ────── */}
          <linearGradient id="whitePetalCore" x1="58" y1="78" x2="58" y2="152" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.92" />
            <stop offset="65%" stopColor="#F2ECE1" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#E2D8C8" stopOpacity="0.72" />
          </linearGradient>

          <linearGradient id="whitePetalSide" x1="58" y1="84" x2="58" y2="152" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E8E0D4" stopOpacity="0.65" />
          </linearGradient>

          {/* ── Sage Botanical Leaf Fill ──────────────────────────────── */}
          <linearGradient id="clusterLeafFill" x1="115" y1="165" x2="115" y2="345" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6E826F" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#6E826F" stopOpacity="0.09" />
          </linearGradient>
        </defs>

        {/* ════════════════════════════════════════════════════════════════
            1. BOTANICAL LEAVES (Background layer)
        ════════════════════════════════════════════════════════════════ */}
        {/* Left sweeping leaf */}
        <m.g
          style={{
            originX: '98px',
            originY: '312px',
            scale:   shouldReduce ? 1 : leftLeafScale,
            rotate:  shouldReduce ? 0 : leftLeafRotate,
            opacity: shouldReduce ? 1 : leftLeafOpacity,
          }}
        >
          <path
            d="M 98 312 C 62 284, 34 236, 40 184 C 58 214, 82 260, 98 312 Z"
            fill="url(#clusterLeafFill)"
            stroke="#6E826F"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 95 304 C 72 268, 52 228, 44 194"
            stroke="#6E826F"
            strokeWidth="0.75"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
        </m.g>

        {/* Center slender leaf */}
        <m.g
          style={{
            originX: '116px',
            originY: '295px',
            scale:   shouldReduce ? 1 : midLeafScale,
            opacity: shouldReduce ? 1 : midLeafOpacity,
          }}
        >
          <path
            d="M 116 295 C 102 254, 96 212, 104 168 C 114 204, 120 248, 116 295 Z"
            fill="url(#clusterLeafFill)"
            stroke="#6E826F"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </m.g>

        {/* Right sweeping leaf */}
        <m.g
          style={{
            originX: '132px',
            originY: '305px',
            scale:   shouldReduce ? 1 : rightLeafScale,
            rotate:  shouldReduce ? 0 : rightLeafRotate,
            opacity: shouldReduce ? 1 : rightLeafOpacity,
          }}
        >
          <path
            d="M 132 305 C 164 276, 192 232, 184 182 C 166 212, 144 256, 132 305 Z"
            fill="url(#clusterLeafFill)"
            stroke="#6E826F"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 135 298 C 156 264, 174 226, 180 192"
            stroke="#6E826F"
            strokeWidth="0.75"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
        </m.g>

        {/* ════════════════════════════════════════════════════════════════
            2. CURVED STEMS
        ════════════════════════════════════════════════════════════════ */}
        {/* Left stem → White Tulip at (62, 146) */}
        <m.path
          d="M 104 360 C 98 300, 76 232, 62 146"
          stroke="#6E826F"
          strokeWidth="1.85"
          strokeLinecap="round"
          style={{
            pathLength: shouldReduce ? 1 : leftStemLength,
            opacity:    shouldReduce ? 1 : stemOpacity,
          }}
        />

        {/* Center tall stem → Purple Tulip at (122, 112) */}
        <m.path
          d="M 118 360 C 118 290, 112 205, 122 112"
          stroke="#6E826F"
          strokeWidth="2.1"
          strokeLinecap="round"
          style={{
            pathLength: shouldReduce ? 1 : mainStemLength,
            opacity:    shouldReduce ? 1 : stemOpacity,
          }}
        />

        {/* Right stem → Lower White & Purple Tulip at (174, 174) */}
        <m.path
          d="M 130 360 C 138 302, 158 242, 174 174"
          stroke="#6E826F"
          strokeWidth="1.75"
          strokeLinecap="round"
          style={{
            pathLength: shouldReduce ? 1 : rightStemLength,
            opacity:    shouldReduce ? 1 : stemOpacity,
          }}
        />

        {/* ════════════════════════════════════════════════════════════════
            3. TULIP A — CENTER TALL PURPLE TULIP (Anchor: 122, 112)
        ════════════════════════════════════════════════════════════════ */}
        <m.g
          style={{
            originX: '122px',
            originY: '112px',
            opacity: shouldReduce ? 1 : centerBudOpacity,
          }}
        >
          {/* Outer Left Petal */}
          <m.g
            style={{
              originX: '122px',
              originY: '112px',
              rotate:  shouldReduce ? -23 : centerOuterLRot,
              scale:   shouldReduce ? 1 : centerPetalScale,
            }}
          >
            <path
              d="M 122 112 C 95 106, 86 75, 100 44 C 111 58, 120 82, 122 112 Z"
              fill="url(#purplePetalSide)"
              stroke="#6F5482"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Outer Right Petal */}
          <m.g
            style={{
              originX: '122px',
              originY: '112px',
              rotate:  shouldReduce ? 23 : centerOuterRRot,
              scale:   shouldReduce ? 1 : centerPetalScale,
            }}
          >
            <path
              d="M 122 112 C 149 106, 158 75, 144 44 C 133 58, 124 82, 122 112 Z"
              fill="url(#purplePetalSide)"
              stroke="#6F5482"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Left Petal */}
          <m.g
            style={{
              originX: '122px',
              originY: '112px',
              rotate:  shouldReduce ? -11 : centerInnerLRot,
              scale:   shouldReduce ? 1 : centerPetalScale,
            }}
          >
            <path
              d="M 122 112 C 101 102, 96 70, 109 39 C 120 55, 126 80, 122 112 Z"
              fill="url(#purplePetalCore)"
              stroke="#6F5482"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Right Petal */}
          <m.g
            style={{
              originX: '122px',
              originY: '112px',
              rotate:  shouldReduce ? 11 : centerInnerRRot,
              scale:   shouldReduce ? 1 : centerPetalScale,
            }}
          >
            <path
              d="M 122 112 C 143 102, 148 70, 135 39 C 124 55, 118 80, 122 112 Z"
              fill="url(#purplePetalCore)"
              stroke="#6F5482"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Center Core Petal */}
          <m.g
            style={{
              originX: '122px',
              originY: '112px',
              scale:   shouldReduce ? 1 : centerBudScale,
            }}
          >
            <path
              d="M 122 112 C 106 98, 106 62, 122 33 C 138 62, 138 98, 122 112 Z"
              fill="url(#purplePetalCore)"
              stroke="#6F5482"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M 122 106 C 122 85, 122 62, 122 43"
              stroke="#6F5482"
              strokeWidth="0.75"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
          </m.g>

          <path
            d="M 117 113 Q 122 108 127 113"
            stroke="#6E826F"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </m.g>

        {/* ════════════════════════════════════════════════════════════════
            4. TULIP B — LEFT MEDIUM WHITE TULIP (Anchor: 62, 146)
        ════════════════════════════════════════════════════════════════ */}
        <m.g
          style={{
            originX: '62px',
            originY: '146px',
            opacity: shouldReduce ? 1 : leftBudOpacity,
            rotate:  -8,
          }}
        >
          {/* Outer Left White Petal */}
          <m.g
            style={{
              originX: '62px',
              originY: '146px',
              rotate:  shouldReduce ? -21 : leftOuterLRot,
              scale:   shouldReduce ? 1 : leftPetalScale,
            }}
          >
            <path
              d="M 62 146 C 39 140, 31 114, 43 87 C 53 99, 60 120, 62 146 Z"
              fill="url(#whitePetalSide)"
              stroke="#8E8479"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Outer Right White Petal */}
          <m.g
            style={{
              originX: '62px',
              originY: '146px',
              rotate:  shouldReduce ? 21 : leftOuterRRot,
              scale:   shouldReduce ? 1 : leftPetalScale,
            }}
          >
            <path
              d="M 62 146 C 85 140, 93 114, 81 87 C 71 99, 64 120, 62 146 Z"
              fill="url(#whitePetalSide)"
              stroke="#8E8479"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Left White Petal */}
          <m.g
            style={{
              originX: '62px',
              originY: '146px',
              rotate:  shouldReduce ? -10 : leftInnerLRot,
              scale:   shouldReduce ? 1 : leftPetalScale,
            }}
          >
            <path
              d="M 62 146 C 44 137, 40 109, 51 82 C 60 96, 65 118, 62 146 Z"
              fill="url(#whitePetalCore)"
              stroke="#8E8479"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Right White Petal */}
          <m.g
            style={{
              originX: '62px',
              originY: '146px',
              rotate:  shouldReduce ? 10 : leftInnerRRot,
              scale:   shouldReduce ? 1 : leftPetalScale,
            }}
          >
            <path
              d="M 62 146 C 80 137, 84 109, 73 82 C 64 96, 59 118, 62 146 Z"
              fill="url(#whitePetalCore)"
              stroke="#8E8479"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Center White Core Petal */}
          <m.g
            style={{
              originX: '62px',
              originY: '146px',
              scale:   shouldReduce ? 1 : leftBudScale,
            }}
          >
            <path
              d="M 62 146 C 48 134, 48 102, 62 77 C 76 102, 76 134, 62 146 Z"
              fill="url(#whitePetalCore)"
              stroke="#8E8479"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <path
              d="M 62 140 C 62 122, 62 102, 62 86"
              stroke="#8E8479"
              strokeWidth="0.7"
              strokeOpacity="0.55"
              strokeLinecap="round"
            />
          </m.g>

          <path
            d="M 57 147 Q 62 142 67 147"
            stroke="#6E826F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </m.g>

        {/* ════════════════════════════════════════════════════════════════
            5. TULIP C — RIGHT LOWER WHITE & PURPLE TULIP (Anchor: 174, 174)
        ════════════════════════════════════════════════════════════════ */}
        <m.g
          style={{
            originX: '174px',
            originY: '174px',
            opacity: shouldReduce ? 1 : rightBudOpacity,
            rotate:  10,
          }}
        >
          {/* Outer Left Lavender Petal */}
          <m.g
            style={{
              originX: '174px',
              originY: '174px',
              rotate:  shouldReduce ? -20 : rightOuterLRot,
              scale:   shouldReduce ? 1 : rightPetalScale,
            }}
          >
            <path
              d="M 174 174 C 153 168, 146 144, 157 120 C 166 131, 172 150, 174 174 Z"
              fill="url(#purplePetalSide)"
              stroke="#6F5482"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Outer Right Lavender Petal */}
          <m.g
            style={{
              originX: '174px',
              originY: '174px',
              rotate:  shouldReduce ? 20 : rightOuterRRot,
              scale:   shouldReduce ? 1 : rightPetalScale,
            }}
          >
            <path
              d="M 174 174 C 195 168, 202 144, 191 120 C 182 131, 176 150, 174 174 Z"
              fill="url(#purplePetalSide)"
              stroke="#6F5482"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Left White Petal */}
          <m.g
            style={{
              originX: '174px',
              originY: '174px',
              rotate:  shouldReduce ? -11 : rightInnerLRot,
              scale:   shouldReduce ? 1 : rightPetalScale,
            }}
          >
            <path
              d="M 174 174 C 158 166, 154 140, 164 116 C 172 128, 177 148, 174 174 Z"
              fill="url(#whitePetalCore)"
              stroke="#8E8479"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Inner Right White Petal */}
          <m.g
            style={{
              originX: '174px',
              originY: '174px',
              rotate:  shouldReduce ? 11 : rightInnerRRot,
              scale:   shouldReduce ? 1 : rightPetalScale,
            }}
          >
            <path
              d="M 174 174 C 190 166, 194 140, 184 116 C 176 128, 171 148, 174 174 Z"
              fill="url(#whitePetalCore)"
              stroke="#8E8479"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </m.g>

          {/* Center White Core Petal with subtle purple tip */}
          <m.g
            style={{
              originX: '174px',
              originY: '174px',
              scale:   shouldReduce ? 1 : rightBudScale,
            }}
          >
            <path
              d="M 174 174 C 161 163, 161 134, 174 111 C 187 134, 187 163, 174 174 Z"
              fill="url(#whitePetalCore)"
              stroke="#7E6B8F"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M 174 168 C 174 152, 174 134, 174 120"
              stroke="#7E6B8F"
              strokeWidth="0.7"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
          </m.g>

          <path
            d="M 170 175 Q 174 171 178 175"
            stroke="#6E826F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </m.g>
      </m.svg>
    </div>
  );
}
