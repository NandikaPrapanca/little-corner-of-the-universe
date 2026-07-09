/**
 * SectionTitle.tsx
 * Reusable section heading block with:
 * - Optional chapter badge (e.g. "Chapter One")
 * - Main title in Cormorant Garamond
 * - Optional subtitle in Inter
 *
 * Accepts children for complete flexibility.
 */

interface SectionTitleProps {
  /** Small label above the title (e.g. "Chapter One") */
  badge?: string;
  /** The main heading text */
  title: string;
  /** Optional subtitle / tagline */
  subtitle?: string;
  /** Text alignment (default: 'center') */
  align?: 'center' | 'left';
  /** Extra className on the wrapper */
  className?: string;
}

export default function SectionTitle({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      {/* Chapter badge */}
      {badge && (
        <span className="chapter-badge" aria-label={`Section: ${badge}`}>
          {badge}
        </span>
      )}

      {/* Main title */}
      <h2
        className="text-glow"
        style={{
          fontFamily:  'var(--font-cormorant)',
          fontSize:    'clamp(2rem, 6vw, 3rem)', // fluid: 32px → 48px
          fontWeight:  400,
          lineHeight:  1.2,
          color:       '#F8FAFC',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   'clamp(0.875rem, 2vw, 1rem)', // 14px → 16px
            fontWeight: 300,
            color:      '#CBD5E1',
            maxWidth:   '480px',
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
