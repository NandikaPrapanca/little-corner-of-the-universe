/**
 * utils/soundEffects.ts
 * Lightweight Web Audio API helpers for soft tactile foley.
 *
 * All functions:
 * - Are zero-dependency and instantiate AudioContext lazily.
 * - Safely handle browser autoplay policy and missing AudioContext.
 * - Strictly respect isMuted parameter (noop if true).
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Ignored if browser blocks resume without gesture
    });
  }

  return sharedAudioCtx;
}

/**
 * Play a warm, delicate bell / harmonic chime when a star is tapped.
 */
export function playStarChime(isMuted = false): void {
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = ctx.currentTime;

  // Dual sine harmonics for a soft musical chime (e.g. E6 & B6)
  const freqs = [1318.51, 1975.53];
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.04, now);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  masterGain.connect(ctx.destination);

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const relativeGain = idx === 0 ? 0.8 : 0.4;
    gain.gain.setValueAtTime(relativeGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 1.2);
  });
}

/**
 * Play a gentle, filtered paper-opening rustle sound when Pom's envelope opens.
 */
export function playEnvelopeRustle(isMuted = false): void {
  if (isMuted) return;

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = ctx.currentTime;
  const duration = 0.35;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate pink-ish / Brownian noise for soft paper texture
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter to simulate paper crinkle/rustle frequency
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + duration);
  filter.Q.setValueAtTime(1.8, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}
