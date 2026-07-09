'use client';

/**
 * ChapterFour.tsx
 * Chapter Four — fourth story chapter.
 * Photos replaced with Polaroid placeholders.
 * Content will be written in a later pass.
 */

import Section        from '@/components/Section';
import SectionTitle   from '@/components/ui/SectionTitle';
import FadeIn         from '@/components/ui/FadeIn';
import PolaroidFrame  from '@/components/ui/PolaroidFrame';

export default function ChapterFour() {
  return (
    <Section id="chapter-four">
      <div className="flex flex-col gap-12">

        {/* ── Section header ────────────────────────────────────────── */}
        <FadeIn>
          <SectionTitle
            badge="Chapter Four"
            title=""
            subtitle=""
          />
        </FadeIn>

        {/* ── Story text placeholder ────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="story-text-area" />
        </FadeIn>

        {/* ── Bob character area — transparent, no card ─────────────── */}
        <FadeIn delay={0.2}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'center',
              paddingBlock:   '1.5rem',
            }}
            aria-label="Bob character — coming soon"
          >
            {/* Bob illustration will be placed here */}
          </div>
        </FadeIn>

        {/* ── Photo gallery — scattered Polaroids ──────────────────── */}
        <FadeIn delay={0.3}>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            style={{ flexWrap: 'wrap' }}
          >
            <PolaroidFrame
              rotation={-3}
              aspectRatio="4/3"
              style={{ maxWidth: '260px', width: '80%' }}
            />
            <PolaroidFrame
              rotation={1.5}
              aspectRatio="4/3"
              style={{ maxWidth: '260px', width: '80%' }}
            />
          </div>
        </FadeIn>

      </div>
    </Section>
  );
}
