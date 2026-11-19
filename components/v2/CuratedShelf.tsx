'use client';

/**
 * components/v2/CuratedShelf.tsx
 * Curated "Movies, Series & Songs" shelf for the V2 editorial journal page.
 *
 * Part A — "Things We Watched":
 *   2x2 grid of tactile cinema-ticket / book-spine cards. Tapping any card
 *   smoothly flips it (iOS Safari–safe 3D flip with 90° midpoint opacity
 *   crossfade) to reveal the handwritten Caveat memory note on the back.
 *
 * Part B — "Songs That Stayed":
 *   2x2 grid of minimalist vinyl-sleeve cards that stream official 30-second
 *   audio previews directly from Apple's public iTunes Search API
 *   (`https://itunes.apple.com/search`). Uses a single shared HTMLAudioElement,
 *   caches resolved preview URLs, animates a spinning vinyl disc + equalizer bar,
 *   and stops cleanly on unmount so audio never bleeds into /v1.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { Film, Tv, RotateCw, Play, Pause, Disc3, Loader2 } from 'lucide-react';
import {
  shelfWatchlist,
  shelfPlaylist,
  type WatchlistItem,
  type PlaylistItem,
} from '@/data/v2Content';

interface ItunesSearchResponse {
  resultCount: number;
  results: Array<{
    previewUrl?: string;
    trackName?:  string;
    artistName?: string;
  }>;
}

async function fetchItunesPreviewUrl(query: string): Promise<string | null> {
  const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(
    query,
  )}&media=music&entity=song&country=US&limit=5`;

  const res = await fetch(endpoint);
  if (!res.ok) return null;

  const data = (await res.json()) as ItunesSearchResponse;
  const match = data.results?.find((item) => Boolean(item.previewUrl));
  return match?.previewUrl ?? null;
}

// ─── Part A: Cinema-Ticket / Book-Spine Watch Card ────────────────────────

interface WatchCardProps {
  item:         WatchlistItem;
  index:        number;
  shouldReduce: boolean;
}

function WatchCard({ item, index, shouldReduce }: WatchCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleToggle = () => setIsFlipped((prev) => !prev);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const Icon = item.category === 'Movie' ? Film : Tv;

  return (
    <m.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: shouldReduce ? 0.01 : 0.55,
        delay:    shouldReduce ? 0 : (index % 2) * 0.07,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >
      <div
        className="relative transition-transform duration-300 ease-out hover:-translate-y-0.5"
        style={{ perspective: '1200px' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-label={
            isFlipped
              ? `${item.title} memory note open. Tap to flip back.`
              : `${item.title} (${item.category}). Tap to flip and read memory note.`
          }
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="relative w-full cursor-pointer select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-desk-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-desk-bg rounded-xl min-h-[215px]"
        >
          <m.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              duration: shouldReduce ? 0.01 : 0.58,
              ease:     [0.22, 1, 0.36, 1],
            }}
            className="min-h-[215px]"
            style={{
              position:       'relative',
              width:          '100%',
              transformStyle: 'preserve-3d',
              willChange:     'transform',
            }}
          >
            {/* ── FRONT FACE: Cinema Ticket / Book Spine ─────────────── */}
            <m.div
              animate={{ opacity: isFlipped ? 0 : 1 }}
              transition={{
                duration: shouldReduce ? 0.01 : 0.16,
                delay:    shouldReduce ? 0 : isFlipped ? 0.14 : 0.22,
              }}
              style={{
                position:                 'absolute',
                inset:                    0,
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform:                'rotateY(0deg)',
                background:               'linear-gradient(160deg, #FFFDF9 0%, #F8F1E4 100%)',
                border:                   `1px solid ${item.accent}40`,
                borderRadius:             '12px',
                overflow:                 'hidden',
                display:                  'flex',
                boxShadow:
                  '0 2px 6px rgba(43, 38, 35, 0.05), 0 10px 24px rgba(43, 38, 35, 0.06)',
                pointerEvents:            isFlipped ? 'none' : 'auto',
              }}
            >
              {/* Tactile book spine / ticket stub strip on left */}
              <div
                aria-hidden="true"
                className="w-3.5 shrink-0 flex flex-col items-center justify-between py-3"
                style={{
                  backgroundColor: `${item.accent}22`,
                  borderRight:     `1px dashed ${item.accent}55`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.accent, opacity: 0.55 }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.accent, opacity: 0.55 }}
                />
              </div>

              {/* Ticket content */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${item.accent}15`,
                      border:          `1px solid ${item.accent}38`,
                      fontFamily:      'var(--font-inter), sans-serif',
                      fontSize:        '0.65rem',
                      fontWeight:      500,
                      letterSpacing:   '0.14em',
                      textTransform:   'uppercase',
                      color:           item.accent,
                    }}
                  >
                    <Icon size={11} aria-hidden="true" />
                    {item.category}
                  </span>

                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily:    'var(--font-inter), sans-serif',
                      fontSize:      '0.65rem',
                      letterSpacing: '0.16em',
                      color:         'rgba(107, 97, 90, 0.55)',
                    }}
                  >
                    NO. 0{index + 1}
                  </span>
                </div>

                <div className="my-auto py-2">
                  <h3
                    style={{
                      fontFamily:    'var(--font-cormorant), Georgia, serif',
                      fontSize:      'clamp(1.55rem, 3.4vw, 1.9rem)',
                      fontWeight:    500,
                      lineHeight:    1.15,
                      letterSpacing: '-0.01em',
                      color:         '#2B2623',
                      margin:        0,
                    }}
                  >
                    {item.title}
                  </h3>
                </div>

                <div
                  className="pt-2.5 flex items-center justify-between"
                  style={{ borderTop: '1px dashed rgba(139, 118, 96, 0.22)' }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-caveat), Caveat, cursive',
                      fontSize:   '1.1rem',
                      color:      '#6B615A',
                    }}
                  >
                    Tap ticket for memory note
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center gap-1"
                    style={{
                      fontFamily:    'var(--font-inter), sans-serif',
                      fontSize:      '0.625rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color:         item.accent,
                    }}
                  >
                    <RotateCw size={10} />
                    flip
                  </span>
                </div>
              </div>
            </m.div>

            {/* ── BACK FACE: Handwritten Caveat Memory Note ──────────── */}
            <m.div
              animate={{ opacity: isFlipped ? 1 : 0 }}
              transition={{
                duration: shouldReduce ? 0.01 : 0.16,
                delay:    shouldReduce ? 0 : isFlipped ? 0.22 : 0.14,
              }}
              className="px-5 py-4"
              style={{
                position:                 'absolute',
                inset:                    0,
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform:                'rotateY(180deg)',
                backgroundColor:          '#FAF3E6',
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(139, 118, 96, 0.11) 24px, rgba(139, 118, 96, 0.11) 25px)',
                border:                   `1px solid ${item.accent}48`,
                borderRadius:             '12px',
                display:                  'flex',
                flexDirection:            'column',
                justifyContent:           'space-between',
                boxShadow:
                  '0 2px 6px rgba(43, 38, 35, 0.06), 0 12px 26px rgba(43, 38, 35, 0.08)',
                pointerEvents:            isFlipped ? 'auto' : 'none',
              }}
            >
              <div
                className="pb-2 flex items-center justify-between gap-2"
                style={{ borderBottom: '1px dashed rgba(139, 118, 96, 0.25)' }}
              >
                <span
                  style={{
                    fontFamily:    'var(--font-cormorant), Georgia, serif',
                    fontStyle:     'italic',
                    fontSize:      '1rem',
                    fontWeight:    500,
                    color:         '#2B2623',
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    fontFamily:    'var(--font-inter), sans-serif',
                    fontSize:      '0.625rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color:         item.accent,
                  }}
                >
                  {item.category}
                </span>
              </div>

              <div className="my-auto py-2 px-0.5 overflow-y-auto no-scrollbar">
                <p
                  style={{
                    fontFamily: 'var(--font-caveat), Caveat, cursive',
                    fontSize:   '1.26rem',
                    fontWeight: 400,
                    lineHeight: 1.38,
                    color:      '#2B2623',
                    margin:     0,
                  }}
                >
                  {item.note}
                </p>
              </div>

              <div
                className="pt-2 flex items-center justify-end"
                style={{ borderTop: '1px dashed rgba(139, 118, 96, 0.2)' }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex items-center gap-1"
                  style={{
                    fontFamily:    'var(--font-inter), sans-serif',
                    fontSize:      '0.625rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color:         item.accent,
                  }}
                >
                  <RotateCw size={10} />
                  front
                </span>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>
    </m.div>
  );
}

// ─── Part B: Minimalist Vinyl-Sleeve Song Card ────────────────────────────

interface SongCardProps {
  item:          PlaylistItem;
  index:         number;
  isPlaying:     boolean;
  isLoading:     boolean;
  isUnavailable: boolean;
  onTogglePlay:  (item: PlaylistItem) => void;
  shouldReduce:  boolean;
}

function SongCard({
  item,
  index,
  isPlaying,
  isLoading,
  isUnavailable,
  onTogglePlay,
  shouldReduce,
}: SongCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: shouldReduce ? 0.01 : 0.55,
        delay:    shouldReduce ? 0 : (index % 2) * 0.07,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >
      <div
        className="relative h-full rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-300"
        style={{
          background: isPlaying
            ? 'linear-gradient(155deg, #FFFDF9 0%, #F5ECE0 100%)'
            : 'linear-gradient(155deg, #FFFDF9 0%, #F9F3E8 100%)',
          border: isPlaying
            ? `1px solid ${item.accent}75`
            : `1px solid ${item.accent}35`,
          boxShadow: isPlaying
            ? `0 4px 18px ${item.accent}1F, 0 10px 26px rgba(43, 38, 35, 0.08)`
            : '0 2px 6px rgba(43, 38, 35, 0.05), 0 10px 24px rgba(43, 38, 35, 0.06)',
        }}
      >
        {/* Top row: Vinyl disc + Track title & artist + Play/Pause button */}
        <div className="flex items-center gap-3.5">
          {/* Vinyl Disc Visual */}
          <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
            <m.div
              animate={
                isPlaying && !shouldReduce ? { rotate: 360 } : { rotate: 0 }
              }
              transition={
                isPlaying && !shouldReduce
                  ? { duration: 6, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.4, ease: 'easeOut' }
              }
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle, #2B2623 0%, #1E1A18 60%, #2F2A27 63%, #1A1715 100%)',
                boxShadow: '0 2px 8px rgba(43, 38, 35, 0.22)',
              }}
            >
              {/* Vinyl center label */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: item.accent }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#FAF6F0' }}
                />
              </div>
            </m.div>
          </div>

          {/* Track Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className="truncate"
                style={{
                  fontFamily:    'var(--font-cormorant), Georgia, serif',
                  fontSize:      'clamp(1.25rem, 2.8vw, 1.45rem)',
                  fontWeight:    600,
                  lineHeight:    1.15,
                  color:         '#2B2623',
                  margin:        0,
                }}
              >
                {item.title}
              </h3>

              {/* Equalizer bars when playing */}
              {isPlaying && (
                <div
                  aria-label="Now playing"
                  className="inline-flex items-end gap-[2px] h-3 shrink-0"
                >
                  {[0, 0.2, 0.1].map((delay, i) => (
                    <m.span
                      key={i}
                      className="w-[2.5px] rounded-full"
                      style={{ backgroundColor: item.accent }}
                      animate={
                        shouldReduce
                          ? { height: '8px' }
                          : { height: ['4px', '12px', '5px', '10px', '4px'] }
                      }
                      transition={{
                        duration: 0.9,
                        repeat:   Infinity,
                        delay,
                        ease:     'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <p
              className="truncate"
              style={{
                fontFamily:    'var(--font-inter), sans-serif',
                fontSize:      '0.78rem',
                fontWeight:    400,
                letterSpacing: '0.03em',
                color:         '#6B615A',
                margin:        0,
              }}
            >
              {item.artist}
            </p>
          </div>

          {/* Play / Pause / Loading Button */}
          <button
            type="button"
            onClick={() => onTogglePlay(item)}
            disabled={isLoading}
            aria-label={
              isLoading
                ? `Loading preview for ${item.title}`
                : isPlaying
                  ? `Pause ${item.title} by ${item.artist}`
                  : `Play 30-second preview of ${item.title} by ${item.artist}`
            }
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-desk-terracotta"
            style={{
              backgroundColor: isPlaying ? item.accent : `${item.accent}18`,
              border:          `1px solid ${item.accent}50`,
              color:           isPlaying ? '#FFFDF9' : item.accent,
              cursor:          isLoading ? 'wait' : 'pointer',
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={15} />
            ) : (
              <Play size={15} className="translate-x-[1px]" />
            )}
          </button>
        </div>

        {/* Personal note */}
        <p
          style={{
            fontFamily: 'var(--font-caveat), Caveat, cursive',
            fontSize:   '1.24rem',
            fontWeight: 400,
            lineHeight: 1.4,
            color:      '#3D3632',
            margin:     0,
          }}
        >
          {item.note}
        </p>

        {/* Bottom footer / Status badge */}
        <div
          className="pt-2.5 flex items-center justify-between gap-2"
          style={{ borderTop: '1px dashed rgba(139, 118, 96, 0.2)' }}
        >
          <span
            className="inline-flex items-center gap-1"
            style={{
              fontFamily:    'var(--font-inter), sans-serif',
              fontSize:      '0.625rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         'rgba(107, 97, 90, 0.72)',
            }}
          >
            <Disc3 size={11} style={{ color: item.accent }} aria-hidden="true" />
            SIDE A · TRACK 0{index + 1}
          </span>

          {isUnavailable ? (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(184, 107, 75, 0.12)',
                border:          '1px solid rgba(184, 107, 75, 0.28)',
                fontFamily:      'var(--font-inter), sans-serif',
                fontSize:        '0.625rem',
                fontWeight:      500,
                color:           '#B86B4B',
              }}
            >
              Preview unavailable
            </span>
          ) : isLoading ? (
            <span
              style={{
                fontFamily:    'var(--font-inter), sans-serif',
                fontSize:      '0.625rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color:         item.accent,
              }}
            >
              Loading...
            </span>
          ) : (
            <span
              style={{
                fontFamily:    'var(--font-inter), sans-serif',
                fontSize:      '0.625rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color:         isPlaying ? item.accent : 'rgba(107, 97, 90, 0.6)',
                fontWeight:    isPlaying ? 500 : 400,
              }}
            >
              {isPlaying ? 'Playing Preview' : '30s Preview'}
            </span>
          )}
        </div>
      </div>
    </m.div>
  );
}

// ─── Main CuratedShelf Component ──────────────────────────────────────────

export default function CuratedShelf() {
  const shouldReduce = useReducedMotion() ?? false;

  // Persistent shared <audio> element rendered in DOM for iOS Safari synchronous play()
  const audioRef           = useRef<HTMLAudioElement | null>(null);
  const previewCacheRef    = useRef<Record<string, string>>({});
  const activeTrackIdRef   = useRef<string | null>(null);
  const requestTokenRef    = useRef<number>(0);

  const [previewCache, setPreviewCache]     = useState<Record<string, string>>({});
  const [playingId, setPlayingId]           = useState<string | null>(null);
  const [loadingId, setLoadingId]           = useState<string | null>(null);
  const [unavailableIds, setUnavailableIds] = useState<Record<string, boolean>>({});

  // Pre-fetch & cache all 4 iTunes preview URLs on mount so mobile taps call audio.play() synchronously
  useEffect(() => {
    let cancelled = false;

    shelfPlaylist.forEach((track) => {
      if (previewCacheRef.current[track.id]) return;

      fetchItunesPreviewUrl(track.itunesQuery)
        .then((url) => {
          if (cancelled) return;
          if (url) {
            previewCacheRef.current[track.id] = url;
            setPreviewCache((prev) => ({ ...prev, [track.id]: url }));
          } else {
            setUnavailableIds((prev) => ({ ...prev, [track.id]: true }));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUnavailableIds((prev) => ({ ...prev, [track.id]: true }));
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Clean up audio on unmount so it never bleeds into /v1
  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      requestTokenRef.current++;
      activeTrackIdRef.current = null;
      if (audioEl) {
        audioEl.pause();
        audioEl.removeAttribute('src');
        audioEl.load();
      }
    };
  }, []);

  const handleAudioError = useCallback(() => {
    const failedId = activeTrackIdRef.current;
    const hasSrc = Boolean(audioRef.current?.getAttribute('src'));
    if (failedId && hasSrc) {
      setUnavailableIds((prev) => ({ ...prev, [failedId]: true }));
      setPlayingId(null);
      setLoadingId(null);
    }
  }, []);

  const handleTogglePlay = useCallback(
    (track: PlaylistItem) => {
      const audio = audioRef.current;
      if (!audio) return;

      // 1. If clicking the currently playing track -> pause synchronously
      if (playingId === track.id) {
        audio.pause();
        setPlayingId(null);
        return;
      }

      // Stop any other currently playing track
      audio.pause();
      setPlayingId(null);
      activeTrackIdRef.current = track.id;
      const token = ++requestTokenRef.current;

      const cachedUrl = previewCacheRef.current[track.id] ?? previewCache[track.id];

      // 2. Synchronous path (iOS Safari safe — no await before audio.play())
      if (cachedUrl) {
        if (audio.src !== cachedUrl) {
          audio.src = cachedUrl;
        }
        audio.volume = 0.7;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (token !== requestTokenRef.current) {
                audio.pause();
                return;
              }
              setUnavailableIds((prev) => {
                if (!prev[track.id]) return prev;
                const next = { ...prev };
                delete next[track.id];
                return next;
              });
              setPlayingId(track.id);
            })
            .catch(() => {
              if (token === requestTokenRef.current) {
                setUnavailableIds((prev) => ({ ...prev, [track.id]: true }));
                setPlayingId(null);
              }
            });
        }
        return;
      }

      // 3. Fallback if user tapped before mount pre-fetch finished:
      // Unlock audio element synchronously inside the user gesture first
      audio.load();
      setLoadingId(track.id);

      fetchItunesPreviewUrl(track.itunesQuery)
        .then((url) => {
          if (token !== requestTokenRef.current) return;
          setLoadingId(null);

          if (!url) {
            setUnavailableIds((prev) => ({ ...prev, [track.id]: true }));
            return;
          }

          previewCacheRef.current[track.id] = url;
          setPreviewCache((prev) => ({ ...prev, [track.id]: url }));

          audio.src = url;
          audio.volume = 0.7;
          return audio.play().then(() => {
            if (token !== requestTokenRef.current) {
              audio.pause();
              return;
            }
            setUnavailableIds((prev) => {
              if (!prev[track.id]) return prev;
              const next = { ...prev };
              delete next[track.id];
              return next;
            });
            setPlayingId(track.id);
          });
        })
        .catch(() => {
          if (token === requestTokenRef.current) {
            setLoadingId(null);
            setUnavailableIds((prev) => ({ ...prev, [track.id]: true }));
            setPlayingId(null);
          }
        });
    },
    [playingId, previewCache],
  );

  return (
    <section
      aria-labelledby="curated-shelf-heading"
      className="relative z-10 w-full max-w-[780px] mx-auto px-5 sm:px-8 pt-2 pb-12"
    >
      {/* Persistent shared HTML5 audio element (no crossOrigin attribute so Apple CDN streams cleanly on iOS Safari) */}
      <audio
        ref={audioRef}
        playsInline
        preload="none"
        onEnded={() => setPlayingId(null)}
        onError={handleAudioError}
        className="hidden"
        aria-hidden="true"
      />
      {/* ── Section Header ───────────────────────────────────────────── */}
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
        <p
          className="mb-2"
          style={{
            fontFamily:    'var(--font-inter), sans-serif',
            fontSize:      '0.6875rem',
            fontWeight:    500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         '#6E826F',
          }}
        >
          II · ON OUR SHELF
        </p>
        <h2
          id="curated-shelf-heading"
          className="mb-3"
          style={{
            fontFamily:    'var(--font-cormorant), Georgia, serif',
            fontSize:      'clamp(1.85rem, 5vw, 2.6rem)',
            fontWeight:    400,
            lineHeight:    1.18,
            color:         '#2B2623',
          }}
        >
          Movies, Series &amp; Songs
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize:   '0.9rem',
            fontWeight: 300,
            lineHeight: 1.75,
            color:      '#6B615A',
            margin:     0,
          }}
        >
          A small collection of things we watched and songs that stayed with us.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PART A — THINGS WE WATCHED (2x2 Cinema-Ticket / Book-Spine Grid)
      ════════════════════════════════════════════════════════════════ */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-5 px-1">
          <span
            style={{
              fontFamily:    'var(--font-inter), sans-serif',
              fontSize:      '0.7rem',
              fontWeight:    500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         '#B86B4B',
            }}
          >
            A · Things We Watched
          </span>
          <span
            style={{
              fontFamily: 'var(--font-caveat), Caveat, cursive',
              fontSize:   '1.1rem',
              color:      '#6B615A',
            }}
          >
            Tap any ticket to flip
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {shelfWatchlist.map((item, idx) => (
            <WatchCard
              key={item.id}
              item={item}
              index={idx}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PART B — SONGS THAT STAYED (2x2 Vinyl-Sleeve Audio Grid)
      ════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-5 px-1">
          <span
            style={{
              fontFamily:    'var(--font-inter), sans-serif',
              fontSize:      '0.7rem',
              fontWeight:    500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         '#6E826F',
            }}
          >
            B · Songs That Stayed
          </span>
          <span
            style={{
              fontFamily: 'var(--font-caveat), Caveat, cursive',
              fontSize:   '1.1rem',
              color:      '#6B615A',
            }}
          >
            Press play for 30s preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {shelfPlaylist.map((item, idx) => (
            <SongCard
              key={item.id}
              item={item}
              index={idx}
              isPlaying={playingId === item.id}
              isLoading={loadingId === item.id}
              isUnavailable={Boolean(unavailableIds[item.id])}
              onTogglePlay={handleTogglePlay}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
