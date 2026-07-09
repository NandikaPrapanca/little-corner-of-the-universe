/**
 * page.tsx
 * The main page — a single long-scrolling storybook.
 *
 * Sections:
 *   Landing → Chapter One → Chapter Two → Chapter Three → Chapter Four
 *   → PomTransition (Pom walks in, envelope → reveals Letter)
 *   → Ending
 */

import Landing        from '@/components/sections/Landing';
import ChapterOne     from '@/components/sections/ChapterOne';
import ChapterTwo     from '@/components/sections/ChapterTwo';
import ChapterThree   from '@/components/sections/ChapterThree';
import ChapterFour    from '@/components/sections/ChapterFour';
import PomTransition  from '@/components/sections/PomTransition';
import Ending         from '@/components/sections/Ending';

export default function Home() {
  return (
    <>
      <Landing />

      <ChapterOne />
      <ChapterTwo />
      <ChapterThree />
      <ChapterFour />

      {/*
        PomTransition owns both the Pom animation and the Letter section.
        Letter only becomes visible after the envelope opening sequence.
      */}
      <PomTransition />

      <Ending />
    </>
  );
}
