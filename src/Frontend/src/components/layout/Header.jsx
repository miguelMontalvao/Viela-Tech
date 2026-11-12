import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Menu, Moon, Sun, Wifi, WifiOff, X } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useTheme } from '../../hooks/useTheme';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useAuth } from '../../hooks/useAuth';
import { PAPEIS } from '../../domain/perfis';

const LINKS_PUBLICOS = [
  { to: '/morador', rotulo: 'Fazer triagem' },
  { to: '/mapa', rotulo: 'Mapa da TB' },
];

function linksDoPapel(papel) {
  if (papel === PAPEIS.GESTOR) return [{ to: '/gestor', rotulo: 'Dashboard' }, { to: '/acs', rotulo: 'Fila de visitas' }, ...LINKS_PUBLICOS.slice(1)];
  if (papel === PAPEIS.ACS) return [{ to: '/acs', rotulo: 'Fila de visitas' }, ...LINKS_PUBLICOS];
  if (papel === PAPEIS.MORADOR) return [{ to: '/minha-area', rotulo: 'Minha área' }, ...LINKS_PUBLICOS];
  return LINKS_PUBLICOS;
}

function classeLink({ isActive }) {
  return `relative flex min-h-toque items-center rounded-full px-3 text-[15px] font-medium transition-colors ${
    isActive
      ? 'text-slate-900 dark:text-white'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  }`;
}

export function OnlineBadge() {
  const online = useOnlineStatus();
  const Icone = online ? Wifi : WifiOff;
  return (
    <span
      role="status"
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
        online
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'bg-sol-100 text-sol-900 dark:bg-slate-700 dark:text-slate-100'
      }`}
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">{online ? 'Online' : 'Offline'}</span>
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
      className="flex min-h-toque min-w-toque items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      {escuro ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

function BotaoConta({ movel = false }) {
  const { autenticado, logout } = useAuth();
  const base = `inline-flex min-h-toque items-center justify-center gap-2 rounded-full px-4 font-semibold transition-colors ${movel ? 'w-full' : ''}`;
  if (autenticado) {
    return (
      <button type="button" onClick={logout} className={`${base} text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10`}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sair
      </button>
    );
  }
  return (
    <Link to="/entrar" className={`${base} bg-sky-700 text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400`}>
      <LogIn className="h-4 w-4" aria-hidden="true" />
      Entrar
    </Link>
  );
}

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const { papel } = useAuth();
  const links = linksDoPapel(papel);

  useEffect(() => setMenuAberto(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-noite/80">
      <div className="container-app flex h-16 items-center gap-3 sm:h-[4.5rem]">
        <Link to="/" className="flex min-h-toque items-center rounded-xl pr-2">
          <Logo />
          <span className="sr-only">, página inicial</span>
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={classeLink}>
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

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
            {menuAberto ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav id="menu-movel" aria-label="Principal (celular)" className="border-t border-slate-900/5 bg-slate-50 dark:border-white/10 dark:bg-noite lg:hidden">
          <ul className="container-app flex flex-col gap-1 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={classeLink}>
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <BotaoConta movel />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
