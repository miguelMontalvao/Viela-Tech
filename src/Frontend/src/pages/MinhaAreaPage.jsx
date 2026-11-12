import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  ClipboardPlus,
  FlaskConical,
  Footprints,
  HeartPulse,
  MapPin,
  RefreshCw,
  Siren,
} from 'lucide-react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { CabecalhoPainel } from '../components/painel/Painel';
import { Revelar, moverHolofote } from '../components/home/Efeitos';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { minhasTriagens } from '../services/perfilService';
import { PAPEIS, STATUS_PARA_MORADOR } from '../domain/perfis';
import { ORDEM_STATUS, STATUS } from '../domain/chamados';
import { ehUrgente } from '../domain/risco';
import { UNIDADES_SAUDE } from '../domain/unidades';
import { primeiroNome } from '../domain/cadastro';

const ICONES_ETAPA = [CircleDot, Footprints, FlaskConical, CheckCircle2];

/** O que acontece depois de cada etapa, explicado para o morador. */
const PROXIMO_PASSO = {
  [STATUS.PENDENTE]: 'O agente comunitário de saúde da sua área recebeu a triagem e vai marcar a visita.',
  [STATUS.EM_ANDAMENTO]: 'O agente está cuidando do seu caso e vai até você para colher a amostra de escarro.',
  [STATUS.COLETADO]: 'Sua amostra foi colhida e segue para o exame. Acompanhe o resultado com a unidade de saúde.',
  [STATUS.CONCLUIDO]: 'Atendimento encerrado. Siga as orientações da unidade de saúde e, se a tosse voltar, faça outra triagem.',
};

const formatar = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
const diasDesde = (d) => Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000));

/** Linha do tempo grande da triagem atual: ícones por etapa e uma linha que se preenche. */
function LinhaDoTempo({ status }) {
  const atual = Math.max(0, ORDEM_STATUS.indexOf(status ?? STATUS.PENDENTE));
  const concluido = status === STATUS.CONCLUIDO;
  const progresso = concluido ? 100 : (atual / (ORDEM_STATUS.length - 1)) * 100;
  return (
    <div className="relative mt-8">
      <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-[width] duration-1000 ease-out" style={{ width: `${progresso}%` }} />
      </div>
      <ol className="relative grid grid-cols-4 gap-2" aria-label="Andamento do atendimento">
        {ORDEM_STATUS.map((s, i) => {
          const Icone = ICONES_ETAPA[i];
          const feito = i < atual || concluido;
          const agora = i === atual && !concluido;
          return (
            <li key={s} className="flex flex-col items-center text-center" aria-current={agora ? 'step' : undefined}>
              <span className="relative flex h-10 w-10 items-center justify-center">
                {agora && <span className="absolute inset-0 rounded-full bg-sky-500/30 motion-safe:animate-ping" aria-hidden="true" />}
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white transition-colors duration-500 dark:ring-slate-900 ${
                    feito ? 'bg-emerald-500 text-white' : agora ? 'bg-sky-600 text-white dark:bg-sky-500' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
              </span>
              <span className={`mt-3 text-xs leading-tight sm:text-sm ${feito || agora ? 'font-semibold text-slate-900 dark:text-white' : 'texto-suave'}`}>
                {STATUS_PARA_MORADOR[s]}
                <span className="sr-only">{feito ? ' (feito)' : agora ? ' (etapa atual)' : ' (ainda não)'}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Sintomas({ t }) {
  const itens = [`Tosse há ${t.dias_tosse} ${t.dias_tosse === 1 ? 'dia' : 'dias'}`, t.tem_febre && 'Febre', t.tem_sudorese && 'Suor noturno'].filter(Boolean);
  return (
    <ul className="flex flex-wrap gap-2">
      {itens.map((s) => (
        <li key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium dark:bg-slate-800">
          {s}
        </li>
      ))}
    </ul>
  );
}

/** A triagem mais recente, em destaque. */
function TriagemAtual({ t }) {
  const urgente = ehUrgente(t);
  const status = t.status ?? STATUS.PENDENTE;
  return (
    <article className="painel relative overflow-hidden p-6 sm:p-8" aria-labelledby="triagem-atual">
      <div aria-hidden="true" className="mancha -right-24 -top-24 h-64 w-64 bg-sky-200/40 dark:bg-sky-800/20" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Acompanhamento atual</p>
            <h2 id="triagem-atual" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {STATUS_PARA_MORADOR[status]}
            </h2>
          </div>
          {urgente && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              <Siren className="h-3.5 w-3.5" aria-hidden="true" /> Prioridade
            </span>
          )}
        </div>

        <LinhaDoTempo status={status} />

        <div className="mt-8 rounded-2xl bg-sky-50 p-5 dark:bg-sky-950/40">
          <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">E agora?</p>
          <p className="mt-1 text-sky-900/80 dark:text-sky-100/80">{PROXIMO_PASSO[status]}</p>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <Sintomas t={t} />
          <p className="flex shrink-0 items-center gap-4 text-sm texto-suave">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {t.setor_viela}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {formatar(t.created_at)}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

/** Triagens anteriores, em cartões compactos. */
function Historico({ triagens }) {
  return (
    <section aria-labelledby="historico">
      <h2 id="historico" className="text-lg font-semibold">
        Triagens anteriores
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {triagens.map((t, i) => {
          const status = t.status ?? STATUS.PENDENTE;
          const atual = Math.max(0, ORDEM_STATUS.indexOf(status));
          return (
            <Revelar as="li" key={t.id} atraso={Math.min(i, 4) * 60} className="painel p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{formatar(t.created_at)}</p>
                {ehUrgente(t) && <Siren className="h-4 w-4 shrink-0 text-red-600" aria-label="Prioridade" />}
              </div>
              <p className="mt-1 text-sm texto-suave">{STATUS_PARA_MORADOR[status]}</p>
              <div className="mt-3 flex gap-1" aria-hidden="true">
                {ORDEM_STATUS.map((s, n) => (
                  <span key={s} className={`h-1.5 flex-1 rounded-full ${n <= atual ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
              <p className="mt-3 text-sm texto-suave">
                Tosse há {t.dias_tosse} {t.dias_tosse === 1 ? 'dia' : 'dias'} · {t.setor_viela}
              </p>
            </Revelar>
          );
        })}
      </ul>
    </section>
  );
}

function Area() {
  const { nome } = useAuth();
  const [triagens, setTriagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await minhasTriagens();
    setTriagens(data);
    setErro(error ? 'Não deu para buscar suas triagens agora. Confira a conexão e tente de novo.' : null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const [atual, ...anteriores] = triagens;
  const emAcompanhamento = triagens.filter((t) => t.status !== STATUS.CONCLUIDO).length;
  const coletadas = triagens.filter((t) => t.status === STATUS.COLETADO || t.status === STATUS.CONCLUIDO).length;

  return (
    <div className="container-app">
      <CabecalhoPainel
        sobrelinha="Minha área"
        titulo={nome ? `Fala, ${primeiroNome(nome)}!` : 'Sua área'}
        acoes={
          <Button variante="vidro" icone={RefreshCw} carregando={carregando} onClick={carregar}>
            Atualizar
          </Button>
        }
        kpis={
          triagens.length
            ? [
                { rotulo: 'Triagens feitas', valor: triagens.length, icone: ClipboardList, detalhe: 'com esta conta' },
                { rotulo: 'Em acompanhamento', valor: emAcompanhamento, icone: HeartPulse, detalhe: 'ainda não concluídas' },
                { rotulo: 'Amostras colhidas', valor: coletadas, icone: FlaskConical, detalhe: 'exame de escarro' },
                { rotulo: 'Dias desde a última', valor: diasDesde(atual.created_at), icone: CalendarClock, detalhe: formatar(atual.created_at) },
              ]
            : null
        }
      >
        Aqui você acompanha cada triagem que fez e vê em que pé está o atendimento.
      </CabecalhoPainel>

      <div className="grid gap-6 py-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8" aria-live="polite">
          {erro && <Alert tipo="aviso">{erro}</Alert>}
          {carregando && triagens.length === 0 ? (
            <Spinner texto="Buscando suas triagens…" />
          ) : !atual ? (
            <div className="painel">
              <EmptyState
                icone={ClipboardPlus}
                titulo="Você ainda não fez nenhuma triagem com esta conta"
                acao={
                  <Link
                    to="/morador"
                    className="inline-flex min-h-toque items-center gap-2 rounded-full bg-sky-700 px-6 font-semibold text-white transition hover:-translate-y-px hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950"
                  >
                    Fazer minha triagem <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
              >
                Está com tosse? Responda quatro perguntas e o agente de saúde fica sabendo.
              </EmptyState>
            </div>
          ) : (
            <>
              <Revelar>
                <TriagemAtual t={atual} />
              </Revelar>
              {anteriores.length > 0 && <Historico triagens={anteriores} />}
            </>
          )}
        </div>

        <aside className="space-y-4">
          <Revelar>
            <Link
              to="/morador"
              onMouseMove={moverHolofote}
              className="holofote group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 to-sky-900 p-7 text-white shadow-lg shadow-sky-900/20 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div aria-hidden="true" className="grade-hero absolute inset-0 opacity-20" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <ClipboardPlus className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="relative mt-5 text-2xl font-semibold leading-tight">Nova triagem</p>
              <p className="relative mt-1 text-sky-100">A tosse voltou ou piorou? Conta pra gente.</p>
              <span className="relative mt-5 inline-flex min-h-toque items-center gap-1.5 font-semibold">
                Começar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </Revelar>
          <Revelar atraso={100} className="painel p-6">
            <p className="font-semibold">Onde fazer o exame</p>
            <ul className="mt-4 space-y-4">
              {UNIDADES_SAUDE.map((u) => (
                <li key={u.nome} className="flex gap-3 text-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{u.nome}</strong>
                    <span className="block texto-suave">{u.descricao}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm texto-suave dark:bg-slate-800/50">
              O exame de escarro e o tratamento são gratuitos pelo SUS.
            </p>
          </Revelar>
        </aside>
      </div>
    </div>
  );
}

export default function MinhaAreaPage() {
  return (
    <ProtectedRoute papeis={[PAPEIS.MORADOR]}>
      <Area />
    </ProtectedRoute>
  );
}
