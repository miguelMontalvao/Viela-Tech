import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Logo } from '../brand/Logo';
import { OndasCalcadao } from '../brand/Enfeites';
import { Spinner } from '../ui/Feedback';

function Footer() {
  return (
    <footer className="mt-20">
      <OndasCalcadao />
      <div className="bg-slate-900 py-12 text-slate-300 dark:bg-black/40">
        <div className="container-app grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo assinatura invertido />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Onde o sol não chega, a saúde chega. Tecnologia cívica para encurtar o caminho entre a primeira tosse e o
              exame na Rocinha.
            </p>
          </div>
          <nav aria-label="Rodapé">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white">Acesso</p>
            <ul className="mt-3 space-y-1 text-sm">
              {[
                ['/morador', 'Fazer triagem'],
                ['/mapa', 'Mapa da tuberculose'],
                ['/entrar', 'Entrar como morador'],
                ['/equipe', 'Acesso da equipe de saúde'],
              ].map(([to, rotulo]) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-toque items-center hover:text-white hover:underline">
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-white">Projeto</p>
            <p className="mt-3 leading-relaxed text-slate-400">FIAP Global Solution 2026.2 · Turma 1ESSRA</p>
            <p className="mt-1 leading-relaxed text-slate-400">ODS 3, 10 e 11</p>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              A triagem não substitui consulta médica. Em caso de falta de ar forte ou tosse com sangue, procure atendimento
              imediatamente.
            </p>
          </div>
        </div>
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
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{titulo}</h1>
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
