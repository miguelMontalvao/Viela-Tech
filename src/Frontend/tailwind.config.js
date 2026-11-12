/**
 * Identidade visual do Viela Tech.
 * Base oficial: Azul Saúde Cívica (sky-600) e Verde Esmeralda (emerald-600) sobre slate.
 * Acentos cariocas (sol, tijolo, laje, mar) são decorativos: nunca indicam risco.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Indicadores de risco do IVM (regra de negócio). Uso exclusivo para status.
        risco: {
          normal: '#16A34A',
          atencao: '#D97706',
          perigo: '#DC2626',
        },
        // Acentos da paisagem carioca
        sol: { 100: '#FEF3C7', 300: '#FCD34D', 400: '#FBBF24', 900: '#78350F' },
        tijolo: { 50: '#FFF7ED', 100: '#FFEDD5', 400: '#FB923C', 600: '#C2410C', 700: '#9A3412', 900: '#431407' },
        laje: { 50: '#FDF2F8', 100: '#FCE7F3', 400: '#F472B6', 600: '#DB2777', 700: '#BE185D', 900: '#500724' },
        mar: { 50: '#ECFEFF', 100: '#CFFAFE', 400: '#22D3EE', 600: '#0E7490', 700: '#155E75', 900: '#083344' },
        noite: '#0B1222',
      },
      minHeight: { toque: '48px' },
      minWidth: { toque: '48px' },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        cartao: '0 1px 2px rgb(15 23 42 / 0.04)',
        flutuante: '0 12px 32px -16px rgb(15 23 42 / 0.18)',
        selo: 'none',
      },
      keyframes: {
        balanco: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        nascer: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        balanco: 'balanco 6s ease-in-out infinite',
        nascer: 'nascer 0.7s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
