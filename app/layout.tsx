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
  // Favicon — envelope SVG reusing the Landing artwork geometry
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 68'%3E%3Crect x='0.5' y='0.5' width='95' height='67' rx='4' fill='%23071827' stroke='%2389CFF0' stroke-width='2'/%3E%3Cpath d='M0 0 L96 0 L48 36 Z' fill='%230F2840' stroke='%2389CFF0' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M0 68 L48 34 L96 68' stroke='%2389CFF0' stroke-width='1' fill='none' opacity='0.5'/%3E%3Ccircle cx='48' cy='52' r='5' fill='%23B8A8E3' opacity='0.7'/%3E%3C/svg%3E",
        type: 'image/svg+xml',
      },
    ],
  },
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
