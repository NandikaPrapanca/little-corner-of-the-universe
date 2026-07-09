'use client';

/**
 * Letter.tsx
 * The letter section — an intimate, handwritten-feel message.
 *
 * Design intent:
 * - Looks like a folded letter on aged paper, not a UI card
 * - Warm cream surface instead of dark glass
 * - Violet accent for warmth — this is the most personal section
 * - Subtle paper texture via CSS gradients
 * - Pom with envelope illustration area (to be filled later)
 *
 * Content intentionally empty — letter text written in a later pass.
 */

import Section    from '@/components/Section';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn     from '@/components/ui/FadeIn';

export default function Letter() {
  return (
    <Section id="letter">
      <div className="flex flex-col items-center gap-10">

        {/* ── Section header ──────────────────────────────────────── */}
        <FadeIn>
          <SectionTitle
            badge="A Letter"
            title=""
            subtitle=""
          />
        </FadeIn>

        {/* ── Letter — paper surface, not a dashboard card ────────── */}
        <FadeIn delay={0.15} className="w-full">
          <div
            role="article"
            aria-label="Birthday letter"
            style={{
              // Aged paper feel — warm off-white, not glassy blue
              background: `
                radial-gradient(ellipse at 20% 10%, rgba(255,252,240,0.97) 0%, transparent 70%),
                linear-gradient(160deg, #FDFAF0 0%, #F8F4E4 50%, #F4EFD8 100%)
              `,
              borderRadius: '4px',
              padding:      'clamp(2rem, 6vw, 3.5rem)',
              position:     'relative',
              // Layered shadows — lift + soft edge glow
              boxShadow: `
                0 2px  8px  rgba(0,0,0,0.22),
                0 12px 40px rgba(0,0,0,0.28),
                0 0   60px  rgba(184,168,227,0.06)
              `,
              // Tiny fold lines for authenticity
              borderTop: '1px solid rgba(200,190,160,0.4)',
              borderLeft: '1px solid rgba(200,190,160,0.2)',
            }}
          >
            {/* ── Wax-seal ornament — top right ───────────────────── */}
            <div
              aria-hidden="true"
              style={{
                position:     'absolute',
                top:          '1.25rem',
                right:        '1.25rem',
                width:        '28px',
                height:       '28px',
                borderRadius: '50%',
                background:   'radial-gradient(circle at 35% 35%, rgba(184,168,227,0.55) 0%, rgba(150,130,200,0.25) 60%, transparent 100%)',
                boxShadow:    '0 1px 4px rgba(0,0,0,0.12)',
              }}
            />

            {/* ── Faint ruled line at top (letter header feel) ──────── */}
            <div
              aria-hidden="true"
              style={{
                height:       '1px',
                background:   'linear-gradient(to right, transparent, rgba(180,165,130,0.3) 30%, rgba(180,165,130,0.3) 70%, transparent)',
                marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}
            />

            {/* ── Letter body — empty until content pass ───────────── */}
            <div
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   'clamp(0.9375rem, 2.5vw, 1.0625rem)',
                fontWeight: 300,
                // Warm near-black for readability on cream paper
                color:      'rgba(40, 32, 20, 0.78)',
                lineHeight: 2,
                minHeight:  '120px', // keeps layout stable while empty
              }}
            >
              {/*
                Letter paragraphs will be written here in the content pass.
                Structure:
                  <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>Dear Candy,</p>
                  <p>...</p>
                  <p style={{ textAlign: 'right', marginTop: '2rem' }}>— with love</p>
              */}
            </div>

            {/* ── Faint ruled line at bottom ───────────────────────── */}
            <div
              aria-hidden="true"
              style={{
                height:    '1px',
                background: 'linear-gradient(to right, transparent, rgba(180,165,130,0.3) 30%, rgba(180,165,130,0.3) 70%, transparent)',
                marginTop: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}
            />
          </div>
        </FadeIn>

        {/* ── Pom with envelope — illustration area ──────────────── */}
        <FadeIn delay={0.3}>
          <div
            style={{
              width:  '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Pom delivering the letter — illustration coming soon"
          >
            {/* /characters/pom/sit-envelope.webp goes here */}
          </div>
        </FadeIn>

      </div>
    </Section>
  );
}
