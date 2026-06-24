import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FreshCart "Greengrocer" palette (from the onboarding design system)
        brand: {
          50: "#eafaf0",
          100: "#cdf0db",
          200: "#9fe3bb",
          300: "#63cf90",
          400: "#2fb567",
          500: "#129E47", // primary green
          600: "#0C7A3C", // gradient g1
          700: "#0A5C2E", // gradient g2
          800: "#084A26", // gradient g3
          900: "#063a1e",
        },
        // Warm yellow accent (CTA highlights, success burst)
        accent: {
          50: "#fff8e6",
          100: "#ffefc2",
          200: "#ffe28a",
          300: "#ffd25c",
          400: "#FFD23F",
          500: "#FFC233", // accent
          600: "#f0a90f",
          700: "#c2860a",
          800: "#996a0c",
          900: "#7a5410",
        },
        // FreshCart neutral tokens (greens-leaning, from the design)
        fresh: {
          ink: "#14271B", // primary text on light
          muted: "#5F7065", // secondary text
          faint: "#8A9A8E", // tertiary / hints
          border: "#E3E8E0", // field & card borders
          surface: "#FBFBF6", // light screen background
          field: "#F6F8F3", // empty field fill
          dot: "#CBD5C9", // inactive progress dot
          ink2: "#0A3D1E", // dark green ink (text on yellow)
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Bricolage Grotesque", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        field: "16px",
        btn: "18px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px -6px rgba(0,0,0,0.12)",
        cta: "0 10px 24px rgba(0,0,0,.16)",
        "cta-accent": "0 10px 24px rgba(0,0,0,.22)",
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
