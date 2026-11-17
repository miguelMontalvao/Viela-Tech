/*
 * Ilustração do morro: casas empilhadas em cores de laje e tijolo, caixas d'água,
 * escadaria, fiação e o sol. Puro SVG (sem imagem), leve e decorativo.
 */

// Paleta das fachadas (decorativa; nenhuma cor de risco)
const CORES = {
  azul: 'fill-sky-500 dark:fill-sky-700',
  azulEsc: 'fill-sky-700 dark:fill-sky-900',
  verde: 'fill-emerald-500 dark:fill-emerald-700',
  tijolo: 'fill-tijolo-600 dark:fill-tijolo-700',
  tijoloClaro: 'fill-tijolo-400 dark:fill-tijolo-600',
  rosa: 'fill-laje-400 dark:fill-laje-700',
  sol: 'fill-sol-300 dark:fill-sol-900',
  mar: 'fill-mar-600 dark:fill-mar-700',
  branco: 'fill-white dark:fill-slate-600',
  cinza: 'fill-slate-300 dark:fill-slate-700',
};

// [x, y, largura, altura, cor] — de trás para frente, subindo o morro
const CASAS = [
  [560, 70, 46, 40, 'branco'], [604, 58, 40, 52, 'rosa'], [642, 76, 52, 34, 'cinza'], [520, 92, 44, 30, 'tijoloClaro'],
  [690, 90, 44, 32, 'sol'], [470, 108, 54, 40, 'azul'], [730, 104, 50, 44, 'tijolo'], [420, 128, 52, 42, 'tijolo'],
  [776, 118, 58, 40, 'verde'], [376, 150, 48, 40, 'sol'], [830, 140, 46, 48, 'branco'], [520, 122, 60, 46, 'mar'],
  [578, 108, 56, 60, 'tijolo'], [632, 112, 50, 56, 'azulEsc'], [680, 120, 54, 48, 'rosa'], [330, 172, 50, 40, 'rosa'],
  [872, 160, 56, 40, 'tijoloClaro'], [460, 146, 64, 48, 'branco'], [730, 146, 60, 52, 'sol'], [280, 192, 54, 44, 'azul'],
  [920, 176, 50, 52, 'verde'], [382, 186, 70, 50, 'tijolo'], [520, 166, 58, 58, 'rosa'], [576, 166, 70, 54, 'cinza'],
  [644, 166, 62, 56, 'verde'], [786, 182, 66, 48, 'azul'], [230, 214, 56, 50, 'sol'], [966, 200, 60, 48, 'tijolo'],
  [450, 192, 72, 56, 'azulEsc'], [702, 196, 82, 54, 'tijoloClaro'], [846, 198, 70, 52, 'rosa'], [176, 238, 60, 52, 'tijolo'],
  [1020, 222, 64, 50, 'sol'], [320, 228, 76, 56, 'verde'], [394, 236, 64, 52, 'branco'], [560, 220, 90, 60, 'tijolo'],
  [646, 226, 64, 56, 'sol'], [910, 226, 76, 56, 'azul'], [120, 262, 64, 48, 'rosa'], [1076, 246, 66, 48, 'verde'],
  [250, 262, 78, 52, 'tijoloClaro'], [460, 248, 98, 60, 'rosa'], [710, 250, 96, 56, 'mar'], [800, 244, 110, 64, 'tijolo'],
  [60, 282, 70, 40, 'azul'], [1134, 268, 70, 46, 'tijolo'], [330, 278, 132, 46, 'azulEsc'], [980, 270, 100, 50, 'branco'],
];

// Caixas d'água sobre as lajes
const CAIXAS = [[580, 62], [742, 98], [470, 102], [926, 170], [600, 102], [404, 180], [866, 192], [258, 208], [1036, 216], [700, 190], [326, 222]];

function Janelas({ x, y, w, h }) {
  const cols = Math.max(1, Math.floor((w - 10) / 16));
  const linhas = Math.max(1, Math.floor((h - 10) / 18));
  const itens = [];
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < linhas; j += 1) {
      // padrão determinístico: algumas janelas acesas
      const acesa = (x + y + i * 7 + j * 13) % 5 === 0;
      itens.push(
        <rect
          key={`${i}-${j}`}
          x={x + 6 + i * 16}
          y={y + 7 + j * 18}
          width="8"
          height="9"
          rx="1.5"
          className={acesa ? 'fill-sol-300 dark:fill-sol-400' : 'fill-slate-900/25 dark:fill-black/40'}
        />,
      );
    }
  }
  return itens;
}

export function SkylineFavela({ className = '', comSol = true }) {
  return (
    <svg viewBox="0 0 1200 330" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true" focusable="false">
      {comSol && (
        <g>
          <circle cx="980" cy="70" r="46" className="fill-sol-300 dark:fill-sol-400" opacity="0.95" />
          <circle cx="980" cy="70" r="70" className="fill-sol-300 dark:fill-sol-400" opacity="0.18" />
        </g>
      )}
      {/* encosta do morro */}
      <path d="M0 330V280C140 240 230 170 380 140S560 40 640 50s170 70 260 110 220 70 300 90V330Z" className="fill-emerald-700/20 dark:fill-emerald-400/10" />
      {CASAS.map(([x, y, w, h, cor], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="2" className={CORES[cor]} />
          <rect x={x - 2} y={y - 4} width={w + 4} height="5" rx="1" className="fill-slate-900/20 dark:fill-black/40" />
          <Janelas x={x} y={y} w={w} h={h} />
        </g>
      ))}
      {CAIXAS.map(([x, y], i) => (
        <g key={`c${i}`}>
          <rect x={x} y={y - 12} width="18" height="12" rx="3" className="fill-sky-800 dark:fill-sky-600" />
          <rect x={x - 1} y={y - 14} width="20" height="3" rx="1.5" className="fill-sky-900 dark:fill-sky-500" />
        </g>
      ))}
      {/* fiação */}
      <g className="stroke-slate-900/50 dark:stroke-slate-300/40" fill="none" strokeWidth="1.5">
        <path d="M0 250C120 268 200 230 300 236S480 210 560 214" />
        <path d="M540 150c60 18 110 6 160 14s110 30 170 26" />
        <path d="M640 210c80 16 160-4 240 10s180 26 320 14" />
        <path d="M60 300c140-20 260 4 400-10" />
      </g>
      {/* escadaria */}
      <path d="M664 330l12-10h14l12-10h14l12-10h14" className="stroke-white/80 dark:stroke-slate-400/60" fill="none" strokeWidth="3" />
      <rect y="318" width="1200" height="12" className="fill-slate-900 dark:fill-black/60" />
    </svg>
  );
}
