/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Design Palette (Section 5)
        teal: {
          DEFAULT: '#007F86',
          50: '#E1F2F1',
          100: '#C2E5E4',
          500: '#007F86',
          600: '#006B70',
          700: '#005459',
        },
        navy: {
          DEFAULT: '#102E3C',
          dark: '#0A1E27',
          light: '#1A4254',
        },
        ink: {
          DEFAULT: '#112B37',
          light: '#204353',
        },
        slate: {
          DEFAULT: '#617580',
          light: '#8395A0',
          dark: '#4A5B64',
        },
        'light-gray': '#F2F5F6',
        'border-gray': '#DCE5E9',

        // Status Colors (Section 6)
        status: {
          emergency: {
            DEFAULT: '#C73540',
            bg: '#FCECEE',
          },
          ready: {
            DEFAULT: '#24735B',
            bg: '#E8F5ED',
          },
          warning: {
            DEFAULT: '#97610A',
            bg: '#FFF2D7',
          },
          info: {
            DEFAULT: '#007F86',
            bg: '#E1F2F1',
          },
        },

        // Map Palette (Section 7)
        map: {
          bg: '#EDF1F0',
          blocks: '#E1E7E5',
          parks: '#D3E4D6',
          water: '#C5DDE5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(17, 43, 55, 0.06), 0 1px 4px -1px rgba(17, 43, 55, 0.04)',
        'elevated': '0 8px 24px -4px rgba(17, 43, 55, 0.08), 0 2px 6px -1px rgba(17, 43, 55, 0.04)',
        'modal': '0 20px 40px -8px rgba(16, 46, 60, 0.2)',
      }
    },
  },
  plugins: [],
}
