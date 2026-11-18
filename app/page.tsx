/**
 * page.tsx
 * The main page — a single long-scrolling storybook.
 *
 * Sections:
 *   Landing → Chapter One → Chapter Two → Chapter Three → Chapter Four
 *   → PomTransition (Pom walks in, envelope → reveals Letter)
 *   → Ending
 */

import dynamic from 'next/dynamic';
import Landing        from '@/components/sections/Landing';
import ChapterOne     from '@/components/sections/ChapterOne';
import ChapterTwo     from '@/components/sections/ChapterTwo';

const ChapterThree  = dynamic(() => import('@/components/sections/ChapterThree'));
const ChapterFour   = dynamic(() => import('@/components/sections/ChapterFour'));
const PomTransition = dynamic(() => import('@/components/sections/PomTransition'));
const Ending        = dynamic(() => import('@/components/sections/Ending'));

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
