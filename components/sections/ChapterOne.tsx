'use client';

/**
 * ChapterOne.tsx
 * Chapter One — first story chapter.
 * Photos are replaced with Polaroid placeholders.
 * Content will be written in a later pass.
 */

import Section        from '@/components/Section';
import SectionTitle   from '@/components/ui/SectionTitle';
import FadeIn         from '@/components/ui/FadeIn';
import PolaroidFrame  from '@/components/ui/PolaroidFrame';

export default function ChapterOne() {
  return (
    <Section id="chapter-one">
      <div className="flex flex-col gap-12">

        {/* ── Section header ────────────────────────────────────────── */}
        <FadeIn>
          <SectionTitle
            badge="Chapter One"
            title=""
            subtitle=""
          />
        </FadeIn>

        {/* ── Story text placeholder ────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="story-text-area" />
        </FadeIn>

        {/* ── Photo placeholder ─────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          <div className="flex justify-center">
            <PolaroidFrame
              rotation={-1.5}
              aspectRatio="4/3"
              className="w-full"
              style={{ maxWidth: '420px' }}
            />
          </div>
        </FadeIn>

      </div>
    </Section>
  );
}
