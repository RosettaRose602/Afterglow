import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a14',
        surface: '#12121e',
        surfaceHigh: '#1a1a2e',
        border: '#2a2a3e',
        textPrimary: '#e8e0f0',
        textSecondary: '#9090b0',
        textMuted: '#505070',
        accentViolet: '#7b5ea7',
        accentRose: '#d4517a',
        accentGold: '#c9a84c',
        accentIce: '#6ab4d4',
        accentGreen: '#5a9e6f',
        safeGreen: '#4caf8a',
        warningAmber: '#e0943a',
        dangerRed: '#e05a5a',
        migraineRed: '#c0392b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'bob': 'bob 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1deg)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(123, 94, 167, 0.3)',
        'glow-gold': '0 0 20px rgba(201, 168, 76, 0.3)',
        'glow-rose': '0 0 20px rgba(212, 81, 122, 0.3)',
        'glow-ice': '0 0 20px rgba(106, 180, 212, 0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config
