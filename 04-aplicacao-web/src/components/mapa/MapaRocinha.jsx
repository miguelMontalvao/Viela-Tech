import { useMemo, useState } from 'react';
import { Map as MapIcon, Siren, Table2 } from 'lucide-react';
import { SETORES_ROCINHA, SETOR_OUTROS, contarPorSetor } from '../../domain/setores';
import { ehUrgente } from '../../domain/risco';

/*
 * Mapa esquemático da Rocinha pintado pelas triagens do app.
 * Escala sequencial de um só tom (azul), validada com o validate_palette (modo ordinal) nos dois temas:
 * claro sky-400→900 sobre branco, escuro sky-700→100 sobre slate-800.
 * Fica só na área da equipe: contagens pequenas de uma doença por sub-área podem identificar pessoas.
 */
const ESCALA = [
  { min: 0, classe: 'fill-slate-100 dark:fill-slate-800', texto: 'fill-slate-500 dark:fill-slate-400', rotulo: 'Nenhuma' },
  { min: 1, classe: 'fill-sky-400 dark:fill-sky-700', texto: 'fill-slate-950 dark:fill-white', rotulo: '1' },
  { min: 2, classe: 'fill-sky-500 dark:fill-sky-500', texto: 'fill-slate-950', rotulo: '2 a 3' },
  { min: 4, classe: 'fill-sky-700 dark:fill-sky-300', texto: 'fill-white dark:fill-slate-950', rotulo: '4 a 6' },
  { min: 7, classe: 'fill-sky-900 dark:fill-sky-100', texto: 'fill-white dark:fill-slate-950', rotulo: '7 ou mais' },
];
const faixa = (n) => [...ESCALA].reverse().find((e) => n >= e.min);

const LARG = 132;
const ALT = 92;
const GAP = 10;

export function MapaRocinha({ chamados }) {
  const contagem = useMemo(() => contarPorSetor(chamados, ehUrgente), [chamados]);
  const [selecionado, setSelecionado] = useState(null);
  const [verTabela, setVerTabela] = useState(false);
  const outros = contagem.get(SETOR_OUTROS.id);
  const detalhe = selecionado ? contagem.get(selecionado) : null;

  const largura = 6 * (LARG + GAP) + LARG / 2;
  const altura = 4 * (ALT + GAP);

  return (
    <section aria-labelledby="mapa-rocinha-titulo" className="painel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <h2 id="mapa-rocinha-titulo" className="text-xl font-semibold">
            Triagens por sub-área da Rocinha
          </h2>
          <p className="mt-1 text-sm texto-suave">
            Mapa esquemático: as posições são aproximadas, do alto do morro (em cima) até a pista (embaixo). O setor é
            reconhecido a partir do que o morador digitou.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVerTabela((v) => !v)}
          aria-pressed={verTabela}
          className="inline-flex min-h-toque shrink-0 items-center gap-2 rounded-full px-4 font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
        >
          {verTabela ? <MapIcon className="h-4 w-4" aria-hidden="true" /> : <Table2 className="h-4 w-4" aria-hidden="true" />}
          {verTabela ? 'Ver mapa' : 'Ver tabela'}
        </button>
      </div>

      {verTabela ? (
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Triagens e casos urgentes por sub-área</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="py-2 pr-4 font-semibold">Sub-área</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Triagens</th>
                <th scope="col" className="py-2 text-right font-semibold">Urgentes</th>
              </tr>
            </thead>
            <tbody>
              {[...contagem.values()]
                .filter((c) => c.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((c) => (
                  <tr key={c.setor.id} className="border-b border-slate-100 dark:border-slate-800">
                    <th scope="row" className="py-2 pr-4 font-medium">{c.setor.nome}</th>
                    <td className="py-2 pr-4 text-right tabular-nums">{c.total}</td>
                    <td className="py-2 text-right tabular-nums">{c.urgentes}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_16rem]">
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${largura} ${altura}`} className="min-w-[36rem]" role="group" aria-label="Mapa esquemático das sub-áreas da Rocinha">
              {SETORES_ROCINHA.map((s) => {
                const c = contagem.get(s.id);
                const f = faixa(c.total);
                const x = s.col * (LARG + GAP) + (s.lin % 2 ? LARG / 2 : 0);
                const y = s.lin * (ALT + GAP);
                const ativo = selecionado === s.id;
                return (
                  <g
                    key={s.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${s.nome}: ${c.total} ${c.total === 1 ? 'triagem' : 'triagens'}, ${c.urgentes} ${c.urgentes === 1 ? 'urgente' : 'urgentes'}`}
                    aria-pressed={ativo}
                    onMouseEnter={() => setSelecionado(s.id)}
                    onFocus={() => setSelecionado(s.id)}
                    onClick={() => setSelecionado(s.id)}
                    className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-sky-500"
                  >
                    <rect
                      x={x + 2}
                      y={y + 2}
                      width={LARG - 4}
                      height={ALT - 4}
                      rx="18"
                      strokeWidth={ativo ? 4 : 2}
                      className={`${f.classe} ${ativo ? 'stroke-slate-900 dark:stroke-white' : 'stroke-white dark:stroke-noite'} transition-[stroke-width]`}
                    />
                    <text x={x + 14} y={y + 30} className={`${f.texto} font-sans text-[13px] font-semibold`}>
                      {s.nome}
                    </text>
                    <text x={x + 14} y={y + 66} className={`${f.texto} font-display text-[26px] font-semibold`}>
                      {c.total}
                    </text>
                    {c.urgentes > 0 && (
                      <g>
                        <rect x={x + LARG - 46} y={y + 46} width="34" height="26" rx="13" className="fill-red-600" />
                        <text x={x + LARG - 29} y={y + 64} textAnchor="middle" className="fill-white font-sans text-[13px] font-semibold">
                          {c.urgentes}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-4">
            <div aria-live="polite" className="min-h-[7.5rem] rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              {detalhe ? (
                <>
                  <p className="text-base font-semibold">{detalhe.setor.nome}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{detalhe.total}</p>
                  <p className="text-sm texto-suave">{detalhe.total === 1 ? 'triagem registrada' : 'triagens registradas'}</p>
                  {detalhe.urgentes > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-300">
                      <Siren className="h-4 w-4" aria-hidden="true" />
                      {detalhe.urgentes} com tosse há 21 dias ou mais
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm texto-suave">Passe o mouse, toque ou navegue com Tab por uma sub-área para ver os detalhes.</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Triagens por sub-área</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {ESCALA.map((e) => (
                  <li key={e.rotulo} className="flex items-center gap-2">
                    <svg className="h-4 w-6" aria-hidden="true">
                      <rect width="24" height="16" rx="4" className={`${e.classe} stroke-slate-300 dark:stroke-slate-600`} />
                    </svg>
                    {e.rotulo}
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <span className="flex h-4 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white" aria-hidden="true">
                    n
                  </span>
                  Casos urgentes (tosse +21 dias)
                </li>
              </ul>
            </div>

            {outros.total > 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-3 text-sm texto-suave dark:border-slate-600">
                <strong className="text-slate-900 dark:text-white">{outros.total}</strong>{' '}
                {outros.total === 1 ? 'triagem não teve o setor reconhecido' : 'triagens não tiveram o setor reconhecido'} e
                {outros.total === 1 ? ' ficou' : ' ficaram'} fora do mapa.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
