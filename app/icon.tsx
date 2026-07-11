/**
 * app/icon.tsx
 * Browser favicon — served automatically as /icon.png by Next.js App Router.
 * Covers: desktop browser tab, Android Chrome, Samsung Internet.
 *
 * Design: cream envelope on transparent background, navy outline, violet seal.
 */

import { ImageResponse } from 'next/og';

export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime     = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          // Transparent background — icon blends with any browser chrome
          background:     'transparent',
        }}
      >
        {/*
          Envelope sized to fill the 32px square with a little padding.
          viewBox 0 0 96 72 — envelope proportions.
        */}
        <svg
          width="30"
          height="23"
          viewBox="0 0 96 72"
          fill="none"
        >
          {/* Envelope body — cream fill */}
          <rect
            x="1" y="1" width="94" height="70" rx="6"
            fill="#F6F1E8"
            stroke="#13233C"
            strokeWidth="4"
          />
          {/* Flap — slightly darker cream */}
          <path
            d="M1 1 L95 1 L48 38 Z"
            fill="#EDE8DC"
            stroke="#13233C"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Bottom fold crease lines */}
          <path d="M1 71 L48 38"  stroke="#13233C" strokeWidth="2" opacity="0.30" />
          <path d="M95 71 L48 38" stroke="#13233C" strokeWidth="2" opacity="0.30" />
          {/* Wax seal — violet heart-ish dot */}
          <circle cx="48" cy="55" r="7" fill="#B8A8E3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
