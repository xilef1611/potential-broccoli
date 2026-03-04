import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CryptoMarket palette (mirrors CSS vars)
        'cm-bg': '#060714',
        'cm-surface': '#0c0e20',
        'cm-card': '#0f1228',
        'cm-border': '#1c2040',
        'cm-cyan': '#00d4ff',
        'cm-purple': '#7c3aed',
        'cm-pink': '#f43f8a',
        'cm-green': '#10b981',
        'cm-orange': '#f59e0b',
        // Legacy aliases
        'cyber-black': '#060714',
        'cyber-dark': '#0c0e20',
        'cyber-card': '#0f1228',
        'cyber-border': '#1c2040',
        'cyber-accent': '#00d4ff',
        'cyber-purple': '#7c3aed',
        'cyber-pink': '#f43f8a',
        'cyber-blue': '#3b82f6',
        'cyber-text': '#c8d5e8',
        'cyber-muted': '#4a5580',
        'ask-bg': '#060714',
        'ask-surface': '#0c0e20',
        'ask-card': '#0f1228',
        'ask-border': '#1c2040',
        'ask-accent': '#00d4ff',
        'ask-muted': '#4a5580',
        'ask-text': '#c8d5e8',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
