/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm cream and sand background palette (renamed dark to preserve class names)
        dark: {
          950: '#EAE5D8', // warm sand dark
          900: '#F6F2E5', // light warm cream paper background
          800: '#FAF8F5', // lighter cream/white card background
          700: '#EDE6D4', // warm inner input backgrounds
          600: '#DFD7C0', // warm grey beige
          500: '#8E7B73', // medium wood brown
          400: '#2E2724', // dark wood brown text/accents
        },
        // Warm creative wood/amber tones (terracotta/gold blend)
        gold: {
          50:  '#FDF8F5',
          100: '#F7E7DF',
          200: '#EFCFBF',
          300: '#E4AB94',
          400: '#D58564', // Terracotta-orange
          500: '#C86A4B', // Warm wood clay
          600: '#A65337', // Mahogany red-brown
          700: '#843F28',
          800: '#622F1D',
          900: '#401E13',
        },
        // Primary Forest Green accent palette
        primary: {
          50:  '#F3F7F5',
          100: '#E2ECE7',
          200: '#C1D6CD',
          300: '#9FBFAF',
          400: '#69947F',
          500: '#355E4E', // Forest Green primary accent
          600: '#2B4D40',
          700: '#213B31',
          800: '#172A22',
          900: '#0E1A15',
        },
        // Gray redefined to custom warm wood/charcoal tones for perfect readability
        gray: {
          50:  '#FAF8F5',
          100: '#F0ECE4',
          200: '#E2DCD0',
          300: '#2E2724', // Deep charcoal-brown (for main text!)
          400: '#524641', // Charcoal-brown secondary text
          500: '#75655E', // Muted brown text
          600: '#8E7B73',
          700: '#2E2724',
          800: '#1E1B19',
          900: '#0E0D0C',
        },
        cream: '#F6F2E5',
        charcoal: '#2E2724',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-x': 'gradientX 8s ease infinite',
        'stagger-in': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(200,106,75,0.2), 0 0 20px rgba(200,106,75,0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(200,106,75,0.4), 0 0 40px rgba(200,106,75,0.15)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #F6F2E5 0%, #EDE4D3 50%, #FAF8F5 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D58564 0%, #C86A4B 50%, #A65337 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(246,242,229,0.95) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.5) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(200,106,75,0.15)',
        'glow-lg': '0 0 40px rgba(200,106,75,0.2)',
        'card': '0 4px 24px rgba(46,39,36,0.06)',
        'card-hover': '0 8px 40px rgba(46,39,36,0.12)',
        'glass': '0 8px 32px rgba(46,39,36,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
