/**
 * components/v2/ArchiveTicketButton.tsx
 * Tactile vintage-ticket / keepsake stub linking back to the Sweet 17 Storybook (/v1).
 */

import Link from 'next/link';

export default function ArchiveTicketButton() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-5 pt-14 pb-20 sm:pt-20 sm:pb-24">
      <p
        className="mb-4 text-center"
        style={{
          fontFamily:    'var(--font-inter), sans-serif',
          fontSize:      '0.7rem',
          fontWeight:    500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color:         'rgba(107, 97, 90, 0.75)',
        }}
      >
        From the Archive
      </p>

      <Link
        href="/v1"
        aria-label="Revisit the Sweet 17 Storybook (v1)"
        className="group relative block w-full max-w-md transition-all duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-desk-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-desk-bg rounded-xl"
      >
        {/* Ticket body */}
        <div
          className="relative overflow-hidden rounded-xl px-6 py-5 sm:px-8 sm:py-6"
          style={{
            background: 'linear-gradient(135deg, #FFFDF9 0%, #F7EFE2 100%)',
            border:     '1px solid rgba(184, 107, 75, 0.28)',
            boxShadow:
              '0 4px 14px rgba(43, 38, 35, 0.06), 0 12px 28px rgba(43, 38, 35, 0.06)',
          }}
        >
          {/* Left & right ticket stub semicircular notches */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{
              backgroundColor: '#F4EDE3',
              boxShadow:       'inset -1px 0 0 rgba(184, 107, 75, 0.28)',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
            style={{
              backgroundColor: '#F4EDE3',
              boxShadow:       'inset 1px 0 0 rgba(184, 107, 75, 0.28)',
            }}
          />

          {/* Inner dashed keepsake border */}
          <div
            className="rounded-lg px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col items-center text-center gap-1.5"
            style={{
              border: '1px dashed rgba(184, 107, 75, 0.32)',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily:    'var(--font-inter), sans-serif',
                  fontSize:      '0.625rem',
                  fontWeight:    500,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color:         '#6E826F',
                }}
              >
                Keepsake Stub · No. 17
              </span>
            </div>

            <span
              className="transition-colors duration-200 group-hover:text-desk-terracotta"
              style={{
                fontFamily:    'var(--font-cormorant), Georgia, serif',
                fontSize:      'clamp(1.25rem, 3.8vw, 1.55rem)',
                fontWeight:    500,
                color:         '#2B2623',
                lineHeight:    1.25,
                letterSpacing: '-0.01em',
              }}
            >
              Revisit the Sweet 17 Storybook (v1){' '}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>

            <span
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize:   '0.75rem',
                fontWeight: 300,
                color:      '#6B615A',
              }}
            >
              The original starlit chapters, music &amp; birthday letter
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
