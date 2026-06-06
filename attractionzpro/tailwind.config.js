/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefde8',
          100: '#fdf9c4',
          200: '#faf18c',
          300: '#f5e44a',
          400: '#efd220',
          DEFAULT: '#D4AF37',
          500: '#D4AF37',
          600: '#b8900f',
          700: '#946d0e',
          800: '#7a5614',
          900: '#694717',
          950: '#3d2609',
        },
        black: {
          DEFAULT: '#0a0a0a',
          soft: '#141414',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
        cream: {
          DEFAULT: '#FDF8F0',
          50: '#FDFAF5',
          100: '#FDF8F0',
          200: '#F9F0DC',
        },
        accent: {
          yellow: '#F5E642',
          champagne: '#F7E7CE',
          rose: '#C9A98A',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body:    ['var(--font-jost)', 'system-ui', 'sans-serif'],
        script:  ['var(--font-dancing)', 'cursive'],
        mono:    ['var(--font-space-mono)', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient':       'linear-gradient(135deg, #D4AF37 0%, #F5E642 50%, #D4AF37 100%)',
        'dark-gradient':       'linear-gradient(180deg, #0a0a0a 0%, #141414 100%)',
        'luxury-hero':         'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
        'card-shine':          'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, transparent 50%)',
        'gold-shimmer':        'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
      },
      boxShadow: {
        'gold':        '0 4px 24px rgba(212, 175, 55, 0.25)',
        'gold-lg':     '0 8px 48px rgba(212, 175, 55, 0.35)',
        'gold-glow':   '0 0 30px rgba(212, 175, 55, 0.4)',
        'luxury':      '0 20px 60px rgba(0, 0, 0, 0.5)',
        'card':        '0 2px 20px rgba(0, 0, 0, 0.4)',
        'inner-gold':  'inset 0 0 20px rgba(212, 175, 55, 0.1)',
      },
      animation: {
        'shimmer':         'shimmer 2.5s linear infinite',
        'float':           'float 6s ease-in-out infinite',
        'pulse-gold':      'pulse-gold 2s ease-in-out infinite',
        'slide-up':        'slide-up 0.6s ease-out forwards',
        'fade-in':         'fade-in 0.8s ease-out forwards',
        'spin-slow':       'spin 8s linear infinite',
        'border-flow':     'border-flow 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(212,175,55,0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'border-flow': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      borderRadius: {
        'xl2': '1.25rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
