// eslint-disable-next-line @typescript-eslint/no-var-requires
const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./modules/renderer/**/*.{html,jsx,tsx}', './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        sidebar: '250px'
      }
    }
  },
  darkMode: 'class',
  plugins: [nextui()]
};
