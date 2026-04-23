/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#F5A623',
          glow: '#D4850A',
          accent: '#FFD700',
        },
        midnight: '#0A0E1A',
        slate: '#111827',
        silver: '#9CA3AF',
        ember: '#EF4444',
        eagle: '#10B981',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'system-ui', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-amber': 'pulse-amber 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'typewriter': 'typewriter 20ms steps(1) forwards',
      },
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        'panel': '12px',
      },
    },
  },
  plugins: [],
}