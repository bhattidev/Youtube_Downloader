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
        'youtube-red': '#ff0000',
        'youtube-red-hover': '#cc0000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 