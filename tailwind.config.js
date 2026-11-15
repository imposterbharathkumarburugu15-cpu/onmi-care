/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        senior: {
          bg: '#FFFFFF',
          darkBg: '#0F172A',
          yellow: '#FACC15',
          text: '#000000',
          darkText: '#FFFFFF',
          accent: '#0284C7',
          success: '#15803D',
          warning: '#B45309',
          danger: '#B91C1C',
        }
      },
      minHeight: {
        'touch': '48px',
        'senior-touch': '56px',
        'hero-touch': '64px',
      },
      minWidth: {
        'touch': '48px',
        'senior-touch': '56px',
      },
      fontSize: {
        'senior-base': ['1.25rem', { lineHeight: '1.75rem' }],
        'senior-lg': ['1.5rem', { lineHeight: '2rem' }],
        'senior-xl': ['2rem', { lineHeight: '2.5rem' }],
        'senior-hero': ['2.75rem', { lineHeight: '3.25rem' }],
      }
    },
  },
  plugins: [],
};
