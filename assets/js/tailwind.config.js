tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Orbitron", "serif"],
      },
      colors: {
        primary: "#6366f1",
        secondary: "#ec4899",
        background: "#0B0F19",
        surface: "#1A233A",
      },
      boxShadow: {
        neon: "0 0 20px rgba(99, 102, 241, 0.5)",
        "neon-pink": "0 0 20px rgba(236, 72, 153, 0.5)",
      },
      screens: {
        xs: "450px",
        "2xl": "1600px",
        "3xl": "1920px",
      },
    },
  },
};
