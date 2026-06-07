/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      // Colors map to the design-token CSS variables defined in globals.css,
      // so Tailwind utilities (`bg-bg`, `text-fg`, `border-rule`…) stay in
      // sync with the site theme.
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        fg: 'var(--fg)',
        'fg-soft': 'var(--fg-soft)',
        muted: 'var(--muted)',
        rule: 'var(--rule)',
        'rule-soft': 'var(--rule-soft)',
        sage: 'var(--sage)',
        'sage-deep': 'var(--sage-deep)',
        terra: 'var(--terra)',
        'terra-deep': 'var(--terra-deep)',
      },

      fontFamily: {
        display: 'var(--f-display)',
        body: 'var(--f-body)',
        mono: 'var(--f-mono)',
      },

      letterSpacing: {
        display: 'var(--display-tracking)',
      },

      maxWidth: {
        wrap: '1440px',
      },

      transitionTimingFunction: {
        editorial: 'cubic-bezier(.2,.7,.2,1)',
      },

      borderRadius: {
        pill: '999px',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Tailwind v3 config is CommonJS
  plugins: [require('@tailwindcss/typography')],
};
