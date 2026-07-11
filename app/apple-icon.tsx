/**
 * app/apple-icon.tsx
 * Apple Touch Icon — served automatically as /apple-icon.png by Next.js.
 * Used on iOS Safari "Add to Home Screen" and iOS/macOS bookmarks.
 *
 * Design: same cream envelope as icon.tsx, scaled to 180×180.
 * Apple icons look best with a solid background (no transparency),
 * so we use a deep navy matching the site's night sky.
 */

import { ImageResponse } from 'next/og';

export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';
export const runtime     = 'edge';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          // Solid navy background — recommended for Apple touch icons
          background:     '#071827',
          borderRadius:   '22px', // iOS applies its own mask, but this helps PWA previews
        }}
      >
        {/* Envelope scaled generously inside the 180px square */}
        <svg
          width="130"
          height="98"
          viewBox="0 0 96 72"
          fill="none"
        >
          {/* Envelope body — cream fill */}
          <rect
            x="1" y="1" width="94" height="70" rx="6"
            fill="#F6F1E8"
            stroke="#13233C"
            strokeWidth="3"
          />
          {/* Flap — slightly darker cream */}
          <path
            d="M1 1 L95 1 L48 38 Z"
            fill="#EDE8DC"
            stroke="#13233C"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Bottom fold crease lines */}
          <path d="M1 71 L48 38"  stroke="#13233C" strokeWidth="1.5" opacity="0.30" />
          <path d="M95 71 L48 38" stroke="#13233C" strokeWidth="1.5" opacity="0.30" />
          {/* Wax seal — violet dot */}
          <circle cx="48" cy="55" r="7" fill="#B8A8E3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
