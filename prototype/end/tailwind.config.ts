import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Learning City brand palette
        brand: {
          sky: "#7cb8e6",
          mint: "#8fd6b4",
          sun: "#f6c66b",
          coral: "#f4977c",
          cream: "#faf7f0",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(90, 110, 140, 0.15)",
        card: "0 2px 12px -2px rgba(90, 110, 140, 0.12)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 0 rgba(246,198,107,0))" },
          "50%": { filter: "drop-shadow(0 0 10px rgba(246,198,107,0.6))" },
        },
        "walk": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(120px)" },
        },
        "rise": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.4s ease-out",
        "float": "float 4s ease-in-out infinite",
        "glow": "glow 2.5s ease-in-out infinite",
        "walk": "walk 8s linear infinite alternate",
        "rise": "rise 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
