'use client';

/**
 * Landing.tsx
 * Hero section — the first thing seen.
 *
 * Experience sequence:
 * 1. Almost dark screen — stars slowly emerge (2–3s, staggered)
 * 2. Moon glow softens in
 * 3. Title fades in after the sky feels alive
 * 4. Subtitle + tagline appear
 * 5. Glowing envelope invitation pulses gently
 * 6. A single drifting star acts as scroll hint
 *
 * Clicking the envelope triggers audio play (respects browser autoplay policy).
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useContext } from 'react';
import { Mail } from 'lucide-react';
import { AudioContext } from '@/components/AudioProvider';

export default function Landing() {
  const shouldReduce = useReducedMotion();
  const audio = useContext(AudioContext);

  // When the user clicks the envelope, trigger audio play
  const handleEnvelopeClick = useCallback(() => {
    audio?.requestPlay();
    // Smooth scroll to chapter one
    const next = document.getElementById('chapter-one');
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  }, [audio]);

  return (
    <section
      id="landing"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Landing — Welcome"
    >

      {/* ── Content — appears after sky feels alive ──────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 gap-0"
           style={{ maxWidth: '600px', width: '100%' }}>

        {/* ── Main title — large, Cormorant, almost luminous ──────────── */}
        <motion.h1
          className="text-glow"
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(2.75rem, 11vw, 5rem)',
            fontWeight:    300,
            lineHeight:    1.1,
            letterSpacing: '-0.02em',
            color:         '#F8FAFC',
            marginBottom:  '1.5rem',
          }}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          A Little Corner<br />
          <span style={{ fontStyle: 'italic', color: '#E8F4FF' }}>of the Universe</span>
        </motion.h1>

        {/* ── Recipient ───────────────────────────────────────────────── */}
        <motion.p
          style={{
            fontFamily:    'var(--font-cormorant)',
            fontSize:      'clamp(1.125rem, 3vw, 1.375rem)',
            fontWeight:    300,
            fontStyle:     'italic',
            color:         'rgba(137, 207, 240, 0.85)',
            letterSpacing: '0.02em',
            marginBottom:  '1.25rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1, ease: 'easeOut' }}
        >
          For Candy.
        </motion.p>

        {/* ── Tagline ─────────────────────────────────────────────────── */}
        <motion.p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   'clamp(0.8125rem, 2vw, 0.9375rem)',
            fontWeight: 300,
            color:      'rgba(203, 213, 225, 0.6)',
            lineHeight: 1.7,
            maxWidth:   '380px',
            marginBottom: '3rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1, ease: 'easeOut' }}
        >
          Some stories are too precious to stay inside a chat history.
        </motion.p>

        {/* ── Envelope invitation ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.6, duration: 0.9, ease: 'easeOut' }}
        >
          <motion.button
            onClick={handleEnvelopeClick}
            aria-label="Open this story — begin reading"
            className="group flex flex-col items-center gap-3 cursor-pointer bg-transparent border-none p-0"
            // Gentle pulse — not bouncy, just breathing
            animate={shouldReduce ? {} : {
              filter: [
                'drop-shadow(0 0 8px rgba(137,207,240,0.25))',
                'drop-shadow(0 0 18px rgba(137,207,240,0.55))',
                'drop-shadow(0 0 8px rgba(137,207,240,0.25))',
              ],
            }}
            transition={{
              duration:   3.5,
              repeat:     Infinity,
              ease:       'easeInOut',
              repeatType: 'loop',
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Envelope icon in a soft circle */}
            <div
              style={{
                width:        '56px',
                height:       '56px',
                borderRadius: '50%',
                border:       '1px solid rgba(137,207,240,0.3)',
                background:   'radial-gradient(circle, rgba(137,207,240,0.08) 0%, transparent 70%)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                transition:   'border-color 0.3s ease',
              }}
            >
              <Mail
                size={22}
                strokeWidth={1.25}
                style={{ color: 'rgba(137,207,240,0.8)' }}
              />
            </div>

            {/* Label */}
            <span
              style={{
                fontFamily:    'var(--font-inter)',
                fontSize:      '0.6875rem',
                fontWeight:    400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color:         'rgba(137,207,240,0.55)',
              }}
            >
              Open
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* ── Scroll hint — a single tiny star drifting downward ──────── */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.4, duration: 1 }}
      >
        <motion.div
          style={{
            width:        '3px',
            height:       '3px',
            borderRadius: '50%',
            backgroundColor: '#FFF4C2',
            boxShadow:    '0 0 6px 2px rgba(255,244,194,0.5)',
          }}
          animate={shouldReduce ? {} : {
            y:       [0, 28, 0],
            opacity: [0.8, 0.15, 0.8],
          }}
          transition={{
            duration:   2.8,
            repeat:     Infinity,
            ease:       'easeInOut',
          }}
        />
      </motion.div>

    </section>
  );
}
