/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f172a", // slate-900
        darkCard: "rgba(30, 41, 59, 0.7)", // slate-800 with opacity for glassmorphism
        accentBlue: "#3b82f6", // blue-500
        accentGreen: "#10b981", // emerald-500
        accentAmber: "#f59e0b", // amber-500
      }
    },
  },
  plugins: [],
}
