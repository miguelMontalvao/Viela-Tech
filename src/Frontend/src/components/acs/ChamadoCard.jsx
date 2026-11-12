import { CalendarClock, CloudOff, MapPin, Siren, Thermometer, Droplets } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Feedback';
import { ehUrgente } from '../../domain/risco';
import { estaFinalizado, idDoChamado, proximasAcoes, rotuloStatus, STATUS } from '../../domain/chamados';

const ESTILO_STATUS = {
  [STATUS.PENDENTE]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  [STATUS.EM_ANDAMENTO]: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
  [STATUS.COLETADO]: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  [STATUS.CONCLUIDO]: 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-slate-950',
};

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function Sintoma({ icone: Icone, ativo, children }) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium ${
        ativo
          ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
          : 'bg-slate-100 text-slate-600 line-through decoration-slate-400 dark:bg-slate-700/60 dark:text-slate-300'
      }`}
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{ativo ? 'Com' : 'Sem'} </span>
      {children}
    </li>
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

  return (
    <article
      aria-labelledby={tituloId}
      className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm dark:bg-slate-800 ${
        urgente && !finalizado ? 'border-red-600' : 'border-slate-200 dark:border-slate-700'
      } ${finalizado ? 'opacity-80' : ''}`}
    >
      {urgente && !finalizado && (
        <p className="flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white">
          <Siren className="h-4 w-4" aria-hidden="true" />
          Urgente — tosse +21 dias
        </p>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 id={tituloId} className="truncate text-lg font-bold">
              {chamado.morador_nome || 'Morador sem nome'}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 texto-suave">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {chamado.setor_viela || 'Setor não informado'}
            </p>
          </div>
          <Badge className={ESTILO_STATUS[status] ?? ESTILO_STATUS[STATUS.PENDENTE]}>{rotuloStatus(status)}</Badge>
        </div>

        <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide texto-suave">Tosse há</dt>
            <dd className={`text-2xl font-extrabold ${urgente ? 'text-red-700 dark:text-red-400' : ''}`}>
              {Number(chamado.dias_tosse) || 0} {Number(chamado.dias_tosse) === 1 ? 'dia' : 'dias'}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Outros sintomas</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm texto-suave">
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
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            {acoes.map((acao) => (
              <Button
                key={acao.status}
                variante={acao.status === STATUS.CONCLUIDO ? 'sucesso' : urgente ? 'perigo' : 'primaria'}
                carregando={atualizando}
                onClick={() => aoAtualizar(chamado, acao.status)}
                className="w-full sm:w-auto"
                aria-describedby={tituloId}
              >
                {acao.rotulo}
              </Button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
