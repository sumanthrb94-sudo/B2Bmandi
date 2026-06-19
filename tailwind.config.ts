import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ninjacart-inspired fresh-produce palette
        brand: {
          50: "#effdf4",
          100: "#d8fbe5",
          200: "#b3f5cd",
          300: "#79eaa8",
          400: "#3dd67d",
          500: "#16bd5f", // primary green
          600: "#0a9a4b",
          700: "#0a793e",
          800: "#0d5f34",
          900: "#0c4e2d",
        },
        accent: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdca8",
          300: "#ffc270",
          400: "#ff9d37",
          500: "#ff8014", // orange accent
          600: "#f0640a",
          700: "#c74a0b",
          800: "#9e3a11",
          900: "#7f3212",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Onboarding type system (self-hosted via next/font)
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px -6px rgba(0,0,0,0.12)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pop: {
          "0%": { transform: "scale(.4)", opacity: "0" },
          "70%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 4.5s ease-in-out infinite",
        "floaty-slow": "floaty 6.5s ease-in-out infinite 1.2s",
        pop: "pop .7s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
