/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:      '#07070F',
        surface: '#0E0E1C',
        card:    '#141428',
        purple: {
          DEFAULT: '#7F77DD',
          light:   '#AFA9EC',
          dark:    '#534AB7',
          faint:   'rgba(127,119,221,0.08)',
        },
        teal:  '#1D9E75',
        coral: '#D85A30',
        border: 'rgba(127,119,221,0.15)',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'glow-pulse':'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
