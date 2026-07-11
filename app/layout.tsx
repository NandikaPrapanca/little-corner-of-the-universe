/**
 * layout.tsx
 * Root layout — Next.js App Router (Server Component).
 *
 * Client-side providers (AudioProvider) are isolated in ClientProviders.tsx
 * so this file can stay a server component and benefit from RSC optimizations.
 */

import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@/styles/globals.css';

import ClientProviders from '@/components/ClientProviders';
import NightSky        from '@/components/NightSky';
import MusicPlayer     from '@/components/MusicPlayer';

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

// ── Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       'A Little Corner of the Universe ✦',
  description: 'A personal, handcrafted birthday storybook.',
  robots:      { index: false, follow: false },
  // Icons are served automatically from app/icon.tsx and app/apple-icon.tsx
  // by Next.js App Router — no explicit icons config needed here.
  openGraph: {
    title:       'little corner of the universe',
    description: 'A personal, handcrafted birthday storybook.',
    type:        'website',
  },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#071827',
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
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-night-bg text-text-primary font-body"
        style={{ WebkitTextSizeAdjust: '100%' }}
      >
        {/*
          ClientProviders mounts AudioProvider (client-only).
          NightSky and MusicPlayer are also client components but
          imported here so they sit outside the page scroll tree.
        */}
        <ClientProviders>
          {/* Fixed animated night sky — always behind everything */}
          <NightSky />

          {/* Floating music player — top-right corner */}
          <MusicPlayer />

          {/* Page content */}
          <main id="main-content" className="relative z-10">
            {children}
          </main>
        </ClientProviders>

        {/* Skip-to-content (accessibility) — sits outside providers intentionally */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-night-card focus:text-text-primary focus:border focus:border-accent-sky"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
        >
          Skip to main content
        </a>
      </body>
    </html>
  );
}
