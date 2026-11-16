import { useMemo, useState } from 'react';
import { Activity, FlaskConical } from 'lucide-react';

// Hipótese didática local: a taxa não existe no modelo Python atual e não é
// uma estimativa clínica/epidemiológica validada.
function calcularTaxa(temperatura, umidade) {
  return 0.01 + Math.max(0, temperatura - 20) * 0.001 + Math.max(0, umidade - 60) * 0.0005;
}

function classificarFator(fator) {
  if (fator >= 2) return { nome: 'Crítico', classe: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100' };
  if (fator >= 1.5) return { nome: 'Alto', classe: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100' };
  if (fator >= 1.2) return { nome: 'Moderado', classe: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100' };
  return { nome: 'Baixo', classe: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100' };
}

export function BacterialSimulator({ leitura }) {
  const [horas, setHoras] = useState(0);
  const temperatura = Number.isFinite(leitura?.temperatura) ? leitura.temperatura : 27;
  const umidade = Number.isFinite(leitura?.umidade) ? leitura.umidade : 72;
  const taxa = useMemo(() => calcularTaxa(temperatura, umidade), [temperatura, umidade]);
  const fator = Math.exp(taxa * horas);
  const risco = classificarFator(fator);
  const pontos = Array.from({ length: 25 }, (_, h) => ({ h, valor: Math.exp(taxa * h) }));
  const max = Math.exp(taxa * 24);
  const path = pontos.map(({ h, valor }) => `${(h / 24) * 100},${100 - ((valor - 1) / (max - 1 || 1)) * 100}`).join(' ');

  return (
    <section className="painel p-6 sm:p-8" aria-labelledby="simulador-titulo">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-sky-100 p-3 text-sky-800 dark:bg-sky-950 dark:text-sky-200"><FlaskConical aria-hidden="true" /></span>
        <div><p className="text-sm font-medium text-sky-700 dark:text-sky-400">Projeção educativa · 24 horas</p><h2 id="simulador-titulo" className="text-2xl font-semibold">Máquina do tempo bacteriana</h2></div>
      </div>
      <p className="mt-4 text-sm texto-suave">Cenário sem ventilação ou limpeza: temperatura {temperatura} °C{leitura?.temperatura == null ? ' (simulada)' : ''} e umidade {umidade}%{leitura?.umidade == null ? ' (simulada)' : ''}.</p>
      <label htmlFor="tempo-simulacao" className="mt-6 block font-semibold">{horas === 0 ? 'Agora' : `Em ${horas}h`}</label>
      <input id="tempo-simulacao" className="deslizante mt-4 w-full accent-sky-700" type="range" min="0" max="24" step="1" value={horas} onChange={(event) => setHoras(Number(event.target.value))} aria-valuetext={`${horas} horas`} />
      <div className="flex justify-between text-xs texto-suave"><span>0h · Agora</span><span>24h</span></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><p className="text-sm texto-suave">Taxa estimada r</p><p className="mt-1 text-xl font-semibold">{taxa.toFixed(4)} h⁻¹</p></div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><p className="text-sm texto-suave">Fator do modelo</p><p className="mt-1 text-xl font-semibold">{fator.toFixed(2)}×</p></div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><p className="text-sm texto-suave">Faixa da projeção</p><span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${risco.classe}`}>{risco.nome}</span></div>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-sky-700" aria-hidden="true" />Progressão projetada</div>
        <svg className="mt-3 h-28 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Curva de crescimento exponencial estimado, fator ${fator.toFixed(2)} em ${horas} horas`}><polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="text-sky-600" /><circle cx={(horas / 24) * 100} cy={100 - ((fator - 1) / (max - 1 || 1)) * 100} r="2.5" fill="currentColor" className="text-emerald-600" /></svg>
        <div className="flex justify-between text-xs texto-suave"><span>Agora</span><span>24 horas</span></div>
      </div>
      <p className="mt-4 text-xs texto-suave">Modelo didático N(t) = N₀ · eʳᵗ, com r = 0,01 + 0,001·máx(T−20, 0) + 0,0005·máx(U−60, 0) por hora. Essa fórmula não está no módulo Python e não representa risco real de tuberculose; serve apenas para explorar um cenário simplificado.</p>
    </section>
  );
}
