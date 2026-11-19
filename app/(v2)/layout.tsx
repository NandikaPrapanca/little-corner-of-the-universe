/**
 * app/(v2)/layout.tsx
 * Warm editorial journal-desk layout for the v2 homepage (/).
 *
 * Scopes `.v2-desk` palette, paper-grain texture, and LazyMotion provider
 * strictly to the v2 route group.
 */

import type { Metadata } from 'next';
import V2Providers       from '@/components/v2/V2Providers';

export const metadata: Metadata = {
  title:       'A Little Corner of My POV · Edition 02',
  description: 'A quiet editorial journal note — how she is and what she is, from my point of view.',
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="v2-desk min-h-screen w-full relative overflow-x-clip">
      <V2Providers>
        <main id="main-content" className="relative z-10">
          {children}
        </main>
      </V2Providers>
    </div>
  );
}
