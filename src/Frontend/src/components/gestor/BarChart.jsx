import { useId, useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

/*
 * Gráfico de barras horizontais de série única.
 * - Uma só cor (#0284C7, validada contra os cards claro e escuro): sem legenda, o título nomeia a série.
 * - Barras finas, ancoradas à esquerda, ponta arredondada de 4px e respiro entre barras.
 * - Valores e rótulos usam as cores de texto, nunca a cor da série.
 * - Tooltip ao passar o mouse ou focar pelo teclado; tabela equivalente para leitores de tela.
 */
export function BarChart({ titulo, descricao, dados, unidade = ['triagem', 'triagens'] }) {
  const [verTabela, setVerTabela] = useState(false);
  const [ativo, setAtivo] = useState(null);
  const idTitulo = useId();
  const total = dados.reduce((s, d) => s + d.valor, 0);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <figure className="card flex flex-col p-5" aria-labelledby={idTitulo}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <figcaption id={idTitulo} className="font-bold">
            {titulo}
          </figcaption>
          {descricao && <p className="mt-0.5 text-sm texto-suave">{descricao}</p>}
        </div>
        <button
          type="button"
          onClick={() => setVerTabela((v) => !v)}
          aria-pressed={verTabela}
          className="inline-flex min-h-toque shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-sky-800 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          {verTabela ? <BarChart3 className="h-4 w-4" aria-hidden="true" /> : <Table2 className="h-4 w-4" aria-hidden="true" />}
          {verTabela ? 'Ver gráfico' : 'Ver tabela'}
        </button>
      </div>

      {verTabela ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 texto-suave dark:border-slate-700">
              <th scope="col" className="py-2 font-semibold">Categoria</th>
              <th scope="col" className="py-2 text-right font-semibold">Quantidade</th>
              <th scope="col" className="py-2 text-right font-semibold">% do total</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.chave} className="border-b border-slate-100 dark:border-slate-700/60">
                <th scope="row" className="py-2 font-medium">{d.rotulo}</th>
                <td className="py-2 text-right tabular-nums">{d.valor}</td>
                <td className="py-2 text-right tabular-nums">{pct(d.valor)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="mt-5 space-y-3" aria-label={`${titulo}: ${dados.map((d) => `${d.rotulo}, ${d.valor}`).join('; ')}`}>
          {dados.map((d) => {
            const largura = d.valor ? Math.max(2, (d.valor / maximo) * 100) : 0;
            const mostrando = ativo === d.chave;
            return (
              <li
                key={d.chave}
                tabIndex={0}
                onMouseEnter={() => setAtivo(d.chave)}
                onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(d.chave)}
                onBlur={() => setAtivo(null)}
                className="relative grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 rounded-lg py-1 sm:grid-cols-[minmax(0,11rem)_1fr_3rem]"
              >
                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200" title={d.rotulo}>
                  {d.rotulo}
                </span>
                <span className="relative h-5 rounded-r bg-slate-100 dark:bg-slate-700/50" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded-r transition-[width] duration-500"
                    style={{ width: `${largura}%`, backgroundColor: '#0284C7', opacity: ativo && !mostrando ? 0.55 : 1 }}
                  />
                </span>
                <span className="text-right text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{d.valor}</span>
                {mostrando && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
                  >
                    {d.rotulo}: <strong>{d.valor}</strong> {d.valor === 1 ? unidade[0] : unidade[1]} · {pct(d.valor)}% do total
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
