'use client';

/**
 * PomTransition.tsx
 * The bridge between the story chapters and the final letter.
 *
 * Stage machine (unchanged):
 *   hidden → walking → sitting → releasing → opening → done
 *
 * Sprite mapping:
 *   walking               → walk-1..5.png  (5-frame loop, ~9.5 FPS)
 *   sitting               → sit.png        (breathing animation)
 *   releasing             → sit-envelope.png
 *   opening | done        → envelope-open.png
 *
 * Walking extras:
 *   - Tiny vertical bob: translateY 0 → -2 → 0 → 2 → 0, ~0.45s per cycle
 *
 * Sitting extras:
 *   - Breathing: scaleY 1 → 1.015 → 1, 2.5s loop, transformOrigin bottom
 *
 * All SVG placeholder graphics have been removed.
 * No tail overlay SVG, no blink overlay — the PNG sprites handle everything.
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

const WALK_FRAMES = [
  '/characters/pom/walk-1.png',
  '/characters/pom/walk-2.png',
  '/characters/pom/walk-3.png',
  '/characters/pom/walk-4.png',
  '/characters/pom/walk-5.png',
] as const;

const SIT           = '/characters/pom/sit.png';
const SIT_ENVELOPE  = '/characters/pom/sit-envelope.png';
const ENVELOPE_OPEN = '/characters/pom/envelope-open.png';

const ALL_ASSETS: readonly string[] = [
  ...WALK_FRAMES,
  SIT,
  SIT_ENVELOPE,
  ENVELOPE_OPEN,
];

// ~9.5 FPS
const WALK_FRAME_MS    = 105;
const WALK_FRAME_COUNT = WALK_FRAMES.length; // 5

// ─── Sprite size ──────────────────────────────────────────────────────────

const POM_W = 160;
const POM_H = 160;

// ─── Asset preloader ──────────────────────────────────────────────────────
// Returns true once all walk frames have resolved (loaded or errored).
// Non-blocking — never delays rendering.

function useSpritePreloader(): boolean {
  const [walkReady, setWalkReady] = useState(false);

  useEffect(() => {
    let resolvedWalk = 0;

    ALL_ASSETS.forEach((src) => {
      const img = new window.Image();

      const done = () => {
        if ((WALK_FRAMES as readonly string[]).includes(src)) {
          resolvedWalk++;
          if (resolvedWalk === WALK_FRAME_COUNT) setWalkReady(true);
        }
      };

      img.onload  = done;
      img.onerror = () => {
        console.warn(`[PomTransition] Sprite failed to load: ${src}`);
        done();
      };

      img.src = src;
    });
  }, []);

  return walkReady;
}

// ─── Stage type ───────────────────────────────────────────────────────────

type PomStage =
  | 'hidden'
  | 'walking'
  | 'sitting'
  | 'releasing'
  | 'opening'
  | 'done';

// ─── Sprite source selection ──────────────────────────────────────────────
// Pure function — no side-effects.

function getSrc(stage: PomStage, walkFrame: number): string {
  switch (stage) {
    case 'hidden':
    case 'walking':
      return WALK_FRAMES[walkFrame];
    case 'sitting':
      return SIT;
    case 'releasing':
      return SIT_ENVELOPE;
    case 'opening':
    case 'done':
      return ENVELOPE_OPEN;
  }
}

// ─── Envelope SVG ─────────────────────────────────────────────────────────
// The SVG envelope that floats above Pom during the sitting/releasing stages.
// Still used because the real envelope asset for the floating overlay is SVG.
// envelope-open.png is shown as the Pom sprite in the opening stage,
// but the floating animated envelope element remains SVG.

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

// ─── Main Component ───────────────────────────────────────────────────────

export default function PomTransition() {
  const shouldReduce = useReducedMotion() ?? false;
  const audio        = useContext(AudioContext);
  const walkReady    = useSpritePreloader();

  const [stage,      setStage]      = useState<PomStage>('hidden');
  const [walkFrame,  setWalkFrame]  = useState(0);
  const [showLetter, setShowLetter] = useState(false);

  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef      = useRef<HTMLDivElement>(null);
  const pomControls     = useAnimation();
  const envControls     = useAnimation();

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
        if (entry.isIntersecting && stage === 'hidden') setStage('walking');
      },
      { threshold: 0.25 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [stage]);

  // ── Walk: frame cycle + horizontal movement ─────────────────────────
  useEffect(() => {
    if (stage !== 'walking') return;

    walkIntervalRef.current = setInterval(() => {
      setWalkFrame(f => (f + 1) % WALK_FRAME_COUNT);
    }, WALK_FRAME_MS);

    pomControls.start({
      x: 0,
      transition: { duration: shouldReduce ? 0.01 : 4, ease: 'linear' },
    }).then(() => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      setStage('sitting');
    });

    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [stage, pomControls, shouldReduce]);

  // ── Envelope click ──────────────────────────────────────────────────
  const handleEnvelopeClick = useCallback(async () => {
    if (stage !== 'sitting') return;

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

  // ── Derived values ───────────────────────────────────────────────────

  const isSitting    = stage === 'sitting' || stage === 'releasing' || stage === 'opening' || stage === 'done';
  const envelopeOpen = stage === 'opening' || stage === 'done';
  const isDone       = stage === 'done';
  const isWalking    = stage === 'walking';
  const currentSrc   = getSrc(stage, walkFrame);

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
            <div
              aria-live="polite"
              aria-label={
                isSitting
                  ? 'A small Pomeranian sits patiently'
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
              {/* ── Pom sprite ─────────────────────────────────────── */}
              <AnimatePresence>
                {stage !== 'hidden' && walkReady && (
                  <motion.div
                    key="pom"
                    style={{
                      position:        'relative',
                      zIndex:          2,
                      transformOrigin: 'bottom center',
                    }}
                    initial={{ x: shouldReduce ? 0 : '-50vw', opacity: shouldReduce ? 1 : 0.85 }}
                    animate={pomControls}
                  >
                    {/*
                      Walking bob: tiny vertical oscillation while frames cycle.
                      Only active during 'walking'; silenced otherwise.
                      scaleY breathing: only active during 'sitting'.
                    */}
                    <motion.div
                      style={{ transformOrigin: 'bottom center' }}
                      animate={shouldReduce ? {} : isWalking
                        // Subtle bob — 0 → -2 → 0 → 2 → 0 px, ~0.45s per cycle
                        ? { y: [0, -2, 0, 2, 0] }
                        // Breathing when sitting — scaleY 1 → 1.015 → 1
                        : stage === 'sitting'
                          ? { scaleY: [1, 1.015, 1] }
                          : {}
                      }
                      transition={shouldReduce ? {} : isWalking
                        ? {
                            duration:   0.45,
                            repeat:     Infinity,
                            ease:       'easeInOut',
                            repeatType: 'loop',
                          }
                        : {
                            duration:   2.5,
                            repeat:     Infinity,
                            ease:       'easeInOut',
                            repeatType: 'mirror',
                          }
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentSrc}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        style={{
                          display:        'block',
                          width:          `${POM_W}px`,
                          height:         `${POM_H}px`,
                          objectFit:      'contain',
                          imageRendering: 'auto',
                          // No extra CSS transforms — Framer Motion handles all movement
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Envelope overlay (floating, sits above Pom) ──────── */}
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
                    {/* Glow behind envelope */}
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
                      <EnvelopeSVG isOpen={envelopeOpen} shouldReduce={shouldReduce} />
                    </motion.button>

                    {/* "open" hint */}
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

              {/* ── Ground line ─────────────────────────────────────── */}
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

            {/* Spacer while hidden (prevents layout collapse) */}
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

        {/* ── Dark overlay during opening ───────────────────────────── */}
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
