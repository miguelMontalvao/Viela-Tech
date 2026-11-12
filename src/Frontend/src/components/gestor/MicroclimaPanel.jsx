import { AlertTriangle, CheckCircle2, CloudSun, Droplets, OctagonAlert, RefreshCw, SunDim } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState, Spinner } from '../ui/Feedback';
import { Alert } from '../ui/Alert';
import { FAIXAS_IVM, LIMIAR_ATENCAO, LIMIAR_PERIGO } from '../../domain/risco';

const ICONE_FAIXA = { NORMAL: CheckCircle2, ATENCAO: AlertTriangle, PERIGO: OctagonAlert };

// Fundo suave + texto escuro da mesma família: legível sob sol e no tema escuro.
const ESTILO_FAIXA = {
  NORMAL: 'border-[#16A34A] bg-green-50 text-green-900 dark:bg-green-950/60 dark:text-green-100',
  ATENCAO: 'border-[#D97706] bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100',
  PERIGO: 'border-[#DC2626] bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100',
};

const formatoHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const fmt = (v) => (v === null || v === undefined ? '—' : `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);

/** Escala semafórica do IVM com marcador da leitura atual. */
function IvmGauge({ ivm }) {
  const zonas = [
    { de: 0, ate: LIMIAR_ATENCAO, cor: FAIXAS_IVM.NORMAL.cor },
    { de: LIMIAR_ATENCAO, ate: LIMIAR_PERIGO, cor: FAIXAS_IVM.ATENCAO.cor },
    { de: LIMIAR_PERIGO, ate: 100, cor: FAIXAS_IVM.PERIGO.cor },
  ];
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="relative">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {zonas.map((z) => (
            <span key={z.de} style={{ width: `${z.ate - z.de}%`, backgroundColor: z.cor }} />
          ))}
        </div>
        {ivm !== null && (
          <span
            className="absolute -top-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-slate-900 shadow dark:border-slate-800 dark:bg-white"
            style={{ left: `${ivm}%` }}
          />
        )}
      </div>
      <div className="relative mt-2 h-4 text-xs font-semibold">
        {[0, LIMIAR_ATENCAO, LIMIAR_PERIGO, 100].map((marca) => (
          <span
            key={marca}
            className={`absolute ${marca === 0 ? '' : marca === 100 ? '-translate-x-full' : '-translate-x-1/2'}`}
            style={{ left: `${marca}%` }}
          >
            {marca}
          </span>
        ))}
      </div>
    </div>
  );
}

function Medida({ icone: Icone, rotulo, valor, ajuda }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <dt className="flex items-center gap-2 text-sm font-semibold texto-suave">
        <Icone className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
        {rotulo}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{valor}</dd>
      {ajuda && <dd className="mt-0.5 text-xs texto-suave">{ajuda}</dd>}
    </div>
  );
}

/** Monitoramento IoT: última leitura do ESP32 (umidade, insolação e IVM). */
export function MicroclimaPanel({ leitura, carregando, erro, aoAtualizar }) {
  const faixa = leitura?.faixa;
  const IconeFaixa = faixa ? ICONE_FAIXA[faixa.id] : null;

  return (
    <section aria-labelledby="microclima-titulo" className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="microclima-titulo" className="text-xl font-semibold">
            Microclima da viela
          </h2>
          <p className="mt-0.5 text-sm texto-suave">
            {leitura?.dataHora ? `Última leitura do sensor: ${formatoHora.format(leitura.dataHora)}` : 'Sensor ESP32 (umidade e luz)'}
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
          {erro && <Alert tipo="aviso" className="mt-5">{erro}</Alert>}
          <EmptyState icone={CloudSun} titulo="Sem leitura disponível">
            Quando o sensor enviar dados para a tabela de microclima, o IVM aparece aqui.
          </EmptyState>
        </>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className={`rounded-2xl border-l-8 p-5 ${faixa ? ESTILO_FAIXA[faixa.id] : 'border-slate-300'}`} role="status">
            <p className="text-sm font-semibold uppercase tracking-wider">IVM · Índice de Vulnerabilidade de Microclima</p>
            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="text-5xl font-semibold tabular-nums tracking-tight">{fmt(leitura.ivm)}</p>
              {faixa && (
                <p className="mb-1 inline-flex items-center gap-1.5 text-xl font-semibold">
                  <IconeFaixa className="h-6 w-6" aria-hidden="true" style={{ color: faixa.cor }} />
                  {faixa.rotulo}
                </p>
              )}
            </div>
            {faixa && <p className="mt-2 font-medium">{faixa.descricao}</p>}
            <IvmGauge ivm={leitura.ivm} />
            {leitura.ivmCalculado && (
              <p className="mt-3 text-xs">Calculado a partir da umidade e da insolação (0,6·U + 0,4·(100 − I)).</p>
            )}
          </div>
          <dl className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Medida icone={Droplets} rotulo="Umidade relativa" valor={fmt(leitura.umidade)} ajuda="Quanto mais alta, maior o risco." />
            <Medida icone={SunDim} rotulo="Insolação (luz)" valor={fmt(leitura.insolacao)} ajuda="Quanto menos luz, maior o risco." />
          </dl>
        </div>
      )}

      <p className="mt-5 text-xs texto-suave">
        Faixas: Normal abaixo de 40% · Atenção de 40% a menos de 70% · Perigo a partir de 70%.
      </p>
    </section>
  );
}
