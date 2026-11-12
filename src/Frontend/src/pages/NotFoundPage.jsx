import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ClipboardList, Home, LogIn, Map as MapIcon } from 'lucide-react';
import { moverHolofote } from '../components/home/Efeitos';

const CAMINHOS = [
  { to: '/', icone: Home, titulo: 'Início', texto: 'Conheça o Viela Tech.' },
  { to: '/morador', icone: ClipboardList, titulo: 'Fazer a triagem', texto: 'Quatro perguntas, com ou sem conta.' },
  { to: '/mapa', icone: MapIcon, titulo: 'Mapa da tuberculose', texto: 'A Rocinha e o Rio em números.' },
  { to: '/entrar', icone: LogIn, titulo: 'Entrar', texto: 'Acompanhe suas triagens.' },
];

/** A viela sem saída: um caminho que sobe o morro e termina num muro. */
function VielaSemSaida() {
  return (
    <svg viewBox="0 0 320 120" className="h-auto w-full max-w-sm" aria-hidden="true">
      <path
        d="M10 100 H70 Q85 100 85 85 V60 Q85 45 100 45 H170 Q185 45 185 60 V75 Q185 88 198 88 H262"
        fill="none"
        className="stroke-slate-300 dark:stroke-slate-700"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 100 H70 Q85 100 85 85 V60 Q85 45 100 45 H170 Q185 45 185 60 V75 Q185 88 198 88 H262"
        fill="none"
        className="caminho-404 stroke-sky-600 dark:stroke-sky-400"
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* muro */}
      <g className="fill-tijolo-500">
        {[0, 1, 2, 3].map((l) => (
          <rect key={l} x={274 + (l % 2) * 6} y={64 + l * 12} width="22" height="10" rx="2" />
        ))}
        {[0, 1, 2, 3].map((l) => (
          <rect key={`b${l}`} x={l % 2 ? 268 : 298} y={64 + l * 12} width={l % 2 ? 4 : 10} height="10" rx="2" />
        ))}
      </g>
      {/* morador perdido */}
      <g className="pino-404">
        <circle cx="250" cy="70" r="12" className="fill-sky-600/20 dark:fill-sky-400/20" />
        <path d="M250 52c-6 0-11 5-11 11 0 8 11 19 11 19s11-11 11-19c0-6-5-11-11-11Z" className="fill-sky-700 dark:fill-sky-400" />
        <circle cx="250" cy="63" r="4" className="fill-white dark:fill-slate-950" />
      </g>
    </svg>
  );
}

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="grade-hero absolute inset-0" />
        <div className="mancha -left-20 top-0 h-96 w-96 bg-sky-300/30 dark:bg-sky-700/20" />
        <div className="mancha bottom-0 right-0 h-80 w-80 bg-orange-200/40 dark:bg-orange-900/20" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="container-app grid min-h-[calc(100dvh-4.5rem)] items-center gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="animate-surgir sobrelinha">Erro 404 · página não encontrada</p>
          <p
            aria-hidden="true"
            className="animate-surgir mt-4 bg-gradient-to-br from-slate-900 via-sky-700 to-emerald-600 bg-clip-text text-[7rem] font-semibold leading-none tracking-[-0.06em] text-transparent dark:from-white dark:via-sky-400 dark:to-emerald-400 sm:text-[10rem]"
            style={{ animationDelay: '80ms' }}
          >
            404
          </p>
          <h1 className="animate-surgir mt-4 text-4xl font-semibold tracking-tight sm:text-5xl" style={{ animationDelay: '160ms' }}>
            Essa viela não tem saída.
          </h1>
          <p className="animate-surgir mt-5 max-w-lg text-lg leading-relaxed texto-suave" style={{ animationDelay: '240ms' }}>
            O endereço{' '}
            <code className="rounded-md bg-slate-900/5 px-1.5 py-0.5 text-base text-slate-800 dark:bg-white/10 dark:text-slate-100">{pathname}</code> não
            existe ou mudou de lugar. Sem estresse: a gente te ajuda a voltar pro caminho.
          </p>
          <div className="animate-surgir mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '320ms' }}>
            <Link
              to="/"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-700 px-7 font-semibold text-white shadow-lg shadow-sky-700/25 transition hover:-translate-y-0.5 hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Voltar ao início
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-7 font-semibold ring-1 ring-slate-300 transition hover:-translate-y-0.5 hover:ring-slate-400 dark:ring-slate-600"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              Página anterior
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="animate-surgir flex justify-center lg:justify-end" style={{ animationDelay: '200ms' }}>
            <VielaSemSaida />
          </div>
          <nav aria-label="Caminhos sugeridos" className="mt-10">
            <p className="text-sm font-semibold">Talvez você estivesse procurando</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {CAMINHOS.map(({ to, icone: Icone, titulo, texto }, i) => (
                <li key={to} className="animate-surgir" style={{ animationDelay: `${360 + i * 70}ms` }}>
                  <Link
                    to={to}
                    onMouseMove={moverHolofote}
                    className="holofote group flex h-full items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-sky-900"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{titulo}</span>
                      <span className="block text-sm texto-suave">{texto}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-600" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
