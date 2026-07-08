/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003558',
          dark: '#00243d',
        },
        accent: {
          DEFAULT: '#CE5D2A',
        },
        neutral: {
          DEFAULT: '#676867',
        },
        surface: '#F4F6F8',
      },
    },
  },
  plugins: [],
};
