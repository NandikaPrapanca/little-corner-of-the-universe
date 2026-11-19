/**
 * app/(v2)/page.tsx
 * V2 Homepage — Photo-free, character-free editorial journal page:
 * "My POV: How She Is & What She Is".
 */

import { heroContent } from '@/data/v2Content';
import PovEssay from '@/components/v2/PovEssay';
import CuratedShelf from '@/components/v2/CuratedShelf';
import ArchiveTicketButton from '@/components/v2/ArchiveTicketButton';
import ScrollTulip from '@/components/v2/ScrollTulip';

export default function V2HomePage() {
  return (
    <div className="relative w-full">
      {/* ── Subtle Scroll-Linked Botanical Tulip (Background Layer) ─── */}
      <ScrollTulip />

      {/* ── Pure Editorial Typography Header ─────────────────────────── */}
      <header className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-10 sm:pb-14 text-center">
        {/* Eyebrow kicker */}
        <p
          className="mb-3.5"
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#B86B4B',
          }}
        >
          {heroContent.kicker}
        </p>

        {/* Main Editorial Title */}
        <h1
          className="mb-5"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(2.5rem, 8vw, 4.25rem)',
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: '#2B2623',
          }}
        >
          {heroContent.titlePrefix}{' '}
          <span
            className="italic"
            style={{ color: '#B86B4B', fontWeight: 400 }}
          >
            {heroContent.titleEmphasis}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto max-w-xl"
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(0.925rem, 2.2vw, 1.025rem)',
            fontWeight: 300,
            lineHeight: 1.85,
            color: '#5C534D',
          }}
        >
          {heroContent.subtitle}
        </p>

        {/* Subtle editorial rule */}
        <div
          aria-hidden="true"
          className="mt-10 mx-auto flex items-center justify-center gap-3 max-w-xs"
        >
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(184, 107, 75, 0.32))',
            }}
          />
          <span style={{ color: '#6E826F', fontSize: '0.7rem' }}>✦</span>
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(to left, transparent, rgba(110, 130, 111, 0.32))',
            }}
          />
        </div>
      </header>

      {/* ── Main Editorial POV Essay ─────────────────────────────────── */}
      <PovEssay />

      {/* ── Curated Movies, Series & Songs Shelf ─────────────────────── */}
      <CuratedShelf />

      {/* ── Archive Keepsake Ticket to V1 (/v1) ──────────────────────── */}
      <ArchiveTicketButton />

      {/* ── Quiet Desk Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 pb-12 text-center px-5">
        <p
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '0.72rem',
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: 'rgba(107, 97, 90, 0.7)',
          }}
        >
          A Little Corner of the Universe · Edition 02 · Kept on warm paper
        </p>
      </footer>
    </div>
  );
}
