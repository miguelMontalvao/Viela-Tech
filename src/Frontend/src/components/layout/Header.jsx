import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Wifi, WifiOff, X } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../../hooks/useTheme';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const LINKS = [
  { to: '/morador', rotulo: 'Sou morador' },
  { to: '/acs', rotulo: 'Painel ACS' },
  { to: '/gestor', rotulo: 'Gestor' },
];

function classeLink({ isActive }) {
  return `flex min-h-toque items-center rounded-xl px-4 font-semibold transition-colors ${
    isActive
      ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
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
          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
      }`}
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      {online ? 'Online' : 'Offline'}
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
      className="flex min-h-toque min-w-toque items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {escuro ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setMenuAberto(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="container-app flex h-16 items-center gap-3">
        <Link to="/" className="flex min-h-toque items-center gap-2.5 rounded-xl pr-2" aria-label="Viela Tech, página inicial">
          <Logo />
          <span className="text-lg font-extrabold tracking-tight">
            Viela <span className="text-sky-700 dark:text-sky-400">Tech</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
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
          <button
            type="button"
            className="flex min-h-toque min-w-toque items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
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
        <nav id="menu-movel" aria-label="Principal (celular)" className="border-t border-slate-200 dark:border-slate-800 md:hidden">
          <ul className="container-app flex flex-col gap-1 py-3">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={classeLink}>
                  {l.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
