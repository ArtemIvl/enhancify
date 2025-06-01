// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        skeleton: {
          "0%": { backgroundColor: "black" },   // light gray
          "50%": { backgroundColor: "black" },  // darker gray
          "100%": { backgroundColor: "black" }, // light gray
        },
      },
      animation: {
        skeleton: "skeleton 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
