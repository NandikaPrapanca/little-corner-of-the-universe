/**
 * app/layout.tsx
 * Minimal root layout — Next.js App Router (Server Component).
 *
 * Loads shared Google Fonts (Cormorant Garamond, Inter, Caveat) and global CSS.
 * Route groups `app/(v1)` and `app/(v2)` provide their own isolated themes,
 * providers, backgrounds, and navigation chrome.
 */

import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Caveat } from 'next/font/google';
import '@/styles/globals.css';

// ── Font configuration ────────────────────────────────────────────────────
const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  variable: '--font-inter',
  display:  'swap',
});

const caveat = Caveat({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  variable: '--font-caveat',
  display:  'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       'A Little Corner of the Universe ✦',
  description: 'A personal, handcrafted scrapbook and birthday keepsake.',
  robots:      { index: false, follow: false },
  openGraph: {
    title:       'A Little Corner of the Universe',
    description: 'A personal, handcrafted scrapbook and birthday keepsake.',
    type:        'website',
  },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#FAF6F0',
};

// ── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-body antialiased"
        style={{ WebkitTextSizeAdjust: '100%' }}
      >
        {children}
      </body>
    </html>
  );
}
