/** @type {import('tailwindcss').Config} */
// Todas as cores vêm dos tokens em app/globals.css — nada hardcoded aqui.
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--c-surface) / <alpha-value>)",
          2: "rgb(var(--c-surface-2) / <alpha-value>)",
        },
        ink: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          contrast: "rgb(var(--c-accent-contrast) / <alpha-value>)",
        },
        terra: "rgb(var(--c-terra) / <alpha-value>)",
        bronze: "rgb(var(--c-bronze) / <alpha-value>)",
        line: "rgb(var(--c-border) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        success: "rgb(var(--c-success) / <alpha-value>)",
        warn: "rgb(var(--c-warn) / <alpha-value>)",
      },
      fontSize: {
        // Escala fluida — limites em rem para acompanhar o controle A/A+/A++
        display: [
          "clamp(2.75rem, 1.1rem + 6.2vw, 6.25rem)",
          { lineHeight: "1.0", letterSpacing: "-0.015em" },
        ],
        "display-sm": [
          "clamp(2.125rem, 1.1rem + 3.4vw, 4rem)",
          { lineHeight: "1.06", letterSpacing: "-0.01em" },
        ],
        title: [
          "clamp(1.5rem, 1.1rem + 1.4vw, 2.25rem)",
          { lineHeight: "1.15" },
        ],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
      },
      transitionTimingFunction: {
        base: "var(--ease)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s var(--ease) forwards",
        "fade-in": "fadeIn 0.5s var(--ease) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
