import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: {
        // Colores personalizados para modo oscuro - imitando el ERP de la imagen
        'dark-bg': '#0a0a0a',           // Fondo principal muy oscuro
        'dark-card': '#1a1a1a',         // Cards y elementos ligeramente más claros
        'dark-sidebar': '#0a0a0a',      // Sidebar mismo tono que el fondo
        'dark-border': '#2a2a2a',       // Bordes sutiles
        'dark-text': '#ffffff',         // Texto principal blanco
        'dark-text-secondary': '#a0a0a0', // Texto secundario gris claro
        'dark-accent': '#10b981',       // Verde para elementos activos/primarios
        'dark-danger': '#ef4444',       // Rojo para elementos críticos
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
