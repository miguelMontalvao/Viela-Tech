import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from 'lucide-react';

const TIPOS = {
  info: {
    icone: Info,
    classe: 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-50',
    corIcone: 'text-sky-700 dark:text-sky-300',
  },
  sucesso: {
    icone: CheckCircle2,
    classe: 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-50',
    corIcone: 'text-emerald-700 dark:text-emerald-300',
  },
  aviso: {
    icone: AlertTriangle,
    classe: 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-50',
    corIcone: 'text-amber-700 dark:text-amber-300',
  },
  erro: {
    icone: OctagonAlert,
    classe: 'border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950/60 dark:text-red-50',
    corIcone: 'text-red-700 dark:text-red-300',
  },
};

/** Mensagem de feedback. O ícone reforça o significado, mas o texto sempre explica sozinho. */
export function Alert({ tipo = 'info', titulo, children, acao, className = '', ...props }) {
  const { icone: Icone, classe, corIcone } = TIPOS[tipo];
  return (
    <div className={`flex gap-3 rounded-xl border-2 p-4 ${classe} ${className}`} {...props}>
      <Icone className={`mt-0.5 h-5 w-5 shrink-0 ${corIcone}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children && <div className={titulo ? 'mt-1 text-sm leading-relaxed' : 'text-sm leading-relaxed'}>{children}</div>}
      </div>
      {acao}
    </div>
  );
}
