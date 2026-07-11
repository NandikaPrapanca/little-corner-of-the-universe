'use client';

/**
 * ChapterFour.tsx
 * "If I could keep a few moments forever..."
 *
 * Constellation interaction:
 *   Clicking a node opens the matching memory panel AND smooth-scrolls
 *   the page so that panel is centered in the viewport.  The panel then
 *   briefly pulses with a violet glow for ~2 seconds before fading back
 *   to its normal appearance.
 *
 * Ref strategy:
 *   A Map<number, HTMLDivElement> is stored in a useRef and never causes
 *   re-renders.  When AnimatePresence mounts a memory panel it registers
 *   its root element into the map via a ref-callback.  The click handler
 *   reads from the map — no querySelector, no getElementById.
 *
 *   Map key  = memory.id  (1–11)
 *   Map value = the motion.div root element of that panel
 *
 *   The map persists across re-renders because it lives in a ref.
 *   Old entries are never stale because AnimatePresence always unmounts
 *   the previous panel before mounting the new one — the ref-callback's
 *   cleanup leg (called with null) removes the entry automatically.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import FadeIn       from '@/components/ui/FadeIn';
import Container    from '@/components/ui/Container';
import BobEasterEgg from '@/components/ui/BobEasterEgg';

// ─── Memory data ──────────────────────────────────────────────────────────

interface Memory {
  id:    number;
  title: string;
  text:  string;
}

const MEMORIES: Memory[] = [
  { id: 1,  title: 'Cyberpunk Edgerunners', text: 'Watching Cyberpunk together somehow made that moon screenshot even more special.' },
  { id: 2,  title: 'La La Land',            text: 'City of Stars will probably remind me of this website for a long time.' },
  { id: 3,  title: 'Off Campus',            text: 'Somehow we managed to binge another thing together.' },
  { id: 4,  title: 'Genshin',               text: 'Logging in somehow became less about resin and more about hanging out.' },
  { id: 5,  title: 'Roblox',                text: 'Funny that Roblox ended up becoming where all of this quietly started.' },
  { id: 6,  title: 'Naruto & Hinata',       text: 'Matching those blind boxes was honestly adorable.' },
  { id: 7,  title: 'The Drunk Texts',       text: 'I told you not to drink.\nYou definitely didn\'t listen.\nBut your drunk texts were still ridiculously funny.' },
  { id: 8,  title: 'Secret Piercing',       text: 'You secretly got your ears pierced. That was one of my favorite unexpected updates.' },
  { id: 9,  title: 'Canada & China',        text: 'Thank you for letting me see little pieces of your adventures.' },
  { id: 10, title: 'Desk Cleanup',          text: 'Somehow you made cleaning my setup feel entertaining.' },
  { id: 11, title: 'The Late Nights',       text: 'There were nights when you felt sad.\nIf staying awake a little longer meant you didn\'t have to feel alone...\nI never really minded.' },
];

// ─── Node positions ───────────────────────────────────────────────────────

const DESKTOP_NODES = [
  { id: 1,  x: 120, y: 80  },
  { id: 2,  x: 280, y: 55  },
  { id: 3,  x: 460, y: 95  },
  { id: 4,  x: 580, y: 185 },
  { id: 5,  x: 510, y: 300 },
  { id: 6,  x: 340, y: 200 },
  { id: 7,  x: 180, y: 240 },
  { id: 8,  x: 70,  y: 320 },
  { id: 9,  x: 200, y: 400 },
  { id: 10, x: 400, y: 420 },
  { id: 11, x: 580, y: 440 },
];

const MOBILE_NODES = [
  { id: 1,  x: 80,  y: 70  },
  { id: 2,  x: 220, y: 50  },
  { id: 3,  x: 310, y: 120 },
  { id: 4,  x: 290, y: 230 },
  { id: 5,  x: 180, y: 190 },
  { id: 6,  x: 70,  y: 240 },
  { id: 7,  x: 130, y: 340 },
  { id: 8,  x: 270, y: 360 },
  { id: 9,  x: 320, y: 460 },
  { id: 10, x: 170, y: 500 },
  { id: 11, x: 60,  y: 570 },
];

const EDGES: [number, number][] = [
  [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 2], [6, 7], [7, 1],
  [7, 8], [8, 9], [9, 10], [10, 5],
  [10, 11], [11, 4], [9, 7],
];

// ─── Constellation SVG ────────────────────────────────────────────────────

interface ConstellationSVGProps {
  nodes:   typeof DESKTOP_NODES;
  viewBox: string;
  openId:  number | null;
}

function ConstellationSVG({ nodes, viewBox, openId }: ConstellationSVGProps) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#89CFF0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#89CFF0" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="nodeGlowOpen" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#B8A8E3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#B8A8E3" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {EDGES.map(([a, b], i) => {
        const na = nodeMap[a];
        const nb = nodeMap[b];
        if (!na || !nb) return null;
        return (
          <line
            key={i}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke="rgba(137,207,240,0.13)"
            strokeWidth="0.75"
            strokeDasharray="3 5"
          />
        );
      })}

      {nodes.map(node => {
        const isOpen = node.id === openId;
        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={isOpen ? 18 : 12}
              fill={isOpen ? 'url(#nodeGlowOpen)' : 'url(#nodeGlow)'}
              style={{ transition: 'r 0.4s ease' }}
            />
            <circle cx={node.x} cy={node.y} r={isOpen ? 4 : 2.5}
              fill={isOpen ? '#B8A8E3' : '#89CFF0'}
              opacity={isOpen ? 1 : 0.75}
              style={{ transition: 'r 0.4s ease, fill 0.4s ease' }}
            />
            <circle cx={node.x} cy={node.y} r={isOpen ? 7 : 5}
              fill="none"
              stroke={isOpen ? 'rgba(184,168,227,0.3)' : 'rgba(137,207,240,0.18)'}
              strokeWidth="0.5"
              style={{ transition: 'r 0.4s ease, stroke 0.4s ease' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Memory panel ─────────────────────────────────────────────────────────

interface MemoryPanelProps {
  memory:        Memory | null;
  onClose:       () => void;
  shouldReduce:  boolean;
  highlighted:   boolean;
  /** Ref-callback: registers/unregisters this panel's DOM element in the parent map */
  onRef:         (id: number, el: HTMLDivElement | null) => void;
}

function MemoryPanel({
  memory,
  onClose,
  shouldReduce,
  highlighted,
  onRef,
}: MemoryPanelProps) {
  const lines = memory?.text.split('\n') ?? [];

  return (
    <AnimatePresence mode="wait">
      {memory && (
        <motion.div
          key={memory.id}
          // Register this element in the parent's ref map when it mounts,
          // and deregister when it unmounts (el === null).
          ref={(el) => onRef(memory.id, el)}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
          animate={{
            opacity:   1,
            y:         0,
            // Highlight pulse: violet glow fades in and out
            boxShadow: highlighted && !shouldReduce
              ? [
                  '0 2px 8px rgba(0,0,0,0.24), 0 12px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)',
                  '0 0 0 2px rgba(184,168,227,0.55), 0 4px 32px rgba(184,168,227,0.30), 0 12px 40px rgba(0,0,0,0.28)',
                  '0 2px 8px rgba(0,0,0,0.24), 0 12px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)',
                ]
              : '0 2px 8px rgba(0,0,0,0.24), 0 12px 32px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          exit={{ opacity: 0, y: shouldReduce ? 0 : -8 }}
          transition={{
            opacity:   { duration: shouldReduce ? 0.01 : 0.55, ease: [0.25, 0.1, 0.25, 1] },
            y:         { duration: shouldReduce ? 0.01 : 0.55, ease: [0.25, 0.1, 0.25, 1] },
            // The pulse runs once over 2 seconds — matches the highlight timeout
            boxShadow: { duration: 2, ease: 'easeInOut', times: [0, 0.4, 1] },
          }}
          style={{
            marginTop:            'clamp(1.5rem, 4vw, 2.5rem)',
            background:           `linear-gradient(135deg,
              rgba(16, 30, 58, 0.82) 0%,
              rgba(14, 26, 52, 0.76) 50%,
              rgba(20, 18, 52, 0.80) 100%)`,
            backdropFilter:       'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border:               '1px solid rgba(184,168,227,0.18)',
            borderRadius:         '16px',
            padding:              'clamp(1.25rem, 4vw, 2rem)',
            position:             'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close memory"
            style={{
              position:  'absolute', top: '12px', right: '14px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', color: 'rgba(203,213,225,0.35)',
              fontSize: '1rem', lineHeight: 1,
              minWidth: '32px', minHeight: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>

          {/* Title */}
          <p style={{
            fontFamily:    'var(--font-inter)',
            fontSize:      'clamp(0.6875rem, 1.6vw, 0.75rem)',
            fontWeight:    500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'rgba(184,168,227,0.65)',
            marginBottom:  '0.75rem',
          }}>
            {memory.title}
          </p>

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {lines.map((line, i) => (
              <p key={i} style={{
                fontFamily:  'var(--font-cormorant)',
                fontSize:    'clamp(1.0625rem, 3vw, 1.3125rem)',
                fontWeight:  300,
                fontStyle:   'italic',
                lineHeight:  1.65,
                color:       i === 0 ? 'rgba(248,250,252,0.85)' : 'rgba(203,213,225,0.68)',
                margin:      0,
                paddingLeft: (i > 0 && lines.length > 1) ? '0.5em' : 0,
              }}>
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Node button ──────────────────────────────────────────────────────────

interface NodeButtonProps {
  node:         { id: number; x: number; y: number };
  title:        string;
  isOpen:       boolean;
  onClick:      (id: number) => void;
  shouldReduce: boolean;
  vbW:          number;
  vbH:          number;
}

function NodeButton({ node, title, isOpen, onClick, shouldReduce, vbW, vbH }: NodeButtonProps) {
  const leftPct = (node.x / vbW) * 100;
  const topPct  = (node.y / vbH) * 100;

  return (
    <motion.button
      onClick={() => onClick(node.id)}
      aria-label={`Memory: ${title}${isOpen ? ' (open)' : ''}`}
      aria-pressed={isOpen}
      style={{
        position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
        transform: 'translate(-50%, -50%)',
        width: '44px', height: '44px',
        borderRadius: '50%', background: 'transparent', border: 'none',
        cursor: 'pointer', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      whileHover={shouldReduce ? undefined : { scale: 1.3 }}
      whileTap={shouldReduce   ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      title={title}
    >
      <span style={{
        position: 'absolute', width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
    </motion.button>
  );
}

// ─── Responsive hook ──────────────────────────────────────────────────────

function useIsMobile(breakpoint = 560): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Main Section ──────────────────────────────────────────────────────────

export default function ChapterFour() {
  const shouldReduce = useReducedMotion() ?? false;
  const isMobile     = useIsMobile();

  const [openId,        setOpenId]        = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // ── Ref map: memory id → panel DOM element ─────────────────────────
  const panelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Mirror of openId in a ref so handlePanelRef can read the current
  // value without capturing a stale closure.
  const openIdRef = useRef<number | null>(null);
  useEffect(() => { openIdRef.current = openId; }, [openId]);

  // shouldReduce in a ref for the same reason
  const shouldReduceRef = useRef(shouldReduce);
  useEffect(() => { shouldReduceRef.current = shouldReduce; }, [shouldReduce]);

  // Auto-clear for the highlight timeout
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref-callback — called by React when a panel mounts or unmounts.
  // On MOUNT (el !== null): store the element, then scroll to it if it
  // belongs to the currently open constellation.  This fires at exactly
  // the right moment: after AnimatePresence has rendered the new panel
  // but before the browser has painted, so scrollIntoView is reliable.
  const handlePanelRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) {
      panelRefs.current.set(id, el);

      // Scroll only when this panel is the one the user just selected
      if (id === openIdRef.current) {
        requestAnimationFrame(() => {
          el.scrollIntoView({
            behavior: shouldReduceRef.current ? 'auto' : 'smooth',
            block:    'center',
          });
        });
      }
    } else {
      panelRefs.current.delete(id);
    }
  }, []); // no deps — reads everything through refs

  const handleNodeClick = useCallback((id: number) => {
    const isClosing = id === openId;

    // Toggle open/closed
    setOpenId(isClosing ? null : id);

    if (isClosing) {
      setHighlightedId(null);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    }
    // Scroll + highlight are now handled by the useEffect below,
    // which fires after React commits the new openId to the DOM.
  }, [openId]);

  // ── Highlight every time a new constellation is opened ─────────────
  // Scroll is now triggered in handlePanelRef the moment the panel mounts.
  // This effect handles only the temporary violet-glow highlight.
  useEffect(() => {
    if (openId === null) return;

    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightedId(null);

    if (!shouldReduce) {
      setHighlightedId(openId);
      highlightTimer.current = setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    }
  }, [openId, shouldReduce]);

  const handleClose = useCallback(() => {
    setOpenId(null);
    setHighlightedId(null);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  const nodes   = isMobile ? MOBILE_NODES : DESKTOP_NODES;
  const vbW     = isMobile ? 360 : 680;
  const vbH     = isMobile ? 680 : 520;
  const viewBox = `0 0 ${vbW} ${vbH}`;

  const openMemory = MEMORIES.find(m => m.id === openId) ?? null;

  return (
    <section
      id="chapter-four"
      aria-labelledby="chapter-four-title"
      style={{ paddingTop: 'clamp(5rem, 12vw, 8rem)', paddingBottom: 'clamp(6rem, 14vw, 10rem)' }}
    >
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ── Chapter badge ──────────────────────────────────────── */}
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <span className="chapter-badge">Chapter Four</span>
            </div>
          </FadeIn>

          {/* ── Title ─────────────────────────────────────────────── */}
          <FadeIn delay={0.1}>
            <h2
              id="chapter-four-title"
              className="text-glow"
              style={{
                fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 7vw, 3.5rem)',
                fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.01em',
                color: '#F8FAFC', marginBottom: '1rem',
              }}
            >
              If I could keep a few moments forever...
            </h2>
          </FadeIn>

          {/* ── Subtitle ──────────────────────────────────────────── */}
          <FadeIn delay={0.2}>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
              fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(137,207,240,0.5)',
            }}>
              These would probably be the first ones I&apos;d save.
            </p>
          </FadeIn>

          <div style={{ height: 'clamp(2.5rem, 6vw, 4rem)' }} aria-hidden="true" />

          {/* ── Hint ──────────────────────────────────────────────── */}
          <FadeIn delay={0.3} direction="none">
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
              fontWeight: 300, letterSpacing: '0.08em',
              color: 'rgba(137,207,240,0.35)', textAlign: 'center',
              marginBottom: 'clamp(1rem, 3vw, 1.75rem)',
            }}>
              tap a star to open a memory
            </p>
          </FadeIn>

          {/* ── Constellation canvas ──────────────────────────────── */}
          <FadeIn direction="none">
            {/*
              The outer div uses the padding-top aspect-ratio trick to
              match the SVG viewBox exactly. Both the SVG and the
              NodeButtons are absolutely positioned inside it, so the
              button percentages are always pixel-perfect over the dots.
              vbW × vbH ratio → paddingTop = (vbH / vbW) * 100%
            */}
            <div
              style={{
                position:    'relative',
                width:       '100%',
                paddingTop:  `${(vbH / vbW) * 100}%`,
              }}
              role="group"
              aria-label="Memory constellation — tap a star to read a memory"
            >
              {/* SVG fills the padded box exactly */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <ConstellationSVG nodes={nodes} viewBox={viewBox} openId={openId} />
              </div>

              {/* Buttons are absolutely positioned in the same coordinate space */}
              {nodes.map(node => (
                <NodeButton
                  key={node.id}
                  node={node}
                  title={MEMORIES[node.id - 1].title}
                  isOpen={openId === node.id}
                  onClick={handleNodeClick}
                  shouldReduce={shouldReduce}
                  vbW={vbW}
                  vbH={vbH}
                />
              ))}
            </div>
          </FadeIn>

          {/* ── Memory panel ──────────────────────────────────────── */}
          <MemoryPanel
            memory={openMemory}
            onClose={handleClose}
            shouldReduce={shouldReduce}
            highlighted={highlightedId === openId}
            onRef={handlePanelRef}
          />

          <div style={{ height: 'clamp(4rem, 10vw, 7rem)' }} aria-hidden="true" />

          {/* ── Closing sentence ──────────────────────────────────── */}
          <FadeIn direction="none">
            <div style={{ position: 'relative' }}>
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.125rem, 3.2vw, 1.5rem)',
                fontWeight: 300, fontStyle: 'italic', color: 'rgba(248,250,252,0.62)',
                lineHeight: 1.65, textAlign: 'center', maxWidth: '480px',
                marginInline: 'auto', letterSpacing: '0.01em',
              }}>
                I think the best memories are usually the ordinary ones.
              </p>
              {/* Bob sits quietly beside the closing line */}
              <BobEasterEgg
                style={{
                  position: 'absolute',
                  bottom:   0,
                  right:    'clamp(0px, 3%, 24px)',
                }}
              />
            </div>
          </FadeIn>

          {/* ── Fade into next section ────────────────────────────── */}
          <FadeIn direction="none">
            <div
              aria-hidden="true"
              style={{
                height: '1px', marginTop: 'clamp(3rem, 7vw, 5rem)',
                background: `linear-gradient(to right,
                  transparent 0%, rgba(137,207,240,0.15) 30%,
                  rgba(184,168,227,0.15) 70%, transparent 100%)`,
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              }}
            />
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
