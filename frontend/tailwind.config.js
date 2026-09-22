import defaultConfig from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6f46b9",
          deep: "#340075",
          muted: "#75777f",
          darkwood: "#402600",
          amber: "#cd8300",
          peach: "#ffb95f",
        },
      },
      keyframes: {
        "progress-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "progress-slide": "progress-slide 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};
