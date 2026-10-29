import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#d4af37",
          black: "#050505",
          dark: "#0d0d0d",
          card: "#121212",
          text: "#ffffff",
          muted: "#b7b7b7",
          border: "#302919",
        },
      },
    },
  },
  plugins: [],
};
export default config;
