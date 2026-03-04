/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'ask-bg': '#0a0a0f',
        'ask-surface': '#111118',
        'ask-border': '#1e1e2e',
        'ask-accent': '#00d4aa',
        'ask-accent-2': '#7b5ea7',
        'ask-text': '#e8e8f0',
        'ask-muted': '#6b6b8a',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,170,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,170,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
