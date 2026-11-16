import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  ClipboardPlus,
  CloudOff,
  FlaskConical,
  Footprints,
  HeartPulse,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Siren,
  UserRound,
} from 'lucide-react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { CabecalhoPainel } from '../components/painel/Painel';
import { Revelar } from '../components/home/Efeitos';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useEnvioPendente } from '../hooks/useEnvioPendente';
import { minhasTriagens } from '../services/perfilService';
import { existemTriagensPendentes } from '../services/sincronizacao';
import { PAPEIS, STATUS_PARA_MORADOR } from '../domain/perfis';
import { ORDEM_STATUS, STATUS } from '../domain/chamados';
import { ehUrgente } from '../domain/risco';
import { UNIDADES_SAUDE } from '../domain/unidades';
import { iniciais, primeiroNome } from '../domain/cadastro';

const ICONES_ETAPA = [CircleDot, Footprints, FlaskConical, CheckCircle2];

/** Rótulos curtos para a linha do tempo (cabem no celular); o título usa o texto completo. */
const ETAPA_CURTA = {
  [STATUS.PENDENTE]: 'Na fila',
  [STATUS.EM_ANDAMENTO]: 'Agente a caminho',
  [STATUS.COLETADO]: 'Amostra colhida',
  [STATUS.CONCLUIDO]: 'Concluído',
};

/** O que acontece depois de cada etapa, explicado para o morador. */
const PROXIMO_PASSO = {
  [STATUS.PENDENTE]: 'O agente comunitário de saúde da sua área recebeu a triagem e vai combinar a visita com você.',
  [STATUS.EM_ANDAMENTO]: 'O agente está cuidando do seu caso e vai até você para colher a amostra de escarro.',
  [STATUS.COLETADO]: 'Sua amostra foi colhida e segue para o exame. O resultado sai pela unidade de saúde.',
  [STATUS.CONCLUIDO]: 'Atendimento encerrado. Siga as orientações da unidade de saúde e, se a tosse voltar, faça outra triagem.',
};

const ESTILO_ETAPA = {
  [STATUS.PENDENTE]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  [STATUS.EM_ANDAMENTO]: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
  [STATUS.COLETADO]: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  [STATUS.CONCLUIDO]: 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-slate-950',
};

const formatoLongo = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const formatoCurto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const statusDe = (t) => (ORDEM_STATUS.includes(t.status) ? t.status : STATUS.PENDENTE);
const dias = (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`;

function haQuanto(data) {
  const d = Math.max(0, Math.floor((Date.now() - new Date(data).getTime()) / 86_400_000));
  return d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`;
}

/** Linha do tempo da triagem atual: ícones por etapa e uma linha que se preenche. */
function LinhaDoTempo({ status }) {
  const atual = Math.max(0, ORDEM_STATUS.indexOf(status));
  const concluido = status === STATUS.CONCLUIDO;
  const progresso = concluido ? 100 : (atual / (ORDEM_STATUS.length - 1)) * 100;
  return (
    <div className="relative mt-8">
      <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-[width] duration-1000 ease-out" style={{ width: `${progresso}%` }} />
      </div>
      <ol className="relative grid grid-cols-4" aria-label="Andamento do atendimento">
        {ORDEM_STATUS.map((s, i) => {
          const Icone = ICONES_ETAPA[i];
          const feito = i < atual || concluido;
          const agora = i === atual && !concluido;
          return (
            <li key={s} className="flex flex-col items-center px-1 text-center" aria-current={agora ? 'step' : undefined}>
              <span className="relative flex h-10 w-10 items-center justify-center">
                {agora && <span className="absolute inset-0 rounded-full bg-sky-500/30 motion-safe:animate-ping" aria-hidden="true" />}
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white transition-colors duration-500 dark:ring-slate-900 ${
                    feito
                      ? 'bg-emerald-500 text-white'
                      : agora
                        ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
              </span>
              <span className={`mt-3 text-xs leading-tight sm:text-sm ${feito || agora ? 'font-semibold text-slate-900 dark:text-white' : 'texto-suave'}`}>
                {ETAPA_CURTA[s]}
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
  const itens = [`Tosse há ${dias(t.dias_tosse)}`, t.tem_febre && 'Febre', t.tem_sudorese && 'Suor noturno'].filter(Boolean);
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Sintomas informados">
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
  const status = statusDe(t);
  return (
    <article className="painel relative overflow-hidden p-6 sm:p-8" aria-labelledby="triagem-atual">
      <div aria-hidden="true" className="mancha -right-24 -top-24 h-64 w-64 bg-sky-200/40 dark:bg-sky-800/20" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Triagem mais recente · {haQuanto(t.created_at)}</p>
          {urgente && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              <Siren className="h-3.5 w-3.5" aria-hidden="true" /> Prioridade: tosse há 21 dias ou mais
            </span>
          )}
        </div>
        <h2 id="triagem-atual" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {STATUS_PARA_MORADOR[status]}
        </h2>

        <LinhaDoTempo status={status} />

        <div className="mt-8 flex gap-3 rounded-2xl bg-sky-50 p-5 dark:bg-sky-950/40">
          <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
          <div>
            <p className="font-semibold text-sky-950 dark:text-sky-100">E agora?</p>
            <p className="mt-1 text-sky-950/80 dark:text-sky-100/80">{PROXIMO_PASSO[status]}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <Sintomas t={t} />
          <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm texto-suave sm:justify-end">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {t.setor_viela || 'Setor não informado'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {formatoLongo.format(new Date(t.created_at))}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

/** Triagens anteriores, da mais nova para a mais antiga. */
function Historico({ triagens }) {
  return (
    <section aria-labelledby="historico">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="historico" className="text-xl font-semibold tracking-tight">
          Triagens anteriores
        </h2>
        <p className="text-sm texto-suave">{triagens.length === 1 ? '1 registro' : `${triagens.length} registros`}</p>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {triagens.map((t, i) => {
          const status = statusDe(t);
          const atual = Math.max(0, ORDEM_STATUS.indexOf(status));
          return (
            <Revelar as="li" key={t.id} atraso={Math.min(i, 4) * 60} className="painel flex flex-col p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{formatoCurto.format(new Date(t.created_at))}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ETAPA[status]}`}>{ETAPA_CURTA[status]}</span>
              </div>
              <div className="mt-3 flex gap-1" aria-hidden="true">
                {ORDEM_STATUS.map((s, n) => (
                  <span key={s} className={`h-1.5 flex-1 rounded-full ${n <= atual ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
              <p className="mt-3 text-sm texto-suave">
                Tosse há {dias(t.dias_tosse)} · {t.setor_viela || 'setor não informado'}
              </p>
              {ehUrgente(t) && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                  <Siren className="h-3.5 w-3.5" aria-hidden="true" /> Prioridade
                </p>
              )}
            </Revelar>
          );
        })}
      </ul>
    </section>
  );
}

/** Dados da conta e direitos (LGPD). */
function SuaConta() {
  const { nome, usuario, logout } = useAuth();
  return (
    <section aria-labelledby="sua-conta" className="painel p-6">
      <h2 id="sua-conta" className="font-semibold">
        Sua conta
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-600 font-semibold text-white"
          aria-hidden="true"
        >
          {iniciais(nome) || <UserRound className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{nome || 'Morador'}</p>
          {usuario?.email && (
            <p className="flex items-center gap-1.5 text-sm texto-suave">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{usuario.email}</span>
            </p>
          )}
        </div>
      </div>
      <p className="mt-5 flex gap-2 rounded-2xl bg-slate-50 p-4 text-sm texto-suave dark:bg-slate-800/50">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
        <span>
          Só você e a equipe de saúde veem suas triagens.{' '}
          <Link to="/privacidade#direitos" className="font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-400">
            Seus direitos na LGPD
          </Link>
        </span>
      </p>
      <Button variante="fantasma" icone={LogOut} onClick={logout} className="mt-3 w-full">
        Sair da conta
      </Button>
    </section>
  );
}

function OndeFazerExame() {
  return (
    <section aria-labelledby="onde-exame" className="painel p-6">
      <h2 id="onde-exame" className="font-semibold">
        Onde fazer o exame
      </h2>
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
      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm texto-suave dark:bg-slate-800/50">O exame de escarro e o tratamento são gratuitos pelo SUS.</p>
    </section>
  );
}

function Area() {
  const { nome } = useAuth();
  const online = useOnlineStatus();
  const { enviadas } = useEnvioPendente();
  const [triagens, setTriagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [pendenteNoAparelho, setPendenteNoAparelho] = useState(() => existemTriagensPendentes());
  const ultimaBusca = useRef(0);

  const carregar = useCallback(async () => {
    ultimaBusca.current = Date.now();
    setCarregando(true);
    const { data, error } = await minhasTriagens();
    if (!error) setTriagens(data);
    setErro(error ? 'Não deu para buscar suas triagens agora. Confira a conexão e tente de novo.' : null);
    setPendenteNoAparelho(existemTriagensPendentes());
    setCarregando(false);
  }, []);

  // Busca ao abrir, quando a conexão volta e quando uma triagem guardada no aparelho é enviada.
  useEffect(() => {
    if (online) carregar();
    else setCarregando(false);
  }, [carregar, online, enviadas]);

  // Ao voltar para a aba depois de um tempo, atualiza o andamento sem precisar clicar.
  useEffect(() => {
    const aoVoltar = () => {
      if (document.visibilityState === 'visible' && navigator.onLine && Date.now() - ultimaBusca.current > 60_000) carregar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => document.removeEventListener('visibilitychange', aoVoltar);
  }, [carregar]);

  // O servidor já ordena, mas a tela não depende disso.
  const ordenadas = useMemo(() => [...triagens].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [triagens]);
  const [atual, ...anteriores] = ordenadas;
  const emAcompanhamento = ordenadas.filter((t) => statusDe(t) !== STATUS.CONCLUIDO).length;
  const coletadas = ordenadas.filter((t) => [STATUS.COLETADO, STATUS.CONCLUIDO].includes(statusDe(t))).length;
  const concluidas = ordenadas.filter((t) => statusDe(t) === STATUS.CONCLUIDO).length;

  return (
    <div className="container-app">
      <CabecalhoPainel
        sobrelinha="Minha área"
        titulo={nome ? `Fala, ${primeiroNome(nome)}!` : 'Sua área'}
        acoes={
          <>
            <ButtonLink to="/morador" variante="claro" icone={ClipboardPlus} className="flex-1 !px-4 sm:flex-none sm:!px-5">
              Nova triagem
            </ButtonLink>
            <Button variante="vidro" icone={RefreshCw} carregando={carregando} onClick={carregar} disabled={!online} className="flex-1 !px-4 sm:flex-none sm:!px-5">
              Atualizar
            </Button>
          </>
        }
        kpis={
          ordenadas.length
            ? [
                { rotulo: 'Triagens feitas', valor: ordenadas.length, icone: ClipboardList, detalhe: `a última foi ${haQuanto(atual.created_at)}` },
                { rotulo: 'Em acompanhamento', valor: emAcompanhamento, icone: HeartPulse, detalhe: 'ainda não concluídas' },
                { rotulo: 'Amostras colhidas', valor: coletadas, icone: FlaskConical, detalhe: 'exame de escarro' },
                { rotulo: 'Concluídas', valor: concluidas, icone: CheckCircle2, detalhe: 'atendimentos encerrados' },
              ]
            : null
        }
      >
        Acompanhe cada triagem que você fez e veja em que pé está o atendimento.
      </CabecalhoPainel>

      <div className="grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8" aria-live="polite" aria-busy={carregando}>
          {!online && (
            <Alert tipo="aviso" titulo="Sem conexão">
              Mostrando o que já estava na tela. O andamento atualiza sozinho quando a internet voltar.
            </Alert>
          )}
          {pendenteNoAparelho && (
            <Alert tipo="aviso" titulo="Triagem guardada neste aparelho">
              <span className="inline-flex items-start gap-1.5">
                <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Ela ainda não chegou à equipe e é enviada automaticamente quando a conexão voltar.
              </span>
            </Alert>
          )}
          {enviadas > 0 && (
            <Alert tipo="sucesso" role="status">
              {enviadas === 1 ? 'A triagem que estava no aparelho foi enviada.' : `${enviadas} triagens que estavam no aparelho foram enviadas.`}
            </Alert>
          )}
          {erro && <Alert tipo="aviso">{erro}</Alert>}

          {carregando && ordenadas.length === 0 ? (
            <div className="painel">
              <Spinner texto="Buscando suas triagens…" />
            </div>
          ) : !atual ? (
            !erro && (
              <div className="painel">
                <EmptyState
                  icone={ClipboardPlus}
                  titulo="Você ainda não fez nenhuma triagem com esta conta"
                  acao={
                    <ButtonLink to="/morador" tamanho="lg" className="group">
                      Fazer minha triagem <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </ButtonLink>
                  }
                >
                  Está com tosse? Responda quatro perguntas e o agente de saúde fica sabendo.
                </EmptyState>
              </div>
            )
          ) : (
            <>
              <Revelar>
                <TriagemAtual t={atual} />
              </Revelar>
              {anteriores.length > 0 && <Historico triagens={anteriores} />}
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Conta e unidades de saúde">
          <Revelar>
            <SuaConta />
          </Revelar>
          <Revelar atraso={100}>
            <OndeFazerExame />
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
