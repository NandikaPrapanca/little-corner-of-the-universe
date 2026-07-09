'use client';

/**
 * FirstInteraction.tsx
 *
 * Listens for the visitor's very first click or tap anywhere on the page.
 *
 * On first interaction:
 *   1. Calls audio.playFaded(0.6, 2000) — starts at volume 0, fades to 0.6
 *      over 2 seconds. Works because it runs inside a genuine user-gesture
 *      event handler (browsers always allow play() from a user event).
 *   2. Hides the "Tap anywhere to begin." hint with a soft fade-out.
 *   3. Removes both event listeners — no further overhead.
 *
 * All subsequent interactions are ignored.
 *
 * Positioning:
 *   Fixed, bottom-center, above the journey-indicator stars (z-35 vs z-40).
 *   pointerEvents: 'none' — the hint is visual only; the document-level
 *   listener catches the actual click regardless of where it lands.
 */

import { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AudioContext } from '@/components/AudioProvider';

export default function FirstInteraction() {
  const audio        = useContext(AudioContext);
  const shouldReduce = useReducedMotion() ?? false;

  const [interacted, setInteracted] = useState(false);
  // Ref guard — ensures the handler fires exactly once even when both
  // 'click' and 'touchstart' fire together on some mobile browsers.
  const firedRef = useRef(false);

  useEffect(() => {
    function handleFirst() {
      if (firedRef.current) return;
      firedRef.current = true;

      // Hide the hint
      setInteracted(true);

      // Start music with 2-second volume fade-in
      audio?.playFaded(0.6, 2000);
    }

    // capture:true — fires before any other listener, including the envelope button
    document.addEventListener('click',      handleFirst, { once: true, capture: true });
    document.addEventListener('touchstart', handleFirst, { once: true, capture: true, passive: true });

    return () => {
      document.removeEventListener('click',      handleFirst, { capture: true });
      document.removeEventListener('touchstart', handleFirst, { capture: true });
    };
  }, [audio]);

  return (
    <AnimatePresence>
      {!interacted && (
        <motion.div
          // Accessible label — screen readers announce this as a hint
          role="status"
          aria-label="Tap anywhere to begin the music"
          // Appear after a 3.5s delay — lets the landing animation settle first
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              delay:    shouldReduce ? 0 : 3.5,
              duration: shouldReduce ? 0 : 1.2,
              ease:     'easeOut',
            },
          }}
          style={{
            position:      'fixed',
            // Sit above the journey indicator (bottom ~28px + 24px pill height ≈ 56px)
            bottom:        'clamp(58px, 9vw, 74px)',
            left:          '50%',
            transform:     'translateX(-50%)',
            zIndex:        35,
            // Transparent to pointer events — document listener handles clicks
            pointerEvents: 'none',
            whiteSpace:    'nowrap',
          }}
        >
          <span
            style={{
              fontFamily:    'var(--font-cormorant)',
              fontStyle:     'italic',
              fontWeight:    300,
              fontSize:      'clamp(0.8125rem, 2vw, 0.9375rem)',
              color:         'rgba(203, 213, 225, 0.42)',
              letterSpacing: '0.04em',
            }}
          >
            Tap anywhere to begin.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
