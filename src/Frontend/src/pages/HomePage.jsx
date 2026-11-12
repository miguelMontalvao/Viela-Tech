import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardList, Cpu, HeartPulse, Stethoscope, Users } from 'lucide-react';

const PERFIS = [
  {
    to: '/morador',
    icone: HeartPulse,
    titulo: 'Sou morador',
    texto: 'Está com tosse? Responda quatro perguntas rápidas e o agente de saúde da sua área fica sabendo.',
    acao: 'Fazer minha triagem',
    destaque: true,
  },
  {
    to: '/acs',
    icone: Stethoscope,
    titulo: 'Sou agente de saúde',
    texto: 'Veja quem precisa de visita, com os casos de tosse longa no topo. Funciona mesmo sem sinal.',
    acao: 'Abrir painel ACS',
  },
  {
    to: '/gestor',
    icone: BarChart3,
    titulo: 'Sou gestor',
    texto: 'Acompanhe o microclima das vielas, as triagens e o andamento das coletas.',
    acao: 'Ver dashboard',
  },
];

const PASSOS = [
  { icone: Cpu, titulo: 'O sensor mede a viela', texto: 'Um ESP32 lê umidade e luz e calcula o IVM, o índice de vulnerabilidade do microclima.' },
  { icone: ClipboardList, titulo: 'O morador faz a triagem', texto: 'Quem tosse há 21 dias ou mais entra como prioridade. Leva menos de um minuto.' },
  { icone: Users, titulo: 'O ACS vai até a casa', texto: 'O agente recebe a fila organizada, registra a coleta e sincroniza quando o sinal volta.' },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-100 blur-3xl dark:bg-sky-900/40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-100 blur-3xl dark:bg-emerald-900/30"
        />
        <div className="container-app relative py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            Rocinha · Rio de Janeiro
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Onde o sol não chega, <span className="text-sky-700 dark:text-sky-400">a saúde chega.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed texto-suave">
            Nas vielas mais fechadas, a luz quase não entra e o ar fica parado. É o ambiente ideal para a tuberculose. O
            Viela Tech junta sensores, triagem e o trabalho dos agentes comunitários para encurtar o caminho entre a
            primeira tosse e o exame.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/morador"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 text-lg font-semibold text-white transition-colors hover:bg-sky-800 dark:bg-sky-600 dark:text-slate-950 dark:hover:bg-sky-500"
            >
              Estou com tosse
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              to="/acs"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 text-lg font-semibold transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Sou da equipe de saúde
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="perfis" className="container-app py-14">
        <h2 id="perfis" className="text-2xl font-extrabold tracking-tight">
          Como você quer usar?
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {PERFIS.map(({ to, icone: Icone, titulo, texto, acao, destaque }) => (
            <li key={to}>
              <Link
                to={to}
                className={`card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-md ${
                  destaque ? 'ring-2 ring-sky-600/40' : ''
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    destaque
                      ? 'bg-sky-700 text-white dark:bg-sky-600 dark:text-slate-950'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  <Icone className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="mt-4 text-xl font-bold">{titulo}</span>
                <span className="mt-2 flex-1 texto-suave">{texto}</span>
                <span className="mt-5 inline-flex min-h-toque items-center gap-2 font-semibold text-sky-700 group-hover:underline dark:text-sky-400">
                  {acao}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como-funciona" className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="container-app">
          <h2 id="como-funciona" className="text-2xl font-extrabold tracking-tight">
            Como funciona
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {PASSOS.map(({ icone: Icone, titulo, texto }, i) => (
              <li key={titulo} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                  {i + 1}
                </span>
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    <Icone className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    {titulo}
                  </p>
                  <p className="mt-1 texto-suave">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-sm texto-suave">
            A triagem do Viela Tech serve para organizar o atendimento. Ela não substitui a consulta nem dá diagnóstico:
            quem confirma tuberculose é o exame feito na unidade de saúde.
          </p>
        </div>
      </section>
    </>
  );
}
