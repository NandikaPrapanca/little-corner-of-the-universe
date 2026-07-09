'use client';

/**
 * ChapterFour.tsx
 * "If I could keep a few moments forever..."
 *
 * A constellation of 11 memory nodes laid out on an SVG canvas.
 * Faint lines connect them like a star chart.
 * Each node is a glowing point — tap/click to expand the memory.
 * Only one memory is open at a time.
 *
 * Layout strategy:
 * - The canvas is a fixed-aspect SVG (viewBox 0 0 680 520 on desktop,
 *   0 0 360 680 on mobile) so positions are consistent across screen sizes.
 * - Node positions are defined as percentages of the viewBox so they
 *   scale correctly with the SVG's natural scaling.
 * - The open memory panel renders as an HTML overlay positioned
 *   relative to the canvas wrapper — not inside the SVG — so text
 *   renders with full browser quality and accessibility.
 *
 * Accessibility:
 * - Each node is a <button> rendered via foreignObject inside SVG,
 *   OR — simpler and more reliable — the SVG is purely decorative
 *   and the interactive buttons are absolutely positioned HTML
 *   elements over the canvas. This approach is used here.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import FadeIn    from '@/components/ui/FadeIn';
import Container from '@/components/ui/Container';

// ─── Memory data ─────────────────────────────────────────────────────────

interface Memory {
  id:    number;
  title: string;
  text:  string;
}

const MEMORIES: Memory[] = [
  {
    id: 1,
    title: 'Cyberpunk Edgerunners',
    text:  'Watching Cyberpunk together somehow made that moon screenshot even more special.',
  },
  {
    id: 2,
    title: 'La La Land',
    text:  'City of Stars will probably remind me of this website for a long time.',
  },
  {
    id: 3,
    title: 'Off Campus',
    text:  'Somehow we managed to binge another thing together.',
  },
  {
    id: 4,
    title: 'Genshin',
    text:  'Logging in somehow became less about resin and more about hanging out.',
  },
  {
    id: 5,
    title: 'Roblox',
    text:  'Funny that Roblox ended up becoming where all of this quietly started.',
  },
  {
    id: 6,
    title: 'Naruto & Hinata',
    text:  'Matching those blind boxes was honestly adorable.',
  },
  {
    id: 7,
    title: 'The Drunk Texts',
    text:  'I told you not to drink.\nYou definitely didn\'t listen.\nBut your drunk texts were still ridiculously funny.',
  },
  {
    id: 8,
    title: 'Secret Piercing',
    text:  'You secretly got your ears pierced. That was one of my favorite unexpected updates.',
  },
  {
    id: 9,
    title: 'Canada & China',
    text:  'Thank you for letting me see little pieces of your adventures.',
  },
  {
    id: 10,
    title: 'Desk Cleanup',
    text:  'Somehow you made cleaning my setup feel entertaining.',
  },
  {
    id: 11,
    title: 'The Late Nights',
    text:  'There were nights when you felt sad.\nIf staying awake a little longer meant you didn\'t have to feel alone...\nI never really minded.',
  },
];

// ─── Node positions ───────────────────────────────────────────────────────
// Two layout sets: desktop (680×520) and mobile (360×680).
// Values are absolute SVG units within those viewBoxes.
// Arranged so they form a loose, organic star-chart shape.

const DESKTOP_NODES = [
  { id: 1,  x: 120, y: 80  },  // top-left cluster
  { id: 2,  x: 280, y: 55  },  // top center
  { id: 3,  x: 460, y: 95  },  // top-right
  { id: 4,  x: 580, y: 185 },  // right
  { id: 5,  x: 510, y: 300 },  // right-center
  { id: 6,  x: 340, y: 200 },  // center
  { id: 7,  x: 180, y: 240 },  // left-center
  { id: 8,  x: 70,  y: 320 },  // left
  { id: 9,  x: 200, y: 400 },  // lower-left
  { id: 10, x: 400, y: 420 },  // lower-center
  { id: 11, x: 580, y: 440 },  // lower-right
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

// Constellation edges — pairs of node ids to connect with faint lines
const EDGES: [number, number][] = [
  [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 2], [6, 7], [7, 1],
  [7, 8], [8, 9], [9, 10], [10, 5],
  [10, 11], [11, 4], [9, 7],
];

// ─── Constellation SVG ────────────────────────────────────────────────────
// Pure decorative layer: lines + static dot markers.
// Interactive buttons are layered above as HTML, not SVG.

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
      {/* ── Background glow field ───────────────────────────────── */}
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

      {/* ── Constellation lines ─────────────────────────────────── */}
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

      {/* ── Node dots ───────────────────────────────────────────── */}
      {nodes.map(node => {
        const isOpen = node.id === openId;
        return (
          <g key={node.id}>
            {/* Outer glow disc */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isOpen ? 18 : 12}
              fill={isOpen ? 'url(#nodeGlowOpen)' : 'url(#nodeGlow)'}
              style={{ transition: 'r 0.4s ease' }}
            />
            {/* Inner dot */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isOpen ? 4 : 2.5}
              fill={isOpen ? '#B8A8E3' : '#89CFF0'}
              opacity={isOpen ? 1 : 0.75}
              style={{ transition: 'r 0.4s ease, fill 0.4s ease' }}
            />
            {/* Tiny satellite dot — gives stars the classic two-ring look */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isOpen ? 7 : 5}
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
// Rendered as a centered overlay below the constellation canvas.
// Appears/disappears with a gentle fade — never interrupts the layout.

interface MemoryPanelProps {
  memory:       Memory | null;
  onClose:      () => void;
  shouldReduce: boolean;
}

function MemoryPanel({ memory, onClose, shouldReduce }: MemoryPanelProps) {
  const lines = memory?.text.split('\n') ?? [];

  return (
    <AnimatePresence mode="wait">
      {memory && (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduce ? 0 : -8 }}
          transition={{ duration: shouldReduce ? 0.01 : 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginTop:       'clamp(1.5rem, 4vw, 2.5rem)',
            background:      `linear-gradient(
              135deg,
              rgba(16, 30, 58, 0.82) 0%,
              rgba(14, 26, 52, 0.76) 50%,
              rgba(20, 18, 52, 0.80) 100%
            )`,
            backdropFilter:  'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border:          '1px solid rgba(184,168,227,0.18)',
            borderRadius:    '16px',
            padding:         'clamp(1.25rem, 4vw, 2rem)',
            boxShadow:       `
              0 2px  8px  rgba(0,0,0,0.24),
              0 12px 32px rgba(0,0,0,0.20),
              inset 0 1px 0 rgba(255,255,255,0.04)
            `,
            position:        'relative',
          }}
        >
          {/* Close tap target — full panel is also tappable */}
          <button
            onClick={onClose}
            aria-label="Close memory"
            style={{
              position:   'absolute',
              top:        '12px',
              right:      '14px',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              padding:    '6px',
              color:      'rgba(203,213,225,0.35)',
              fontSize:   '1rem',
              lineHeight: 1,
              // Min touch target
              minWidth:   '32px',
              minHeight:  '32px',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          {/* Memory title */}
          <p
            style={{
              fontFamily:    'var(--font-inter)',
              fontSize:      'clamp(0.6875rem, 1.6vw, 0.75rem)',
              fontWeight:    500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'rgba(184,168,227,0.65)',
              marginBottom:  '0.75rem',
            }}
          >
            {memory.title}
          </p>

          {/* Memory text — supports multi-line */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {lines.map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily:    'var(--font-cormorant)',
                  fontSize:      'clamp(1.0625rem, 3vw, 1.3125rem)',
                  fontWeight:    300,
                  fontStyle:     'italic',
                  lineHeight:    1.65,
                  color:         i === 0
                    ? 'rgba(248,250,252,0.85)'
                    : 'rgba(203,213,225,0.68)',
                  margin:        0,
                  paddingLeft:   (i > 0 && lines.length > 1) ? '0.5em' : 0,
                }}
              >
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
// An invisible touch-target button positioned exactly over each SVG node.
// The SVG draws the visuals; this element handles interaction.

interface NodeButtonProps {
  node:         { id: number; x: number; y: number };
  title:        string;
  isOpen:       boolean;
  onClick:      (id: number) => void;
  shouldReduce: boolean;
  /** viewBox dimensions so we can calculate % position */
  vbW:          number;
  vbH:          number;
}

function NodeButton({
  node, title, isOpen, onClick, shouldReduce, vbW, vbH,
}: NodeButtonProps) {
  // Position as % of viewBox — the SVG scales to fill its container
  // so these % positions will track the dots exactly.
  const leftPct = (node.x / vbW) * 100;
  const topPct  = (node.y / vbH) * 100;

  return (
    <motion.button
      onClick={() => onClick(node.id)}
      aria-label={`Memory: ${title}${isOpen ? ' (open)' : ''}`}
      aria-pressed={isOpen}
      style={{
        position:        'absolute',
        left:            `${leftPct}%`,
        top:             `${topPct}%`,
        transform:       'translate(-50%, -50%)',
        // Touch target: 44×44 minimum
        width:           '44px',
        height:          '44px',
        borderRadius:    '50%',
        background:      'transparent',
        border:          'none',
        cursor:          'pointer',
        // Show title label as tooltip via title attribute
        // Visible label renders below on hover via CSS
        zIndex:          2,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
      }}
      whileHover={shouldReduce ? undefined : { scale: 1.3 }}
      whileTap={shouldReduce   ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      title={title}
    >
      {/* Visually hidden label for screen readers */}
      <span style={{
        position: 'absolute',
        width:    '1px',
        height:   '1px',
        overflow: 'hidden',
        clip:     'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
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
  const [openId, setOpenId] = useState<number | null>(null);

  const nodes   = isMobile ? MOBILE_NODES : DESKTOP_NODES;
  const vbW     = isMobile ? 360 : 680;
  const vbH     = isMobile ? 680 : 520;
  const viewBox = `0 0 ${vbW} ${vbH}`;

  const handleNodeClick = useCallback((id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  const handleClose = useCallback(() => setOpenId(null), []);

  const openMemory = MEMORIES.find(m => m.id === openId) ?? null;

  return (
    <section
      id="chapter-four"
      aria-labelledby="chapter-four-title"
      style={{
        paddingTop:    'clamp(5rem, 12vw, 8rem)',
        paddingBottom: 'clamp(6rem, 14vw, 10rem)',
      }}
    >
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ── Chapter badge ───────────────────────────────────────── */}
          <FadeIn>
            <div style={{ marginBottom: '2rem' }}>
              <span className="chapter-badge">Chapter Four</span>
            </div>
          </FadeIn>

          {/* ── Title ───────────────────────────────────────────────── */}
          <FadeIn delay={0.1}>
            <h2
              id="chapter-four-title"
              className="text-glow"
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(2rem, 7vw, 3.5rem)',
                fontWeight:    300,
                lineHeight:    1.2,
                letterSpacing: '-0.01em',
                color:         '#F8FAFC',
                marginBottom:  '1rem',
              }}
            >
              If I could keep a few moments forever...
            </h2>
          </FadeIn>

          {/* ── Subtitle ────────────────────────────────────────────── */}
          <FadeIn delay={0.2}>
            <p
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      'clamp(0.75rem, 1.8vw, 0.875rem)',
                fontWeight:    400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         'rgba(137,207,240,0.5)',
              }}
            >
              These would probably be the first ones I&apos;d save.
            </p>
          </FadeIn>

          {/* ── Breathing space ─────────────────────────────────────── */}
          <div style={{ height: 'clamp(2.5rem, 6vw, 4rem)' }} aria-hidden="true" />

          {/* ── Hint text ───────────────────────────────────────────── */}
          <FadeIn delay={0.3} direction="none">
            <p
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      'clamp(0.6875rem, 1.5vw, 0.75rem)',
                fontWeight:    300,
                letterSpacing: '0.08em',
                color:         'rgba(137,207,240,0.35)',
                textAlign:     'center',
                marginBottom:  'clamp(1rem, 3vw, 1.75rem)',
              }}
            >
              tap a star to open a memory
            </p>
          </FadeIn>

          {/* ── Constellation canvas ─────────────────────────────────── */}
          <FadeIn direction="none">
            {/*
              Outer wrapper is `position: relative` so the absolutely
              positioned NodeButtons track the SVG coordinate system.
              The SVG scales to fill 100% width; buttons use % positions
              matching the SVG viewBox proportions.
            */}
            <div
              style={{ position: 'relative', width: '100%' }}
              role="group"
              aria-label="Memory constellation — tap a star to read a memory"
            >
              <ConstellationSVG
                nodes={nodes}
                viewBox={viewBox}
                openId={openId}
              />

              {/* Interactive buttons layered over the SVG */}
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

          {/* ── Expanded memory panel ────────────────────────────────── */}
          <MemoryPanel
            memory={openMemory}
            onClose={handleClose}
            shouldReduce={shouldReduce}
          />

          {/* ── Generous space before closing sentence ───────────────── */}
          <div style={{ height: 'clamp(4rem, 10vw, 7rem)' }} aria-hidden="true" />

          {/* ── Closing sentence ─────────────────────────────────────── */}
          <FadeIn direction="none">
            <p
              style={{
                fontFamily:    'var(--font-cormorant)',
                fontSize:      'clamp(1.125rem, 3.2vw, 1.5rem)',
                fontWeight:    300,
                fontStyle:     'italic',
                color:         'rgba(248,250,252,0.62)',
                lineHeight:    1.65,
                textAlign:     'center',
                maxWidth:      '480px',
                marginInline:  'auto',
                letterSpacing: '0.01em',
              }}
            >
              I think the best memories are usually the ordinary ones.
            </p>
          </FadeIn>

          {/* ── Fade into next section ────────────────────────────────── */}
          <FadeIn direction="none">
            <div
              aria-hidden="true"
              style={{
                height:      '1px',
                marginTop:   'clamp(3rem, 7vw, 5rem)',
                background:  `linear-gradient(
                  to right,
                  transparent 0%,
                  rgba(137,207,240,0.15) 30%,
                  rgba(184,168,227,0.15) 70%,
                  transparent 100%
                )`,
                maskImage:    'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
              }}
            />
          </FadeIn>

        </div>
      </Container>
    </section>
  );
}
