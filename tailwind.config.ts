
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
       colors: {
        background: "#f7f9fb",
        "on-background": "#191c1e",
        surface: "#f7f9fb",
        "on-surface": "#191c1e",
        "on-surface-variant": "#45464d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        outline: "#76777d",
        "outline-variant": "#c6c6cd",
        primary: "#000000",
        secondary: "#0051d5",
        "secondary-container": "#316bf3",
        "secondary-fixed": "#dbe1ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#fefcff",
        "on-secondary-fixed": "#00174b",
      }
    },
  },
  plugins: [],
};
export default config;
