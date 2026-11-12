import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDot, ClipboardPlus, Footprints, FlaskConical, MapPin, RefreshCw, Siren } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Alert } from '../components/ui/Alert';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { minhasTriagens } from '../services/perfilService';
import { PAPEIS, STATUS_PARA_MORADOR } from '../domain/perfis';
import { ORDEM_STATUS } from '../domain/chamados';
import { ehUrgente } from '../domain/risco';
import { UNIDADES_SAUDE } from '../domain/unidades';

const ICONES_ETAPA = [CircleDot, Footprints, FlaskConical, CheckCircle2];

function LinhaDoTempo({ status }) {
  const atual = Math.max(0, ORDEM_STATUS.indexOf(status ?? 'PENDENTE'));
  return (
    <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Andamento do atendimento">
      {ORDEM_STATUS.map((s, i) => {
        const Icone = ICONES_ETAPA[i];
        const feito = i <= atual;
        return (
          <li key={s} className="flex flex-col items-center text-center" aria-current={i === atual ? 'step' : undefined}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                feito ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-slate-400 dark:border-slate-600'
              }`}
            >
              <Icone className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className={`mt-2 text-xs leading-tight ${feito ? 'font-semibold text-slate-900 dark:text-white' : 'texto-suave'}`}>
              {STATUS_PARA_MORADOR[s]}
              <span className="sr-only">{feito ? ' (feito)' : ' (ainda não)'}</span>
            </span>
          </li>
        );
      })}
    </ol>
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

  const formatar = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="container-app">
      <PageHeader
        eyebrow="Minha área"
        titulo={nome ? `Fala, ${nome.split(' ')[0]}!` : 'Sua área'}
      >
        Aqui você acompanha cada triagem que fez e vê em que pé está o atendimento.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="minhas-triagens" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="minhas-triagens" className="text-2xl font-semibold">
              Minhas triagens
            </h2>
            <button
              type="button"
              onClick={carregar}
              className="inline-flex min-h-toque items-center gap-2 rounded-full px-4 font-semibold text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} aria-hidden="true" />
              Atualizar
            </button>
          </div>
          {erro && <Alert tipo="aviso">{erro}</Alert>}
          {carregando && triagens.length === 0 ? (
            <Spinner texto="Buscando suas triagens…" />
          ) : triagens.length === 0 ? (
            <div className="card">
              <EmptyState
                icone={ClipboardPlus}
                titulo="Você ainda não fez nenhuma triagem com esta conta"
                acao={
                  <Link to="/morador" className="inline-flex min-h-toque items-center rounded-full bg-sky-700 px-6 font-semibold text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950">
                    Fazer minha triagem
                  </Link>
                }
              >
                Está com tosse? Responda quatro perguntas e o agente de saúde fica sabendo.
              </EmptyState>
            </div>
          ) : (
            <ul className="space-y-4">
              {triagens.map((t) => (
                <li key={t.id} className="card overflow-hidden">
                  {ehUrgente(t) && (
                    <p className="flex items-center gap-2 bg-red-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                      <Siren className="h-4 w-4" aria-hidden="true" />
                      Prioridade: tosse há 21 dias ou mais
                    </p>
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-base font-semibold">Triagem de {formatar(t.created_at)}</p>
                      <p className="text-sm texto-suave">
                        <MapPin className="mr-1 inline h-4 w-4" aria-hidden="true" />
                        {t.setor_viela}
                      </p>
                    </div>
                    <p className="mt-1 texto-suave">
                      Tosse há {t.dias_tosse} {t.dias_tosse === 1 ? 'dia' : 'dias'}
                      {t.tem_febre ? ' · febre' : ''}
                      {t.tem_sudorese ? ' · suor noturno' : ''}
                    </p>
                    <LinhaDoTempo status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <Link
            to="/morador"
            className="group block rounded-2xl bg-sky-700 p-6 text-white "
          >
            <ClipboardPlus className="h-8 w-8" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-semibold leading-tight">Nova triagem</p>
            <p className="mt-1 text-sky-50">A tosse voltou ou piorou? Conta pra gente.</p>
            <span className="mt-4 inline-flex min-h-toque items-center font-semibold underline-offset-4 group-hover:underline">Começar →</span>
          </Link>
          <div className="card p-6">
            <p className="text-base font-semibold">Onde fazer o exame</p>
            <ul className="mt-3 space-y-3">
              {UNIDADES_SAUDE.map((u) => (
                <li key={u.nome} className="flex gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <span>
                    <strong>{u.nome}</strong>
                    <span className="block texto-suave">{u.descricao}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
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
