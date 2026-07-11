'use client';

/**
 * Landing.tsx
 * The opening of the storybook.
 *
 * Sequence of events:
 *   0.0s — dark screen, stars begin appearing in batches (handled by NightSky)
 *   2.8s — title "A Little Corner / of the Universe" fades in
 *   3.6s — "For Candy." appears
 *   4.3s — personal opening line fades in
 *   4.9s — whispered second line
 *   5.6s — illustrated envelope rises in and begins breathing glow
 *   7.0s — scroll hint star appears
 *
 * On envelope click:
 *   1. Music starts
 *   2. Envelope plays opening animation (flap lifts, body opens)
 *   3. Small light particles drift upward from the envelope
 *   4. After 600ms, smooth-scroll to #chapter-one
 */

import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useAnimation,
} from 'framer-motion';
import {
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { AudioContext } from '@/components/AudioProvider';

// ─── Tiny particle emitted when envelope opens ────────────────────────────
interface Particle {
  id:     number;
  x:      number; // px offset from envelope center
  drift:  number; // final x drift
  size:   number;
  delay:  number;
  color:  string;
}

function makeParticles(): Particle[] {
  const colors = [
    'rgba(137,207,240,0.7)',
    'rgba(184,168,227,0.6)',
    'rgba(255,244,194,0.8)',
  ];
  return Array.from({ length: 12 }, (_, i) => ({
    id:    i,
    x:     (Math.random() - 0.5) * 60,
    drift: (Math.random() - 0.5) * 80,
    size:  1.5 + Math.random() * 2,
    delay: Math.random() * 0.3,
    color: colors[i % colors.length],
  }));
}

// ─── SVG Envelope ─────────────────────────────────────────────────────────
// Hand-drawn style: body, closed flap, flap-open overlay.
// The flap is a separate element so it can animate independently.

interface EnvelopeProps {
  isOpen:       boolean;
  shouldReduce: boolean;
}

function Envelope({ isOpen, shouldReduce }: EnvelopeProps) {
  const W = 96;  // viewBox width
  const H = 68;  // viewBox height

  // Flap as a folded triangle (points downward when closed)
  // When open it rotates up around the top edge
  const flapPath = `M 0 0 L ${W} 0 L ${W / 2} ${H * 0.44} Z`;

  // Diagonal crease lines on body (like a real envelope)
  // Bottom-left to center, bottom-right to center
  const crease1 = `M 0 ${H} L ${W / 2} ${H * 0.52}`;
  const crease2 = `M ${W} ${H} L ${W / 2} ${H * 0.52}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* ── Envelope body ───────────────────────────────────────── */}
      <rect
        x="0.5" y="0.5"
        width={W - 1} height={H - 1}
        rx="3"
        fill="rgba(16,37,61,0.6)"
        stroke="rgba(137,207,240,0.35)"
        strokeWidth="1"
      />

      {/* ── Body crease lines ────────────────────────────────────── */}
      <path d={crease1} stroke="rgba(137,207,240,0.12)" strokeWidth="0.75" />
      <path d={crease2} stroke="rgba(137,207,240,0.12)" strokeWidth="0.75" />

      {/* ── Flap — animates open ─────────────────────────────────── */}
      {/*
        transformOrigin is the top edge of the envelope.
        rotateX(180deg) flips it back so it looks "open".
        We use a CSS perspective wrapper so the 3D rotation looks natural.
      */}
      <motion.path
        d={flapPath}
        fill="rgba(16,37,61,0.85)"
        stroke="rgba(137,207,240,0.35)"
        strokeWidth="1"
        strokeLinejoin="round"
        style={{ transformOrigin: '48px 0px' }}
        animate={
          shouldReduce
            ? {}
            : isOpen
            ? { rotateX: 180, opacity: 0.3 }
            : { rotateX: 0,   opacity: 1   }
        }
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* ── Subtle inner glow when breathing ─────────────────────── */}
      <rect
        x="12" y={H * 0.52}
        width={W - 24} height={H * 0.36}
        rx="2"
        fill="rgba(137,207,240,0.03)"
      />

      {/* ── Small wax seal dot ───────────────────────────────────── */}
      <circle
        cx={W / 2} cy={H * 0.68}
        r="3.5"
        fill="rgba(184,168,227,0.3)"
        stroke="rgba(184,168,227,0.5)"
        strokeWidth="0.75"
      />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function Landing() {
  const shouldReduce = useReducedMotion() ?? false;
  const audio        = useContext(AudioContext);

  const [envelopeOpen,    setEnvelopeOpen]    = useState(false);
  const [showParticles,   setShowParticles]   = useState(false);
  const [hasInteracted,   setHasInteracted]   = useState(false);
  const [particles]                           = useState<Particle[]>(makeParticles);

  const envelopeControls = useAnimation();
  const scrollTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll lock — disabled until user opens the envelope ────────────
  // Lock scroll on mount so the opening scene can't be skipped.
  // Unlock the moment the envelope is clicked (hasInteracted → true).
  useEffect(() => {
    // Lock
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Block keyboard scroll keys
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = [
        'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', ' ',
        'Home', 'End',
      ];
      if (blocked.includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockKeys, { passive: false });

    return () => {
      // Always restore on unmount (safety net)
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // Unlock as soon as the user has interacted
  useEffect(() => {
    if (!hasInteracted) return;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, [hasInteracted]);

  // Cleanup scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  const handleEnvelopeClick = useCallback(async () => {
    if (hasInteracted) return; // only open once
    setHasInteracted(true);

    // 1. Start music immediately on the user gesture
    if (audio) {
      audio.requestPlay().catch((err: unknown) => {
        console.warn('[Landing] audio.requestPlay rejected:', err);
      });
    }

    // 2. Envelope opening animation
    setEnvelopeOpen(true);

    // 3. Small particles drift up
    if (!shouldReduce) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1800);
    }

    // 4. After 600ms delay, scroll to chapter one
    scrollTimer.current = setTimeout(() => {
      const next = document.getElementById('chapter-one');
      if (next) {
        next.scrollIntoView({ behavior: shouldReduce ? 'auto' : 'smooth' });
      }
    }, 600);
  }, [hasInteracted, audio, shouldReduce, envelopeControls]);

  // ── Base fade-in config ─────────────────────────────────────────────
  const fadeUp = (delay: number) => ({
    initial:    { opacity: 0, y: shouldReduce ? 0 : 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: shouldReduce ? 0.01 : 1.0, ease: [0.25, 0.1, 0.25, 1] as const },
  });

  const fadeOnly = (delay: number) => ({
    initial:    { opacity: 0 },
    animate:    { opacity: 1 },
    transition: { delay, duration: shouldReduce ? 0.01 : 0.9, ease: 'easeOut' as const },
  });

  return (
    <section
      id="landing"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Welcome"
    >
      {/* ── Centered content column ──────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ maxWidth: '560px', width: '100%', paddingInline: '1.25rem' }}
      >

        {/* ── Title ───────────────────────────────────────────────────── */}
        <motion.h1
          className="text-glow"
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(2.6rem, 10.5vw, 4.75rem)',
            fontWeight:    300,
            lineHeight:    1.12,
            letterSpacing: '-0.02em',
            color:         '#F8FAFC',
            marginBottom:  '0.75rem',
          }}
          {...fadeUp(2.8)}
        >
          A Little Corner
          <br />
          <span style={{ fontStyle: 'italic', color: '#E8F4FF' }}>
            of the Universe
          </span>
        </motion.h1>

        {/* ── Recipient ───────────────────────────────────────────────── */}
        <motion.p
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(1.0625rem, 2.8vw, 1.25rem)',
            fontWeight:    300,
            fontStyle:     'italic',
            color:         'rgba(137,207,240,0.8)',
            letterSpacing: '0.03em',
            marginBottom:  '2.75rem',
          }}
          {...fadeOnly(3.6)}
        >
          For Candy.
        </motion.p>

        {/* ── Personal opening — main line ────────────────────────────── */}
        <motion.p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   'clamp(0.875rem, 2.2vw, 1rem)',
            fontWeight: 300,
            color:      'rgba(203,213,225,0.75)',
            lineHeight: 1.75,
            maxWidth:   '400px',
            marginBottom: '0.65rem',
          }}
          {...fadeOnly(4.3)}
        >
          You once asked why I never get tired of listening to your stories.
        </motion.p>

        {/* ── Whispered second line ────────────────────────────────────── */}
        <motion.p
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(0.9375rem, 2.4vw, 1.0625rem)',
            fontWeight:    300,
            fontStyle:     'italic',
            color:         'rgba(184,168,227,0.55)',  // softer, almost ghost
            letterSpacing: '0.01em',
            lineHeight:    1.6,
            maxWidth:      '340px',
            marginBottom:  '3.5rem',
          }}
          {...fadeOnly(4.9)}
        >
          Maybe this is my answer.
        </motion.p>

        {/* ── Envelope ────────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(5.6)}
          style={{ position: 'relative' }}
        >
          {/* Breathing glow behind the envelope — very soft */}
          <motion.div
            aria-hidden="true"
            style={{
              position:     'absolute',
              inset:        '-20px',
              borderRadius: '50%',
              background:   'radial-gradient(circle, rgba(137,207,240,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
            animate={shouldReduce ? {} : {
              opacity: [0.4, 0.9, 0.4],
              scale:   [0.92, 1.06, 0.92],
            }}
            transition={{
              duration:   4,
              repeat:     Infinity,
              ease:       'easeInOut',
            }}
          />

          {/* The envelope button */}
          <motion.button
            onClick={handleEnvelopeClick}
            aria-label="Open this letter"
            disabled={hasInteracted}
            style={{
              background:  'none',
              border:      'none',
              padding:     '8px',
              cursor:      hasInteracted ? 'default' : 'pointer',
              position:    'relative',
              display:     'block',
              // Minimum touch target: 44×44px
              minWidth:    '44px',
              minHeight:   '44px',
            }}
            whileHover={hasInteracted || shouldReduce ? undefined : { scale: 1.05 }}
            whileTap={hasInteracted  || shouldReduce ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Envelope isOpen={envelopeOpen} shouldReduce={shouldReduce} />
          </motion.button>

          {/* ── Particles that drift up when envelope opens ─────────── */}
          <AnimatePresence>
            {showParticles && particles.map((p) => (
              <motion.span
                key={p.id}
                aria-hidden="true"
                style={{
                  position:     'absolute',
                  bottom:       '50%',
                  left:         `calc(50% + ${p.x}px)`,
                  width:        `${p.size}px`,
                  height:       `${p.size}px`,
                  borderRadius: '50%',
                  background:   p.color,
                  pointerEvents: 'none',
                }}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  y:       [-8, -55 - Math.random() * 40],
                  x:       [0,  p.drift],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.2 + Math.random() * 0.6,
                  delay:    p.delay,
                  ease:     'easeOut',
                }}
              />
            ))}
          </AnimatePresence>

          {/* Open label — hidden after click */}
          <AnimatePresence>
            {!hasInteracted && (
              <motion.span
                style={{
                  display:       'block',
                  marginTop:     '14px',
                  fontFamily:    'var(--font-inter)',
                  fontSize:      '0.625rem',
                  fontWeight:    400,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color:         'rgba(137,207,240,0.4)',
                  textAlign:     'center',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ delay: 6, duration: 0.8 }}
              >
                open
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Scroll hint — single glowing star drifting down ──────────── */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduce ? 0 : 7.5, duration: 1 }}
      >
        <motion.div
          style={{
            width:           '3px',
            height:          '3px',
            borderRadius:    '50%',
            backgroundColor: '#FFF4C2',
            boxShadow:       '0 0 5px 2px rgba(255,244,194,0.45)',
          }}
          animate={shouldReduce ? {} : {
            y:       [0, 32, 0],
            opacity: [0.75, 0.1, 0.75],
          }}
          transition={{
            duration:   3.2,
            repeat:     Infinity,
            ease:       'easeInOut',
            delay:      0.5,
          }}
        />
      </motion.div>
    </section>
  );
}
