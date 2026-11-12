import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowUp, MapPin, Phone, ShieldCheck, Siren } from 'lucide-react';
import { UNIDADES_SAUDE } from '../../domain/unidades';
import { Header } from './Header';
import { Logo } from '../brand/Logo';
import { Spinner } from '../ui/Feedback';

const ANO = new Date().getFullYear();

const COLUNAS = [
  {
    titulo: 'Para o morador',
    links: [
      ['/morador', 'Fazer a triagem'],
      ['/entrar', 'Entrar ou criar conta'],
      ['/minha-area', 'Minha área'],
      ['/mapa', 'Mapa da tuberculose'],
    ],
  },
  {
    titulo: 'Equipe de saúde',
    links: [
      ['/equipe', 'Acesso da equipe'],
      ['/acs', 'Fila de visitas do ACS'],
      ['/gestor', 'Painel do gestor'],
    ],
  },
  {
    titulo: 'Transparência',
    links: [
      ['/privacidade', 'Política de privacidade'],
      ['/termos', 'Termos de uso'],
      ['/privacidade#direitos', 'Seus direitos na LGPD'],
    ],
  },
];

function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      {/* Faixa de emergência */}
      <div className="border-b border-white/10">
        <div className="container-app flex flex-col gap-3 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5">
            <Siren className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
            <span>
              <strong className="text-white">Falta de ar forte ou tosse com sangue?</strong> Procure atendimento já. A triagem não substitui
              consulta médica.
            </span>
          </p>
          <a href="tel:192" className="inline-flex min-h-toque shrink-0 items-center gap-2 rounded-full bg-white/10 px-5 font-semibold text-white hover:bg-white/15">
            <Phone className="h-4 w-4" aria-hidden="true" /> SAMU 192
          </a>
        </div>
      </div>

      <div className="container-app grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="inline-flex min-h-toque items-center">
            <Logo invertido assinatura />
            <span className="sr-only">, página inicial</span>
          </Link>
          <p className="mt-5 max-w-sm leading-relaxed text-slate-400">
            Saúde cívica para as vielas da Rocinha: sensor de microclima, autotriagem de tosse e a fila dos agentes de saúde num só sistema.
          </p>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Onde fazer o exame de escarro</p>
            <ul className="mt-3 space-y-2 text-sm">
              {UNIDADES_SAUDE.map((u) => (
                <li key={u.nome} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span className="text-slate-200">{u.nome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8 lg:pl-12">
          {COLUNAS.map((c) => (
            <div key={c.titulo}>
              <p className="text-sm font-semibold text-white">{c.titulo}</p>
              <ul className="mt-3">
                {c.links.map(([to, rotulo]) => (
                  <li key={to}>
                    <Link to={to} className="inline-flex min-h-toque items-center text-slate-400 transition-colors hover:text-white">
                      {rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:col-span-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Seus dados, suas regras
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Tratamos só o necessário para organizar as visitas, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). Você pode pedir acesso,
              correção ou exclusão a qualquer momento.{' '}
              <Link to="/privacidade#direitos" className="font-semibold text-sky-300 hover:underline">
                Saiba como
              </Link>
              .
            </p>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col gap-3 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ANO} Viela Tech · Protótipo acadêmico da FIAP Global Solution 2026.2 · ODS 3, 10 e 11. Não é um serviço oficial da Prefeitura do Rio.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex min-h-toque items-center gap-1.5 self-start font-semibold text-slate-300 hover:text-white sm:self-auto"
          >
            Voltar ao topo <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function PularParaConteudo() {
  return (
    <a
      href="#conteudo"
      className="sr-only z-50 rounded-xl bg-sky-700 px-4 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:flex focus:min-h-toque focus:items-center"
    >
      Pular para o conteúdo
    </a>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PularParaConteudo />
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

/** Páginas em tela cheia (login): sem cabeçalho nem rodapé do site. */
export function TelaCheia() {
  return (
    <>
      <PularParaConteudo />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <Suspense fallback={<Spinner texto="Carregando…" className="min-h-[100dvh]" />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}

