/**
 * data/v2Content.ts
 * Editable content for the V2 editorial journal homepage ("My POV").
 *
 * Customize any text below. The layouts in `PovEssay.tsx` and
 * `CuratedShelf.tsx` will automatically adapt.
 */

export interface HeroContent {
  kicker:        string;
  titlePrefix:   string;
  titleEmphasis: string;
  subtitle:      string;
}

export interface PovEssayContent {
  sectionLabel:   string;
  heading:        string;
  leadParagraphs: string[];
  pullQuote:      string;
  pullQuoteNote?: string;
  bodyParagraphs: string[];
  signOff:        string;
}

export interface WatchlistItem {
  id:       string;
  title:    string;
  category: 'Movie' | 'Series';
  /** Personal memory note revealed when the card is tapped/flipped */
  note:     string;
  /** Hex accent color for ticket border, spine, and badge */
  accent:   string;
}

export interface PlaylistItem {
  id:          string;
  title:       string;
  artist:      string;
  /** Search query for Apple's public iTunes Search API 30-second preview */
  itunesQuery: string;
  /** Short personal note displayed on the vinyl sleeve card */
  note:        string;
  /** Subtle label accent color */
  accent:      string;
}

export const heroContent: HeroContent = {
  kicker:        'EDITION 02 · A QUIET NOTE',
  titlePrefix:   'A Little Corner of',
  titleEmphasis: 'My POV',
  subtitle:
    'No screenshots or borrowed characters this time. Just a quiet page written from my side of the table about how she is, what she is, and the small ways she makes ordinary days feel lighter.',
};

export const povEssay: PovEssayContent = {
  sectionLabel: 'I · HOW SHE IS & WHAT SHE IS',
  heading:      'Seen from across the room, and across a hundred late-night calls.',
  leadParagraphs: [
    'If you asked her to describe herself, she would probably skip right past the best parts. She has a habit of noticing her own worries first, wondering if she is talking too much, overthinking a small moment, or assuming the things she cares about are too ordinary to mention.',
    'From my point of view, it looks completely different. What I see is someone whose warmth shows up before she even realizes it is there. It is in the way she cannot finish telling a joke without laughing halfway through, and how a quick ten-minute check-in effortlessly turns into two hours of conversation.',
  ],
  pullQuote:
    'She is the rare kind of person who makes you feel like you never have to perform. Around her, an ordinary evening is already enough.',
  pullQuoteNote: 'From my side of the story',
  bodyParagraphs: [
    'At her core, she is deeply genuine. She feels things earnestly, whether she is getting excited over a blind box, talking about her future dreams in Canada, or caring fiercely about the people in her corner. There is zero pretense in the way she shows up.',
    'Even on quiet nights when she doubts herself or feels weighed down by overthinking, her kindness toward the people around her never slips. I wrote this page so that whenever she forgets how she looks to the people who care about her, she can borrow my perspective for a few minutes.',
  ],
  signOff: 'Written from my POV, always in your corner.',
};

export const shelfWatchlist: WatchlistItem[] = [
  {
    id:       'watch-la-la-land',
    title:    'La La Land',
    category: 'Movie',
    note:     'City of Stars will probably always remind me of us and the first version of this site. Some movies just stick around long after the credits roll.',
    accent:   '#B86B4B',
  },
  {
    id:       'watch-cyberpunk-edgerunners',
    title:    'Cyberpunk: Edgerunners',
    category: 'Series',
    note:     'Still one of my favorite watches with you. A reminder that no matter how chaotic things get, I\'d still take you to the moon.',
    accent:   '#6E826F',
  },
  {
    id:       'watch-obsession',
    title:    'Obsession',
    category: 'Series',
    note:     'Queued up for a quiet evening when the real commentary track is just us talking through every scene.',
    accent:   '#8D729E',
  },
  {
    id:       'watch-moon-knight',
    title:    'Moon Knight',
    category: 'Series',
    note:     'Late-night episodes, chaotic plot twists, and another reason staying up a little too late on a call was always worth it.',
    accent:   '#5C6B73',
  },
];

export const shelfPlaylist: PlaylistItem[] = [
  {
    id:          'song-miss-me',
    title:       'MISS ME',
    artist:      'keshi',
    itunesQuery: 'keshi MISS ME',
    note:        'For the quiet late-night hours when a song says more than a long message ever could.',
    accent:      '#B86B4B',
  },
  {
    id:          'song-soft-spot',
    title:       'soft spot',
    artist:      'keshi',
    itunesQuery: 'keshi soft spot',
    note:        'Because some people quietly become your favorite part of the day before you even think to name it.',
    accent:      '#6E826F',
  },
  {
    id:          'song-no-one-noticed',
    title:       'No One Noticed',
    artist:      'The Marías',
    itunesQuery: 'The Marias No One Noticed',
    note:        'Soft, dreamy, and the exact kind of melody that belongs in the background of a calm evening.',
    accent:      '#8D729E',
  },
  {
    id:          'song-used-to-me',
    title:       'Used to Me',
    artist:      'Luke Chiang',
    itunesQuery: 'Luke Chiang Used to Me',
    note:        'Warm, familiar, and impossible to hear without thinking of how easy it feels to talk to you.',
    accent:      '#5C6B73',
  },
];
