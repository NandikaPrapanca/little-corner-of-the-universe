'use client';

/**
 * PomTransition.tsx
 * The bridge between the story chapters and the final letter.
 *
 * Sequence:
 * 1. Generous quiet space — night sky breathes.
 * 2. Pom walks in from the left using a 5-frame sprite animation at 10 FPS.
 * 3. Pom reaches center, transitions to sitting-with-envelope pose.
 * 4. Pom idles: blinks, tail wag, breathing.
 * 5. Envelope glows softly every few seconds.
 * 6. User clicks/taps the envelope.
 * 7. Opening sequence:
 *    a. Pom releases — steps back slightly.
 *    b. Envelope floats upward and enlarges.
 *    c. Background overlay darkens.
 *    d. Envelope flap opens (SVG animation).
 *    e. After completion → Letter section fades in.
 * 8. Volume ducks gently during the opening, restores when letter is visible.
 *
 * Walk frames (10 FPS, 100ms per frame):
 *   /characters/pom/walk-1.png  through  walk-5.png
 *
 * Sitting / envelope sprites:
 *   /characters/pom/sit-envelope.png
 *   /characters/pom/sit.png
 *   /characters/pom/envelope-open.png
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  type CSSProperties,
} from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimation,
} from 'framer-motion';
import { AudioContext } from '@/components/AudioProvider';
import FadeIn    from '@/components/ui/FadeIn';
import Container from '@/components/ui/Container';
import Letter    from '@/components/sections/Letter';

// ─── Asset paths ──────────────────────────────────────────────────────────

// Walk cycle — 5 frames, played at 10 FPS (100ms per frame)
const WALK_FRAMES = [
  '/characters/pom/walk-1.png',
  '/characters/pom/walk-2.png',
  '/characters/pom/walk-3.png',
  '/characters/pom/walk-4.png',
  '/characters/pom/walk-5.png',
] as const;

const SIT_ENVELOPE  = '/characters/pom/sit-envelope.png';
const SIT           = '/characters/pom/sit.png';
const ENVELOPE_OPEN = '/characters/pom/envelope-open.png';

// All assets that should be preloaded before walking begins
const ALL_ASSETS: readonly string[] = [
  ...WALK_FRAMES,
  SIT_ENVELOPE,
  SIT,
  ENVELOPE_OPEN,
];

// Walk animation: 100ms per frame = 10 FPS
const WALK_FRAME_MS    = 100;
const WALK_FRAME_COUNT = WALK_FRAMES.length; // 5

// ─── Sprite size ──────────────────────────────────────────────────────────

const POM_W = 160; // px — rendered width
const POM_H = 160; // px — rendered height

// ─── Asset preloader ──────────────────────────────────────────────────────
/**
 * Preloads all Pom sprite assets in parallel without blocking rendering.
 * Returns true when all walk frames have resolved (loaded or errored).
 * Logs a console warning for each image that fails to load.
 */
function useSpritePreloader(): boolean {
  const [walkReady, setWalkReady] = useState(false);

  useEffect(() => {
    let resolvedWalkCount = 0;

    ALL_ASSETS.forEach((src) => {
      const img = new window.Image();

      const onDone = () => {
        if ((WALK_FRAMES as readonly string[]).includes(src)) {
          resolvedWalkCount++;
          if (resolvedWalkCount === WALK_FRAME_COUNT) {
            setWalkReady(true);
          }
        }
      };

      img.onload  = onDone;
      img.onerror = () => {
        console.warn(`[PomTransition] Failed to preload sprite: ${src}`);
        onDone();
      };

      img.src = src;
    });
  }, []);

  return walkReady;
}

// ─── Sprite Pom ───────────────────────────────────────────────────────────
// Renders a single sprite frame. No crossfade — just an img swap.

interface SpritePomProps {
  src:     string;
  blink:   boolean;
  breathe: boolean;
}

function SpritePom({ src, breathe }: SpritePomProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={POM_W}
      height={POM_H}
      style={{
        imageRendering:  'auto',           // preserve quality, no pixel-art scaling
        transform:       breathe ? 'scaleY(1.015) translateY(-1px)' : 'scaleY(1)',
        transition:      'transform 1.2s ease-in-out',
        transformOrigin: 'bottom center',
        display:         'block',
        width:           `${POM_W}px`,    // fixed size prevents layout shift on frame swap
        height:          `${POM_H}px`,
        objectFit:       'contain',
      }}
    />
  );
}

// ─── Envelope SVG ─────────────────────────────────────────────────────────
// Drawn as SVG so the flap can animate with Framer Motion.
// Not modified in this prompt — kept identical to previous implementation.

interface EnvelopeSVGProps {
  isOpen:       boolean;
  shouldReduce: boolean;
  style?:       CSSProperties;
}

function EnvelopeSVG({ isOpen, shouldReduce, style }: EnvelopeSVGProps) {
  const W = 72;
  const H = 50;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="3"
        fill="rgba(16,37,61,0.75)"
        stroke="rgba(137,207,240,0.4)"
        strokeWidth="1"
      />
      <line x1="0" y1={H} x2={W / 2} y2={H * 0.54}
        stroke="rgba(137,207,240,0.12)" strokeWidth=".75" />
      <line x1={W} y1={H} x2={W / 2} y2={H * 0.54}
        stroke="rgba(137,207,240,0.12)" strokeWidth=".75" />
      <motion.path
        d={`M 0 0 L ${W} 0 L ${W / 2} ${H * 0.46} Z`}
        fill="rgba(16,37,61,0.9)"
        stroke="rgba(137,207,240,0.4)"
        strokeWidth="1"
        strokeLinejoin="round"
        style={{ transformOrigin: `${W / 2}px 0px` }}
        animate={shouldReduce ? {} : isOpen
          ? { rotateX: 180, opacity: 0.25 }
          : { rotateX: 0,   opacity: 1   }
        }
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      />
      <circle cx={W / 2} cy={H * 0.7} r="4"
        fill="rgba(184,168,227,0.3)"
        stroke="rgba(184,168,227,0.55)"
        strokeWidth=".75"
      />
    </svg>
  );
}

// ─── Stage type ───────────────────────────────────────────────────────────
// Unchanged — same state machine as before.

type PomStage =
  | 'hidden'
  | 'walking'
  | 'sitting'
  | 'releasing'
  | 'opening'
  | 'done';

// ─── Main Component ───────────────────────────────────────────────────────

export default function PomTransition() {
  const shouldReduce = useReducedMotion() ?? false;
  const audio        = useContext(AudioContext);

  // Preload all sprites — walk begins once all walk frames are ready
  const walkReady = useSpritePreloader();

  // Stage machine state (unchanged)
  const [stage,      setStage]      = useState<PomStage>('hidden');
  // Walk frame index: 0–4 cycling through WALK_FRAMES at 10 FPS
  const [walkFrame,  setWalkFrame]  = useState(0);
  // Idle animation state (used when sitting)
  const [blink,      setBlink]      = useState(false);
  const [breathe,    setBreathe]    = useState(false);
  const [wagPhase,   setWagPhase]   = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const walkIntervalRef    = useRef<ReturnType<typeof setInterval>  | null>(null);
  const blinkIntervalRef   = useRef<ReturnType<typeof setInterval>  | null>(null);
  const breatheIntervalRef = useRef<ReturnType<typeof setInterval>  | null>(null);
  const wagIntervalRef     = useRef<ReturnType<typeof setInterval>  | null>(null);
  const sectionRef         = useRef<HTMLDivElement>(null);

  const pomControls = useAnimation();
  const envControls = useAnimation();

  // ── Volume duck helper ──────────────────────────────────────────────
  const duckVolume = useCallback((targetVolume: number, durationMs: number) => {
    if (!audio) return;
    const start  = audio.volume;
    const delta  = targetVolume - start;
    const steps  = 20;
    const stepMs = durationMs / steps;
    let i = 0;
    const id = setInterval(() => {
      i++;
      audio.setVolume(Math.max(0, Math.min(1, start + delta * (i / steps))));
      if (i >= steps) clearInterval(id);
    }, stepMs);
  }, [audio]);

  // ── Trigger walk when section enters viewport ───────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && stage === 'hidden') {
          setStage('walking');
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [stage]);

  // ── Walk animation ──────────────────────────────────────────────────
  // 5-frame cycle at 10 FPS. Movement duration ~4s.
  useEffect(() => {
    if (stage !== 'walking') return;

    // Advance one frame every 100ms — cycles 0 → 1 → 2 → 3 → 4 → 0 → …
    walkIntervalRef.current = setInterval(() => {
      setWalkFrame(f => (f + 1) % WALK_FRAME_COUNT);
    }, WALK_FRAME_MS);

    // Translate from off-screen left to center
    const walkDuration = shouldReduce ? 0.01 : 4;

    pomControls.start({
      x: 0,
      transition: { duration: walkDuration, ease: 'linear' },
    }).then(() => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      setStage('sitting');
    });

    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [stage, pomControls, shouldReduce]);

  // ── Idle animations once sitting ────────────────────────────────────
  // (unchanged from previous implementation)
  useEffect(() => {
    if (stage !== 'sitting') return;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      blinkIntervalRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 150);
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };
    scheduleBlink();

    breatheIntervalRef.current = setInterval(() => {
      setBreathe(b => !b);
    }, 2000);

    wagIntervalRef.current = setInterval(() => {
      setWagPhase(w => !w);
    }, 600);

    return () => {
      if (blinkIntervalRef.current)  clearTimeout(blinkIntervalRef.current as unknown as ReturnType<typeof setTimeout>);
      if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
      if (wagIntervalRef.current)     clearInterval(wagIntervalRef.current);
    };
  }, [stage]);

  // ── Envelope click ──────────────────────────────────────────────────
  // (unchanged from previous implementation)
  const handleEnvelopeClick = useCallback(async () => {
    if (stage !== 'sitting') return;

    if (blinkIntervalRef.current)   clearTimeout(blinkIntervalRef.current as unknown as ReturnType<typeof setTimeout>);
    if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
    if (wagIntervalRef.current)     clearInterval(wagIntervalRef.current);

    setStage('releasing');
    duckVolume(0.3, 1200);

    await pomControls.start({
      x:     shouldReduce ? 0 : -12,
      scale: shouldReduce ? 1 : 0.95,
      transition: { duration: 0.5, ease: 'easeOut' },
    });

    setStage('opening');

    await envControls.start({
      y:     shouldReduce ? 0 : -60,
      scale: shouldReduce ? 1 : 2.2,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
    });

    await new Promise<void>(res => setTimeout(res, shouldReduce ? 0 : 700));

    setShowLetter(true);
    setStage('done');
    duckVolume(0.6, 1500);
  }, [stage, pomControls, envControls, duckVolume, shouldReduce]);

  // ── Computed values ──────────────────────────────────────────────────

  const isSitting    = stage === 'sitting' || stage === 'releasing' || stage === 'opening' || stage === 'done';
  const envelopeOpen = stage === 'opening' || stage === 'done';
  const isDone       = stage === 'done';

  // Sprite source:
  //   walking → cycle through WALK_FRAMES (5 frames)
  //   sitting and beyond → sit-envelope sprite
  const currentSrc: string = isSitting
    ? SIT_ENVELOPE
    : WALK_FRAMES[walkFrame];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          POM TRANSITION SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="pom-transition"
        aria-label="A small Pomeranian arrives with a letter"
        ref={sectionRef}
        style={{
          paddingTop:    'clamp(6rem, 16vw, 11rem)',
          paddingBottom: 'clamp(4rem, 10vw, 7rem)',
          position:      'relative',
          overflow:      'hidden',
        }}
      >
        <Container>
          <div
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
            }}
          >
            {/* ── Pom + envelope stage ──────────────────────────────── */}
            <div
              aria-live="polite"
              aria-label={
                isSitting
                  ? 'A small Pomeranian sits patiently holding a glowing envelope'
                  : 'A small Pomeranian is walking toward you'
              }
              style={{
                position:       'relative',
                height:         `${POM_H + 40}px`,
                display:        'flex',
                alignItems:     'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* ── Pom sprite ───────────────────────────────────────── */}
              {/*
                Only renders once sprites are preloaded (walkReady).
                currentSrc switches between walk frames and sit-envelope
                automatically — no separate placeholder branch.
              */}
              <AnimatePresence>
                {stage !== 'hidden' && walkReady && (
                  <motion.div
                    key="pom"
                    style={{
                      position: 'relative',
                      zIndex:   2,
                      x:        !isSitting ? '-50vw' : 0,
                    }}
                    initial={{ x: shouldReduce ? 0 : '-50vw', opacity: shouldReduce ? 1 : 0.8 }}
                    animate={pomControls}
                  >
                    <SpritePom
                      src={currentSrc}
                      blink={blink}
                      breathe={breathe}
                    />

                    {/* Tail wag overlay while sitting */}
                    {isSitting && (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position:        'absolute',
                          right:           '-8px',
                          bottom:          '28px',
                          width:           '22px',
                          height:          '12px',
                          borderRadius:    '0 50% 50% 0',
                          border:          '1.5px solid rgba(255,244,194,0.4)',
                          borderLeft:      'none',
                          transformOrigin: 'left center',
                        }}
                        animate={shouldReduce ? {} : wagPhase
                          ? { rotate: 25, scaleY: 1.1 }
                          : { rotate: -15, scaleY: 0.9 }
                        }
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Envelope (floating above Pom while sitting) ──────── */}
              <AnimatePresence>
                {isSitting && !isDone && (
                  <motion.div
                    key="envelope"
                    initial={{ opacity: 0, y: 0, scale: 1 }}
                    animate={envControls}
                    style={{
                      position: 'absolute',
                      bottom:   `${POM_H - 20}px`,
                      zIndex:   3,
                      cursor:   stage === 'sitting' ? 'pointer' : 'default',
                    }}
                  >
                    {/* Breathing glow behind envelope */}
                    <motion.div
                      aria-hidden="true"
                      style={{
                        position:      'absolute',
                        inset:         '-16px',
                        borderRadius:  '50%',
                        background:    'radial-gradient(circle, rgba(137,207,240,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      }}
                      animate={shouldReduce || stage !== 'sitting' ? {} : {
                        opacity: [0.3, 0.9, 0.3],
                        scale:   [0.9, 1.1, 0.9],
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <motion.button
                      onClick={handleEnvelopeClick}
                      aria-label="Open the letter"
                      disabled={stage !== 'sitting'}
                      style={{
                        background:     'none',
                        border:         'none',
                        padding:        '8px',
                        cursor:         stage === 'sitting' ? 'pointer' : 'default',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        minWidth:       '60px',
                        minHeight:      '60px',
                      } as CSSProperties}
                      whileHover={stage === 'sitting' && !shouldReduce ? { scale: 1.08 } : undefined}
                      whileTap={stage  === 'sitting' && !shouldReduce ? { scale: 0.95 } : undefined}
                      transition={{ duration: 0.2 }}
                    >
                      <EnvelopeSVG
                        isOpen={envelopeOpen}
                        shouldReduce={shouldReduce}
                      />
                    </motion.button>

                    {/* "open" hint while waiting */}
                    <AnimatePresence>
                      {stage === 'sitting' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 1.5, duration: 0.8 }}
                          style={{
                            fontFamily:    'var(--font-inter)',
                            fontSize:      '0.625rem',
                            fontWeight:    300,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color:         'rgba(137,207,240,0.4)',
                            textAlign:     'center',
                            marginTop:     '10px',
                            pointerEvents: 'none',
                          }}
                        >
                          open
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Ground line ──────────────────────────────────────── */}
              {stage !== 'hidden' && (
                <div
                  aria-hidden="true"
                  style={{
                    position:   'absolute',
                    bottom:     0,
                    left:       '50%',
                    transform:  'translateX(-50%)',
                    width:      '120px',
                    height:     '1px',
                    background: 'radial-gradient(ellipse at center, rgba(137,207,240,0.15) 0%, transparent 70%)',
                  }}
                />
              )}
            </div>

            {/* ── Empty-space holder while stage is hidden ─────────────── */}
            {stage === 'hidden' && (
              <FadeIn direction="none">
                <p
                  aria-hidden="true"
                  style={{
                    fontFamily:    'var(--font-inter)',
                    fontSize:      '0.625rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'rgba(137,207,240,0.25)',
                    marginTop:     '2rem',
                    textAlign:     'center',
                  }}
                >
                  &nbsp;
                </p>
              </FadeIn>
            )}
          </div>
        </Container>

        {/* ── Darkening overlay during envelope opening ─────────────── */}
        <AnimatePresence>
          {(stage === 'opening' || stage === 'done') && (
            <motion.div
              aria-hidden="true"
              style={{
                position:      'fixed',
                inset:         0,
                background:    'rgba(7,24,39,0.55)',
                zIndex:        10,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LETTER — revealed after envelope opens
      ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0.01 : 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Letter />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
