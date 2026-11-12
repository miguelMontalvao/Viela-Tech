import { Loader2 } from 'lucide-react';

/** Indicador de carregamento anunciado para leitores de tela. */
export function Spinner({ texto = 'Carregando…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 py-10 texto-suave ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-sky-400" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}

/** Estado vazio com ícone, título e explicação curta. */
export function EmptyState({ icone: Icone, titulo, children, acao }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icone && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          <Icone className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <p className="text-lg font-semibold">{titulo}</p>
      {children && <p className="mt-1 max-w-md text-sm texto-suave">{children}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/** Rótulo curto (status, sinalização). */
export function Badge({ children, className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
