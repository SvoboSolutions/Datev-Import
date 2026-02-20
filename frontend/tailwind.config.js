/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Base */
        bg: "#f1f5f9",
        surface: "#ffffff",
        border: "#d1d5db",

        /* Text */
        primary: "#020617",
        secondary: "#334155",
        muted: "#64748b",

        /* Accent (SKL-ish Lime) */
        accent: "#84cc16",            // lime-500
        "accent-hover": "#4d7c0f",     // lime-700
        "accent-soft": "#f7fee7",      // lime-50
        "accent-foreground": "#0b1220",// dark text on lime

        /* Optional: secondary accent for links (keeps some blue) */
        info: "#2563eb",              // old accent (optional)

        /* Status */
        success: "#15803d",
        warning: "#b45309",
        error: "#b91c1c",
      },
    },
  },
  plugins: [],
};
