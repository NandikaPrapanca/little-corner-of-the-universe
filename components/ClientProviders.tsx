'use client';

/**
 * ClientProviders.tsx
 * A thin 'use client' wrapper around all client-side providers.
 * This allows layout.tsx to remain a Server Component while still
 * mounting context providers that require the client runtime.
 *
 * Add any future client providers here.
 */

import type { ReactNode } from 'react';
import AudioProvider from '@/components/AudioProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
}
