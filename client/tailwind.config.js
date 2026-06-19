/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f4dba8',
          300: '#ecc070',
          400: '#e2a040',
          500: '#d4852a',
          600: '#b86b1e',
          700: '#96521a',
          800: '#7a421b',
          900: '#643819',
          950: '#3a1d09',
        },
        wood: {
          light: '#c8956c',
          mid: '#a0522d',
          dark: '#6b3a2a',
          deep: '#3d1f14',
        },
        cream: '#fdf6e3',
        charcoal: '#1a1a2e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'wood-grain': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q 25 45 50 50 Q 75 55 100 50' stroke='rgba(160,82,45,0.1)' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
        'hero-gradient': 'linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(61,31,20,0.7) 100%)',
      },
      boxShadow: {
        'wood': '0 4px 20px rgba(160,82,45,0.2)',
        'wood-lg': '0 8px 40px rgba(160,82,45,0.3)',
        'glow': '0 0 20px rgba(212,133,42,0.4)',
        'card': '0 2px 15px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
