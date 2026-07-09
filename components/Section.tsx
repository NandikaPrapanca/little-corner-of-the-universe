/**
 * Section.tsx
 * The universal section wrapper for every chapter/section on the page.
 *
 * Provides:
 * - Consistent vertical padding (generous whitespace)
 * - An id for scroll anchoring
 * - An animation container (children expected to use FadeIn)
 * - Optional top/bottom Divider rendering
 * - Responsive centered layout
 *
 * Usage:
 *   <Section id="chapter-one" showDivider>
 *     <SectionTitle ... />
 *     ...content...
 *   </Section>
 */

import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import Divider from '@/components/ui/Divider';

interface SectionProps {
  /** Anchor id for scroll navigation */
  id: string;
  /** Section content */
  children: ReactNode;
  /** Show decorative divider below section (default: true) */
  showDivider?: boolean;
  /** Additional className on the outer section element */
  className?: string;
  /** Reduce top padding (useful for first section) */
  compactTop?: boolean;
}

export default function Section({
  id,
  children,
  showDivider = true,
  className = '',
  compactTop = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`
        relative
        ${compactTop ? 'pt-20 sm:pt-28' : 'pt-28 sm:pt-36'}
        pb-20 sm:pb-28
        ${className}
      `}
      aria-labelledby={`${id}-title`}
    >
      {/* Centered content container */}
      <Container>
        {children}
      </Container>

      {/* Optional section divider */}
      {showDivider && (
        <Container className="mt-16 sm:mt-24">
          <Divider />
        </Container>
      )}
    </section>
  );
}
