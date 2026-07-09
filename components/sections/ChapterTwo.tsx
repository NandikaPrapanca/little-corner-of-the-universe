'use client';

/**
 * ChapterTwo.tsx
 * Chapter Two — second story chapter.
 * Photos are replaced with Polaroid placeholders.
 * Content will be written in a later pass.
 */

import Section        from '@/components/Section';
import SectionTitle   from '@/components/ui/SectionTitle';
import FadeIn         from '@/components/ui/FadeIn';
import PolaroidFrame  from '@/components/ui/PolaroidFrame';

export default function ChapterTwo() {
  return (
    <Section id="chapter-two">
      <div className="flex flex-col gap-12">

        {/* ── Section header ────────────────────────────────────────── */}
        <FadeIn>
          <SectionTitle
            badge="Chapter Two"
            title=""
            subtitle=""
          />
        </FadeIn>

        {/* ── Story text placeholder ────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="story-text-area" />
        </FadeIn>

        {/* ── Photos — slight alternating tilt ─────────────────────── */}
        <FadeIn delay={0.2}>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8"
            style={{ flexWrap: 'wrap' }}
          >
            <PolaroidFrame
              rotation={2}
              aspectRatio="4/3"
              style={{ maxWidth: '280px', width: '100%' }}
            />
            <PolaroidFrame
              rotation={-2.5}
              aspectRatio="3/4"
              style={{ maxWidth: '220px', width: '80%' }}
            />
          </div>
        </FadeIn>

      </div>
    </Section>
  );
}
