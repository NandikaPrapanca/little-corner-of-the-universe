'use client';

/**
 * PomTransition.tsx
 * The bridge between the story chapters and the final letter.
 *
 * Stage machine:
 *   hidden → walking → sitting → releasing → opening → done
 *
 * Mobile & Tablet Reliability:
 *   - Uses a mobile-safe IntersectionObserver threshold (0.15).
 *   - Preloads and pre-decodes (`img.decode()`) all sprite frames on mount
 *     with a safety fallback timeout so slow mobile networks never hang.
 *   - Mounts all sprite frames as stacked <img> layers and toggles opacity
 *     instead of mutating a single <img src> every 105ms (which causes
 *     mobile Safari/Chrome to abort in-flight async decodes of ~620 KB PNGs
 *     and stay frozen on frame 1).
 *   - Uses declarative Framer Motion `animate={{ x: 0, opacity: 1 }}` and a
 *     deterministic walk duration timer so the walk → sit transition never
 *     stalls on touch devices.
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
} from 'framer-motion';
import { AudioContext } from '@/components/AudioProvider';
import { playEnvelopeRustle } from '@/utils/soundEffects';
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

const SIT          = '/characters/pom/sit.png';
const SIT_ENVELOPE = '/characters/pom/sit-envelope.png';

const RENDERED_SPRITES: readonly string[] = [
  ...WALK_FRAMES,
  SIT_ENVELOPE,
  SIT,
];

const ALL_ASSETS: readonly string[] = [
  ...RENDERED_SPRITES,
  '/characters/pom/envelope-open.png',
];

const WALK_FRAME_MS    = 105; // ~9.5 FPS
const WALK_FRAME_COUNT = WALK_FRAMES.length;
const WALK_DURATION_S  = 4;
const WALK_DURATION_MS = WALK_DURATION_S * 1000;

// ─── Sprite size ──────────────────────────────────────────────────────────

const POM_W = 160;
const POM_H = 160;

// ─── Asset preloader & decoder ────────────────────────────────────────────

function useSpritePreloader(): boolean {
  const [walkReady, setWalkReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resolved  = 0;

    const markWalkFrameReady = () => {
      if (cancelled) return;
      resolved++;
      if (resolved >= WALK_FRAME_COUNT) {
        setWalkReady(true);
      }
    };

    // Safety fallback: never block mobile walk animation longer than 2.2s
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setWalkReady(true);
    }, 2200);

    ALL_ASSETS.forEach((src) => {
      const isWalkFrame = (WALK_FRAMES as readonly string[]).includes(src);
      const img = new window.Image();
      img.decoding = 'async';

      const handleLoaded = () => {
        if (typeof img.decode === 'function') {
          img
            .decode()
            .catch(() => {
              // Ignore decode warning; image is already loaded
            })
            .finally(() => {
              if (isWalkFrame) markWalkFrameReady();
            });
        } else if (isWalkFrame) {
          markWalkFrameReady();
        }
      };

      img.onload = handleLoaded;
      img.onerror = () => {
        console.warn(`[PomTransition] Sprite failed to load: ${src}`);
        if (isWalkFrame) markWalkFrameReady();
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
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
  const [envHovered,     setEnvHovered]     = useState(false);
  // Letter is hidden until Pom hands it over — prevents layout spoiler
  const [letterUnlocked, setLetterUnlocked] = useState(false);

  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const walkFinishRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef      = useRef<HTMLDivElement>(null);

  // Stores user's audio state prior to ducking so it can be restored cleanly
  const priorAudioState = useRef<{ volume: number; isMuted: boolean } | null>(null);

  // ── Volume duck helper ──────────────────────────────────────────────
  const duckVolume = useCallback((targetVolume: number, durationMs: number) => {
    if (!audio) return;
    if (duckIntervalRef.current) {
      clearInterval(duckIntervalRef.current);
      duckIntervalRef.current = null;
    }

    // Capture state only on initial duck
    if (!priorAudioState.current) {
      priorAudioState.current = { volume: audio.volume, isMuted: audio.isMuted };
    }

    // Never unmute if user has muted audio
    if (priorAudioState.current.isMuted || audio.isMuted) return;

    const start  = audio.volume;
    const delta  = targetVolume - start;
    const steps  = 20;
    const stepMs = durationMs / steps;
    let i = 0;
    duckIntervalRef.current = setInterval(() => {
      i++;
      audio.setVolume(Math.max(0, Math.min(1, start + delta * (i / steps))));
      if (i >= steps) {
        if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
        duckIntervalRef.current = null;
      }
    }, stepMs);
  }, [audio]);

  const restoreVolume = useCallback((durationMs: number) => {
    if (!audio) return;
    if (duckIntervalRef.current) {
      clearInterval(duckIntervalRef.current);
      duckIntervalRef.current = null;
    }

    const prior = priorAudioState.current;
    priorAudioState.current = null;

    if (!prior || prior.isMuted || audio.isMuted) return;

    const start  = audio.volume;
    const target = prior.volume;
    const delta  = target - start;
    const steps  = 20;
    const stepMs = durationMs / steps;
    let i = 0;
    duckIntervalRef.current = setInterval(() => {
      i++;
      audio.setVolume(Math.max(0, Math.min(1, start + delta * (i / steps))));
      if (i >= steps) {
        if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
        duckIntervalRef.current = null;
      }
    }, stepMs);
  }, [audio]);

  useEffect(() => {
    return () => {
      if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      if (walkFinishRef.current) clearTimeout(walkFinishRef.current);
    };
  }, []);

  // ── Walk trigger (mobile-safe threshold 0.15) ───────────────────────
  useEffect(() => {
    if (!sectionRef.current || stage !== 'hidden') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStage('walking');
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [stage]);

  // ── Walk: frame cycle + deterministic walk completion timer ─────────
  useEffect(() => {
    if (stage !== 'walking' || !walkReady) return;

    // Cycle through walk-1..5.png at ~9.5 FPS
    walkIntervalRef.current = setInterval(() => {
      setWalkFrame((f) => (f + 1) % WALK_FRAME_COUNT);
    }, WALK_FRAME_MS);

    // Transition to 'sitting' once the 4s walk completes
    const durationMs = shouldReduce ? 20 : WALK_DURATION_MS;
    walkFinishRef.current = setTimeout(() => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
        walkIntervalRef.current = null;
      }
      setStage('sitting');
    }, durationMs);

    return () => {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
        walkIntervalRef.current = null;
      }
      if (walkFinishRef.current) {
        clearTimeout(walkFinishRef.current);
        walkFinishRef.current = null;
      }
    };
  }, [stage, walkReady, shouldReduce]);

  // ── Envelope click ───────────────────────────────────────────────────
  // 1. Instant sprite swap to sit.png
  // 2. Brief 300ms pause — feels like Pom takes a breath
  // 3. Unlock Letter, then RAF-scroll to it
  const handleEnvelopeClick = useCallback(async () => {
    if (stage !== 'sitting') return;

    // Instant sprite swap — Pom hands over the letter
    setStage('releasing');
    setEnvHovered(false);

    // Play tactile paper foley (respecting mute state)
    playEnvelopeRustle(audio?.isMuted ?? false);

    // Subtle audio duck
    duckVolume(0.35, 800);

    // Brief pause before reveal
    await new Promise<void>((res) =>
      setTimeout(res, shouldReduce ? 0 : 300),
    );

    setStage('done');

    // Mount the Letter section, then scroll to it in the next frame
    setLetterUnlocked(true);

    requestAnimationFrame(() => {
      const letterEl = document.getElementById('letter');
      if (letterEl) {
        letterEl.scrollIntoView({
          behavior: shouldReduce ? 'auto' : 'smooth',
          block:    'start',
        });
      }
    });

    // Restore volume after scroll starts
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    restoreTimerRef.current = setTimeout(() => restoreVolume(1000), 600);
  }, [stage, duckVolume, restoreVolume, shouldReduce, audio?.isMuted]);

  // ── Derived ──────────────────────────────────────────────────────────

  const isSitting  = stage === 'sitting' || stage === 'releasing' || stage === 'opening' || stage === 'done';
  const isWalking  = stage === 'walking';
  const currentSrc = getSrc(stage, walkFrame);

  // Envelope hitbox:
  // Positioned over the lower-centre of the sprite where the envelope lives.
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
                width:          '100%',
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
                      willChange:      'transform',
                    }}
                    initial={{
                      x:       shouldReduce ? 0 : '-42vw',
                      opacity: shouldReduce ? 1 : 0.88,
                    }}
                    animate={{
                      x:       0,
                      opacity: 1,
                    }}
                    transition={{
                      x: {
                        duration: shouldReduce ? 0.01 : WALK_DURATION_S,
                        ease:     'linear',
                      },
                      opacity: {
                        duration: shouldReduce ? 0.01 : 0.4,
                        ease:     'easeOut',
                      },
                    }}
                  >
                    {/*
                      Ambient glow — centered behind the full sprite.
                      Lives on the outer wrapper so it stays centred
                      during both walking and sitting. Never drifts.
                    */}
                    <div
                      aria-hidden="true"
                      style={{
                        position:      'absolute',
                        top:           '50%',
                        left:          '50%',
                        transform:     'translate(-50%, -50%)',
                        width:         `${POM_W + 60}px`,
                        height:        `${POM_H + 60}px`,
                        borderRadius:  '50%',
                        background:    'radial-gradient(circle, rgba(255,248,220,0.20) 0%, rgba(137,207,240,0.08) 50%, transparent 72%)',
                        filter:        'blur(14px)',
                        pointerEvents: 'none',
                        zIndex:        1,
                      }}
                    />

                    {/* Walking bob / sitting breathe wrapper */}
                    <motion.div
                      style={{
                        position:        'relative',
                        width:           `${POM_W}px`,
                        height:          `${POM_H}px`,
                        transformOrigin: 'bottom center',
                      }}
                      animate={
                        shouldReduce
                          ? {}
                          : isWalking
                            ? { y: [0, -2, 0, 2, 0] }
                            : isSitting
                              ? { scaleY: [1, 1.015, 1] }
                              : {}
                      }
                      transition={
                        shouldReduce
                          ? {}
                          : isWalking
                            ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }
                            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }
                      }
                    >
                      {/*
                        Stacked pre-decoded sprite frames:
                        All frames stay mounted in the DOM with eager loading and
                        toggle opacity instantaneously so mobile Safari/Chrome
                        never stalls decoding ~620 KB PNGs on `src` swaps.
                      */}
                      {RENDERED_SPRITES.map((spriteSrc) => {
                        const isActive = spriteSrc === currentSrc;
                        return (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={spriteSrc}
                            src={spriteSrc}
                            alt=""
                            aria-hidden="true"
                            width={POM_W}
                            height={POM_H}
                            loading="eager"
                            decoding="sync"
                            draggable={false}
                            style={{
                              position:       'absolute',
                              inset:          0,
                              display:        'block',
                              width:          `${POM_W}px`,
                              height:         `${POM_H}px`,
                              objectFit:      'contain',
                              imageRendering: 'auto',
                              opacity:        isActive ? 1 : 0,
                              pointerEvents:  'none',
                            }}
                          />
                        );
                      })}

                      {/* ── Envelope hitbox ────────────────────────
                        Only active in the 'sitting' stage.
                        Positioned over the envelope in sit-envelope.png.
                        The hitbox is the ONLY interactive element.
                      ─────────────────────────────────────────────── */}
                      {stage === 'sitting' && (
                        <button
                          type="button"
                          onClick={handleEnvelopeClick}
                          aria-label="Take the letter from Pom"
                          onMouseEnter={() => setEnvHovered(true)}
                          onMouseLeave={() => setEnvHovered(false)}
                          style={{
                            position:   'absolute',
                            bottom:     '2px',
                            left:       '50%',
                            transform:  `translateX(-50%) scale(${envHovered && !shouldReduce ? 1.04 : 1})`,
                            transition: 'transform 0.2s ease',
                            width:      `${ENV_BOX_W}px`,
                            height:     `${ENV_BOX_H}px`,
                            background: 'transparent',
                            border:     'none',
                            cursor:     'pointer',
                            zIndex:     4,
                            minWidth:   '44px',
                            minHeight:  '44px',
                          } as CSSProperties}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── "take the letter" hint — appears after 1.5s idle ── */}
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
          LETTER — only mounts after Pom hands over the envelope
      ══════════════════════════════════════════════════════════════ */}
      {letterUnlocked && <Letter />}
    </>
  );
}
