/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
        'plex': ['IBM Plex Sans', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e2',
          300: '#d6d3d0',
          400: '#a8a29e',
          500: '#78706c',
          600: '#57504a',
          700: '#292524',
          800: '#1c1917',
          900: '#0f0e0d',
        },
        teal: {
          700: '#0b6e69',
          800: '#0a5854',
        },
        amber: {
          400: '#d9a441',
          700: '#8c5b06',
        },
        red: {
          600: '#c44536',
        },
      },
      backgroundOpacity: {
        6: '0.06',
        7: '0.07',
        12: '0.12',
        15: '0.15',
        72: '0.72',
        86: '0.86',
      },
      boxShadow: {
        lg: '0 24px 80px rgba(27, 38, 49, 0.12)',
      },
      backdropBlur: {
        xl: '16px',
      },
    },
  },
  plugins: [],
}
