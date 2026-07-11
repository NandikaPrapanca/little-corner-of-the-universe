'use client';

/**
 * PomTransition.tsx
 * The bridge between the story chapters and the final letter.
 *
 * Stage machine (unchanged):
 *   hidden → walking → sitting → releasing → opening → done
 *
 * New interaction flow:
 *   1. Pom walks in (unchanged).
 *   2. Pom arrives holding the envelope → sit-envelope.png, breathing idle.
 *   3. The envelope area glows softly. Only the envelope is clickable.
 *   4. Clicking the envelope:
 *        a. Instantly swaps to sit.png (Pom hands over the letter).
 *        b. Waits ~300ms.
 *        c. Smoothly scrolls to #letter.
 *   5. Letter section is already in the DOM; scroll reveals it naturally.
 *
 * Sprite mapping:
 *   walking                        → walk-1..5.png  (~9.5 FPS)
 *   sitting (idle, holding)        → sit-envelope.png
 *   releasing | opening | done     → sit.png   (handed off)
 *
 * No floating envelope overlay.
 * No dark screen overlay.
 * No old invisible full-Pom click target.
 * The only interactive element is the envelope hitbox on the sprite.
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
// envelope-open.png kept in preload list for future use but not rendered in this flow

const ALL_ASSETS: readonly string[] = [
  ...WALK_FRAMES,
  SIT,
  SIT_ENVELOPE,
  '/characters/pom/envelope-open.png',
];

const WALK_FRAME_MS    = 105; // ~9.5 FPS
const WALK_FRAME_COUNT = WALK_FRAMES.length;

// ─── Sprite size ──────────────────────────────────────────────────────────

const POM_W = 160;
const POM_H = 160;

// ─── Asset preloader ──────────────────────────────────────────────────────

function useSpritePreloader(): boolean {
  const [walkReady, setWalkReady] = useState(false);

  useEffect(() => {
    let resolved = 0;

    ALL_ASSETS.forEach((src) => {
      const img = new window.Image();
      const done = () => {
        if ((WALK_FRAMES as readonly string[]).includes(src)) {
          resolved++;
          if (resolved === WALK_FRAME_COUNT) setWalkReady(true);
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

function getSrc(stage: PomStage, walkFrame: number): string {
  switch (stage) {
    case 'hidden':
    case 'walking':
      return WALK_FRAMES[walkFrame];
    case 'sitting':
      // Pom is idle, holding the envelope in mouth
      return SIT_ENVELOPE;
    case 'releasing':
    case 'opening':
    case 'done':
      // Pom has handed off the envelope — peaceful sit
      return SIT;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function PomTransition() {
  const shouldReduce = useReducedMotion() ?? false;
  const audio        = useContext(AudioContext);
  const walkReady    = useSpritePreloader();

  const [stage,     setStage]     = useState<PomStage>('hidden');
  const [walkFrame, setWalkFrame] = useState(0);
  // Hover state for the envelope hitbox
  const [envHovered, setEnvHovered] = useState(false);

  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef      = useRef<HTMLDivElement>(null);
  const pomControls     = useAnimation();

  // ── Volume duck helper (audio untouched per spec) ───────────────────
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

  // ── Walk trigger ────────────────────────────────────────────────────
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

  // ── Envelope click ───────────────────────────────────────────────────
  // 1. Instant sprite swap to sit.png
  // 2. Brief 300ms pause — feels like Pom takes a breath
  // 3. Gentle scroll to the Letter section
  const handleEnvelopeClick = useCallback(async () => {
    if (stage !== 'sitting') return;

    // Instant swap — no delay, no animation
    setStage('releasing');
    setEnvHovered(false);

    // Subtle audio duck (unchanged)
    duckVolume(0.35, 800);

    // Short pause before scroll
    await new Promise<void>(res =>
      setTimeout(res, shouldReduce ? 0 : 300),
    );

    setStage('done');

    // Scroll to letter
    const letterEl = document.getElementById('letter');
    if (letterEl) {
      letterEl.scrollIntoView({
        behavior: shouldReduce ? 'auto' : 'smooth',
        block:    'start',
      });
    }

    // Restore volume after scroll starts
    setTimeout(() => duckVolume(0.6, 1000), 600);
  }, [stage, duckVolume, shouldReduce]);

  // ── Derived ──────────────────────────────────────────────────────────

  const isSitting = stage === 'sitting' || stage === 'releasing' || stage === 'opening' || stage === 'done';
  const isWalking = stage === 'walking';
  const currentSrc = getSrc(stage, walkFrame);

  // Envelope hitbox:
  // Positioned over the lower-centre of the sprite where the envelope lives.
  // Approximation: ~55% of sprite width, ~25% of sprite height,
  // anchored to the bottom-centre.
  const ENV_BOX_W = Math.round(POM_W * 0.55); // ~88px
  const ENV_BOX_H = Math.round(POM_H * 0.28); // ~45px

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
                  ? 'A small Pomeranian sits holding a glowing envelope — click the envelope to open it'
                  : 'A small Pomeranian is walking toward you'
              }
              style={{
                position:       'relative',
                height:         `${POM_H + 24}px`,
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
                    {/* Walking bob / sitting breathe wrapper */}
                    <motion.div
                      style={{ transformOrigin: 'bottom center' }}
                      animate={shouldReduce ? {} : isWalking
                        ? { y: [0, -2, 0, 2, 0] }
                        : isSitting
                          ? { scaleY: [1, 1.015, 1] }
                          : {}
                      }
                      transition={shouldReduce ? {} : isWalking
                        ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }
                        : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }
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
                        }}
                      />

                      {/* ── Envelope hitbox + glow ──────────────────
                        Only visible/active in the 'sitting' stage.
                        Positioned over the envelope in sit-envelope.png.
                        The hitbox is the ONLY interactive element.
                      ─────────────────────────────────────────────── */}
                      {stage === 'sitting' && (
                        <>
                          {/* Warm glow — behind the button, follows envelope position */}
                          <motion.div
                            aria-hidden="true"
                            style={{
                              position:      'absolute',
                              bottom:        '2px',
                              left:          '50%',
                              transform:     'translateX(-50%)',
                              width:         `${ENV_BOX_W + 20}px`,
                              height:        `${ENV_BOX_H + 20}px`,
                              borderRadius:  '50%',
                              background:    'radial-gradient(circle, rgba(255,220,140,0.28) 0%, rgba(137,207,240,0.12) 55%, transparent 75%)',
                              pointerEvents: 'none',
                              zIndex:        3,
                            }}
                            animate={shouldReduce ? {} : envHovered
                              ? { opacity: [0.7, 1, 0.7], scale: [1.0, 1.08, 1.0] }
                              : { opacity: [0.4, 0.75, 0.4], scale: [0.95, 1.05, 0.95] }
                            }
                            transition={{
                              duration:   envHovered ? 1.2 : 3.5,
                              repeat:     Infinity,
                              ease:       'easeInOut',
                            }}
                          />

                          {/* Transparent button — hitbox only, no visible element */}
                          <button
                            onClick={handleEnvelopeClick}
                            aria-label="Take the letter from Pom"
                            onMouseEnter={() => setEnvHovered(true)}
                            onMouseLeave={() => setEnvHovered(false)}
                            style={{
                              position:        'absolute',
                              bottom:          '2px',
                              left:            '50%',
                              transform:       `translateX(-50%) scale(${envHovered && !shouldReduce ? 1.04 : 1})`,
                              transition:      'transform 0.2s ease',
                              width:           `${ENV_BOX_W}px`,
                              height:          `${ENV_BOX_H}px`,
                              background:      'transparent',
                              border:          'none',
                              cursor:          'pointer',
                              zIndex:          4,
                              // Minimum touch target
                              minWidth:        '44px',
                              minHeight:       '44px',
                            } as CSSProperties}
                          />
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── "open" hint — appears after 1.5s idle ───────────── */}
              <AnimatePresence>
                {stage === 'sitting' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ delay: shouldReduce ? 0 : 1.5, duration: 0.8 }}
                    style={{
                      position:      'absolute',
                      bottom:        '-22px',
                      left:          '50%',
                      transform:     'translateX(-50%)',
                      fontFamily:    'var(--font-inter)',
                      fontSize:      '0.625rem',
                      fontWeight:    300,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color:         'rgba(137,207,240,0.42)',
                      whiteSpace:    'nowrap',
                      pointerEvents: 'none',
                      zIndex:        1,
                    }}
                  >
                    take the letter
                  </motion.p>
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

            {/* Spacer while hidden */}
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
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LETTER — always in the DOM; user scrolls to it naturally
      ══════════════════════════════════════════════════════════════ */}
      <Letter />
    </>
  );
}
