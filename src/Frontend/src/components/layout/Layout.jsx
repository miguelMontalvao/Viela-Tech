import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Logo } from './Logo';

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 text-sm texto-suave dark:border-slate-800">
      <div className="container-app flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span>
            <strong className="text-slate-900 dark:text-slate-100">Viela Tech</strong> · Onde o sol não chega, a saúde chega.
          </span>
        </div>
        <p>FIAP Global Solution 2026.2 · Turma 1ESSRA · ODS 3, 10 e 11</p>
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
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Cabeçalho padrão das páginas internas. */
export function PageHeader({ eyebrow, titulo, children, acoes }) {
  return (
    <div className="flex flex-col gap-4 pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pt-10">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{titulo}</h1>
        {children && <p className="mt-3 text-lg texto-suave">{children}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}
