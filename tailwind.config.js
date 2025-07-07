/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  safelist: ["shadow-blue-glow", "rounded-custom-10", "mt-6"],
  theme: {
    extend: {
      boxShadow: {
        "blue-glow": "0 0 30px rgba(0, 0, 255, 0.6)",
      },
      borderRadius: {
        "custom-10": "10px",
      },
    },
  },
  plugins: [],
};
