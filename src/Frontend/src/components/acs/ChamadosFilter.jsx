import { Search } from 'lucide-react';

const FILTROS = [
  { id: 'abertos', rotulo: 'Em aberto' },
  { id: 'urgentes', rotulo: 'Urgentes' },
  { id: 'concluidos', rotulo: 'Concluídos' },
  { id: 'todos', rotulo: 'Todos' },
];

/** Busca por nome/setor e filtro por grupo da fila. */
export function ChamadosFilter({ filtro, aoMudarFiltro, busca, aoMudarBusca, contagens }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Filtrar chamados" className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const ativo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoMudarFiltro(f.id)}
              className={`inline-flex min-h-toque items-center gap-2 rounded-xl border-2 px-4 font-semibold transition-colors ${
                ativo
                  ? 'border-sky-700 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-600 dark:text-slate-950'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              {f.rotulo}
              <span
                className={`rounded-full px-2 text-sm ${
                  ativo ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                } ${f.id === 'urgentes' && contagens[f.id] > 0 && !ativo ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' : ''}`}
              >
                {contagens[f.id]}
              </span>
            </button>
          );
        })}
      </div>
      <div className="relative lg:w-72">
        <label htmlFor="busca-chamados" className="sr-only">
          Buscar por nome ou setor
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          id="busca-chamados"
          type="search"
          value={busca}
          onChange={(e) => aoMudarBusca(e.target.value)}
          placeholder="Buscar nome ou setor"
          className="campo pl-12"
        />
      </div>
    </div>
  );
}
