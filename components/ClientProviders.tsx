'use client';

/**
 * ClientProviders.tsx
 * Thin 'use client' wrapper — mounts all fixed client-side UI elements
 * that live outside the page scroll tree.
 */

import type { ReactNode } from 'react';
import AudioProvider      from '@/components/AudioProvider';
import JourneyIndicator   from '@/components/JourneyIndicator';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AudioProvider>
      {children}
      {/* Fixed journey indicator — six stars at bottom-center */}
      <JourneyIndicator />
    </AudioProvider>
  );
}
