export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        motiva: ["'Motiva Sans'", "'Nunito Sans'", "Arial", "sans-serif"],
      },
      colors: {
        steam: {
          page: "#1b2838",
          header: "#171a21",
          text: "#c6d4df",
          muted: "#8f98a0",
          link: "#67c1f5",
          dim: "#56707f",
          tag: "#384959",
          green: "#BEEE11",
          greenbg: "#4c6b22",
          price: "#344654",
          panel: "#16202d",
          blue: "#1a9fff",
        },
      },
    },
  },
  plugins: [],
};
