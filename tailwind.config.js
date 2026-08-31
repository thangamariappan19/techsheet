/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./Components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Using <alpha-value> so Tailwind opacity modifiers (bg-primary/10 etc.) work */
        background:  "hsl(var(--background) / <alpha-value>)",
        foreground:  "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT:    "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input:  "hsl(var(--input) / <alpha-value>)",
        ring:   "hsl(var(--ring) / <alpha-value>)",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },

      boxShadow: {
        /* Classic */
        "premium":       "0 4px 20px -2px rgba(0,0,0,0.10), 0 2px 10px -2px rgba(0,0,0,0.05)",
        "premium-hover": "0 10px 40px -4px rgba(0,0,0,0.15), 0 4px 15px -4px rgba(0,0,0,0.10)",
        /* Neon cyan glows */
        "neon-sm":  "0 0 10px hsl(186 100% 50% / 0.30), 0 0 30px hsl(186 100% 50% / 0.10)",
        "neon":     "0 0 20px hsl(186 100% 50% / 0.25), 0 0 60px hsl(186 100% 50% / 0.08)",
        "neon-lg":  "0 0 30px hsl(186 100% 50% / 0.30), 0 0 80px hsl(186 100% 50% / 0.10), 0 0 120px hsl(186 100% 50% / 0.05)",
        /* Card hover */
        "card-hover": "0 12px 40px rgba(0,0,0,0.15), 0 0 60px hsl(186 100% 50% / 0.06)",
        "card-hover-dark": "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px hsl(186 100% 50% / 0.18), 0 0 80px hsl(186 100% 50% / 0.07)",
      },

      animation: {
        "glow-pulse":  "glow-pulse 3s ease-in-out infinite",
        "float":       "float 6s ease-in-out infinite",
        "shimmer":     "shimmer-sweep 4s linear infinite",
        "ping-slow":   "ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite",
        "spin-slow":   "spin 8s linear infinite",
        "scan":        "scan 4s linear infinite",
      },

      keyframes: {
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 15px hsl(186 100% 50% / 0.2)" },
          "50%":      { boxShadow: "0 0 35px hsl(186 100% 50% / 0.45), 0 0 80px hsl(186 100% 50% / 0.1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        "shimmer-sweep": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "ping-slow": {
          "75%,100%": { transform: "scale(2.2)", opacity: "0" },
        },
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },

      backgroundImage: {
        "dot-grid":       "radial-gradient(circle at 1px 1px, hsl(186 100% 50% / 0.055) 1px, transparent 0)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
