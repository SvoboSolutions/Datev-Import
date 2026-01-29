/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
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

        /* Accent */
        accent: "#2563eb",
        "accent-hover": "#1e40af",
        "accent-soft": "#eff6ff",
        "accent-foreground": "#ffffff",

        /* Status */
        success: "#15803d",
        warning: "#b45309",
        error: "#b91c1c",
      },
    },
  },
  plugins: [],
};
