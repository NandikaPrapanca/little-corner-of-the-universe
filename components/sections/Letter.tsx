'use client';

/**
 * Letter.tsx
 * The final letter — Candy's birthday message.
 *
 * Layout:
 *   Warm off-white paper card (#F8F5EF), max-width ~700px, centered.
 *   Cormorant Garamond serif, comfortable line-height, generous padding.
 *   The whole card fades up on mount.
 *   Paragraphs fade in staggered (0.12s between each).
 *   Signature fades in after the body.
 *   P.S. line fades in ~2.5s after mount, smaller + italic, opacity 0.7.
 *
 * No typewriter effect. No bouncing. Reads immediately after reveal.
 * Stars and music continue — this is the peaceful end of the story.
 */

import { motion, useReducedMotion } from 'framer-motion';

// ─── Letter paragraphs ────────────────────────────────────────────────────
// Each entry becomes one <p>. Empty string = intentional spacing paragraph.

const PARAGRAPHS: string[] = [
  'Hi, Candy.',
  'If you\'re reading this, then I guess my little pomeranian managed to find you after all.',
  'Happy seventeenth birthday.',
  'Before anything else... thank you for scrolling all the way here. I know it was a long journey, but I hope this tiny little corner of the universe managed to make you smile at least once.',
  'When I first started making this, I kept wondering what I wanted you to feel after reaching the end. I didn\'t want it to be overly dramatic or anything like that. I just wanted to make something that was... us. A collection of moments, memories, and all the little things that somehow became important without either of us realizing it.',
  'It\'s honestly funny how everything started.',
  'Out of all the places we could\'ve met, it happened because of a random Discord call while we were playing Roblox with Albani. If someone had told me back then that we\'d end up talking almost every single day, I probably would\'ve laughed and said, "Yeah... probably not."',
  'And yet, here we are.',
  'Somewhere along the way, checking if you had messaged me quietly became part of my day. Calls became normal. Random conversations somehow turned into hours without either of us noticing. It never really felt like something extraordinary — it just felt... comfortable.',
  'And I think that\'s what made it special.',
  'People usually remember the big moments in life.\nThe birthdays.\nThe trips.\nThe celebrations.',
  'But I think the little things are what make someone unforgettable.',
  'Like how you always laugh before you even finish your own joke.\nHow excited you get over plushies and blind boxes.\nHow you somehow think your random little stories aren\'t worth telling me.',
  'They always are.',
  'I don\'t think you\'ve realized this yet, but I genuinely enjoy listening to every single one of them — even the ones you say are "not important."',
  'Because if it\'s something you wanted to tell me, then it\'s already important enough for me to hear.',
  'And honestly...\nI hope you never stop telling me about your day, no matter how random or small you think it is.',
  'I also love that you never really have to pretend around me.\nWhether it\'s your random burps, your sleepy voice at two in the morning, or every other little thing you call your "true colors."',
  'Thank you for trusting me enough to let me see that side of you.\nI wouldn\'t trade it for a more "perfect" version of you.\nBecause those little things are what make you... you.',
  'There\'s something I hope you\'ll slowly learn as you get older.',
  'Please don\'t be so harsh on yourself.',
  'I know you overthink.\nI know you sometimes convince yourself that you\'re not enough.\nI know you worry that people will eventually replace you.',
  'But from where I\'m standing...\nI honestly don\'t see the person you\'re so afraid of being.',
  'I see someone who\'s incredibly caring.\nSomeone who\'s funny without even trying.\nSomeone who somehow manages to make ordinary days feel less ordinary.\nSomeone whose presence quietly makes life a little brighter.',
  'And I hope one day you\'ll be able to see yourself the way the people who care about you already do.',
  'Because you deserve that kindness from yourself too.',
  'You once told me you\'re scared of being replaced.\nI don\'t think that\'s something you\'ll ever have to worry about with me.',
  'People come and go.\nLife changes.\nUniversities, countries, responsibilities...\nEverything eventually changes.',
  'But some people leave footprints that are simply too meaningful to disappear.',
  'You\'re one of those people.',
  'No matter where life takes us, I don\'t think I\'ll ever forget the person who made me laugh through random late-night calls, listened to my nonsense, and somehow became part of my everyday life without either of us planning for it.',
  'Speaking of the future...',
  'I really hope you get accepted into the university you\'ve been dreaming about in Canada.\nI know how much it means to you.\nI know you\'ve even said that if everything goes well, you want to build your life there and not come back to Indonesia after graduating.',
  'And if that\'s the future waiting for you...\nThen I genuinely hope you get it.',
  'Because dreams like that don\'t come from nowhere.\nThey\'re built from years of hoping, working, and believing.',
  'So wherever life takes you — even if it\'s on the other side of the world, I hope you find happiness there.\nI\'ll be rooting for you from here.\nAlways.',
  'Thank you...',
  'For every random conversation.\nFor every late-night call.\nFor every game.\nFor every movie.\nFor trusting me with your thoughts.\nFor making ordinary days feel a little less ordinary.\nAnd thank you for becoming one of my favorite people.',
  'You once told me that you were lucky to have met me.\nBut if I\'m being honest...\nI think I\'m the lucky one.',
  'I don\'t know what life will look like a few years from now.\nMaybe we\'ll both get busier.\nMaybe we\'ll call a little less.\nMaybe we\'ll end up on completely different paths.',
  'But I hope one thing never changes.',
  'I hope you never forget how loved, appreciated, and memorable you truly are.',
  'Because you are.\nMore than you probably realize.',
  'So...',
  'Here\'s to seventeen.\nTo new adventures.\nTo getting that acceptance letter you\'ve been waiting for.\nTo building a new life in Canada.\nTo countless more blind boxes.\nTo laughing a little louder.\nTo overthinking a little less.\nAnd to every beautiful memory that still hasn\'t happened yet.',
  'Happy 17th Birthday, Candy.',
  'Take care of yourself, okay?\nI\'ll always be cheering for you.',
  'With lots of love,',
];

// ─── Animation helpers ────────────────────────────────────────────────────

const STAGGER   = 0.12;  // seconds between paragraphs
const PARA_DUR  = 0.55;  // seconds per paragraph fade
const SIG_DELAY = PARAGRAPHS.length * STAGGER + 0.3;
const PS_DELAY  = SIG_DELAY + 2.5;

// ─── Component ────────────────────────────────────────────────────────────

export default function Letter() {
  const shouldReduce = useReducedMotion() ?? false;

  // Shared paragraph fade-up variant
  const paraVariant = (i: number) => ({
    initial:    { opacity: 0, y: shouldReduce ? 0 : 12 },
    animate:    { opacity: 1, y: 0 },
    transition: {
      delay:    shouldReduce ? 0 : i * STAGGER,
      duration: shouldReduce ? 0.01 : PARA_DUR,
      ease:     [0.25, 0.1, 0.25, 1] as const,
    },
  });

  return (
    // The section id="letter" is the scroll target from PomTransition
    <section
      id="letter"
      aria-label="Birthday letter"
      style={{
        paddingTop:    'clamp(4rem, 10vw, 7rem)',
        paddingBottom: 'clamp(6rem, 14vw, 10rem)',
        display:       'flex',
        justifyContent: 'center',
        paddingInline: 'clamp(1rem, 4vw, 2.5rem)',
      }}
    >
      {/* ── Paper card — fades up as a whole on mount ────────────── */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduce ? 0.01 : 0.9,
          ease:     [0.25, 0.1, 0.25, 1],
        }}
        style={{
          width:        '100%',
          maxWidth:     '700px',
          // Warm off-white paper
          background:   `
            radial-gradient(ellipse at 18% 8%, rgba(255,253,245,0.95) 0%, transparent 65%),
            linear-gradient(160deg, #FDFAF2 0%, #F8F5EF 45%, #F3EFE3 100%)
          `,
          borderRadius: '6px',
          padding:      'clamp(2.25rem, 6vw, 4rem)',
          position:     'relative',
          // Layered paper shadows
          boxShadow: `
            0 2px   6px  rgba(0,0,0,0.14),
            0 10px  32px rgba(0,0,0,0.18),
            0 28px  64px rgba(0,0,0,0.10),
            inset 0 0 0 1px rgba(200,185,150,0.18)
          `,
          // Subtle paper grain via repeating gradient
          backgroundImage: `
            radial-gradient(ellipse at 18% 8%, rgba(255,253,245,0.95) 0%, transparent 65%),
            linear-gradient(160deg, #FDFAF2 0%, #F8F5EF 45%, #F3EFE3 100%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 24px,
              rgba(180,165,130,0.025) 24px,
              rgba(180,165,130,0.025) 25px
            )
          `,
        }}
      >
        {/* ── Wax-seal ornament ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position:     'absolute',
            top:          '1.5rem',
            right:        '1.75rem',
            width:        '30px',
            height:       '30px',
            borderRadius: '50%',
            background:   'radial-gradient(circle at 35% 35%, rgba(184,168,227,0.55) 0%, rgba(150,130,200,0.20) 60%, transparent 100%)',
            boxShadow:    '0 1px 4px rgba(0,0,0,0.10)',
          }}
        />

        {/* ── Ruled header line ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            height:       '1px',
            background:   'linear-gradient(to right, transparent, rgba(180,165,130,0.35) 25%, rgba(180,165,130,0.35) 75%, transparent)',
            marginBottom: 'clamp(1.75rem, 4vw, 2.75rem)',
          }}
        />

        {/* ── Letter body ───────────────────────────────────────── */}
        <div
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize:   'clamp(1rem, 2.6vw, 1.125rem)',
            fontWeight: 400,
            color:      '#3D5474',   // body text
            lineHeight: 1.9,
          }}
        >
          {PARAGRAPHS.map((para, i) => {
            // First paragraph "Hi, Candy." is the heading
            const isHeading = i === 0;
            // Multi-line paragraphs that start with certain italic phrases
            const isItalicLead =
              para.startsWith('And honestly') ||
              para.startsWith('Speaking of') ||
              para.startsWith('Thank you...') ||
              para.startsWith('So...');

            return (
              <motion.p
                key={i}
                {...paraVariant(i)}
                style={{
                  marginBottom: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                  whiteSpace:   'pre-line',
                  color:        isHeading
                    ? '#233A56'      // heading
                    : isItalicLead
                      ? '#5B6F89'    // italic/quiet beats
                      : '#3D5474',   // body
                  fontWeight:   isHeading ? 600 : 400,
                  fontSize:     isHeading
                    ? 'clamp(1.1rem, 3vw, 1.3rem)'
                    : undefined,
                }}
              >
                {para}
              </motion.p>
            );
          })}

          {/* ── Signature ───────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay:    shouldReduce ? 0 : SIG_DELAY,
              duration: shouldReduce ? 0.01 : 0.7,
              ease:     'easeOut',
            }}
            style={{
              marginTop:   'clamp(2rem, 5vw, 3rem)',
              fontWeight:  600,
              fontStyle:   'italic',
              fontSize:    'clamp(1.0625rem, 2.8vw, 1.25rem)',
              color:       '#233A56',   // signature
              whiteSpace:  'pre-line',
            }}
          >
            — Nan ♡
          </motion.p>

          {/* ── P.S. ────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.70 }}
            transition={{
              delay:    shouldReduce ? 0 : PS_DELAY,
              duration: shouldReduce ? 0.01 : 0.8,
              ease:     'easeOut',
            }}
            style={{
              marginTop:     'clamp(1.25rem, 3vw, 2rem)',
              fontSize:      'clamp(0.875rem, 2.2vw, 0.9375rem)',
              fontStyle:     'italic',
              fontWeight:    300,
              textAlign:     'center',
              color:         '#5B6F89',   // P.S.
              letterSpacing: '0.01em',
            }}
          >
            P.S. I still owe you that trip to the moon.
          </motion.p>
        </div>

        {/* ── Ruled footer line ─────────────────────────────────── */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay:    shouldReduce ? 0 : SIG_DELAY,
            duration: 0.6,
          }}
          style={{
            height:    '1px',
            background: 'linear-gradient(to right, transparent, rgba(180,165,130,0.35) 25%, rgba(180,165,130,0.35) 75%, transparent)',
            marginTop: 'clamp(1.75rem, 4vw, 2.75rem)',
          }}
        />
      </motion.div>
    </section>
  );
}
