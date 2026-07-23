'use client';

/**
 * ChapterThree.tsx
 * "The little things that quietly became you."
 *
 * A vertical collection of handwritten thoughts — one card per observation.
 * Each card is a translucent glass surface with a subtle navy gradient,
 * tiny star doodles at the corners, and a single thought written in
 * Cormorant Garamond italic.
 *
 * Cards fade in independently on scroll.
 * No photos, no icons, no illustrations — words only.
 */

import { motion, useReducedMotion } from 'framer-motion';
import FadeIn      from '@/components/ui/FadeIn';
import Container   from '@/components/ui/Container';
import BobEasterEgg from '@/components/ui/BobEasterEgg';

// ─── Thoughts — each becomes its own card ─────────────────────────────────

const THOUGHTS: string[] = [
  'You laugh before your own joke finishes.',
  'You somehow turned Coca-Cola into a personality trait.',
  'You get excited over Blind Boxes like it\'s Christmas.',
  'You\'ll say "last story"\u2026\u00a0\u00a0\u00a0\nand then somehow tell five more.',
  'You always get excited whenever dogs appear.',
  'You somehow made sushi impossible to eat without thinking of you.',
  'You\'ve talked about Canada so many times that I can\'t help imagining how happy you\'ll be if you get there.',
  'You overthink far more than you deserve to.',
  'I wish you could be as kind to yourself as you are to the people around you.',
  'You always worry about being replaced.\nI hope one day you realize the people who truly care about you don\'t keep score like that.',
  'You don\'t always see yourself kindly.\nI wish you could borrow my eyes for a day.\nMaybe then you\'d understand why I keep telling you you\'re prettier than you think.',
  'You worry about being forgotten.\nI don\'t think that\'s something you\'ll ever have to worry about with me.',
];

// ─── Tiny star doodle — placed in corners of each card ────────────────────
// Four-pointed, very small, different opacities per corner so they feel
// hand-scattered rather than symmetrically placed.

interface StarDoodleProps {
  corner: 'tl' | 'tr' | 'bl' | 'br';
  /** Scale 0–1 relative to base size */
  scale?: number;
}

function StarDoodle({ corner, scale = 1 }: StarDoodleProps) {
  const size = Math.round(7 * scale);

  const pos: React.CSSProperties = {
    tl: { top: '10px',    left: '12px'  },
    tr: { top: '10px',    right: '12px' },
    bl: { bottom: '10px', left: '12px'  },
    br: { bottom: '10px', right: '12px' },
  }[corner];

  const opacityMap = { tl: 0.28, tr: 0.18, bl: 0.16, br: 0.22 };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      style={{
        position:     'absolute',
        pointerEvents:'none',
        opacity:      opacityMap[corner],
        ...pos,
      }}
    >
      {/* Four-point star */}
      <path
        d="M5 0 L5.55 4.45 L10 5 L5.55 5.55 L5 10 L4.45 5.55 L0 5 L4.45 4.45 Z"
        fill="#FFF4C2"
      />
    </svg>
  );
}

// ─── Thought card ──────────────────────────────────────────────────────────

interface ThoughtCardProps {
  text:  string;
  /** Is this a "heavy" card — longer, more personal content? */
  heavy?: boolean;
}

function ThoughtCard({ text, heavy = false }: ThoughtCardProps) {
  // Detect multi-line thoughts (contain \n) — render as separate lines
  const lines = text.split('\n');

  // Heavy cards (longer personal thoughts) get a slightly warmer tint
  const bgGradient = heavy
    ? `linear-gradient(
        135deg,
        rgba(20, 30, 55, 0.78) 0%,
        rgba(16, 28, 52, 0.70) 50%,
        rgba(22, 18, 48, 0.75) 100%
      )`
    : `linear-gradient(
        135deg,
        rgba(16, 37, 61, 0.72) 0%,
        rgba(14, 32, 55, 0.65) 50%,
        rgba(18, 30, 58, 0.70) 100%
      )`;

  const borderColor = heavy
    ? 'rgba(184, 168, 227, 0.14)'
    : 'rgba(137, 207, 240, 0.10)';

  return (
    <div
      style={{
        position:        'relative',
        background:      bgGradient,
        backdropFilter:  'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:          `1px solid ${borderColor}`,
        borderRadius:    '16px',
        padding:         'clamp(1.25rem, 4vw, 1.875rem) clamp(1.375rem, 4vw, 2rem)',
        boxShadow:       `
          0 2px  8px  rgba(0, 0, 0, 0.22),
          0 8px  24px rgba(0, 0, 0, 0.16),
          inset 0 1px 0 rgba(255, 255, 255, 0.04)
        `,
      }}
    >
      {/* ── Corner star doodles ───────────────────────────────────── */}
      <StarDoodle corner="tl" scale={0.9} />
      <StarDoodle corner="br" scale={0.75} />
      {/* Only heavy/longer cards get all four corners */}
      {heavy && <StarDoodle corner="tr" scale={0.65} />}
      {heavy && <StarDoodle corner="bl" scale={0.70} />}

      {/* ── Thought text ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6em' }}>
        {lines.map((line, i) => {
          // First line of a multi-line card is the hook — slightly brighter
          const isHook = lines.length > 1 && i === 0;

          return (
            <p
              key={i}
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(1.0625rem, 3vw, 1.3125rem)',
                fontWeight:    isHook ? 400 : 300,
                fontStyle:     'italic',
                lineHeight:    1.65,
                letterSpacing: '0.01em',
                color:         isHook
                  ? 'rgba(248, 250, 252, 0.88)'
                  : 'rgba(203, 213, 225, 0.72)',
                margin:        0,
                // Indent continuation lines slightly for multi-line thoughts
                paddingLeft:   (!isHook && lines.length > 1) ? '0.5em' : 0,
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ─── Closing divider — gradient line fading to nothing ────────────────────

function ClosingDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height:      '1px',
        background:  `linear-gradient(
          to right,
          transparent 0%,
          rgba(137, 207, 240, 0.18) 25%,
          rgba(184, 168, 227, 0.18) 75%,
          transparent 100%
        )`,
        maskImage:    'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        marginTop:   'clamp(2.5rem, 6vw, 4rem)',
      }}
    />
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function ChapterThree() {
  const shouldReduce = useReducedMotion() ?? false;

  // Cards 8–11 (0-indexed) are the heavier, more personal thoughts
  const isHeavy = (index: number) => index >= 7;

  return (
    <section
      id="chapter-three"
      aria-labelledby="chapter-three-title"
      style={{
        paddingTop:    'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(5rem, 12vw, 8rem)',
      }}
    >
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ── Chapter badge ────────────────────────────────────────── */}
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <span className="chapter-badge">Chapter Three</span>
            </div>
          </FadeIn>

          {/* ── Title ────────────────────────────────────────────────── */}
          <FadeIn delay={0.1}>
            <h2
              id="chapter-three-title"
              className="text-glow"
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(2rem, 7vw, 3.5rem)',
                fontWeight:    300,
                lineHeight:    1.2,
                letterSpacing: '-0.01em',
                color:         '#F8FAFC',
                marginBottom:  '1rem',
              }}
            >
              The little things that quietly became you.
            </h2>
          </FadeIn>

          {/* ── Subtitle ─────────────────────────────────────────────── */}
          <FadeIn delay={0.2}>
            <p
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      'clamp(0.75rem, 1.8vw, 0.875rem)',
                fontWeight:    400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         'rgba(137,207,240,0.5)',
              }}
            >
              The things I&apos;ll always associate with you.
            </p>
          </FadeIn>

          {/* ── Breathing space ──────────────────────────────────────── */}
          <div style={{ height: 'clamp(3rem, 7vw, 5rem)' }} aria-hidden="true" />

          {/* ── Card stack ───────────────────────────────────────────── */}
          {/*
            Cards are staggered: each one has a slightly longer FadeIn
            viewport margin so they reveal one at a time rather than
            all at once when the section enters the screen.
          */}
          <div
            style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           'clamp(1rem, 2.5vw, 1.5rem)',
            }}
          >
            {THOUGHTS.map((thought, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: shouldReduce ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  // Progressive reveal: earlier cards trigger sooner,
                  // later cards need to scroll further into view
                  margin: `-${40 + i * 4}px`,
                }}
                transition={{
                  duration: shouldReduce ? 0.01 : 0.75,
                  ease:     [0.25, 0.1, 0.25, 1],
                  // Slight stagger within the viewport window
                  delay:    shouldReduce ? 0 : 0.05,
                }}
              >
                <ThoughtCard
                  text={thought}
                  heavy={isHeavy(i)}
                />
              </motion.div>
            ))}
          </div>

          {/* ── Breathing space before closing ───────────────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 5.5rem)' }} aria-hidden="true" />

          {/* ── Closing sentence ─────────────────────────────────────── */}
          <FadeIn direction="none">
            <p
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(1.125rem, 3.2vw, 1.5rem)',
                fontWeight:    300,
                fontStyle:     'italic',
                color:         'rgba(248,250,252,0.65)',
                lineHeight:    1.65,
                textAlign:     'center',
                maxWidth:      '500px',
                marginInline:  'auto',
                letterSpacing: '0.01em',
              }}
            >
              It&apos;s funny how someone slowly becomes home in the smallest ways.
            </p>
          </FadeIn>

          {/* ── Divider fading into next section ─────────────────────── */}
          <FadeIn direction="none">
            {/* Bob sleeps near the bottom-left corner of this section */}
            <div style={{ position: 'relative' }}>
              <ClosingDivider />
              <BobEasterEgg
                style={{
                  position: 'absolute',
                  bottom:   '-4px',
                  left:     'clamp(0px, 2%, 16px)',
                  // Tilt slightly — sleeping pose
                  transform: 'rotate(-12deg)',
                }}
              />
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
