import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Design System Colors ─────────────────────────────────────
      colors: {
        night: {
          bg:      '#071827', // Page background
          card:    '#10253D', // Card surfaces
        },
        text: {
          primary:   '#F8FAFC', // Main text
          secondary: '#CBD5E1', // Subtext / captions
        },
        accent: {
          sky:    '#89CFF0', // Primary accent (baby blue)
          violet: '#B8A8E3', // Secondary accent (soft violet)
        },
        star:  '#FFF4C2', // Twinkling stars
        moon:  '#FFF8E7', // Moon glow
      },

      // ─── Typography ───────────────────────────────────────────────
      fontFamily: {
        title: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        body:  ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },

      // ─── Max widths ───────────────────────────────────────────────
      maxWidth: {
        content: '720px',
      },

      // ─── Custom animations ────────────────────────────────────────
      animation: {
        'twinkle':        'twinkle 3s ease-in-out infinite',
        'twinkle-slow':   'twinkle 5s ease-in-out infinite',
        'twinkle-fast':   'twinkle 2s ease-in-out infinite',
        'shooting-star':  'shootingStar 4s linear forwards',
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'moon-glow':      'moonGlow 4s ease-in-out infinite',
        'drift':          'drift 20s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.2', transform: 'scale(0.7)' },
        },
        shootingStar: {
          '0%':   { transform: 'translateX(0) translateY(0)', opacity: '1' },
          '100%': { transform: 'translateX(400px) translateY(200px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        moonGlow: {
          '0%, 100%': { boxShadow: '0 0 40px 20px rgba(255, 248, 231, 0.15)' },
          '50%':       { boxShadow: '0 0 60px 30px rgba(255, 248, 231, 0.25)' },
        },
        drift: {
          '0%':   { transform: 'translateX(0) translateY(0)' },
          '25%':  { transform: 'translateX(10px) translateY(-15px)' },
          '50%':  { transform: 'translateX(-5px) translateY(-25px)' },
          '75%':  { transform: 'translateX(-12px) translateY(-10px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
      },

      // ─── Box shadows ──────────────────────────────────────────────
      boxShadow: {
        'card':     '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(137, 207, 240, 0.15)',
        'glow-sky':    '0 0 20px rgba(137, 207, 240, 0.3)',
        'glow-violet': '0 0 20px rgba(184, 168, 227, 0.3)',
      },

      // ─── Border radius ────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ─── Backdrop blur ────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
