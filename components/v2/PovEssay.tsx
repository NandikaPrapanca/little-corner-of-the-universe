'use client';

/**
 * components/v2/PovEssay.tsx
 * Editorial reading column for "My POV: How She Is & What She Is".
 *
 * Pure typography on warm stationery — centered max-w-[640px] column,
 * generous line height, indented Cormorant Garamond pull-quote, and
 * subtle ink dividers.
 */

import { m, useReducedMotion } from 'framer-motion';
import { povEssay } from '@/data/v2Content';

export default function PovEssay() {
  const shouldReduce = useReducedMotion() ?? false;

  const fadeProps = (delay = 0) => ({
    initial: { opacity: 0, y: shouldReduce ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: {
      duration: shouldReduce ? 0.01 : 0.65,
      delay: shouldReduce ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <section
      aria-labelledby="pov-essay-heading"
      className="relative z-10 w-full max-w-[680px] mx-auto px-5 sm:px-8 pt-4 pb-16 sm:pb-24"
    >
      {/* Tactile editorial paper sheet */}
      <m.article
        {...fadeProps(0.05)}
        className="relative rounded-2xl px-6 py-9 sm:px-12 sm:py-14"
        style={{
          background:
            'linear-gradient(168deg, #FFFDF9 0%, #FAF5EC 55%, #F6EFE3 100%)',
          border: '1px solid rgba(184, 107, 75, 0.18)',
          boxShadow:
            '0 2px 6px rgba(43, 38, 35, 0.04), 0 16px 40px rgba(43, 38, 35, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Top ruled margin accent */}
        <div
          aria-hidden="true"
          className="flex items-center justify-between pb-6 mb-7"
          style={{ borderBottom: '1px solid rgba(184, 107, 75, 0.18)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#B86B4B',
            }}
          >
            {povEssay.sectionLabel}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '0.875rem',
              color: '#6E826F',
            }}
          >
            Personal Essay
          </span>
        </div>

        {/* Essay heading */}
        <h2
          id="pov-essay-heading"
          className="mb-7"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(1.65rem, 4.5vw, 2.35rem)',
            fontWeight: 400,
            lineHeight: 1.22,
            letterSpacing: '-0.01em',
            color: '#2B2623',
          }}
        >
          {povEssay.heading}
        </h2>

        {/* Lead paragraphs */}
        <div className="space-y-5 max-w-[640px]">
          {povEssay.leadParagraphs.map((para, idx) => (
            <p
              key={`lead-${idx}`}
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
                fontWeight: 300,
                lineHeight: 1.9,
                color: '#3D3632',
                margin: 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Highlighted Cormorant Garamond Pull-Quote */}
        <m.blockquote
          {...fadeProps(0.1)}
          className="my-9 sm:my-11 pl-5 sm:pl-7 py-2"
          style={{
            borderLeft: '2px solid #B86B4B',
            background:
              'linear-gradient(90deg, rgba(184, 107, 75, 0.05) 0%, transparent 100%)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.3rem, 3.6vw, 1.65rem)',
              fontWeight: 400,
              lineHeight: 1.45,
              color: '#2B2623',
              margin: 0,
            }}
          >
            &ldquo;{povEssay.pullQuote}&rdquo;
          </p>
          {povEssay.pullQuoteNote && (
            <footer
              className="mt-2.5"
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#6E826F',
              }}
            >
              {povEssay.pullQuoteNote}
            </footer>
          )}
        </m.blockquote>

        {/* Closing body paragraphs */}
        <div className="space-y-5 max-w-[640px]">
          {povEssay.bodyParagraphs.map((para, idx) => (
            <p
              key={`body-${idx}`}
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
                fontWeight: 300,
                lineHeight: 1.9,
                color: '#3D3632',
                margin: 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Handwritten sign-off */}
        <div
          className="mt-10 pt-6 flex items-center justify-between"
          style={{ borderTop: '1px dashed rgba(139, 118, 96, 0.25)' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-caveat), Caveat, cursive',
              fontSize: 'clamp(1.35rem, 3.5vw, 1.6rem)',
              fontWeight: 500,
              color: '#B86B4B',
              margin: 0,
            }}
          >
            {povEssay.signOff}
          </p>
          <span
            aria-hidden="true"
            style={{
              color: '#6E826F',
              fontSize: '0.8rem',
              opacity: 0.75,
            }}
          >
            ✦
          </span>
        </div>
      </m.article>
    </section>
  );
}
