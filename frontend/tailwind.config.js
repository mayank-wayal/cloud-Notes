/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)",
        surface: "0 16px 50px rgba(2, 6, 23, 0.28)",
        lift: "0 24px 80px rgba(2, 6, 23, 0.36)"
      },
      borderRadius: {
        surface: "0.5rem",
        control: "0.75rem"
      },
      backgroundImage: {
        "surface-primary": "linear-gradient(180deg, rgba(17, 24, 39, 0.82), rgba(15, 23, 42, 0.62))",
        "surface-accent": "linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(14, 165, 233, 0.14), rgba(16, 185, 129, 0.1))",
        "brand-radial": "radial-gradient(circle at 18% 0%, rgba(99, 102, 241, 0.18), transparent 28rem), radial-gradient(circle at 88% 12%, rgba(16, 185, 129, 0.1), transparent 24rem)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        },
        scaleFade: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        floatIn: "floatIn 420ms ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        scaleFade: "scaleFade 180ms ease-out both"
      }
    }
  },
  plugins: []
};
