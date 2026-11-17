import { useId, useMemo, useState } from 'react';
import { Activity, FlaskConical, Info } from 'lucide-react';
import { ESTILO_FAIXA, ICONE_FAIXA } from '../ui/faixas';
import {
  HORAS_SIMULADAS,
  LIMIAR_FATOR_ATENCAO,
  LIMIAR_FATOR_PERIGO,
  classificarFator,
  curvaCrescimento,
  fatorCrescimento,
  formatoNumero,
  montarCenario,
  taxaCrescimento,
} from '../../domain/simulacao';

/**
 * Simulador temporal (US-16): projeta um cenário didático de 0 a 24 h a partir do microclima.
 * Toda a lógica está em domain/simulacao.js (testada); aqui só há apresentação e o estado do controle.
 */
export function BacterialSimulator({ leitura }) {
  const [horas, setHoras] = useState(0);
  const idDescricao = useId();
  const cenario = useMemo(() => montarCenario(leitura), [leitura]);
  const taxa = useMemo(() => taxaCrescimento(cenario.temperatura, cenario.umidade), [cenario]);
  const curva = useMemo(() => curvaCrescimento(taxa), [taxa]);
  const fator = fatorCrescimento(taxa, horas);
  const faixa = classificarFator(fator);
  const IconeFaixa = ICONE_FAIXA[faixa.id];
  const maximo = curva[curva.length - 1].fator;
  const y = (valor) => 100 - ((valor - 1) / (maximo - 1 || 1)) * 100;
  const pontos = curva.map(({ h, fator: f }) => `${(h / HORAS_SIMULADAS) * 100},${y(f)}`).join(' ');
  const progresso = (horas / HORAS_SIMULADAS) * 100;

  return (
    <section className="painel p-6 sm:p-8" aria-labelledby="simulador-titulo">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-sky-100 p-3 text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          <FlaskConical aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Cenário didático · 24 horas</p>
          <h2 id="simulador-titulo" className="text-2xl font-semibold">
            Máquina do tempo do microclima
          </h2>
        </div>
      </div>

      {cenario.algumSimulado && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/50 dark:text-amber-50">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {cenario.semLeitura
            ? 'Sem leitura do sensor: todos os valores abaixo são simulados.'
            : 'O sensor não enviou todos os campos; os valores marcados como (simulado) completam o cenário.'}
        </p>
      )}

      <p id={idDescricao} className="mt-4 text-sm texto-suave">
        Cenário sem ventilação nem limpeza, com temperatura de {formatoNumero(cenario.temperatura)} °C
        {cenario.simulados.temperatura ? ' (simulado)' : ''} e umidade de {formatoNumero(cenario.umidade)}%
        {cenario.simulados.umidade ? ' (simulado)' : ''}. Arraste para ver como o fator do modelo evolui.
      </p>

      <label htmlFor="tempo-simulacao" className="mt-6 block font-semibold">
        Horas à frente: <span className="tabular-nums">{horas === 0 ? 'agora' : `${horas} h`}</span>
      </label>
      <input
        id="tempo-simulacao"
        className="deslizante mt-4 w-full"
        style={{ background: `linear-gradient(to right, #0284c7 ${progresso}%, rgb(203 213 225) ${progresso}%)` }}
        type="range"
        min="0"
        max={HORAS_SIMULADAS}
        step="1"
        value={horas}
        onChange={(event) => setHoras(Number(event.target.value))}
        aria-valuetext={horas === 0 ? 'agora' : `${horas} horas à frente`}
        aria-describedby={idDescricao}
      />
      <div className="mt-1 flex justify-between text-xs texto-suave" aria-hidden="true">
        <span>Agora</span>
        <span>24 h</span>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <dt className="text-sm texto-suave">Taxa do modelo (r)</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{formatoNumero(taxa, 4)} por hora</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <dt className="text-sm texto-suave">Fator em {horas} h</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{formatoNumero(fator, 2)}×</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <dt className="text-sm texto-suave">Faixa da projeção</dt>
          <dd className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${ESTILO_FAIXA[faixa.id]}`}>
            <IconeFaixa className="h-4 w-4" aria-hidden="true" style={{ color: faixa.cor }} />
            {faixa.rotulo}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
          Progressão projetada
        </div>
        <svg
          className="mt-3 h-28 w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Curva exponencial do cenário: fator ${formatoNumero(fator, 2)} em ${horas} horas, chegando a ${formatoNumero(maximo, 2)} em 24 horas.`}
        >
          <polyline points={pontos} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="text-sky-600 dark:text-sky-400" />
          <circle cx={(horas / HORAS_SIMULADAS) * 100} cy={y(fator)} r="2.5" fill={faixa.cor} />
        </svg>
        <div className="flex justify-between text-xs texto-suave" aria-hidden="true">
          <span>Agora</span>
          <span>24 horas</span>
        </div>
      </div>

      <p className="mt-4 text-xs texto-suave">
        Modelo ilustrativo N(t) = N₀ · eʳᵗ, com r = 0,01 + 0,001·máx(T − 20, 0) + 0,0005·máx(U − 60, 0) por hora. Faixas: Normal abaixo de{' '}
        {formatoNumero(LIMIAR_FATOR_ATENCAO)}× · Atenção até {formatoNumero(LIMIAR_FATOR_PERIGO)}× · Perigo a partir de {formatoNumero(LIMIAR_FATOR_PERIGO)}×. A fórmula é uma
        hipótese didática, sem calibração científica: não mede bactérias nem o risco de tuberculose. O indicador oficial do projeto é o IVM.
      </p>
    </section>
  );
}
