/**
 * page.tsx
 * The main page — a single long-scrolling storybook.
 *
 * Renders all sections in order:
 *   Landing → Chapter One → Chapter Two → Chapter Three → Chapter Four → Letter → Ending
 *
 * Each section is a separate component in /components/sections/
 * to keep this file clean and sections independently maintainable.
 */

import Landing      from '@/components/sections/Landing';
import ChapterOne   from '@/components/sections/ChapterOne';
import ChapterTwo   from '@/components/sections/ChapterTwo';
import ChapterThree from '@/components/sections/ChapterThree';
import ChapterFour  from '@/components/sections/ChapterFour';
import Letter       from '@/components/sections/Letter';
import Ending       from '@/components/sections/Ending';

export default function Home() {
  return (
    <>
      {/* ── Hero / Opening ─────────────────────────────────────────── */}
      <Landing />

      {/* ── Story Chapters ─────────────────────────────────────────── */}
      <ChapterOne />
      <ChapterTwo />
      <ChapterThree />
      <ChapterFour />

      {/* ── Letter ─────────────────────────────────────────────────── */}
      <Letter />

      {/* ── Closing ────────────────────────────────────────────────── */}
      <Ending />
    </>
  );
}
