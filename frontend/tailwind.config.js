/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#4a2545",
          burgundy: "#8c1c40",
          cherry: "#c71543",
          orange: "#f05b32",
          yellow: "#f9b21a",
          darkbg: "#121212",
          darkcard: "#1e1e1e",
          darkborder: "#2d2d2d",
          headerRed: "#dc2626", // Un rojo intenso para el header
          lightBgSoft: "#FFF6F0", // Un blanco grisáceo suave, menos "encandilante"
        },
      },
    },
  },
  plugins: [],
};
