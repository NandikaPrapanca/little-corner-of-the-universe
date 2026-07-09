/**
 * SectionTitle.tsx
 * Reusable section heading: optional badge → title → optional subtitle.
 *
 * When title is empty (during foundation phase), the h2 is omitted
 * entirely so sections don't have invisible empty headings in the DOM.
 */

interface SectionTitleProps {
  badge?:     string;
  title:      string;
  subtitle?:  string;
  align?:     'center' | 'left';
  className?: string;
}

export default function SectionTitle({
  badge,
  title,
  subtitle,
  align     = 'center',
  className = '',
}: SectionTitleProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  // Nothing to render if all content is empty — avoids orphan elements
  if (!badge && !title && !subtitle) return null;

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`}>

      {/* Chapter badge */}
      {badge && (
        <span className="chapter-badge" aria-label={`Section: ${badge}`}>
          {badge}
        </span>
      )}

      {/* Main title — only rendered when non-empty */}
      {title && (
        <h2
          className="text-glow"
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(2rem, 6vw, 3rem)',
            fontWeight:    400,
            lineHeight:    1.2,
            color:         '#F8FAFC',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   'clamp(0.875rem, 2vw, 1rem)',
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
