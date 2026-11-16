/* Enfeites cariocas: divisor do calçadão, bandeirinhas e selo de letreiro. Todos decorativos. */

/** Faixa com as ondas do calçadão (Copacabana), usada como divisor de seção. */
export function OndasCalcadao({ className = '', clara = false }) {
  return (
    <div
      aria-hidden="true"
      className={`h-6 w-full ${clara ? 'textura-calcadao-clara' : 'textura-calcadao bg-white dark:bg-slate-200'} ${className}`}
    />
  );
}

const CORES_BANDEIRA = [
  'fill-sky-500',
  'fill-sol-400',
  'fill-emerald-500',
  'fill-laje-400',
  'fill-tijolo-400',
  'fill-mar-400',
];

/** Varal de bandeirinhas, como nas festas de laje. */
export function Bandeirinhas({ className = '', quantidade = 14 }) {
  const passo = 600 / quantidade;
  return (
    <svg viewBox="0 0 600 46" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path d="M0 6Q300 30 600 6" className="stroke-slate-700 dark:stroke-slate-400" strokeWidth="1.5" fill="none" />
      {Array.from({ length: quantidade }, (_, i) => {
        const x = i * passo + passo / 2;
        const t = x / 600;
        const y = 6 + 24 * 4 * t * (1 - t) * 0.98;
        return (
          <path
            key={i}
            d={`M${x - 11} ${y}L${x + 11} ${y}L${x + 11} ${y + 18}L${x} ${y + 12}L${x - 11} ${y + 18}Z`}
            className={CORES_BANDEIRA[i % CORES_BANDEIRA.length]}
          />
        );
      })}
    </svg>
  );
}

const TONS_SELO = {
  sol: 'bg-sol-300 text-slate-900',
  verde: 'bg-emerald-300 text-slate-900',
  azul: 'bg-sky-300 text-slate-900',
  rosa: 'bg-laje-100 text-slate-900',
  branco: 'bg-white text-slate-900',
};

/** Selo inclinado, no estilo das placas pintadas à mão. */
export function Selo({ children, tom = 'sol', inclinacao = '-rotate-2', className = '' }) {
  return <span className={`selo ${TONS_SELO[tom]} ${inclinacao} ${className}`}>{children}</span>;
}
