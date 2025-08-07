/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryLight: "#7765DA",
        primary: "#5767D0",
        primaryDark: "#4F0DCE",
        backgroundLight: "#F2F2F2",
        textDark: "#373737",
        textGray: "#6E6E6E",
      },
    },
  },
  plugins: [],
};
