'use client';

/**
 * PomTransition.tsx
 * The bridge between the story chapters and the final letter.
 *
 * Sequence:
 * 1. Generous quiet space — night sky breathes.
 * 2. Pom walks in from the left (two-frame walk cycle).
 * 3. Pom reaches center, transitions to sitting-with-envelope pose.
 * 4. Pom idles: blinks, tail wag, breathing.
 * 5. Envelope glows softly every few seconds.
 * 6. User clicks/taps the envelope.
 * 7. Opening sequence:
 *    a. Pom releases — steps back slightly.
 *    b. Envelope floats upward.
 *    c. Envelope scales up.
 *    d. Background overlay darkens.
 *    e. Envelope opens (paper unfold SVG animation).
 *    f. After completion → Letter section fades in.
 * 8. Volume ducks gently during the opening, restores when letter is visible.
 *
 * Asset paths (will be populated when illustrations are provided):
 *   /characters/pom/walk-01.webp   — walk frame 1
 *   /characters/pom/walk-02.webp   — walk frame 2
 *   /characters/pom/sit-envelope.webp — sitting, holding envelope
 *
 * If any asset is missing, a simple geometric placeholder is shown
 * so the animation system still runs correctly.
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
  type Variants,
} from 'framer-motion';
import { AudioContext } from '@/components/AudioProvider';
import FadeIn    from '@/components/ui/FadeIn';
import Container from '@/components/ui/Container';
import Letter    from '@/components/sections/Letter';

// ─── Asset paths ──────────────────────────────────────────────────────────

const WALK_1        = '/characters/pom/walk-01.webp';
const WALK_2        = '/characters/pom/walk-02.webp';
const SIT_ENVELOPE  = '/characters/pom/sit-envelope.webp';

// ─── Sprite size — consistent across both walk and sit frames ─────────────

const POM_W = 160; // px — rendered width on desktop
const POM_H = 160; // px

// ─── Asset existence check ────────────────────────────────────────────────
// Attempt to load each image; if it 404s, fall back to the placeholder.

function useSpriteReady(src: string): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const img = new window.Image();
    img.onload  = () => setReady(true);
    img.onerror = () => setReady(false);
    img.src = src;
  }, [src]);
  return ready;
}

// ─── Placeholder Pom ──────────────────────────────────────────────────────
// Shown when sprite images aren't available yet.
// A soft circular blob with dot eyes — reads as "a small creature".

interface PlaceholderPomProps {
  isWalking: boolean;
  walkFrame: 0 | 1;
  blink:     boolean;
  breathe:   boolean;
}

function PlaceholderPom({ blink, breathe }: PlaceholderPomProps) {
  return (
    <svg
      width={POM_W}
      height={POM_H}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{
        transform: breathe ? 'scaleY(1.02)' : 'scaleY(1)',
        transition: 'transform 1.2s ease-in-out',
        transformOrigin: 'bottom center',
      }}
    >
      {/* Body */}
      <ellipse cx="50" cy="62" rx="30" ry="26"
        fill="rgba(255,248,231,0.18)"
        stroke="rgba(255,244,194,0.35)"
        strokeWidth="1.5"
      />
      {/* Head */}
      <circle cx="50" cy="38" r="20"
        fill="rgba(255,248,231,0.18)"
        stroke="rgba(255,244,194,0.35)"
        strokeWidth="1.5"
      />
      {/* Ears */}
      <ellipse cx="33" cy="24" rx="6" ry="9" transform="rotate(-15 33 24)"
        fill="rgba(255,248,231,0.12)"
        stroke="rgba(255,244,194,0.25)"
        strokeWidth="1"
      />
      <ellipse cx="67" cy="24" rx="6" ry="9" transform="rotate(15 67 24)"
        fill="rgba(255,248,231,0.12)"
        stroke="rgba(255,244,194,0.25)"
        strokeWidth="1"
      />
      {/* Eyes — blink = line, open = circle */}
      {blink ? (
        <>
          <line x1="43" y1="38" x2="47" y2="38" stroke="rgba(255,244,194,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="53" y1="38" x2="57" y2="38" stroke="rgba(255,244,194,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="45" cy="38" r="2" fill="rgba(255,244,194,0.7)" />
          <circle cx="55" cy="38" r="2" fill="rgba(255,244,194,0.7)" />
        </>
      )}
      {/* Tiny nose */}
      <circle cx="50" cy="43" r="1.5" fill="rgba(255,244,194,0.5)" />
      {/* Envelope in paws */}
      <rect x="36" y="74" width="28" height="18" rx="2"
        fill="rgba(16,37,61,0.7)"
        stroke="rgba(137,207,240,0.4)"
        strokeWidth="1"
      />
      <path d="M36 74 L50 83 L64 74"
        stroke="rgba(137,207,240,0.3)"
        strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}

// ─── Sprite Pom ───────────────────────────────────────────────────────────

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
        imageRendering: 'pixelated',
        transform:      breathe ? 'scaleY(1.015) translateY(-1px)' : 'scaleY(1)',
        transition:     'transform 1.2s ease-in-out',
        transformOrigin: 'bottom center',
        display:        'block',
      }}
    />
  );
}

// ─── Envelope SVG ─────────────────────────────────────────────────────────
// Drawn as an SVG so we can animate the flap opening.

interface EnvelopeSVGProps {
  isOpen:      boolean;
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
      {/* Body */}
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="3"
        fill="rgba(16,37,61,0.75)"
        stroke="rgba(137,207,240,0.4)"
        strokeWidth="1"
      />
      {/* Bottom fold lines */}
      <line x1="0" y1={H} x2={W / 2} y2={H * 0.54}
        stroke="rgba(137,207,240,0.12)" strokeWidth=".75" />
      <line x1={W} y1={H} x2={W / 2} y2={H * 0.54}
        stroke="rgba(137,207,240,0.12)" strokeWidth=".75" />
      {/* Flap */}
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
      {/* Wax seal */}
      <circle cx={W / 2} cy={H * 0.7} r="4"
        fill="rgba(184,168,227,0.3)"
        stroke="rgba(184,168,227,0.55)"
        strokeWidth=".75"
      />
    </svg>
  );
}

// ─── Walk stage states ────────────────────────────────────────────────────

type PomStage =
  | 'hidden'        // before section is visible
  | 'walking'       // entering from left
  | 'sitting'       // arrived — idle with envelope
  | 'releasing'     // envelope leaving pom's paws
  | 'opening'       // envelope animating open
  | 'done';         // letter is now visible

// ─── Main Component ───────────────────────────────────────────────────────

export default function PomTransition() {
  const shouldReduce = useReducedMotion() ?? false;
  const audio        = useContext(AudioContext);

  // Sprite availability
  const walk1Ready = useSpriteReady(WALK_1);
  const walk2Ready = useSpriteReady(WALK_2);
  const sitReady   = useSpriteReady(SIT_ENVELOPE);
  const hasSprites = walk1Ready && walk2Ready && sitReady;

  // Animation state
  const [stage,     setStage]     = useState<PomStage>('hidden');
  const [walkFrame, setWalkFrame] = useState<0 | 1>(0);
  const [blink,     setBlink]     = useState(false);
  const [breathe,   setBreathe]   = useState(false);
  const [wagPhase,  setWagPhase]  = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  // Refs for intervals / timeouts so we clean up properly
  const walkIntervalRef  = useRef<ReturnType<typeof setInterval>  | null>(null);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval>  | null>(null);
  const breatheIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wagIntervalRef   = useRef<ReturnType<typeof setInterval>  | null>(null);
  const sectionRef       = useRef<HTMLDivElement>(null);

  // Framer controls for Pom and envelope
  const pomControls      = useAnimation();
  const envControls      = useAnimation();

  // ── Volume duck helper ──────────────────────────────────────────────
  const duckVolume = useCallback((targetVolume: number, durationMs: number) => {
    if (!audio) return;
    const start   = audio.volume;
    const delta   = targetVolume - start;
    const steps   = 20;
    const stepMs  = durationMs / steps;
    let   i       = 0;
    const id = setInterval(() => {
      i++;
      audio.setVolume(Math.max(0, Math.min(1, start + delta * (i / steps))));
      if (i >= steps) clearInterval(id);
    }, stepMs);
  }, [audio]);

  // ── Start walk-in when section enters viewport ──────────────────────
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
  useEffect(() => {
    if (stage !== 'walking') return;

    // Flip walk frames every 300ms
    walkIntervalRef.current = setInterval(() => {
      setWalkFrame(f => f === 0 ? 1 : 0);
    }, 300);

    // Animate Pom from off-screen left to center
    const walkDuration = shouldReduce ? 0.01 : 2.4;

    pomControls.start({
      x: 0,
      transition: {
        duration: walkDuration,
        ease:     'linear',
      },
    }).then(() => {
      // Arrived — stop walk, switch to sitting
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      setStage('sitting');
    });

    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [stage, pomControls, shouldReduce]);

  // ── Idle animations once sitting ────────────────────────────────────
  useEffect(() => {
    if (stage !== 'sitting') return;

    // Blink randomly every 3–6s
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

    // Breathing cycle — gentle scale every 2s
    breatheIntervalRef.current = setInterval(() => {
      setBreathe(b => !b);
    }, 2000);

    // Tail wag — alternates every 0.6s
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
  const handleEnvelopeClick = useCallback(async () => {
    if (stage !== 'sitting') return;

    // Stop idle animations
    if (blinkIntervalRef.current)  clearTimeout(blinkIntervalRef.current as unknown as ReturnType<typeof setTimeout>);
    if (breatheIntervalRef.current) clearInterval(breatheIntervalRef.current);
    if (wagIntervalRef.current)     clearInterval(wagIntervalRef.current);

    setStage('releasing');

    // 1. Duck volume gently
    duckVolume(0.3, 1200);

    // 2. Pom steps back slightly
    await pomControls.start({
      x:    shouldReduce ? 0 : -12,
      scale: shouldReduce ? 1 : 0.95,
      transition: { duration: 0.5, ease: 'easeOut' },
    });

    setStage('opening');

    // 3. Envelope floats up and enlarges
    await envControls.start({
      y:    shouldReduce ? 0 : -60,
      scale: shouldReduce ? 1 : 2.2,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
    });

    // 4. Small pause while flap animates (the SVG handles the flap rotate)
    await new Promise<void>(res => setTimeout(res, shouldReduce ? 0 : 700));

    // 5. Reveal letter
    setShowLetter(true);
    setStage('done');

    // 6. Restore volume
    duckVolume(0.6, 1500);
  }, [stage, pomControls, envControls, duckVolume, shouldReduce]);

  // ─── Computed values ────────────────────────────────────────────────

  const isSitting    = stage === 'sitting' || stage === 'releasing' || stage === 'opening' || stage === 'done';
  const envelopeOpen = stage === 'opening' || stage === 'done';
  const isDone       = stage === 'done';

  // Current walk sprite
  const walkSrc = walkFrame === 0 ? WALK_1 : WALK_2;
  const sitSrc  = SIT_ENVELOPE;

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
          // Generous quiet space — let the sky breathe
          paddingTop:    'clamp(6rem, 16vw, 11rem)',
          paddingBottom: 'clamp(4rem, 10vw, 7rem)',
          position:      'relative',
          overflow:      'hidden',
        }}
      >
        <Container>
          <div
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
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
                position: 'relative',
                height:   `${POM_H + 40}px`,  // +40 for envelope float room
                display:  'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* ── Pom sprite / placeholder ──────────────────────── */}
              <AnimatePresence>
                {stage !== 'hidden' && (
                  <motion.div
                    key="pom"
                    style={{
                      position: 'relative',
                      zIndex:   2,
                      // Start off-screen left during walk-in phase
                      x: !isSitting ? '-50vw' : 0,
                    }}
                    initial={{ x: shouldReduce ? 0 : '-50vw', opacity: shouldReduce ? 1 : 0.8 }}
                    animate={pomControls}
                  >
                    {hasSprites ? (
                      <SpritePom
                        src={isSitting ? sitSrc : walkSrc}
                        blink={blink}
                        breathe={breathe}
                      />
                    ) : (
                      <PlaceholderPom
                        isWalking={!isSitting}
                        walkFrame={walkFrame}
                        blink={blink}
                        breathe={breathe}
                      />
                    )}

                    {/* ── Tail wag overlay (placeholder only) ──────── */}
                    {!hasSprites && isSitting && (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          right:    '-8px',
                          bottom:   '28px',
                          width:    '22px',
                          height:   '12px',
                          borderRadius: '0 50% 50% 0',
                          border:   '1.5px solid rgba(255,244,194,0.4)',
                          borderLeft: 'none',
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

              {/* ── Envelope (floating above pom while sitting) ──────── */}
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
                        background:  'none',
                        border:      'none',
                        padding:     '8px',
                        cursor:      stage === 'sitting' ? 'pointer' : 'default',
                        display:     'flex',
                        alignItems:  'center',
                        justifyContent: 'center',
                        // Ensure min touch target
                        minWidth:    '60px',
                        minHeight:   '60px',
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

                    {/* "tap to open" hint — only while waiting */}
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

              {/* ── Subtle ground line under pom ─────────────────────── */}
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

            {/* ── Hint to scroll if pom hasn't appeared yet ────────────── */}
            {stage === 'hidden' && (
              <FadeIn direction="none">
                <p
                  style={{
                    fontFamily:    'var(--font-inter)',
                    fontSize:      '0.625rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'rgba(137,207,240,0.25)',
                    marginTop:     '2rem',
                    textAlign:     'center',
                  }}
                  aria-hidden="true"
                >
                  &nbsp;
                </p>
              </FadeIn>
            )}
          </div>
        </Container>

        {/* ── Darkening overlay during envelope opening ─────────────────── */}
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
