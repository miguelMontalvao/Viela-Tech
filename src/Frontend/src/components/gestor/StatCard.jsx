/** Indicador numérico (KPI). Cor só no ícone; o número fica na cor de texto. */
export function StatCard({ icone: Icone, rotulo, valor, detalhe, tom = 'azul' }) {
  const tons = {
    azul: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    verde: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    vermelho: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    neutro: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  };
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tons[tom]}`}>
        <Icone className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold texto-suave">{rotulo}</p>
        <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight">{valor}</p>
        {detalhe && <p className="mt-1 text-sm texto-suave">{detalhe}</p>}
      </div>
    </div>
  );
}
