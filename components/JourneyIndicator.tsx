'use client';

/**
 * JourneyIndicator.tsx
 * Six tiny fixed stars — one per story section.
 *
 * Detection logic:
 *   We observe all six sections with IntersectionObserver.
 *   On each callback we also read each element's boundingClientRect
 *   and pick the section whose top edge is closest to (and above)
 *   the viewport centre. That section is the single active star.
 *   This guarantees exactly one star is active at all times and
 *   works correctly when scrolling in either direction.
 *
 * Sections observed (in page order):
 *   landing · chapter-one · chapter-two · chapter-three · chapter-four · ending
 *
 * Why "ending" not "pom-transition":
 *   The Pom section is a transition — it has no indicator star.
 *   The final star lights when the reader reaches the Ending section.
 *
 * Threshold choice:
 *   threshold: 0  — fires as soon as any pixel enters the viewport.
 *   We do NOT use a high threshold because ChapterTwo and ChapterThree
 *   are 2000–4000px tall on mobile; they can never reach 45% visibility.
 *
 * rootMargin: '-1px 0px -1px 0px'
 *   Prevents false-positive fires at the exact top/bottom edge.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion }     from 'framer-motion';

// ─── Section order ────────────────────────────────────────────────────────
// Must match the rendered page order exactly.

const SECTIONS = [
  { id: 'landing',       label: 'Opening'       },
  { id: 'chapter-one',   label: 'Chapter One'   },
  { id: 'chapter-two',   label: 'Chapter Two'   },
  { id: 'chapter-three', label: 'Chapter Three' },
  { id: 'chapter-four',  label: 'Chapter Four'  },
  { id: 'ending',        label: 'Ending'        },
] as const;

// ─── Pick the "current" section ───────────────────────────────────────────
// Among all elements that are currently intersecting the viewport,
// return the one whose top edge is closest to (and ≤) the viewport midpoint.
// This gives a stable, single active section regardless of scroll speed.

function pickActiveId(
  ids:        readonly string[],
  intersecting: Set<string>,
): string | null {
  const mid = window.innerHeight / 2;
  let   best: string | null = null;
  let   bestDist            = Infinity;

  for (const id of ids) {
    if (!intersecting.has(id)) continue;
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    // Distance from section top to viewport midpoint.
    // Sections above the midpoint have rect.top < mid.
    // We prefer the section whose top is closest to mid from above.
    const dist = Math.abs(rect.top - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best     = id;
    }
  }

  return best;
}

// ─── Star component ───────────────────────────────────────────────────────

interface StarProps {
  active:        boolean;
  justActivated: boolean; // true on the transition inactive→active
  shouldReduce:  boolean;
  label:         string;
  index:         number;
  /** When false, render a plain static star with no animation props */
  mounted:       boolean;
}

function Star({ active, justActivated, shouldReduce, label, index, mounted }: StarProps) {
  const starPath = 'M5 0 L5.55 4.45 L10 5 L5.55 5.55 L5 10 L4.45 5.55 L0 5 L4.45 4.45 Z';

  // ── Pre-hydration: purely static, no Framer Motion animation props ──
  // The server and first client render must be byte-for-byte identical.
  // We render a plain <div> + <svg> here — no `animate`, no `initial`,
  // no values derived from useReducedMotion() or client-only state.
  if (!mounted) {
    return (
      <div
        role="img"
        aria-label={`${label}: ${active ? 'current section' : 'not yet reached'}`}
        style={{
          position:       'relative',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          '20px',
          height:         '20px',
        }}
      >
        {/* Static glow placeholder — same dimensions, no animation */}
        {active && (
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              inset:         '-6px',
              borderRadius:  '50%',
              background:    'radial-gradient(circle, rgba(246,241,232,0.22) 0%, transparent 70%)',
              pointerEvents: 'none',
              opacity:       0.6,
            }}
          />
        )}
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ display: 'block', opacity: active ? 1 : 0.28 }}
        >
          <path d={starPath} fill={active ? '#F6F1E8' : '#89AACC'} />
        </svg>
      </div>
    );
  }

  // ── Post-hydration: full Framer Motion animations ────────────────────
  return (
    <motion.div
      role="img"
      aria-label={`${label}: ${active ? 'current section' : 'not yet reached'}`}
      style={{
        position:       'relative',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '20px',
        height:         '20px',
      }}
    >
      {/* Glow halo — only when active */}
      {active && (
        <motion.div
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         '-6px',
            borderRadius:  '50%',
            background:    'radial-gradient(circle, rgba(246,241,232,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          initial={justActivated && !shouldReduce ? { opacity: 0, scale: 0.5 } : false}
          animate={
            shouldReduce
              ? { opacity: 1 }
              : { opacity: [0.6, 1, 0.5], scale: [0.9, 1.15, 0.95] }
          }
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  duration:    0.5,
                  ease:        'easeOut',
                  times:       [0, 0.4, 1],
                  repeat:      Infinity,
                  repeatDelay: 2.5,
                  repeatType:  'loop',
                }
          }
        />
      )}

      {/* The star SVG */}
      <motion.svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ display: 'block', willChange: 'transform, opacity' }}
        initial={
          justActivated && !shouldReduce
            ? { opacity: 0, scale: 0.7 }
            : false
        }
        animate={
          active
            ? { opacity: 1,    scale: 1    }
            : { opacity: 0.28, scale: 0.75 }
        }
        transition={
          shouldReduce
            ? { duration: 0 }
            : {
                duration: 0.5,
                ease:     [0.25, 0.1, 0.25, 1],
                delay:    justActivated ? index * 0.02 : 0,
              }
        }
      >
        <path
          d={starPath}
          fill={active ? '#F6F1E8' : '#89AACC'}
        />
      </motion.svg>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function JourneyIndicator() {
  const shouldReduce = useReducedMotion() ?? false;
  const ids          = SECTIONS.map(s => s.id);

  // ── Hydration gate ────────────────────────────────────────────────────
  // false on the server and during the first client render.
  // true only after useEffect runs (client-only).
  // While false, Star renders plain static HTML — no Framer Motion props,
  // no values from useReducedMotion() — so server and client HTML match exactly.
  const [mounted, setMounted] = useState(false);

  // Set of section IDs currently touching the viewport (any pixel visible)
  const intersectingRef = useRef<Set<string>>(new Set());
  // Single active ID — the section closest to viewport midpoint
  const [activeId,  setActiveId]  = useState<string | null>('landing');
  // Previous active — to detect justActivated
  const prevActiveRef = useRef<string | null>(null);

  useEffect(() => {
    // Mark as mounted — enables Framer Motion animations on all stars
    setMounted(true);

    // Resolve the active section and push to state
    function update() {
      const next = pickActiveId(ids, intersectingRef.current);
      setActiveId(next);
    }

    // Build the observer
    function buildObserver(): IntersectionObserver {
      return new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).id;
            if (entry.isIntersecting) {
              intersectingRef.current.add(id);
            } else {
              intersectingRef.current.delete(id);
            }
          }
          update();
        },
        {
          // Fire as soon as any pixel is visible
          threshold: 0,
          // Small negative margin so sections right at the edge don't flicker
          rootMargin: '-1px 0px -1px 0px',
          root: null,
        },
      );
    }

    let observer = buildObserver();

    // Attach observer to all sections that exist now
    function attachAll(obs: IntersectionObserver): string[] {
      const missing: string[] = [];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          obs.observe(el);
        } else {
          missing.push(id);
        }
      }
      return missing;
    }

    let missing = attachAll(observer);

    // If any sections were missing (e.g. Letter inside AnimatePresence),
    // poll briefly until they appear, then observe them too.
    let pollId: ReturnType<typeof setInterval> | null = null;
    if (missing.length > 0) {
      let attempts = 0;
      pollId = setInterval(() => {
        attempts++;
        const stillMissing: string[] = [];
        for (const id of missing) {
          const el = document.getElementById(id);
          if (el) {
            observer.observe(el);
          } else {
            stillMissing.push(id);
          }
        }
        missing = stillMissing;
        if (missing.length === 0 || attempts > 30) {
          if (pollId) clearInterval(pollId);
        }
      }, 200);
    }

    // Re-evaluate active section on every scroll (lightweight — no DOM writes)
    function onScroll() {
      update();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Seed: mark whatever is visible right now
    update();

    return () => {
      observer.disconnect();
      if (pollId) clearInterval(pollId);
      window.removeEventListener('scroll', onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build per-star state
  const stars = SECTIONS.map(section => {
    const active        = section.id === activeId;
    const justActivated = active && prevActiveRef.current !== section.id;
    return { ...section, active, justActivated };
  });

  // Update prev ref synchronously (before next render)
  prevActiveRef.current = activeId;

  return (
    <div
      aria-label="Story progress"
      role="navigation"
      style={{
        position:  'fixed',
        bottom:    'clamp(18px, 3vw, 28px)',
        left:      '50%',
        transform: 'translateX(-50%)',
        zIndex:    40,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '12px',
          background: 'rgba(7, 24, 39, 0.35)',
          backdropFilter:       'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '999px',
          padding:      '6px 14px',
          border:       '1px solid rgba(137, 207, 240, 0.06)',
        }}
      >
        {stars.map((star, i) => (
          <Star
            key={star.id}
            active={star.active}
            justActivated={star.justActivated}
            shouldReduce={shouldReduce}
            label={star.label}
            index={i}
            mounted={mounted}
          />
        ))}
      </div>
    </div>
  );
}
