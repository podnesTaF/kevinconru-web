/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
    './pages/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    // We override Tailwind's defaults selectively. `extend` would keep the
    // generic palette — for an editorial site we want a tight, intentional one.
    screens: {
      sm:  '600px',
      md:  '760px',
      lg:  '880px',
      xl:  '1100px',
      '2xl': '1400px',
      '3xl': '1640px',
    },

    colors: {
      transparent: 'transparent',
      current:     'currentColor',
      inherit:     'inherit',

      // ───── Paper (backgrounds) ─────
      paper: {
        DEFAULT: '#F2EDE4',
        warm:    '#EDE6D8',
        deep:    '#E5DCC8',
      },

      // ───── Ink (text + dark surfaces) ─────
      ink: {
        DEFAULT: '#1A1714',
        soft:    '#3A332C',
        muted:   '#6B6157',
        faint:   '#A39A8E',
      },

      // ───── Ochre (single accent) ─────
      ochre: {
        DEFAULT: '#8B6F47',
        light:   '#A88A60',
        deep:    '#6E5638',
      },

      // ───── Functional ─────
      rule: {
        DEFAULT: 'rgba(26, 23, 20, 0.12)',
        strong:  'rgba(26, 23, 20, 0.28)',
        faint:   'rgba(26, 23, 20, 0.06)',
      },

      white: '#FFFFFF',
      black: '#000000',
    },

    fontFamily: {
      serif: ['"Cormorant Garamond"', 'Garamond', '"Times New Roman"', 'serif'],
      sans:  ['"Inter Tight"', 'system-ui', '-apple-system', 'sans-serif'],
      mono:  ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },

    fontSize: {
      // ── Display (serif) ──
      'display-xl': ['clamp(56px, 8vw, 128px)',  { lineHeight: '0.95', letterSpacing: '-0.02em'  }],
      'display-lg': ['clamp(48px, 7.5vw, 120px)',{ lineHeight: '0.95', letterSpacing: '-0.015em' }],
      'display-md': ['clamp(40px, 5vw, 72px)',   { lineHeight: '1',    letterSpacing: '-0.015em' }],
      'display-sm': ['clamp(32px, 3.6vw, 56px)', { lineHeight: '1.05', letterSpacing: '-0.01em'  }],

      // ── Editorial (serif body / pulled quotes) ──
      'editorial-lg': ['clamp(26px, 2.6vw, 38px)', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
      'editorial-md': ['clamp(22px, 2vw, 30px)',   { lineHeight: '1.4',  letterSpacing: '-0.005em' }],
      'editorial-sm': ['clamp(20px, 1.6vw, 24px)', { lineHeight: '1.5',  letterSpacing: '0'        }],

      // ── Titles (cards, list items) ──
      'title-lg': ['clamp(22px, 1.7vw, 28px)', { lineHeight: '1.2',  letterSpacing: '-0.005em' }],
      'title-md': ['20px',                     { lineHeight: '1.25', letterSpacing: '-0.005em' }],

      // ── UI (sans) ──
      'ui-base': ['16px', { lineHeight: '1.6' }],
      'ui-sm':   ['14px', { lineHeight: '1.6' }],
      'ui-xs':   ['13px', { lineHeight: '1.6' }],

      // ── Eyebrows / nav (uppercase tracked) ──
      'eyebrow':    ['11px', { lineHeight: '1.5', letterSpacing: '0.28em' }],
      'eyebrow-sm': ['10px', { lineHeight: '1.4', letterSpacing: '0.3em'  }],
      'eyebrow-lg': ['12px', { lineHeight: '1.5', letterSpacing: '0.22em' }],

      // ── Numerics (years, plate marks, ISBN) ──
      'numeric-xl': ['clamp(40px, 4vw, 60px)', { lineHeight: '1' }],
      'numeric-lg': ['48px',                   { lineHeight: '1' }],
      'numeric-md': ['22px',                   { lineHeight: '1' }],
    },

    fontWeight: {
      light:   '300',
      regular: '400',
      medium:  '500',
    },

    letterSpacing: {
      tightest: '-0.02em',
      tighter:  '-0.015em',
      tight:    '-0.005em',
      normal:   '0',
      wide:     '0.18em',
      wider:    '0.22em',
      widest:   '0.28em',
      ultra:    '0.32em',
    },

    extend: {
      spacing: {
        'gutter':     'clamp(24px, 4vw, 64px)',
        'gutter-lg':  'clamp(48px, 6vw, 96px)',
        'section':    'clamp(80px, 12vh, 160px)',
        'section-sm': 'clamp(56px, 8vh, 100px)',
        'page-top':   'clamp(80px, 14vh, 160px)',
      },

      maxWidth: {
        'editorial':   '1240px',
        'archive':     '1640px',
        'prose-serif': '720px',
        'prose-meta':  '440px',
      },

      aspectRatio: {
        'book':  '3 / 4',
        'plate': '4 / 5',
      },

      transitionTimingFunction: {
        'editorial': 'cubic-bezier(.2, .6, .2, 1)',
        'reveal':    'cubic-bezier(.6, .05, .2, 1)',
      },
      transitionDuration: {
        '400':  '400ms',
        '500':  '500ms',
        '900':  '900ms',
        '1100': '1100ms',
        '1400': '1400ms',
      },

      keyframes: {
        'hero-in': {
          '0%':   { opacity: '0', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rise: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.4' },
          '50%':      { transform: 'scaleY(1)',   opacity: '1'   },
        },
        'underline-in': {
          '0%':   { right: '100%' },
          '100%': { right: '0' },
        },
      },

      animation: {
        'hero-in':      'hero-in 1.6s cubic-bezier(.2,.6,.2,1) 0.2s forwards',
        'rise':         'rise 1.1s cubic-bezier(.2,.6,.2,1) forwards',
        'rise-delayed': 'rise 1s cubic-bezier(.2,.6,.2,1) 0.3s forwards',
        'scroll-hint':  'scroll-hint 2.4s ease-in-out infinite',
        'underline-in': 'underline-in 600ms cubic-bezier(.2,.6,.2,1) forwards',
      },

      boxShadow: {
        'none':     'none',
        'hairline': '0 0 0 0.5px rgba(26, 23, 20, 0.12)',
      },

      borderRadius: {
        'none':  '0',
        'sm':    '2px',
        DEFAULT: '0',
        'pill':  '999px',
      },

      borderWidth: {
        DEFAULT: '1px',
        '0.5':   '0.5px',
        '1':     '1px',
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
};