import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f6f7",
          100: "#e7e9ec",
          200: "#cfd5db",
          300: "#aab4bf",
          400: "#7a8898",
          500: "#556476",
          600: "#3f4b5a",
          700: "#313a45",
          800: "#242a33",
          900: "#171b20"
        }
      }
    }
  },
  plugins: []
};

export default config;
