/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#15803D',
          800: '#166534',
          900: '#0D3B2E',
          950: '#062018',
        },
        gold: {
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#D97706',
          600: '#C5A059',
          700: '#92400E',
        },
        charcoal: {
          800: '#1E293B',
          900: '#0F172A',
        },
        cream: {
          50: '#FCFBF7',
          100: '#FAF9F6',
          200: '#F4F2EC',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
