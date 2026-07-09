'use client';

/**
 * ClientProviders.tsx
 * Thin 'use client' wrapper — mounts all fixed client-side UI that lives
 * outside the page scroll tree.
 */

import type { ReactNode } from 'react';
import AudioProvider      from '@/components/AudioProvider';
import JourneyIndicator   from '@/components/JourneyIndicator';
import FirstInteraction   from '@/components/FirstInteraction';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
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
