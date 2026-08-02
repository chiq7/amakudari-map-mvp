
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f3ec",
        "on-background": "#182033",
        surface: "#fbf8f2",
        "on-surface": "#182033",
        "on-surface-variant": "#5f6270",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1ece3",
        "surface-container": "#e9e1d5",
        "surface-container-high": "#ded5c9",
        "surface-container-highest": "#d3c8ba",
        outline: "#81828b",
        "outline-variant": "#ddd6cd",
        primary: "#182033",
        secondary: "#3559a8",
        "secondary-container": "#29498f",
        "secondary-fixed": "#e6ebfa",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#ffffff",
        "on-secondary-fixed": "#263b72",
        accent: "#d7604f",
        "accent-soft": "#fbe6df",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(24, 32, 51, 0.10)",
        card: "0 8px 24px rgba(24, 32, 51, 0.07)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
