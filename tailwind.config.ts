import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'mdx': '860px',
      'lg': '1024px',
      'lg2': '1170px',
      'sxl': '1200px',
      'xl': '1280px',
      'xl2': '1400px',
      '2xl': '1536px',
      'xs': '450px', 
      'xs2': '600px', 
      'xxs': '395px',
    },
    extend: {
      fontFamily: {
        estedad: 'Estedad',
        iranyekan: ['IRANYekan', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
