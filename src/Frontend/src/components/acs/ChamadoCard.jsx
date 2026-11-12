import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarClock, CloudOff, Droplets, MapPin, Siren, Thermometer } from 'lucide-react';
import { Button } from '../ui/Button';
import { EtapasAtendimento } from '../painel/Painel';
import { LIMITE_TOSSE_DIAS, ehUrgente } from '../../domain/risco';
import { estaFinalizado, idDoChamado, proximasAcoes, rotuloStatus, STATUS } from '../../domain/chamados';
import { iniciais } from '../../domain/cadastro';

const ESTILO_STATUS = {
  [STATUS.PENDENTE]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  [STATUS.EM_ANDAMENTO]: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
  [STATUS.COLETADO]: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  [STATUS.CONCLUIDO]: 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-slate-950',
};

const ESCALA_DIAS = 42; // seis semanas: a régua de tosse mostra bem os 21 dias no meio
const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function Sintoma({ icone: Icone, ativo, children }) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        ativo
          ? 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-800'
          : 'bg-slate-100 text-slate-500 line-through decoration-slate-400 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{ativo ? 'Com' : 'Sem'} </span>
      {children}
    </li>
  );
}

/** Régua de dias de tosse com a marca dos 21 dias. */
function ReguaTosse({ dias, urgente }) {
  const pct = Math.min(dias, ESCALA_DIAS) / ESCALA_DIAS;
  return (
    <div className="relative mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${urgente ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-sky-500'}`}
        style={{ width: `${Math.max(pct * 100, dias > 0 ? 3 : 0)}%` }}
      />
      <span className="absolute -top-1 h-4 w-0.5 rounded bg-red-500/70" style={{ left: `${(LIMITE_TOSSE_DIAS / ESCALA_DIAS) * 100}%` }} />
    </div>
  );
}

/** Cartão de um chamado de coleta na fila do ACS. */
export function ChamadoCard({ chamado, aoAtualizar, atualizando }) {
  const urgente = ehUrgente(chamado);
  const finalizado = estaFinalizado(chamado);
  const status = chamado.status ?? STATUS.PENDENTE;
  const acoes = proximasAcoes(status);
  const id = idDoChamado(chamado);
  const tituloId = `chamado-${String(id).replace(/[^a-zA-Z0-9-]/g, '')}`;
  const dias = Number(chamado.dias_tosse) || 0;
  const alerta = urgente && !finalizado;

  // Pulso verde quando o status muda (resposta visual ao toque do ACS).
  const anterior = useRef(status);
  const [mudou, setMudou] = useState(false);
  useEffect(() => {
    if (anterior.current !== status) {
      anterior.current = status;
      setMudou(true);
      const t = setTimeout(() => setMudou(false), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [status]);

  return (
    <article
      aria-labelledby={tituloId}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/[0.06] dark:bg-slate-900 ${
        alerta ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-slate-800'
      } ${finalizado ? 'opacity-75 hover:opacity-100' : ''} ${mudou ? 'animate-destaque' : ''}`}
    >
      {alerta && <span className="absolute inset-y-0 left-0 w-1.5 bg-red-600" aria-hidden="true" />}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
              alerta ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
            }`}
            aria-hidden="true"
          >
            {iniciais(chamado.morador_nome) || '?'}
          </span>
          <div className="min-w-0 flex-1">
            <h3 id={tituloId} className="truncate text-lg font-semibold leading-tight">
              {chamado.morador_nome || 'Morador sem nome'}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm texto-suave">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{chamado.setor_viela || 'Setor não informado'}</span>
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${ESTILO_STATUS[status] ?? ESTILO_STATUS[STATUS.PENDENTE]}`}>
            {rotuloStatus(status)}
          </span>
        </div>

        {alerta && (
          <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            <Siren className="h-3.5 w-3.5" aria-hidden="true" /> Urgente · tosse há 21 dias ou mais
          </p>
        )}

        <dl className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide texto-suave">Tosse há</dt>
            <dd className={`text-3xl font-semibold tabular-nums tracking-tight ${urgente ? 'text-red-700 dark:text-red-400' : ''}`}>
              {dias} <span className="text-base font-medium">{dias === 1 ? 'dia' : 'dias'}</span>
            </dd>
            <dd>
              <ReguaTosse dias={dias} urgente={urgente} />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Outros sintomas</dt>
            <dd>
              <ul className="flex flex-wrap gap-2 sm:justify-end">
                <Sintoma icone={Thermometer} ativo={chamado.tem_febre}>
                  Febre
                </Sintoma>
                <Sintoma icone={Droplets} ativo={chamado.tem_sudorese}>
                  Suor noturno
                </Sintoma>
              </ul>
            </dd>
          </div>
        </dl>

        <div key={status} className="animate-surgir mt-6">
          <EtapasAtendimento status={status} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm texto-suave">
          {chamado.created_at && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Triagem em {formatoData.format(new Date(chamado.created_at))}
            </span>
          )}
          {chamado._offline && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <CloudOff className="h-4 w-4" aria-hidden="true" />
              Aguardando sincronização
            </span>
          )}
        </div>

        {acoes.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            {acoes.map((acao) => (
              <Button
                key={acao.status}
                variante={acao.status === STATUS.CONCLUIDO ? 'sucesso' : urgente ? 'perigo' : 'primaria'}
                carregando={atualizando}
                onClick={() => aoAtualizar(chamado, acao.status)}
                className="group/botao w-full"
                aria-describedby={tituloId}
              >
                {acao.rotulo}
                {!atualizando && <ArrowRight className="h-4 w-4 transition-transform group-hover/botao:translate-x-1" aria-hidden="true" />}
              </Button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
