'use client';

/**
 * ChapterThree.tsx
 * Chapter Three — third story chapter.
 * Photos are replaced with Polaroid placeholders.
 * Content will be written in a later pass.
 */

import Section        from '@/components/Section';
import SectionTitle   from '@/components/ui/SectionTitle';
import FadeIn         from '@/components/ui/FadeIn';
import PolaroidFrame  from '@/components/ui/PolaroidFrame';

export default function ChapterThree() {
  return (
    <Section id="chapter-three">
      <div className="flex flex-col gap-12">

        {/* ── Section header ────────────────────────────────────────── */}
        <FadeIn>
          <SectionTitle
            badge="Chapter Three"
            title=""
            subtitle=""
          />
        </FadeIn>

        {/* ── Story text placeholder ────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="story-text-area" />
        </FadeIn>

        {/* ── Portrait photo — slightly taller crop ────────────────── */}
        <FadeIn delay={0.2}>
          <div className="flex justify-center">
            <PolaroidFrame
              rotation={1}
              aspectRatio="3/4"
              style={{ maxWidth: '260px', width: '72%' }}
            />
          </div>
        </FadeIn>

        {/* ── Pom character area — transparent, no dashboard card ──── */}
        <FadeIn delay={0.3}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'center',
              paddingBlock:   '2rem',
            }}
            aria-label="Pom character — coming soon"
          >
            {/* Pom walk animation will be placed here in a later pass */}
          </div>
        </FadeIn>

      </div>
    </Section>
  );
}
