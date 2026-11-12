import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NimbusIcons } from '../ui/nimbusIcons';

// A barra líquida (WebGL) só existe no desktop: no celular nem é baixada.
const LiquidNavbar = lazy(() => import('../ui/LiquidNavbar'));

function useDesktop() {
  const consulta = '(min-width: 1024px)';
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(consulta).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(consulta);
    if (!mq) return undefined;
    const mudar = () => setDesktop(mq.matches);
    mq.addEventListener('change', mudar);
    return () => mq.removeEventListener('change', mudar);
  }, []);
  return desktop;
}
import { ArrowRight, LogIn, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useTheme } from '../../hooks/useTheme';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useAuth } from '../../hooks/useAuth';
import { PAPEIS } from '../../domain/perfis';

const INICIO = { to: '/', rotulo: 'Início', icone: NimbusIcons.home, fx: 'glow' };
const TRIAGEM = { to: '/morador', rotulo: 'Fazer triagem', icone: NimbusIcons.clipboard, fx: 'pop' };
const MAPA = { to: '/mapa', rotulo: 'Mapa da TB', icone: NimbusIcons.globe, fx: 'spin' };

function linksDoPapel(papel) {
  if (papel === PAPEIS.GESTOR)
    return [
      { to: '/gestor', rotulo: 'Dashboard', icone: NimbusIcons.chart, fx: 'pop' },
      { to: '/acs', rotulo: 'Fila de visitas', icone: NimbusIcons.list, fx: 'pop' },
      MAPA,
    ];
  if (papel === PAPEIS.ACS) return [{ to: '/acs', rotulo: 'Fila de visitas', icone: NimbusIcons.list, fx: 'pop' }, TRIAGEM, MAPA];
  if (papel === PAPEIS.MORADOR) return [INICIO, { to: '/minha-area', rotulo: 'Minha área', icone: NimbusIcons.user, fx: 'wave' }, TRIAGEM, MAPA];
  return [INICIO, TRIAGEM, MAPA];
}

/** Indicador de conexão: um ponto que pulsa, com o texto a partir do desktop. */
export function OnlineBadge() {
  const online = useOnlineStatus();
  return (
    <span
      role="status"
      title={online ? 'Conectado' : 'Sem internet: o que você fizer fica salvo no aparelho'}
      className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 dark:text-slate-300"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        {online && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      </span>
      <span className="sr-only xl:not-sr-only">{online ? 'Online' : 'Offline'}</span>
    </span>
  );
}

export function ThemeToggle() {
  const { escuro, alternarTema } = useTheme();
  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={escuro}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
      className="group flex min-h-toque min-w-toque items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      <span key={String(escuro)} className="animate-girar-entrar">
        {escuro ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      </span>
    </button>
  );
}

function BotaoConta({ movel = false }) {
  const { autenticado, logout } = useAuth();
  const base = `group inline-flex min-h-toque items-center justify-center gap-2 rounded-full px-5 font-semibold transition-all ${movel ? 'w-full text-lg' : ''}`;
  if (autenticado) {
    return (
      <button
        type="button"
        onClick={logout}
        className={`${base} text-slate-700 ring-1 ring-slate-300 hover:bg-slate-900/5 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-white/10`}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sair
      </button>
    );
  }
  return (
    <Link
      to="/entrar"
      className={`${base} bg-slate-900 text-white shadow-sm hover:-translate-y-px hover:bg-slate-800 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100`}
    >
      <LogIn className="h-4 w-4" aria-hidden="true" />
      Entrar
      <ArrowRight className="-ml-1 h-4 w-0 opacity-0 transition-all group-hover:ml-0 group-hover:w-4 group-hover:opacity-100" aria-hidden="true" />
    </Link>
  );
}

/** Barra fina que mostra quanto da página já foi lida. */
function ProgressoLeitura() {
  const ref = useRef(null);
  useEffect(() => {
    let id;
    const atualizar = () => {
      cancelAnimationFrame(id);
      id = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      });
    };
    atualizar();
    addEventListener('scroll', atualizar, { passive: true });
    addEventListener('resize', atualizar);
    return () => {
      removeEventListener('scroll', atualizar);
      removeEventListener('resize', atualizar);
      cancelAnimationFrame(id);
    };
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-sky-600 to-emerald-500"
    />
  );
}

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const { pathname } = useLocation();
  const { papel } = useAuth();
  const links = linksDoPapel(papel);
  const navigate = useNavigate();
  const { escuro } = useTheme();
  const desktop = useDesktop();

  useEffect(() => setMenuAberto(false), [pathname]);

  useEffect(() => {
    const aoRolar = () => setRolou(scrollY > 12);
    aoRolar();
    addEventListener('scroll', aoRolar, { passive: true });
    return () => removeEventListener('scroll', aoRolar);
  }, []);

  // Esc fecha o menu do celular e trava a rolagem enquanto ele está aberto.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && setMenuAberto(false);
    addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [menuAberto]);

  const flutuante = rolou && !menuAberto;

  return (
    <>
      <header className="animate-descer sticky top-0 z-30 h-16 sm:h-[4.5rem]">
        <div className={`transition-[padding] duration-500 ease-out ${flutuante ? 'px-2 pt-2 sm:px-4' : 'px-0 pt-0'}`}>
          <div
            className={`relative mx-auto transition-all duration-500 ease-out ${
              flutuante
                ? 'max-w-7xl rounded-full bg-white shadow-lg shadow-slate-900/[0.07] ring-1 ring-slate-900/[0.06] dark:bg-slate-900 dark:ring-white/10'
                : 'max-w-full rounded-none bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)] dark:bg-slate-900 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            }`}
          >
            <div
              className={`container-app relative flex items-center gap-3 transition-[height] duration-500 ${flutuante ? 'h-14 !px-3 sm:!px-4' : 'h-16 sm:h-[4.5rem]'}`}
            >
              <Link
                to="/"
                onClick={() => {
                  // Já na Home, o link não muda de rota: sobe até o topo.
                  if (pathname === '/') window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                }}
                className="flex min-h-toque items-center rounded-xl pr-2 transition-transform hover:scale-[1.02]"
              >
                <Logo />
                <span className="sr-only">, página inicial</span>
              </Link>

              {desktop && (
                <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
                  <Suspense fallback={null}>
                    <LiquidNavbar
                      items={links.map((l) => ({ label: l.rotulo, href: l.to, icon: l.icone, fx: l.fx }))}
                      active={links.findIndex((l) => l.to === pathname)}
                      onNavigate={(to) => navigate(to)}
                      tone={escuro ? 'dark' : 'light'}
                    />
                  </Suspense>
                </div>
              )}

              <div className="ml-auto flex items-center gap-1 sm:gap-2">
                <OnlineBadge />
                <ThemeToggle />
                <div className="hidden lg:block">
                  <BotaoConta />
                </div>
                <button
                  type="button"
                  className="flex min-h-toque min-w-toque items-center justify-center rounded-full text-slate-800 hover:bg-slate-900/5 dark:text-slate-100 dark:hover:bg-white/10 lg:hidden"
                  aria-expanded={menuAberto}
                  aria-controls="menu-movel"
                  aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
                  onClick={() => setMenuAberto((v) => !v)}
                >
                  <span key={String(menuAberto)} className="animate-girar-entrar">
                    {menuAberto ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                  </span>
                </button>
              </div>
            </div>
            <span
              className={`pointer-events-none absolute inset-x-6 bottom-0 overflow-hidden ${flutuante ? 'opacity-100' : 'opacity-0'} transition-opacity`}
            >
              <ProgressoLeitura />
            </span>
          </div>
        </div>
      </header>

      {menuAberto && (
        <nav
          id="menu-movel"
          aria-label="Principal (celular)"
          className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-white dark:bg-slate-900 sm:top-[4.5rem] lg:hidden"
        >
          <ul className="container-app flex flex-col py-6">
            {links.map((l, i) => (
              <li key={l.to} className="animate-surgir border-b border-slate-200 dark:border-slate-800" style={{ animationDelay: `${i * 60}ms` }}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `flex min-h-16 items-center justify-between text-2xl font-semibold tracking-tight ${isActive ? 'text-sky-700 dark:text-sky-400' : ''}`
                  }
                >
                  {l.rotulo}
                  <ArrowRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </NavLink>
              </li>
            ))}
            <li className="animate-surgir pt-8" style={{ animationDelay: `${links.length * 60}ms` }}>
              <BotaoConta movel />
            </li>
            <li className="animate-surgir pt-6 text-sm texto-suave" style={{ animationDelay: `${(links.length + 1) * 60}ms` }}>
              <Link to="/privacidade" className="inline-flex min-h-toque items-center pr-4 font-medium">
                Privacidade
              </Link>
              <Link to="/termos" className="inline-flex min-h-toque items-center font-medium">
                Termos de uso
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
