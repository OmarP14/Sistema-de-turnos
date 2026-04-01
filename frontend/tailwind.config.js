/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        b: {
          bg:      "#0a0a0a",   // negro profundo
          surface: "#111111",   // superficie tarjetas
          card:    "#161616",   // tarjetas
          border:  "#222222",   // bordes sutiles
          red:     "#E8192C",   // rojo barbería
          redDim:  "#7a0d16",   // rojo oscuro
          blue:    "#1E6FD9",   // azul acero
          blueDim: "#0d3470",   // azul oscuro
          white:   "#F8F8F8",   // blanco cálido
          gray:    "#888888",   // texto secundario
          light:   "#CCCCCC",   // texto terciario
        }
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        heading: ["'Oswald'", "sans-serif"],
        body:    ["'Barlow'", "sans-serif"],
      },
      boxShadow: {
        red:  "0 0 20px rgba(232,25,44,0.35), 0 0 60px rgba(232,25,44,0.1)",
        blue: "0 0 20px rgba(30,111,217,0.35), 0 0 60px rgba(30,111,217,0.1)",
        card: "0 4px 24px rgba(0,0,0,0.6)",
      }
    },
  },
  plugins: [],
}
