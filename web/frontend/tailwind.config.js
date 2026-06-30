/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ledger: {
          ink: "#0B1F3A",      // navy profond - fond panneaux / texte sur clair
          paper: "#F7F5F0",    // off-white - fond principal
          line: "#D8D2C2",     // hairlines / dividers
          emerald: "#1F7A53",  // accent positif / actions
          gold: "#C9A227",     // accent secondaire / highlights
          slate: "#5B6472",    // texte secondaire
          rose: "#9A3B3B",     // erreurs / négatif
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};
