import { BAIRROS, VIEWBOX } from '../../data/rioBairros';
import { AREAS_PLANEJAMENTO } from '../../data/tuberculoseRio';
import { CLASSES } from '../mapa/MapaTematico';

const AP_DO_RP = Object.fromEntries(AREAS_PLANEJAMENTO.flatMap((a) => a.rps.map((rp) => [rp, a])));
const ROCINHA = BAIRROS.find((b) => b.id === 'rocinha');
const classe = (t) => CLASSES.find((c) => t <= c.ate);

/** Versão compacta do mapa temático para a Home (carregada só quando aparece). */
export default function MiniMapa() {
  return (
    <svg viewBox={`0 0 ${VIEWBOX.largura} ${VIEWBOX.altura}`} className="h-auto w-full animate-surgir" aria-hidden="true">
      {BAIRROS.filter((b) => b.id !== 'rocinha').map((b) => (
        <path key={b.id} d={b.d} className={`stroke-white dark:stroke-slate-900 ${classe(AP_DO_RP[b.rp].taxa).fill}`} strokeWidth={0.5} />
      ))}
      <circle cx={ROCINHA.cx} cy={ROCINHA.cy} r="18" className="fill-tijolo-500/30 motion-safe:animate-ping" style={{ transformOrigin: `${ROCINHA.cx}px ${ROCINHA.cy}px`, transformBox: 'view-box' }} />
      <path d={ROCINHA.d} className="fill-tijolo-500 stroke-white dark:stroke-slate-950" strokeWidth={1.5} />
    </svg>
  );
}
