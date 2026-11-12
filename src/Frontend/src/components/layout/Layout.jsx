import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Logo } from '../brand/Logo';
import { Spinner } from '../ui/Feedback';

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900/5 dark:border-white/10">
      <div className="container-app flex flex-col gap-4 py-8 text-sm texto-suave sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="max-w-md">A triagem não substitui consulta médica. Falta de ar forte ou tosse com sangue: procure atendimento já.</p>
        <Link to="/equipe" className="inline-flex min-h-toque items-center font-semibold hover:text-slate-900 hover:underline dark:hover:text-white">
          Equipe de saúde
        </Link>
      </div>
    </footer>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-xl bg-sky-700 px-4 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:flex focus:min-h-toque focus:items-center"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<Spinner texto="Carregando…" className="min-h-[100dvh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

/** Cabeçalho padrão das páginas internas. */
export function PageHeader({ eyebrow, titulo, children, acoes, selo }) {
  return (
    <div className="relative flex flex-col gap-4 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
      <div className="max-w-2xl">
        {eyebrow && <p className="sobrelinha">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{titulo}</h1>
        {children && <p className="mt-4 text-lg leading-relaxed texto-suave">{children}</p>}
      </div>
      {(acoes || selo) && (
        <div className="flex flex-wrap items-center gap-3">
          {selo}
          {acoes}
        </div>
      )}
    </div>
  );
}
