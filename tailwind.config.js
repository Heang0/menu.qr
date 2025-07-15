// qr-digital-menu-system/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Look for Tailwind classes in all your HTML files in the frontend directory
    "./frontend/**/*.html",
    // If you add any JS files where you dynamically generate class names, add them here too
    "./frontend/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define your custom font families
        // 'sans' will be your primary English font (Inter)
        sans: ['Inter', 'sans-serif'],
        // 'khmer' specifically for Battambang font
        khmer: ['Battambang', 'serif'], // Battambang is a serif-style font
      },
    },
  },
  plugins: [],
}