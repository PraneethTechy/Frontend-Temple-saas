/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Light theme only - no dark classes are used
  theme: {
    extend: {
      colors: {
        spiritual: {
          bg: '#FAF8F3',
          card: '#FFFFFF',
          border: '#E8E2D5',
          borderLight: '#F0EBE1',
          text: '#241C16',
          muted: '#6E6259',
          subtle: '#A89E95',
          surface: '#F5F0E6',
          primary: '#B7791F',
          primaryHover: '#9B6416',
          primaryLight: '#FDF6E2',
          primaryRing: '#E9C46A',
          accent: '#7A2E2E',
          accentHover: '#632424',
          accentLight: '#FAEDED',
          gold: '#C59B27',
          goldMuted: '#DFC67F',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        'spiritual-sm': '0 1px 3px rgba(36, 28, 22, 0.05), 0 1px 2px rgba(36, 28, 22, 0.03)',
        'spiritual-md': '0 4px 12px rgba(36, 28, 22, 0.06), 0 2px 4px rgba(36, 28, 22, 0.04)',
        'spiritual-lg': '0 10px 25px rgba(36, 28, 22, 0.08), 0 4px 10px rgba(36, 28, 22, 0.03)',
      }
    },
  },
  plugins: [],
}
