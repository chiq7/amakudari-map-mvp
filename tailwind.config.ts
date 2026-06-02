
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
       colors: {
        background: "#f8fafc",
        "on-background": "#191c1e",
        surface: "#ffffff",
        "on-surface": "#191c1e",
        "on-surface-variant": "#45464d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        outline: "#76777d",
        "outline-variant": "#c6c6cd",
        primary: "#000000",
        secondary: "#0051d5",
      }
    },
  },
  plugins: [],
};
export default config;

