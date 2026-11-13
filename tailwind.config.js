/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          150: "#efefed",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
        sage: {
          50: "#f3f6f3",
          100: "#e3ebe3",
          200: "#c7d7c7",
          300: "#a2bca2",
          400: "#7a9d7a",
          500: "#5c8259",
          600: "#476945",
          700: "#3a5438",
          800: "#30442f",
          900: "#283828",
        },
        clay: {
          50: "#fbf6f1",
          100: "#f4e8dc",
          200: "#e8cdb2",
          300: "#d9ab80",
          400: "#c9895a",
          500: "#bb7140",
          600: "#a35c34",
          700: "#86482d",
          800: "#6d3c2a",
          900: "#5a3325",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(28, 25, 23, 0.06)",
        card: "0 4px 20px rgba(28, 25, 23, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
