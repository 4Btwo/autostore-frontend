/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AutoStore dark theme palette
        bg: {
          DEFAULT: '#0A0F1E',
          2: '#0F172A',
        },
        card: {
          DEFAULT: '#111827',
          2: '#1E293B',
          3: '#263348',
        },
        border: {
          DEFAULT: '#1E2D45',
          2: '#2D3F55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn .4s ease both',
        'fade-up': 'fadeUp .45s cubic-bezier(.16,1,.3,1) both',
        'slide-up': 'slideUp .5s cubic-bezier(.16,1,.3,1) both',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '.8' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
