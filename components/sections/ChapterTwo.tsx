'use client';

/**
 * ChapterTwo.tsx
 * "These Would Be Mine" — the scrapbook section.
 *
 * Three photos laid out like pages of a physical scrapbook:
 *   - Organic rotation, masking tape corners, paper shadows
 *   - Each photo has its own caption, story text, and decorative details
 *   - Photos fade in slowly on scroll, one at a time
 *   - Tiny scattered stars and sparkles decorate the margins
 *
 * Photos:
 *   img01-genshin.webp  — hero, centered, largest
 *   img02-discord.webp  — rotated right, tape top-left corner
 *   img03-selfie.webp   — rotated left, tape top-right corner
 */

import Image            from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import FadeIn           from '@/components/ui/FadeIn';
import Container        from '@/components/ui/Container';
import BobEasterEgg     from '@/components/ui/BobEasterEgg';

// ─── Types ────────────────────────────────────────────────────────────────

interface TapeProps {
  /** Which corner to place the tape strip */
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// ─── Masking tape strip ────────────────────────────────────────────────────
// A small translucent rectangle that looks like torn washi tape.

function Tape({ corner }: TapeProps) {
  const positions: Record<TapeProps['corner'], React.CSSProperties> = {
    'top-left':     { top: '-8px',  left: '18px',  transform: 'rotate(-8deg)'  },
    'top-right':    { top: '-8px',  right: '18px', transform: 'rotate(6deg)'   },
    'bottom-left':  { bottom: '-8px', left: '18px',  transform: 'rotate(5deg)' },
    'bottom-right': { bottom: '-8px', right: '18px', transform: 'rotate(-7deg)'},
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position:     'absolute',
        width:        '48px',
        height:       '14px',
        // Slightly warm translucent beige — washi tape
        background:   'rgba(255,248,220,0.55)',
        borderRadius: '1px',
        // Torn paper edges via box-shadow
        boxShadow:    'inset 0 0 0 0.5px rgba(180,160,100,0.25)',
        // Very faint texture lines
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          rgba(200,180,120,0.07) 3px,
          rgba(200,180,120,0.07) 4px
        )`,
        ...positions[corner],
      }}
    />
  );
}

// ─── Tiny decorative star ──────────────────────────────────────────────────

interface TinyStarProps {
  style?: React.CSSProperties;
  size?:  number;
  color?: string;
}

function TinyStar({ style, size = 3, color = '#FFF4C2' }: TinyStarProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position:     'absolute',
        width:        `${size}px`,
        height:       `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow:    `0 0 ${size * 2}px ${size}px ${color}40`,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

// ─── Four-pointed sparkle ──────────────────────────────────────────────────

function Sparkle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{
        position:     'absolute',
        pointerEvents: 'none',
        opacity:      0.45,
        ...style,
      }}
    >
      {/* Four-point star shape */}
      <path
        d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z"
        fill="#FFF4C2"
      />
    </svg>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────
// Mimics an in-game or messenger chat bubble — rounded, soft, dark surface.

function ChatBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '8px',
        background:   'rgba(16,37,61,0.85)',
        border:       '1px solid rgba(137,207,240,0.18)',
        borderRadius: '18px 18px 18px 4px', // tail on bottom-left
        padding:      '10px 16px',
        maxWidth:     '100%',
        boxShadow:    '0 2px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Tiny avatar dot */}
      <div
        aria-hidden="true"
        style={{
          width:           '7px',
          height:          '7px',
          borderRadius:    '50%',
          backgroundColor: 'rgba(137,207,240,0.5)',
          flexShrink:      0,
        }}
      />
      <span
        style={{
          fontFamily:    'var(--font-inter)',
          fontSize:      'clamp(0.8125rem, 2vw, 0.9375rem)',
          fontWeight:    300,
          fontStyle:     'italic',
          color:         'rgba(203,213,225,0.85)',
          letterSpacing: '0.01em',
          lineHeight:    1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Scrapbook photo card ──────────────────────────────────────────────────
// A photo mounted on a cream paper backing with tape, caption, and body text.

interface ScrapPhotoProps {
  src:        string;
  alt:        string;
  rotation:   number;    // degrees — paper tilt
  tapeCorner: TapeProps['corner'];
  caption:    string;
  children:   React.ReactNode; // body text / extra elements
  maxWidth?:  string;
  aspectRatio?: '4/3' | '3/4' | '1/1';
  align?:     'left' | 'center' | 'right';
}

function ScrapPhoto({
  src,
  alt,
  rotation,
  tapeCorner,
  caption,
  children,
  maxWidth    = '420px',
  aspectRatio = '4/3',
  align       = 'center',
}: ScrapPhotoProps) {
  const shouldReduce = useReducedMotion() ?? false;

  const ptMap = { '4/3': 75, '3/4': 133.3, '1/1': 100 };
  const pt    = ptMap[aspectRatio];

  const marginMap = {
    left:   '0 auto 0 0',
    center: '0 auto',
    right:  '0 0 0 auto',
  };

  return (
    <motion.div
      style={{
        position:    'relative',
        maxWidth,
        width:       '100%',
        margin:      marginMap[align],
        transform:   shouldReduce ? undefined : `rotate(${rotation}deg)`,
        willChange:  'transform',
      }}
      whileHover={shouldReduce ? undefined : {
        rotate: rotation * 0.35,
        scale:  1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
    >
      {/* ── Paper backing ─────────────────────────────────────────── */}
      <div
        style={{
          background:   '#F5F1E8',
          padding:      '10px 10px 40px 10px',
          borderRadius: '2px',
          boxShadow: `
            0 2px  6px  rgba(0,0,0,0.30),
            0 10px 28px rgba(0,0,0,0.22),
            inset 0 0 0 1px rgba(0,0,0,0.05)
          `,
          // Very subtle paper grain
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(255,252,240,0.6) 0%, transparent 60%),
            linear-gradient(160deg, #F7F3EA 0%, #F0EBD8 100%)
          `,
        }}
      >
        {/* Tape strip */}
        <Tape corner={tapeCorner} />

        {/* Photo image */}
        <div
          style={{
            position:   'relative',
            width:      '100%',
            paddingTop: `${pt}%`,
            overflow:   'hidden',
            borderRadius: '1px',
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 720px) 90vw, 480px"
            loading="lazy"
          />
          {/* Faint vignette over photo */}
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Caption — handwritten feel */}
        <div
          style={{
            paddingTop:    '10px',
            paddingInline: '4px',
            textAlign:     'center',
          }}
        >
          <span
            style={{
              fontFamily:    'var(--font-cormorant)',
              fontStyle:     'italic',
              fontSize:      'clamp(0.8125rem, 2vw, 0.9375rem)',
              color:         'rgba(60,48,36,0.65)',
              letterSpacing: '0.02em',
              lineHeight:    1.3,
            }}
          >
            {caption}
          </span>
        </div>
      </div>

      {/* Body text lives OUTSIDE the paper so it doesn't rotate with it */}
      {/* We break out of the transform by using a sibling below */}
      <div
        style={{
          // Un-rotate so body text sits straight — visual trick
          transform:  shouldReduce ? undefined : `rotate(${-rotation}deg)`,
          marginTop:  '1.75rem',
          paddingInline: '4px',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Body text helper ──────────────────────────────────────────────────────

function BodyText({
  children,
  align = 'left',
  italic = false,
  soft = false,
}: {
  children: React.ReactNode;
  align?:   'left' | 'center';
  italic?:  boolean;
  soft?:    boolean;
}) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-inter)',
        fontSize:   'clamp(0.875rem, 2.2vw, 1rem)',
        fontWeight: 300,
        fontStyle:  italic ? 'italic' : 'normal',
        color:      soft
          ? 'rgba(203,213,225,0.55)'
          : 'rgba(203,213,225,0.78)',
        lineHeight: 1.9,
        textAlign:  align,
        margin:     0,
      }}
    >
      {children}
    </p>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function ChapterTwo() {
  const shouldReduce = useReducedMotion() ?? false;

  return (
    <section
      id="chapter-two"
      aria-labelledby="chapter-two-title"
      style={{
        paddingTop:    'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(5rem, 12vw, 8rem)',
        // Slight overflow allowed for rotated photos on desktop
        overflowX:     'clip',
      }}
    >
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ── Chapter badge ──────────────────────────────────────── */}
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <span className="chapter-badge">Chapter Two</span>
            </div>
          </FadeIn>

          {/* ── Opening sentence ───────────────────────────────────── */}
          <FadeIn delay={0.1}>
            <h2
              id="chapter-two-title"
              className="text-glow"
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(2.25rem, 7.5vw, 3.75rem)',
                fontWeight:    300,
                lineHeight:    1.15,
                letterSpacing: '-0.01em',
                color:         '#F8FAFC',
                marginBottom:  '1rem',
              }}
            >
              If memories had pages...
            </h2>
          </FadeIn>

          {/* ── Subtitle ───────────────────────────────────────────── */}
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
              These would be mine.
            </p>
          </FadeIn>

          {/* ── Breathing space ────────────────────────────────────── */}
          <div style={{ height: 'clamp(4rem, 9vw, 6.5rem)' }} aria-hidden="true" />


          {/* ════════════════════════════════════════════════════════
              PHOTO ONE — Hero, centered, largest
          ════════════════════════════════════════════════════════ */}
          <FadeIn direction="none">
            {/* Relative wrapper for scattered decorations */}
            <div style={{ position: 'relative', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>

              {/* Scattered tiny stars around photo one */}
              <TinyStar style={{ top: '12%',  left: '-2%',  opacity: 0.6 }} size={2.5} />
              <TinyStar style={{ top: '5%',   right: '8%',  opacity: 0.45 }} size={2} />
              <TinyStar style={{ bottom: '20%', right: '-1%', opacity: 0.5 }} size={2} />
              <Sparkle  style={{ top: '-12px', left: '15%',  transform: 'rotate(15deg)' }} />
              <Sparkle  style={{ bottom: '30px', right: '12%', transform: 'rotate(-20deg)' }} />

              <ScrapPhoto
                src="/photos/img01-genshin.webp"
                alt="Genshin Impact screenshot — the moon area we explored together"
                rotation={-1.5}
                tapeCorner="top-left"
                caption="You probably remember this."
                maxWidth="480px"
                aspectRatio="4/3"
                align="center"
              >
                <div
                  style={{
                    display:       'flex',
                    flexDirection: 'column',
                    gap:           '1.25rem',
                    alignItems:    'flex-start',
                  }}
                >

                  {/* In-game chat bubble */}
                  <ChatBubble text="sorry, wish we could goto the moon together." />

      
                </div>
              </ScrapPhoto>
            </div>
          </FadeIn>


          {/* ── Gap between photos ─────────────────────────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 6rem)' }} aria-hidden="true" />


          {/* ════════════════════════════════════════════════════════
              PHOTO TWO — rotated right, tape top-left
          ════════════════════════════════════════════════════════ */}
          <FadeIn direction="none">
            <div style={{ position: 'relative' }}>

              <TinyStar style={{ top: '8%',    left: '4%',   opacity: 0.5 }} size={2} />
              <TinyStar style={{ bottom: '15%', right: '-1%', opacity: 0.45 }} size={2.5} color="rgba(184,168,227,0.9)" />
              <Sparkle  style={{ top: '-8px',  right: '20%', transform: 'rotate(10deg)' }} />

              <ScrapPhoto
                src="/photos/img02-discord.webp"
                alt="Discord screenshot — candid screenshot I saved"
                rotation={2.5}
                tapeCorner="top-left"
                caption="Caught you pouting."
                maxWidth="360px"
                aspectRatio="4/3"
                align="left"
              >
                <BodyText>
                  I still think it&apos;s funny that my first instinct was taking a
                  screenshot instead of saying anything.
                </BodyText>
              </ScrapPhoto>
            </div>
          </FadeIn>


          {/* ── Gap between photos ─────────────────────────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 6rem)' }} aria-hidden="true" />


          {/* ════════════════════════════════════════════════════════
              PHOTO THREE — rotated left, tape top-right
          ════════════════════════════════════════════════════════ */}
          <FadeIn direction="none">
            <div style={{ position: 'relative' }}>

              <TinyStar style={{ top: '10%',   right: '5%',  opacity: 0.5 }} size={2} />
              <TinyStar style={{ bottom: '20%', left: '-1%',  opacity: 0.4 }} size={2} color="rgba(184,168,227,0.9)" />
              <Sparkle  style={{ top: '-10px', left: '25%', transform: 'rotate(-12deg)' }} />
              <Sparkle  style={{ bottom: '20px', right: '8%', transform: 'rotate(18deg)' }} />

              <ScrapPhoto
                src="/photos/img03-selfie.webp"
                alt="Photo you sent out of nowhere"
                rotation={-2}
                tapeCorner="top-right"
                caption="Woppaaaaaa."
                maxWidth="300px"
                aspectRatio="3/4"
                align="right"
              >
                <div style={{ textAlign: 'right' }}>
                  <BodyText align="center">
                    Cute looking ahh girl.
                  </BodyText>
                </div>
              </ScrapPhoto>
            </div>
          </FadeIn>

            {/* ── Gap between photos ─────────────────────────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 6rem)' }} aria-hidden="true" />


            {/* ════════════════════════════════════════════════════════
              PHOTO FOUR — Hero, centered, largest
          ════════════════════════════════════════════════════════ */}
          <FadeIn direction="none">
            {/* Relative wrapper for scattered decorations */}
            <div style={{ position: 'relative', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>

              {/* Scattered tiny stars around photo one */}
              <TinyStar style={{ top: '12%',  left: '-2%',  opacity: 0.6 }} size={2.5} />
              <TinyStar style={{ top: '5%',   right: '8%',  opacity: 0.45 }} size={2} />
              <TinyStar style={{ bottom: '20%', right: '-1%', opacity: 0.5 }} size={2} />
              <Sparkle  style={{ top: '-12px', left: '15%',  transform: 'rotate(15deg)' }} />
              <Sparkle  style={{ bottom: '30px', right: '12%', transform: 'rotate(-20deg)' }} />

              <ScrapPhoto
                src="/photos/img04-baby.webp"
                alt="Genshin Impact screenshot — the moon area we explored together"
                rotation={-1.5}
                tapeCorner="top-left"
                caption="Just a baby."
                maxWidth="480px"
                aspectRatio="4/3"
                align="center"
              >
                <div
                  style={{
                    display:       'flex',
                    flexDirection: 'column',
                    gap:           '1.25rem',
                    alignItems:    'flex-start',
                  }}
                >

                  {/* In-game chat bubble */}
                  <ChatBubble text="AWWWWWWWWWWWWWWWWWWWWWW." />

      
                </div>
              </ScrapPhoto>
            </div>
          </FadeIn>


          {/* ── Gap between photos ─────────────────────────────────── */}
          <div style={{ height: 'clamp(3.5rem, 8vw, 6rem)' }} aria-hidden="true" />

          
          {/* ── Final breathing space ───────────────────────────────── */}
          <div style={{ position: 'relative' }}>
            <div style={{ height: 'clamp(2rem, 5vw, 4rem)' }} aria-hidden="true" />
            {/* Bob peeks beside the third photo area */}
            <BobEasterEgg
              flipX
              style={{
                position: 'absolute',
                bottom:   0,
                left:     'clamp(-8px, -1vw, -4px)',
              }}
            />
          </div>

          {/* ── Section divider — gradient line with ornament ──────── */}
          <FadeIn direction="none">
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '12px',
                marginTop:      'clamp(2rem, 5vw, 3.5rem)',
              }}
            >
              <div
                style={{
                  flex:       1,
                  height:     '1px',
                  background: 'linear-gradient(to right, transparent, rgba(137,207,240,0.2))',
                }}
              />
              {/* Three dots ornament */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(137,207,240,0.35)', display: 'inline-block' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF4C2', opacity: 0.5, display: 'inline-block' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(184,168,227,0.35)', display: 'inline-block' }} />
              </div>
              <div
                style={{
                  flex:       1,
                  height:     '1px',
                  background: 'linear-gradient(to left, transparent, rgba(184,168,227,0.2))',
                }}
              />
            </div>
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
