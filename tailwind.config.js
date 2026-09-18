/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F7F7F5",
        ink: "#1C1F26",
        primary: { DEFAULT: "#2F5D5A", dark: "#20403E", light: "#DCE8E7" },
        alert: { DEFAULT: "#C1503F", light: "#F5DEDA" },
        line: "#E1E0DB",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
