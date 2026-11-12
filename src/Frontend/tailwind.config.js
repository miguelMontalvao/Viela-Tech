/** Identidade visual oficial do Viela Tech. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Indicadores de risco do IVM (RN do projeto)
        risco: {
          normal: '#16A34A',
          atencao: '#D97706',
          perigo: '#DC2626',
        },
      },
      minHeight: { toque: '48px' },
      minWidth: { toque: '48px' },
    },
  },
  plugins: [],
};
