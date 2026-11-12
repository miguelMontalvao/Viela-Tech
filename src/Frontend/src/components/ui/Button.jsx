import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/*
 * Os fundos usam o tom 700 da mesma família da paleta oficial
 * (Azul Saúde Cívica / Verde Esmeralda) para garantir contraste AA
 * do texto branco, inclusive sob luz solar forte.
 */
const VARIANTES = {
  primaria:
    'bg-sky-700 text-white hover:bg-sky-800 active:bg-sky-900 dark:bg-sky-600 dark:hover:bg-sky-500 dark:text-slate-950',
  sucesso:
    'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-slate-950',
  perigo: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900',
  secundaria:
    'border-2 border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  fantasma: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
};

const TAMANHOS = {
  md: 'min-h-toque px-5 text-base',
  lg: 'min-h-12 px-6 text-base',
  icone: 'min-h-toque min-w-toque p-0',
};

/** Botão acessível com área de toque mínima de 48px. */
export const Button = forwardRef(function Button(
  { variante = 'primaria', tamanho = 'md', carregando = false, icone: Icone, className = '', children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors
        disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...props}
    >
      {carregando ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        Icone && <Icone className="h-5 w-5 shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});
