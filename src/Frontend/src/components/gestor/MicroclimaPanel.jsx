import { AlertTriangle, CheckCircle2, CloudSun, Cpu, Droplets, OctagonAlert, RefreshCw, SunDim } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState, Spinner } from '../ui/Feedback';
import { Alert } from '../ui/Alert';
import { FAIXAS_IVM, LIMIAR_ATENCAO, LIMIAR_PERIGO } from '../../domain/risco';
import { useContador, useNaTela } from '../../hooks/useAnimacao';

const ICONE_FAIXA = { NORMAL: CheckCircle2, ATENCAO: AlertTriangle, PERIGO: OctagonAlert };

// Cores de risco só aqui (status), sempre com ícone e rótulo.
const ESTILO_FAIXA = {
  NORMAL: 'bg-green-50 text-green-900 ring-green-200 dark:bg-green-950/60 dark:text-green-100 dark:ring-green-900',
  ATENCAO: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:ring-amber-900',
  PERIGO: 'bg-red-50 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-900',
};

const formatoHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const fmt = (v) => (v === null || v === undefined ? '—' : `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);

/* Semicírculo: 0 à esquerda, 100 à direita. */
const CX = 120;
const CY = 120;
const R = 96;
const ponto = (v, r = R) => {
  const a = Math.PI * (1 - v / 100);
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};
const arco = (de, ate) => {
  const [x1, y1] = ponto(de);
  const [x2, y2] = ponto(ate);
  return `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`;
};

/** Medidor semicircular do IVM com as três faixas e o ponteiro na leitura atual. */
function MedidorIvm({ ivm, faixa, ativo }) {
  const valor = useContador(ivm ?? 0, 1200, ivm, ativo);
  const zonas = [
    [0, LIMIAR_ATENCAO, FAIXAS_IVM.NORMAL.cor],
    [LIMIAR_ATENCAO, LIMIAR_PERIGO, FAIXAS_IVM.ATENCAO.cor],
    [LIMIAR_PERIGO, 100, FAIXAS_IVM.PERIGO.cor],
  ];
  const angulo = -90 + (Math.min(100, Math.max(0, valor)) / 100) * 180;
  const IconeFaixa = faixa ? ICONE_FAIXA[faixa.id] : null;
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="-14 0 268 140" className="w-full" aria-hidden="true">
        <path d={arco(0, 100)} fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="18" strokeLinecap="round" />
        {zonas.map(([de, ate, cor]) => (
          <path key={de} d={arco(de + 0.8, ate - 0.8)} fill="none" stroke={cor} strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        ))}
        {[0, LIMIAR_ATENCAO, LIMIAR_PERIGO, 100].map((m) => {
          const [x, y] = ponto(m, R + 20);
          return (
            <text key={m} x={x} y={y + 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold dark:fill-slate-400">
              {m}
            </text>
          );
        })}
        {ivm !== null && (
          <g style={{ transform: `rotate(${angulo}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + 16} className="stroke-slate-900 dark:stroke-white" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        <circle cx={CX} cy={CY} r="9" className="fill-slate-900 dark:fill-white" />
        <circle cx={CX} cy={CY} r="3.5" className="fill-white dark:fill-slate-900" />
      </svg>
      <div className="-mt-4 text-center">
        <p className="text-5xl font-semibold tabular-nums tracking-tight">{ivm === null ? '—' : fmt(Math.round(valor * 10) / 10)}</p>
        {faixa && (
          <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${ESTILO_FAIXA[faixa.id]}`}>
            <IconeFaixa className="h-4 w-4" aria-hidden="true" style={{ color: faixa.cor }} />
            {faixa.rotulo}
          </p>
        )}
      </div>
    </div>
  );
}

function Medida({ icone: Icone, rotulo, valor, ajuda, cor, ativo }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <dt className="flex items-center gap-2 text-sm font-semibold texto-suave">
        <Icone className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
        {rotulo}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{fmt(valor)}</dd>
      <dd className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <span className={`block h-full rounded-full transition-[width] duration-1000 ease-out ${cor}`} style={{ width: ativo && valor != null ? `${valor}%` : '0%' }} />
      </dd>
      {ajuda && <dd className="mt-2 text-xs texto-suave">{ajuda}</dd>}
    </div>
  );
}

/** Monitoramento IoT: última leitura do ESP32 (umidade, insolação e IVM). */
export function MicroclimaPanel({ leitura, carregando, erro, aoAtualizar }) {
  const faixa = leitura?.faixa;
  const [ref, naTela] = useNaTela();

  return (
    <section ref={ref} aria-labelledby="microclima-titulo" className="painel p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
            <Cpu className="h-4 w-4" aria-hidden="true" /> Sensor ESP32
            {leitura && (
              <span className="inline-flex items-center gap-1.5 texto-suave">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                ao vivo
              </span>
            )}
          </p>
          <h2 id="microclima-titulo" className="mt-1 text-2xl font-semibold tracking-tight">
            Microclima da viela
          </h2>
          <p className="mt-1 text-sm texto-suave">
            {leitura?.dataHora ? `Última leitura: ${formatoHora.format(leitura.dataHora)} · atualiza a cada minuto` : 'Umidade e luz medidas no beco'}
          </p>
        </div>
        <Button variante="secundaria" icone={RefreshCw} carregando={carregando} onClick={aoAtualizar}>
          Atualizar
        </Button>
      </div>

      {carregando && !leitura ? (
        <Spinner texto="Buscando leitura do sensor…" />
      ) : !leitura ? (
        <>
          {erro && (
            <Alert tipo="aviso" className="mt-5">
              {erro}
            </Alert>
          )}
          <EmptyState icone={CloudSun} titulo="Sem leitura disponível">
            Quando o sensor enviar dados para a tabela de microclima, o IVM aparece aqui.
          </EmptyState>
        </>
      ) : (
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div role="status" aria-label={`IVM ${fmt(leitura.ivm)}${faixa ? `, ${faixa.rotulo}` : ''}`}>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider texto-suave">IVM · Índice de Vulnerabilidade de Microclima</p>
            <MedidorIvm ivm={leitura.ivm} faixa={faixa} ativo={naTela} />
            {faixa && <p className="mx-auto mt-3 max-w-sm text-center text-sm texto-suave">{faixa.descricao}</p>}
          </div>
          <dl className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Medida
              icone={Droplets}
              rotulo="Umidade relativa"
              valor={leitura.umidade}
              cor="bg-sky-500"
              ajuda="Quanto mais alta, maior o risco."
              ativo={naTela}
            />
            <Medida
              icone={SunDim}
              rotulo="Insolação (luz)"
              valor={leitura.insolacao}
              cor="bg-sol-400"
              ajuda="Quanto menos luz, maior o risco."
              ativo={naTela}
            />
          </dl>
          {leitura.ivmCalculado && <p className="-mt-5 text-xs texto-suave lg:col-start-2">IVM calculado: 0,6 × umidade + 0,4 × (100 − luz).</p>}
        </div>
      )}

      <p className="mt-8 border-t border-slate-200 pt-4 text-xs texto-suave dark:border-slate-800">
        Faixas: Normal abaixo de {LIMIAR_ATENCAO}% · Atenção de {LIMIAR_ATENCAO}% a menos de {LIMIAR_PERIGO}% · Perigo a partir de {LIMIAR_PERIGO}%.
      </p>
    </section>
  );
}
