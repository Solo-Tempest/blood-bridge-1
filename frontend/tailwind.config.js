/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif:  ['"DM Serif Display"', 'serif'],
        sans:   ['"DM Sans"', 'sans-serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'bb-red':       '#C8102E',
        'bb-red-dark':  '#8B0A1E',
        'bb-red-light': '#FFEEF1',
        'bb-red-mid':   '#F4C5CC',
        'bb-cream':     '#FAF7F2',
        'bb-ink':       '#0E0C0D',
        'bb-ink-60':    '#5A5458',
        'bb-ink-30':    '#BEB8BB',
        'bb-ink-10':    '#F0ECEE',
        'bb-green':     '#0D7A55',
        'bb-amber':     '#C07A00',
        'bb-blue':      '#1A4FA0',
      },
      borderRadius: {
        'bb-sm': '6px',
        'bb':    '12px',
        'bb-lg': '20px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(1.4)' },
        },
        rotate: {
          to: { transform: 'rotate(360deg)' },
        },
        counterRotate: {
          to: { transform: 'rotate(-360deg)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,16,46,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(200,16,46,0.2)' },
        },
      },
      animation: {
        'bb-pulse':          'pulse 2s infinite',
        'bb-rotate':         'rotate 30s linear infinite',
        'bb-counter-rotate': 'counterRotate 30s linear infinite',
        'bb-fade-in-up':     'fadeInUp 0.3s ease both',
        'bb-glow-red':       'glowRed 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
