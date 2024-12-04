/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},      // Tailwind CSS configuration
    autoprefixer: {},     // Optional: Add Autoprefixer if needed
  },
};

export default config;