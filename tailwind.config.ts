import type { Config } from "tailwindcss";

// Brand direction (AGENTS.md A9): natural, vibrant, authentic. Neutral
// background so the photography carries the page; one vibrant accent;
// bold editorial display type for headlines (per the supplied inspiration).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15130F",
        paper: "#FAF7F2",
        sand: "#EFE9DF",
        line: "#DDD5C7",
        accent: "#E8491C", // warm vermillion — vibrant, matches "bright colours" style copy
        accentDark: "#C23A13",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 11vw, 10rem)", { lineHeight: "0.88", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 7vw, 6rem)", { lineHeight: "0.92", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "0.98", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        content: "1440px",
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
