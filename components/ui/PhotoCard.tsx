'use client';

/**
 * PhotoCard.tsx
 * A cinematic photo display card with:
 * - Graceful fallback for missing images
 * - Hover scale animation (1.03 per design spec)
 * - Optional caption
 * - Soft shadow and rounded corners
 * - Lazy loading via Next.js Image
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface PhotoCardProps {
  /** Path relative to /public (e.g. /photos/img01-genshin.webp) */
  src: string;
  /** Accessible alt text */
  alt: string;
  /** Optional caption below the photo */
  caption?: string;
  /** Aspect ratio class — default is 4/3 */
  aspectRatio?: '4/3' | '3/4' | '1/1' | '16/9';
  /** Extra className on the card wrapper */
  className?: string;
}

/** Maps aspect ratio strings to Tailwind padding-bottom percentages */
const aspectRatioMap: Record<NonNullable<PhotoCardProps['aspectRatio']>, string> = {
  '4/3':  'pt-[75%]',   // 3/4 = 75%
  '3/4':  'pt-[133%]',  // 4/3 ≈ 133%
  '1/1':  'pt-[100%]',
  '16/9': 'pt-[56.25%]',
};

export default function PhotoCard({
  src,
  alt,
  caption,
  aspectRatio = '4/3',
  className = '',
}: PhotoCardProps) {
  const [hasError, setHasError] = useState(false);
  const paddingClass = aspectRatioMap[aspectRatio];

  return (
    <motion.figure
      className={`glass-card overflow-hidden ${className}`}
      whileHover={{
        scale: 1.03, // design spec hover scale
        boxShadow: '0 8px 40px rgba(137, 207, 240, 0.15)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Aspect ratio container */}
      <div className={`relative w-full ${paddingClass}`}>
        {hasError ? (
          /* ── Fallback for missing images ─────────────────────────── */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(16,37,61,0.8), rgba(7,24,39,0.9))',
            }}
            aria-label={`Image unavailable: ${alt}`}
          >
            {/* Placeholder icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(137,207,240,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '0.75rem',
                color:      'rgba(203,213,225,0.5)',
              }}
            >
              {alt}
            </span>
          </div>
        ) : (
          /* ── Actual image ─────────────────────────────────────────── */
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 720px) 100vw, 720px"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        )}
      </div>

      {/* Optional caption */}
      {caption && (
        <figcaption
          className="px-4 py-3"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   '0.8125rem',
            fontWeight: 300,
            color:      '#CBD5E1',
            textAlign:  'center',
            fontStyle:  'italic',
          }}
        >
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
