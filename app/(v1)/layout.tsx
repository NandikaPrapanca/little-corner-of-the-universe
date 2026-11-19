/**
 * app/(v1)/layout.tsx
 * Isolated layout for the original Sweet 17 Storybook (/v1).
 *
 * Keeps NightSky, AudioProvider, MusicPlayer, JourneyIndicator, and
 * FirstInteraction strictly scoped to the /v1 route group.
 */

import type { Metadata } from 'next';
import Link              from 'next/link';
import ClientProviders   from '@/components/ClientProviders';
import NightSky          from '@/components/NightSky';
import MusicPlayer       from '@/components/MusicPlayer';

export const metadata: Metadata = {
  title:       'A Little Corner of the Universe · Sweet 17 (v1) ✦',
  description: 'The original handcrafted Sweet 17 birthday storybook.',
};

export default function V1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-night-bg text-text-primary relative">
      <ClientProviders>
        {/* Fixed animated night sky — strictly scoped to v1 */}
        <NightSky />

        {/* Subtle floating return pill — top-left corner */}
        <Link
          href="/"
          aria-label="Back to Latest Polaroid Desk"
          className="glass-card fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-light tracking-wide text-text-secondary transition-all duration-200 hover:text-text-primary hover:border-accent-sky/30 print:hidden"
          style={{
            borderRadius: '999px',
            fontFamily:   'var(--font-inter)',
          }}
        >
          <span aria-hidden="true">←</span>
          <span>Back to Latest</span>
        </Link>

        {/* Floating music player — top-right corner */}
        <MusicPlayer />

        {/* V1 Storybook content */}
        <main id="main-content" className="relative z-10">
          {children}
        </main>
      </ClientProviders>

      {/* Skip-to-content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-night-card focus:text-text-primary focus:border focus:border-accent-sky"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem' }}
      >
        Skip to main content
      </a>
    </div>
  );
}
