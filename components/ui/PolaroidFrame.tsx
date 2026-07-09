'use client';

/**
 * PolaroidFrame.tsx
 * An empty Polaroid-style photo placeholder.
 *
 * Design intent:
 * - Looks like an undeveloped photograph waiting to be filled
 * - Soft cream-tinted paper background
 * - Rounded corners, subtle drop shadow
 * - Very slight rotation (each instance receives a unique angle)
 * - Bottom "label" strip like a real Polaroid
 * - Never looks like a UI card — always looks handcrafted
 *
 * Usage:
 *   <PolaroidFrame rotation={-2} label="Chapter One" />
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface PolaroidFrameProps {
  /** Rotation in degrees — negative tilts left, positive tilts right */
  rotation?: number;
  /** Optional tiny label at the bottom (pencil-written feel) */
  label?: string;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Inline style override */
  style?: React.CSSProperties;
  /** Aspect ratio of the photo area (default: 4/3) */
  aspectRatio?: '4/3' | '3/4' | '1/1';
}

const aspectMap = {
  '4/3': 75,    // padding-top %
  '3/4': 133.3,
  '1/1': 100,
};

export default function PolaroidFrame({
  rotation    = 0,
  label,
  className   = '',
  style: styleProp,
  aspectRatio = '4/3',
}: PolaroidFrameProps) {
  const shouldReduce = useReducedMotion();
  const pt = aspectMap[aspectRatio];

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{
        // Polaroid outer shell — soft paper white
        background:   '#F4F0E8',
        borderRadius: '3px',
        padding:      '10px 10px 32px 10px', // extra bottom for the label strip
        boxShadow: `
          0 2px  8px  rgba(0, 0, 0, 0.28),
          0 8px  24px rgba(0, 0, 0, 0.18),
          inset 0 0 0 1px rgba(0,0,0,0.04)
        `,
        transform: shouldReduce ? undefined : `rotate(${rotation}deg)`,
        willChange: 'transform',
        maxWidth: '100%',
      }}
      whileHover={shouldReduce ? undefined : {
        rotate: rotation * 0.4, // slightly un-tilt on hover — tactile feel
        scale:  1.03,
        boxShadow: `
          0 4px  16px rgba(0,0,0,0.32),
          0 16px 40px rgba(0,0,0,0.22)
        `,
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* ── Photo area — the "undeveloped" frame ────────────────────── */}
      <div
        style={{
          position:     'relative',
          width:        '100%',
          paddingTop:   `${pt}%`,
          background:   `
            radial-gradient(ellipse at 30% 25%, rgba(200,195,185,0.5) 0%, transparent 60%),
            linear-gradient(135deg, #C8C4BC 0%, #B8B4AC 50%, #C0BCB4 100%)
          `,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Very faint grain texture via pseudo-noise pattern */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.015) 2px,
                rgba(255,255,255,0.015) 4px
              )
            `,
          }}
        />

        {/* Tiny center mark — subtle crosshair like an empty viewfinder */}
        <div
          style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            transform: 'translate(-50%, -50%)',
            opacity:   0.18,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="10" y1="0"  x2="10" y2="8"  stroke="#888" strokeWidth="1" />
            <line x1="10" y1="12" x2="10" y2="20" stroke="#888" strokeWidth="1" />
            <line x1="0"  y1="10" x2="8"  y2="10" stroke="#888" strokeWidth="1" />
            <line x1="12" y1="10" x2="20" y2="10" stroke="#888" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* ── Label strip ─────────────────────────────────────────────── */}
      {label && (
        <div
          style={{
            paddingTop:  '8px',
            textAlign:   'center',
            fontFamily:  '"Caveat", var(--font-cormorant), cursive',
            fontSize:    '0.75rem',
            color:       'rgba(80, 70, 60, 0.55)',
            letterSpacing: '0.02em',
            lineHeight:  1,
            userSelect:  'none',
          }}
        >
          {label}
        </div>
      )}
    </motion.div>
  );
}
