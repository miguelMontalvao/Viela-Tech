import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';

/**
 * Aparência das faixas do IVM (Normal, Atenção, Perigo), compartilhada pelo painel de
 * microclima, pelo simulador e pelo boletim. Cores de risco só para status, sempre com
 * ícone e rótulo escrito.
 */
export const ICONE_FAIXA = { NORMAL: CheckCircle2, ATENCAO: AlertTriangle, PERIGO: OctagonAlert };

export const ESTILO_FAIXA = {
  NORMAL: 'bg-green-50 text-green-900 ring-green-200 dark:bg-green-950/60 dark:text-green-100 dark:ring-green-900',
  ATENCAO: 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:ring-amber-900',
  PERIGO: 'bg-red-50 text-red-900 ring-red-200 dark:bg-red-950/60 dark:text-red-100 dark:ring-red-900',
};
