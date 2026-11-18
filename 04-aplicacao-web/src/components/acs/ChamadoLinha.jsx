import { ArrowRight, CloudOff, Droplets, MapPin, Siren, Thermometer } from 'lucide-react';
import { Button } from '../ui/Button';
import { ehUrgente } from '../../domain/risco';
import { estaFinalizado, idDoChamado, proximasAcoes, rotuloStatus, STATUS, tempoRelativo } from '../../domain/chamados';
import { iniciais } from '../../domain/cadastro';

const ESTILO_STATUS = {
  [STATUS.PENDENTE]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  [STATUS.EM_ANDAMENTO]: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
  [STATUS.COLETADO]: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  [STATUS.CONCLUIDO]: 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-slate-950',
};

/** Linha compacta de um chamado: visão em lista da fila do ACS. */
export function ChamadoLinha({ chamado, aoAtualizar, atualizando }) {
  const urgente = ehUrgente(chamado);
  const finalizado = estaFinalizado(chamado);
  const alerta = urgente && !finalizado;
  const status = chamado.status ?? STATUS.PENDENTE;
  const acao = proximasAcoes(status)[0];
  const dias = Number(chamado.dias_tosse) || 0;
  const quando = tempoRelativo(chamado.created_at);
  const tituloId = `linha-${String(idDoChamado(chamado)).replace(/[^a-zA-Z0-9-]/g, '')}`;

  return (
    <article
      aria-labelledby={tituloId}
      className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white p-4 pl-5 transition hover:shadow-md hover:shadow-slate-900/[0.06] dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-4 ${
        alerta ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-slate-800'
      } ${finalizado ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {alerta && <span className="absolute inset-y-0 left-0 w-1.5 bg-red-600" aria-hidden="true" />}

      <span
        className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold sm:flex ${
          alerta ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
        }`}
        aria-hidden="true"
      >
        {iniciais(chamado.morador_nome) || '?'}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 id={tituloId} className="truncate text-base font-semibold">
            {chamado.morador_nome || 'Morador sem nome'}
          </h4>
          {alerta && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              <Siren className="h-3 w-3" aria-hidden="true" /> Urgente
            </span>
          )}
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm texto-suave">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{chamado.setor_viela || 'Setor não informado'}</span>
          </span>
          {quando && <span>{quando}</span>}
          {chamado._offline && (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300">
              <CloudOff className="h-4 w-4" aria-hidden="true" /> Aguardando sincronização
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${urgente ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' : 'bg-slate-100 dark:bg-slate-800'}`}>
          Tosse {dias} {dias === 1 ? 'dia' : 'dias'}
        </span>
        {chamado.tem_febre && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-800">
            <Thermometer className="h-4 w-4" aria-hidden="true" /> Febre
          </span>
        )}
        {chamado.tem_sudorese && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-800">
            <Droplets className="h-4 w-4" aria-hidden="true" /> Suor noturno
          </span>
        )}
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTILO_STATUS[status] ?? ESTILO_STATUS[STATUS.PENDENTE]}`}>{rotuloStatus(status)}</span>
      </div>

      {acao && (
        <Button
          variante={acao.status === STATUS.CONCLUIDO ? 'sucesso' : urgente ? 'perigo' : 'primaria'}
          carregando={atualizando}
          onClick={() => aoAtualizar(chamado, acao.status)}
          className="w-full shrink-0 sm:w-auto"
          aria-describedby={tituloId}
        >
          {acao.rotulo}
          {!atualizando && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      )}
    </article>
  );
}
