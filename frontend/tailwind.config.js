/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        craft: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary terracotta orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        india: {
          saffron: '#FF9933',
          terracotta: '#C2410C',
          gold: '#D4AF37',
          marigold: '#F59E0B',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#0F172A',
          indigo: '#1E3A8A',
          parchment: '#FAF8F5'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        heritage: ['Cinzel', '"Playfair Display"', '"Noto Serif Devanagari"', 'serif'],
        hindi: ['"Noto Sans Devanagari"', '"Noto Serif Devanagari"', 'sans-serif']
      }
    },
  },
  plugins: [],
}

