// tailwind.config.js
// const { nextui } = require( '@nextui-org/react' )
import { nextui } from '@nextui-org/react'

console.log( 'what?' )

/** @type {import('tailwindcss').Config} */
const setting = {
  content: [
    // ...
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [nextui()],
}

module.exports = setting
