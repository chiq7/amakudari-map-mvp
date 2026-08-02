
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f7f3",
        "on-background": "#17201d",
        surface: "#fbfcf9",
        "on-surface": "#17201d",
        "on-surface-variant": "#52605b",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ee",
        "surface-container": "#e8ede7",
        "surface-container-high": "#e0e7df",
        "surface-container-highest": "#d5ded6",
        outline: "#75827d",
        "outline-variant": "#d6ded8",
        primary: "#173a33",
        secondary: "#08705a",
        "secondary-container": "#0b8067",
        "secondary-fixed": "#d8f1e8",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#ffffff",
        "on-secondary-fixed": "#123c32",
        accent: "#c96f28",
        "accent-soft": "#fff0df",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(26, 52, 44, 0.08)",
        card: "0 8px 24px rgba(26, 52, 44, 0.06)",
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
