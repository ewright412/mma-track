import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060b18",
        card: "#0a1225",
        "card-elevated": "#0f1d36",
        border: "rgba(100, 140, 255, 0.08)",
        accent: {
          DEFAULT: "#2563eb",
          red: "#ef4444",
          blue: "#3b82f6",
        },
        success: "#22c55e",
        warning: "#f59e0b",
      },
      borderRadius: {
        card: "8px",
        button: "6px",
        input: "4px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
