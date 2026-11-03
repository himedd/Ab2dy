/** Ab2dy neon-eternity theme — ported 1:1 from the former CDN inline config (zero visual change) */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './types.ts',
    './components/**/*.{tsx,ts}',
    './utils/**/*.ts',
    './services/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', '"Tajawal"', 'sans-serif'],
        heading: ['"Cairo"', '"Outfit"', '"Tajawal"', 'sans-serif'],
        arabic: ['"Tajawal"', '"Cairo"', 'sans-serif'],
        cairo: ['"Cairo"', '"Tajawal"', 'sans-serif'],
        gaming: ['"Bangers"', 'cursive'],
      },
      colors: {
        kick: { DEFAULT: '#A6FF5C', dark: '#1E6B0C', glow: 'rgba(166,255,92,0.35)' },
        neon: { DEFAULT: '#A6FF5C', dim: '#1E6B0C' },
        emeraldx: { DEFAULT: '#5BE817', deep: '#04110A', glow: 'rgba(91,232,23,0.35)' },
        storm: { DEFAULT: '#5BE817', bright: '#A6FF5C', deep: '#04110A', glow: 'rgba(91,232,23,0.35)' },
        accent: { blue: '#5BE817', deep: '#04110A', sky: '#7BEF3D', navy: '#123A0A', ice: '#A6FF5C' },
        ink: { 950: '#030603', 900: '#050805', 800: '#070D06', 700: '#0B1A0A' },
        ice: { light: '#E2FFCB', DEFAULT: '#5BE817', dark: '#123A0A' }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow': 'spin 14s linear infinite',
        'spin-slower': 'spin 26s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'charge': 'charge 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'shine-periodic': 'shinePeriodic 8.5s cubic-bezier(0.4,0,0.2,1) infinite',
        'float': 'floatY 9s ease-in-out infinite',
        'float-soft': 'floatSoft 7s ease-in-out infinite',
        'pulse-ice': 'pulseIce 3.6s ease-in-out infinite',
        'pulse-slow': 'pulse 4.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'marquee': 'marqueeCitadel 55s linear infinite',
        'marquee-rev': 'marqueeRev 60s linear infinite',
        'aurora': 'aurora 24s ease-in-out infinite alternate',
        'glitch': 'glitchFx 0.5s steps(2) infinite',
        'tick': 'tickGlow 2.6s ease-in-out infinite',
        'ring-orbit': 'spin 14s linear infinite',
        'ember-rise': 'emberRise 12s linear infinite',
        'halo-spin': 'spin 30s linear infinite',
      },
      keyframes: {
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        gradientX: { '0%,100%': { 'background-position': '0% 50%' }, '50%': { 'background-position': '100% 50%' } },
        charge: { '0%': { width: '0%', opacity: '1' }, '100%': { width: '100%', opacity: '0' } },
        shinePeriodic: { '0%': { transform: 'translateX(-170%) skewX(-18deg)', opacity: '0' }, '8%': { opacity: '0.6' }, '24%': { transform: 'translateX(170%) skewX(-18deg)', opacity: '0' }, '100%': { transform: 'translateX(170%) skewX(-18deg)', opacity: '0' } },
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        floatSoft: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pulseIce: { '0%,100%': { opacity: '1', filter: 'drop-shadow(0 0 4px rgba(91,232,23,0.7))' }, '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 14px rgba(91,232,23,0.7))' } },
        marqueeCitadel: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        marqueeRev: { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        aurora: { '0%': { transform: 'translate(-4%, -1%) scale(1)', opacity: '0.6' }, '50%': { transform: 'translate(3%, 2%) scale(1.05)', opacity: '0.9' }, '100%': { transform: 'translate(-2%, 3%) scale(1.02)', opacity: '0.75' } },
        glitchFx: { '0%': { transform: 'translate(0)' }, '25%': { transform: 'translate(-1px,1px)' }, '50%': { transform: 'translate(1px,-1px)' }, '75%': { transform: 'translate(-1px,-1px)' }, '100%': { transform: 'translate(0)' } },
        tickGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(91,232,23,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(91,232,23,0)' } },
        emberRise: { '0%': { transform: 'translateY(0)', opacity: '0' }, '12%': { opacity: '0.8' }, '100%': { transform: 'translateY(-110vh)', opacity: '0' } },
      }
    }
  },
  plugins: [],
};
