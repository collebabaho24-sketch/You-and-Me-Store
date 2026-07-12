import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f9f7",
          100: "#dcefe8",
          200: "#b9dfd1",
          300: "#8bc9b4",
          400: "#5aac93",
          500: "#3b9078",
          600: "#2c7461",
          700: "#265e4f",
          800: "#224c41",
          900: "#1e3f37",
        },
        accent: {
          400: "#f2a154",
          500: "#eb8a2f",
          600: "#d97220",
        },
      },
    },
  },
  plugins: [],
};
export default config;
