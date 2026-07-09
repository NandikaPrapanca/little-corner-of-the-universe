'use client';

/**
 * ClientProviders.tsx
 * Thin 'use client' wrapper — mounts all fixed client-side UI that lives
 * outside the page scroll tree.
 *
 * Scroll restoration:
 *   Sets window.history.scrollRestoration = 'manual' so the browser never
 *   reinstates a previous scroll position on page refresh.
 *   Then scrolls to (0, 0) instantly on mount so every page load begins
 *   at the landing section, regardless of where the visitor was before.
 *
 *   'instant' behavior avoids any visible scroll jump and produces no
 *   layout shift because it runs synchronously inside the first useEffect
 *   before the browser has painted more than one frame.
 */

import { useEffect }     from 'react';
import type { ReactNode } from 'react';
import AudioProvider      from '@/components/AudioProvider';
import JourneyIndicator   from '@/components/JourneyIndicator';
import FirstInteraction   from '@/components/FirstInteraction';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position.
    // Must be set before scrollTo so it takes effect immediately.
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Restore default behaviour when the component unmounts (e.g. during
    // hot-reload in development) so it doesn't interfere with other pages.
    return () => {
      if (typeof window !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []); // empty deps — runs exactly once on mount

  return (
    <AudioProvider>
      {children}

      {/* Fixed journey indicator — six stars at bottom-center */}
      <JourneyIndicator />

      {/* First-interaction hint — shows until the visitor first taps */}
      <FirstInteraction />
    </AudioProvider>
  );
}
