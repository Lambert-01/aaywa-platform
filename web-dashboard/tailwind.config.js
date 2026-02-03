/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#00A1DE', // Rwanda Blue
            50: '#e0f6ff',
            100: '#b8e9ff',
            200: '#80d9ff',
            300: '#38c5ff',
            400: '#00A1DE',
            500: '#008bbf',
            600: '#006d99',
            700: '#005578',
            800: '#00425e',
            900: '#00364d',
          },
          gold: {
            DEFAULT: '#FFD700', // Sanza Gold
            50: '#fffdf0',
            100: '#fff8c2',
            200: '#fff394',
            300: '#ffeb5c',
            400: '#FFD700',
            500: '#e6c200',
            600: '#b39700',
            700: '#806c00',
            800: '#524500',
            900: '#292200',
          },
          green: {
            DEFAULT: '#22c55e', // Agriculture Green
            50: '#f0fdf4',
            100: '#dcfce7',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          }
        },
        primary: {
          DEFAULT: '#00A1DE', // Default to Blue
          50: '#e0f6ff',
          100: '#b8e9ff',
          200: '#80d9ff',
          300: '#38c5ff',
          400: '#00A1DE',
          500: '#008bbf',
          600: '#006d99',
          700: '#005578',
          800: '#00425e',
          900: '#00364d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }

    },
  },
  plugins: [],
}