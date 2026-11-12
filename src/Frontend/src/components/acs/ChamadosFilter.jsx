import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

const FILTROS = [
  { id: 'abertos', rotulo: 'Em aberto' },
  { id: 'urgentes', rotulo: 'Urgentes' },
  { id: 'concluidos', rotulo: 'Concluídos' },
  { id: 'todos', rotulo: 'Todos' },
];

/** Busca por nome/setor e filtro por grupo da fila, com destaque que desliza até o filtro ativo. */
export function ChamadosFilter({ filtro, aoMudarFiltro, busca, aoMudarBusca, contagens }) {
  const grupoRef = useRef(null);
  const buscaRef = useRef(null);
  const [indicador, setIndicador] = useState(null);

  const medir = useCallback(() => {
    const el = grupoRef.current?.querySelector('[aria-pressed="true"]');
    if (el) setIndicador({ left: el.offsetLeft, width: el.offsetWidth });
  }, []);
  useLayoutEffect(() => {
    medir();
    document.fonts?.ready.then(medir);
    addEventListener('resize', medir);
    return () => removeEventListener('resize', medir);
  }, [filtro, contagens, medir]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div ref={grupoRef} role="group" aria-label="Filtrar chamados" className="relative inline-flex gap-1 rounded-2xl bg-slate-900/5 p-1 dark:bg-white/5">
          <span
            aria-hidden="true"
            className="absolute inset-y-1 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 ease-out dark:bg-slate-700 dark:ring-white/10"
            style={indicador ?? { opacity: 0 }}
          />
          {FILTROS.map((f) => {
            const ativo = filtro === f.id;
            const alerta = f.id === 'urgentes' && contagens[f.id] > 0;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={ativo}
                onClick={() => aoMudarFiltro(f.id)}
                className={`relative inline-flex min-h-toque shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 font-semibold transition-colors ${
                  ativo ? 'text-slate-900 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {f.rotulo}
                <span
                  className={`min-w-6 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums leading-6 ${
                    alerta ? 'bg-red-600 text-white' : ativo ? 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100' : 'bg-slate-900/5 dark:bg-white/10'
                  }`}
                >
                  {contagens[f.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative lg:w-80">
        <label htmlFor="busca-chamados" className="sr-only">
          Buscar por nome ou setor
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          ref={buscaRef}
          id="busca-chamados"
          type="search"
          value={busca}
          onChange={(e) => aoMudarBusca(e.target.value)}
          placeholder="Buscar nome ou setor"
          className="campo rounded-2xl pl-12 pr-12 [&::-webkit-search-cancel-button]:hidden"
        />
        {busca && (
          <button
            type="button"
            onClick={() => {
              aoMudarBusca('');
              buscaRef.current?.focus();
            }}
            aria-label="Limpar busca"
            className="animate-surgir absolute inset-y-0 right-0 flex min-w-toque items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
