'use client';

/**
 * ChapterOne.tsx
 * "How Our Stories Crossed" — the first story section.
 *
 * Layout:
 *   - Chapter badge
 *   - Large cinematic opening line
 *   - Subtitle
 *   - Generous whitespace breath
 *   - Story split into small readable moments, each fading in on scroll
 *   - Closing italic sentence, centered
 *   - Constellation divider fading into the next section
 *
 * No photos. No placeholders. Text only.
 */

import { motion, useReducedMotion } from 'framer-motion';
import FadeIn from '@/components/ui/FadeIn';
import Container from '@/components/ui/Container';
import BobEasterEgg from '@/components/ui/BobEasterEgg';

// ─── Constellation divider ─────────────────────────────────────────────────
// A tiny hand-drawn constellation — three stars connected by faint lines.
// Fades out toward the bottom to blend softly into the next section.

function ConstellationDivider() {
  // Star positions in a 120×40 viewBox
  // Three stars arranged like a loose triangle
  const stars = [
    { cx: 20,  cy: 20  },
    { cx: 60,  cy: 8   },
    { cx: 100, cy: 22  },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        display:        'flex',
        justifyContent: 'center',
        paddingBlock:   '2.5rem',
        // Fade to nothing at the bottom
        maskImage:      'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)',
      }}
    >
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connecting lines — very faint */}
        <line
          x1={stars[0].cx} y1={stars[0].cy}
          x2={stars[1].cx} y2={stars[1].cy}
          stroke="rgba(137,207,240,0.18)"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        <line
          x1={stars[1].cx} y1={stars[1].cy}
          x2={stars[2].cx} y2={stars[2].cy}
          stroke="rgba(137,207,240,0.18)"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        <line
          x1={stars[0].cx} y1={stars[0].cy}
          x2={stars[2].cx} y2={stars[2].cy}
          stroke="rgba(137,207,240,0.10)"
          strokeWidth="0.5"
          strokeDasharray="1.5 4"
        />

        {/* Stars — two small, one slightly larger */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={i === 1 ? 2 : 1.5}
            fill="#FFF4C2"
            opacity={i === 1 ? 0.75 : 0.55}
          />
        ))}

        {/* Tiny glow on the center star */}
        <circle
          cx={stars[1].cx}
          cy={stars[1].cy}
          r="5"
          fill="rgba(255,244,194,0.06)"
        />
      </svg>
    </div>
  );
}

// ─── Story beat — a single readable paragraph ──────────────────────────────
// Each beat gets its own FadeIn so they reveal independently on scroll.

interface BeatProps {
  text:      string;
  delay?:    number;
  align?:    'left' | 'center';
  size?:     'body' | 'small';
  italic?:   boolean;
  spacing?:  'normal' | 'loose';
}

function Beat({
  text,
  delay   = 0,
  align   = 'left',
  size    = 'body',
  italic  = false,
  spacing = 'normal',
}: BeatProps) {
  const fontSize = size === 'small'
    ? 'clamp(0.8125rem, 2vw, 0.9375rem)'
    : 'clamp(0.9375rem, 2.4vw, 1.0625rem)';

  return (
    <FadeIn delay={delay}>
      <p
        style={{
          fontFamily:   'var(--font-inter)',
          fontSize,
          fontWeight:   300,
          fontStyle:    italic ? 'italic' : 'normal',
          color:        italic
            ? 'rgba(203,213,225,0.70)'
            : 'rgba(203,213,225,0.82)',
          lineHeight:   spacing === 'loose' ? 2.1 : 1.9,
          textAlign:    align,
          maxWidth:     align === 'center' ? '480px' : '100%',
          marginInline: align === 'center' ? 'auto' : undefined,
        }}
      >
        {text}
      </p>
    </FadeIn>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function ChapterOne() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section
      id="chapter-one"
      aria-labelledby="chapter-one-title"
      style={{
        paddingTop:    'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(4rem, 10vw, 7rem)',
      }}
    >
      <Container>
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            // All vertical rhythm lives here — no gap shorthand
            // so each gap can be tuned independently via margin
          }}
        >

          {/* ── Chapter badge ────────────────────────────────────── */}
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <span className="chapter-badge">Chapter One</span>
            </div>
          </FadeIn>

          {/* ── Opening line — large, cinematic ──────────────────── */}
          <FadeIn delay={0.1}>
            <h2
              id="chapter-one-title"
              className="text-glow"
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(2.25rem, 7.5vw, 3.75rem)',
                fontWeight:    300,
                lineHeight:    1.15,
                letterSpacing: '-0.01em',
                color:         '#F8FAFC',
                marginBottom:  '1.25rem',
              }}
            >
              Every story starts somewhere.
            </h2>
          </FadeIn>

          {/* ── Subtitle ─────────────────────────────────────────── */}
          <FadeIn delay={0.2}>
            <p
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      'clamp(0.75rem, 1.8vw, 0.875rem)',
                fontWeight:    400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         'rgba(137,207,240,0.5)',
                marginBottom:  '0',
              }}
            >
              How Our Stories Crossed
            </p>
          </FadeIn>

          {/* ── Breathing space before story ─────────────────────── */}
          <div style={{ height: 'clamp(3rem, 7vw, 5rem)' }} aria-hidden="true" />

          {/* ═══════════════════════════════════════════════════════
              STORY
              Each beat is its own paragraph — small, readable, with
              generous spacing between them. They reveal independently
              on scroll, giving the reading a cinematic pacing.
          ═══════════════════════════════════════════════════════ */}

          <div
            style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           'clamp(1.75rem, 4vw, 2.5rem)',
            }}
          >

            <Beat
              text="Sometimes the people who become important in our lives arrive in the most ordinary ways."
              spacing="loose"
            />

            <Beat
              text="Ours started with a Discord call."
              italic
              align="center"
            />

            <Beat
              text="Albani and i was in a discord server voice call, and you ended up joining me. At the time, it was simply another evening. Another game. Nothing about it felt extraordinary."
            />

            {/* Breath pause — visual gap before the shift */}
            <div style={{ height: 'clamp(0.5rem, 2vw, 1rem)' }} aria-hidden="true" />

            <Beat
              text="Then one day..."
              italic
              align="center"
              size="small"
            />

            <Beat
              text="You followed me on Instagram. A little later, you were the one who sent me a message asking to play Genshin."
            />

            <Beat
              text="Looking back now..."
              italic
              align="center"
              size="small"
            />

            <Beat
              text="It's funny how something so ordinary slowly became part of my everyday life."
              spacing="loose"
            />

            <Beat
              text="Somewhere between random games, late night calls, listening to every story you had to tell, and countless conversations..."
            />

            <Beat
              text="Talking to you stopped feeling like something I chose to do. It simply became part of my day."
              spacing="loose"
            />

            <Beat
              text="And honestly..."
              italic
              align="center"
              size="small"
            />

            <Beat
              text="I'm really grateful that it did."
              align="center"
              spacing="loose"
            />

          </div>

          {/* ── Generous space before closing line ───────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 5.5rem)' }} aria-hidden="true" />

          {/* ── Closing sentence — centered italic ───────────────── */}
          <FadeIn>
            <motion.p
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(1.125rem, 3.2vw, 1.5rem)',
                fontWeight:    300,
                fontStyle:     'italic',
                color:         'rgba(248,250,252,0.72)',
                lineHeight:    1.65,
                textAlign:     'center',
                maxWidth:      '520px',
                marginInline:  'auto',
                letterSpacing: '0.01em',
              }}
              // Subtle text glow — softer than the h2 version
              animate={shouldReduce ? {} : {
                textShadow: [
                  '0 0 20px rgba(137,207,240,0.0)',
                  '0 0 20px rgba(137,207,240,0.18)',
                  '0 0 20px rgba(137,207,240,0.0)',
                ],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              "I didn't know it then...but that random evening would become
              one of my favorite beginnings."
            </motion.p>
          </FadeIn>

          {/* ── Constellation divider — fades into next section ──── */}
          <FadeIn direction="none">
            {/* Bob sits beside the constellation — easy to miss */}
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <ConstellationDivider />
              <BobEasterEgg
                style={{
                  position: 'absolute',
                  bottom:   '8px',
                  right:    'clamp(0px, 5%, 40px)',
                }}
              />
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
