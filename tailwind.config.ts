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
        background: "#0f0f13",
        card: "#1a1a24",
        "card-elevated": "#252530",
        border: "rgba(255,255,255,0.08)",
        accent: {
          DEFAULT: "#ef4444",
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
