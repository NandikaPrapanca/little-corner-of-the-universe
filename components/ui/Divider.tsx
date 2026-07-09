/**
 * Divider.tsx
 * A decorative section divider — a thin gradient line with optional center ornament.
 * Used between sections to visually breathe and separate content areas.
 */

interface DividerProps {
  /** Show a small ornament in the center of the line (default: true) */
  showOrnament?: boolean;
  /** Extra className */
  className?: string;
}

export default function Divider({ showOrnament = true, className = '' }: DividerProps) {
  return (
    <div
      className={`relative flex items-center justify-center py-2 ${className}`}
      aria-hidden="true"
      role="separator"
    >
      {/* Left gradient line */}
      <div
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(137,207,240,0.2))',
        }}
      />

      {/* Optional center ornament */}
      {showOrnament && (
        <div className="mx-4 flex items-center gap-1.5">
          {/* Three dots: accent · star · accent */}
          <span
            className="block w-1 h-1 rounded-full"
            style={{ backgroundColor: 'rgba(137,207,240,0.4)' }}
          />
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#FFF4C2', opacity: 0.6 }}
          />
          <span
            className="block w-1 h-1 rounded-full"
            style={{ backgroundColor: 'rgba(184,168,227,0.4)' }}
          />
        </div>
      )}

      {/* Right gradient line */}
      <div
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(to left, transparent, rgba(184,168,227,0.2))',
        }}
      />
    </div>
  );
}
