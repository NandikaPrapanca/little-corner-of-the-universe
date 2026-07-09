/**
 * components/index.ts
 * Barrel export for all reusable components.
 * Allows clean imports: import { FadeIn, PolaroidFrame } from '@/components'
 */

// ── Providers ─────────────────────────────────────────────────────────────
export { default as ClientProviders }                 from './ClientProviders';
export { default as AudioProvider, AudioContext }     from './AudioProvider';
export type { AudioContextValue }                     from './AudioProvider';

// ── Layout & Structure ────────────────────────────────────────────────────
export { default as Section }      from './Section';
export { default as NightSky }     from './NightSky';
export { default as MusicPlayer }  from './MusicPlayer';

// ── UI Primitives ─────────────────────────────────────────────────────────
export { default as Container }     from './ui/Container';
export { default as SectionTitle }  from './ui/SectionTitle';
export { default as PhotoCard }     from './ui/PhotoCard';
export { default as PolaroidFrame } from './ui/PolaroidFrame';
export { default as Divider }       from './ui/Divider';
export { default as FadeIn }        from './ui/FadeIn';

// ── Background Effects ────────────────────────────────────────────────────
export { default as AnimatedStars }     from './ui/AnimatedStars';
export { default as FloatingParticles } from './ui/FloatingParticles';
export { default as ShootingStar }      from './ui/ShootingStar';

// ── Page Sections ─────────────────────────────────────────────────────────
export { default as Landing }      from './sections/Landing';
export { default as ChapterOne }   from './sections/ChapterOne';
export { default as ChapterTwo }   from './sections/ChapterTwo';
export { default as ChapterThree } from './sections/ChapterThree';
export { default as ChapterFour }  from './sections/ChapterFour';
export { default as Letter }       from './sections/Letter';
export { default as Ending }       from './sections/Ending';
