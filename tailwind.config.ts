import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#FAF9F6",
          surface: "#FFFFFF",
          border: "#E6E4E0",
          text: "#1A1A1A",
          muted: "#6B6B6B",
          orange: "#E07A2F",
          "orange-hover": "#C96A28",
          accent: "#F5F0EB",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.06)",
        card: "0 2px 12px rgba(0,0,0,0.06)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
