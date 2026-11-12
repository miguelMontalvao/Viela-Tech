import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CloudOff, Info, Map as MapaIcone, MapPin, RotateCcw, Siren } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Revelar } from '../home/Efeitos';
import { UNIDADES_SAUDE } from '../../domain/unidades';

function UnidadesDeSaude() {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {UNIDADES_SAUDE.map((u, i) => (
        <Revelar
          as="li"
          key={u.nome}
          atraso={150 + i * 80}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">{u.nome}</p>
            <p className="text-sm texto-suave">{u.descricao}</p>
          </div>
        </Revelar>
      ))}
    </ul>
  );
}

/** Três passos do que acontece agora, iguais para todo resultado. */
function ProximosPassos({ urgente }) {
  const passos = [
    ['Sua triagem entrou na fila', urgente ? 'No topo, como prioridade.' : 'O agente da sua área já pode ver.'],
    ['O agente de saúde entra em contato', 'Ele combina a visita e colhe a amostra de escarro.'],
    ['O exame é feito na unidade', 'É simples, gratuito e é ele que confirma ou descarta a TB.'],
  ];
  return (
    <ol className="mt-6 grid gap-3 sm:grid-cols-3">
      {passos.map(([titulo, texto], i) => (
        <Revelar as="li" key={titulo} atraso={i * 90} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${
              i === 0 ? 'bg-emerald-600' : 'bg-sky-600 dark:bg-sky-500 dark:text-slate-950'
            }`}
            aria-hidden="true"
          >
            {i === 0 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </span>
          <p className="mt-3 font-semibold">{titulo}</p>
          <p className="mt-1 text-sm texto-suave">{texto}</p>
        </Revelar>
      ))}
    </ol>
  );
}

/** Resultado mostrado depois do envio da triagem. */
export function ResultadoTriagem({ resultado, aoNovaTriagem, logado = false }) {
  const tituloRef = useRef(null);

  // Move o foco para o resultado: quem usa leitor de tela ouve a resposta na hora.
  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const { urgente, sintomasAssociados, offline, nome } = resultado;

  return (
    <section aria-labelledby="resultado-titulo" className="space-y-5">
      {urgente ? (
        <div className="animate-surgir overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl shadow-red-900/[0.06] dark:border-red-900 dark:bg-slate-900">
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 px-6 py-6 text-white sm:px-8">
            <div aria-hidden="true" className="grade-hero absolute inset-0 opacity-20" />
            <div className="relative flex items-start gap-4">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-2xl bg-white/30 motion-safe:animate-ping" aria-hidden="true" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                  <Siren className="h-6 w-6" aria-hidden="true" />
                </span>
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-red-100">Alerta prioritário</p>
                <h2 id="resultado-titulo" ref={tituloRef} tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight focus:outline-none sm:text-3xl">
                  Tosse há 21 dias ou mais precisa de exame
                </h2>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-lg">
              {nome}, tosse que dura três semanas ou mais precisa ser avaliada. <strong>Procure uma unidade de saúde o quanto antes</strong> e
              peça o exame de escarro. Ele é simples e gratuito.
            </p>
            {sintomasAssociados.length > 0 && (
              <p className="mt-3 texto-suave">Você também informou {sintomasAssociados.join(' e ')}. Conte isso no atendimento.</p>
            )}
            <UnidadesDeSaude />
            <ProximosPassos urgente />
          </div>
        </div>
      ) : (
        <div className="animate-surgir painel overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-sky-50 px-6 py-6 dark:from-emerald-950/40 dark:to-sky-950/40 sm:px-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Triagem registrada</p>
                <h2 id="resultado-titulo" ref={tituloRef} tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight focus:outline-none sm:text-3xl">
                  Valeu, {nome}! A equipe já sabe.
                </h2>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="texto-suave">
              O agente comunitário de saúde da sua área vai receber suas respostas. Se a tosse continuar, piorar ou chegar a três semanas, procure uma
              das unidades abaixo.
            </p>
            <UnidadesDeSaude />
            <ProximosPassos />
          </div>
        </div>
      )}

      {offline && (
        <Alert tipo="aviso" titulo="Guardada neste aparelho">
          <span className="inline-flex items-start gap-1.5">
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Não deu para enviar agora. Sua triagem ficou salva aqui e segue para a equipe assim que a conexão voltar.
          </span>
        </Alert>
      )}

      <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/40">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
        <div>
          <p className="font-semibold text-sky-950 dark:text-sky-100">Isto não é um diagnóstico</p>
          <p className="mt-1 text-sm text-sky-950/80 dark:text-sky-100/80">
            A triagem ajuda a organizar quem precisa de visita primeiro. Só o exame feito na unidade de saúde confirma ou descarta a tuberculose. Em
            caso de falta de ar forte ou tosse com sangue, procure atendimento imediatamente.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {logado && (
          <Link
            to="/minha-area"
            className="group inline-flex min-h-toque items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white transition hover:-translate-y-px hover:bg-emerald-800 hover:shadow-md active:scale-[0.98] dark:bg-emerald-600 dark:text-slate-950"
          >
            Acompanhar na Minha área
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        )}
        <Button variante="secundaria" icone={RotateCcw} onClick={aoNovaTriagem}>
          Fazer outra triagem
        </Button>
        <Link
          to="/mapa"
          className="inline-flex min-h-toque items-center justify-center gap-2 rounded-xl px-5 font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
        >
          <MapaIcone className="h-4 w-4" aria-hidden="true" />
          Ver o mapa da tuberculose
        </Link>
      </div>
    </section>
  );
}
