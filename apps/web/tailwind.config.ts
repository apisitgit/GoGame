import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        parchment: "#f8f5ea",
        moss: "#3f6f4e",
        ember: "#c65f3d",
        skyglass: "#d7ecf1",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans Thai",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;

