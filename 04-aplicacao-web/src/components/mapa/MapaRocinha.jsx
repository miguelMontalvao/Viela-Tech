import { useMemo, useState } from 'react';
import { Flame, Info, Map as MapIcon, Siren, Table2 } from 'lucide-react';
import { SETORES_ROCINHA, SETOR_OUTROS, contarPorSetor } from '../../domain/setores';
import { ehUrgente, classificarIVM, LIMIAR_ATENCAO, LIMIAR_PERIGO } from '../../domain/risco';
import { CAMADAS, contarCamada, intensidade, ivmSimuladoPorSetor, nivelConcentracao, rotuloValor } from '../../domain/heatmap';

/*
 * Mapa esquemático da Rocinha pintado pelas triagens do app.
 * Escala sequencial de um só tom (azul), validada com o validate_palette (modo ordinal) nos dois temas:
 * claro sky-400→900 sobre branco, escuro sky-700→100 sobre slate-800.
 * Fica só na área da equipe: contagens pequenas de uma doença por sub-área podem identificar pessoas.
 *
 * Modo "Mapa de calor": camadas de concentração (índigo, de propósito fora do semáforo para não
 * confundir volume de registros com risco) e a camada de IVM, a única que usa verde/âmbar/vermelho.
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

const classeCirculoIvm = { NORMAL: 'fill-green-600', ATENCAO: 'fill-amber-500', PERIGO: 'fill-red-600' };
const simboloIvm = { NORMAL: '●', ATENCAO: '▲', PERIGO: '■' };
const HALO = '[paint-order:stroke] stroke-white/90 dark:stroke-slate-900/90';

export function MapaRocinha({ chamados, ivmReferencia = null }) {
  const contagem = useMemo(() => contarPorSetor(chamados, ehUrgente), [chamados]);
  const [selecionado, setSelecionado] = useState(null);
  const [verTabela, setVerTabela] = useState(false);
  const [calor, setCalor] = useState(false);
  const [camadaId, setCamadaId] = useState('notificacoes');
  const outros = contagem.get(SETOR_OUTROS.id);
  const detalhe = selecionado ? contagem.get(selecionado) : null;

  const camada = CAMADAS.find((c) => c.id === camadaId);
  const ehIvm = camadaId === 'ivm';
  const valores = useMemo(() => (ehIvm ? ivmSimuladoPorSetor(ivmReferencia) : contarCamada(chamados, camadaId)), [chamados, camadaId, ehIvm, ivmReferencia]);
  const maximo = useMemo(() => (valores && !ehIvm ? Math.max(0, ...valores.values()) : 100), [valores, ehIvm]);
  const semIvm = calor && ehIvm && !valores;

  const info = (id) => {
    const v = valores?.get(id) ?? 0;
    if (ehIvm) {
      const cl = classificarIVM(v);
      return { v, razao: v / 100, rotuloCelula: v ? v.toFixed(0) : '–', nivel: cl?.rotulo ?? 'Sem leitura', cl };
    }
    const razao = intensidade(v, maximo);
    return { v, razao, rotuloCelula: rotuloValor(v), nivel: nivelConcentracao(razao), cl: null };
  };

  const largura = 6 * (LARG + GAP) + LARG / 2;
  const altura = 4 * (ALT + GAP);
  const posicao = (s) => ({ x: s.col * (LARG + GAP) + (s.lin % 2 ? LARG / 2 : 0), y: s.lin * (ALT + GAP) });
  const infoSel = selecionado ? info(selecionado) : null;
  const nomeSel = SETORES_ROCINHA.find((s) => s.id === selecionado)?.nome;

  const escolherCamada = (id) => {
    setCamadaId(id);
    setCalor(true);
    setVerTabela(false);
  };

  return (
    <section aria-labelledby="mapa-rocinha-titulo" className="painel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <h2 id="mapa-rocinha-titulo" className="text-xl font-semibold">
            {calor ? `Mapa de calor · ${camada.rotulo}` : 'Triagens por sub-área da Rocinha'}
          </h2>
          <p className="mt-1 text-sm texto-suave">
            Mapa esquemático: as posições são aproximadas, do alto do morro (em cima) até a pista (embaixo). O setor é
            reconhecido a partir do que o morador digitou.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={calor}
            onClick={() => setCalor((v) => !v)}
            className={`inline-flex min-h-toque items-center gap-2 rounded-full px-4 font-semibold ring-1 transition-colors ${
              calor
                ? 'bg-indigo-700 text-white ring-indigo-700 dark:bg-indigo-300 dark:text-slate-950 dark:ring-indigo-300'
                : 'text-slate-800 ring-slate-300 hover:bg-slate-50 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            Mapa de calor: {calor ? 'ligado' : 'desligado'}
          </button>
          <button
            type="button"
            onClick={() => setVerTabela((v) => !v)}
            aria-pressed={verTabela}
            className="inline-flex min-h-toque items-center gap-2 rounded-full px-4 font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
          >
            {verTabela ? <MapIcon className="h-4 w-4" aria-hidden="true" /> : <Table2 className="h-4 w-4" aria-hidden="true" />}
            {verTabela ? 'Ver mapa' : 'Ver tabela'}
          </button>
        </div>
      </div>

      {calor && (
        <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 sm:px-6">
          <div role="radiogroup" aria-label="Camada do mapa de calor" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {CAMADAS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={camadaId === c.id}
                onClick={() => escolherCamada(c.id)}
                title={c.descricao}
                className={`min-h-toque shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                  camadaId === c.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-900/5 text-slate-700 hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                }`}
              >
                {c.rotulo}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm texto-suave">{camada.descricao}.</p>
        </div>
      )}

      {verTabela ? (
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{calor ? `${camada.rotulo} por sub-área` : 'Triagens e casos urgentes por sub-área'}</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="py-2 pr-4 font-semibold">Sub-área</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">{calor ? camada.rotulo : 'Triagens'}</th>
                <th scope="col" className="py-2 text-right font-semibold">{calor ? (ehIvm ? 'Faixa' : 'Concentração') : 'Urgentes'}</th>
              </tr>
            </thead>
            <tbody>
              {calor
                ? SETORES_ROCINHA.map((s) => ({ s, i: info(s.id) }))
                    .filter(({ i }) => i.v > 0)
                    .sort((a, b) => b.i.v - a.i.v)
                    .map(({ s, i }) => (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                        <th scope="row" className="py-2 pr-4 font-medium">{s.nome}</th>
                        <td className="py-2 pr-4 text-right tabular-nums">{ehIvm ? i.v.toFixed(0) : rotuloValor(i.v)}</td>
                        <td className="py-2 text-right">{i.nivel}</td>
                      </tr>
                    ))
                : [...contagem.values()]
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
              {calor && (
                <defs>
                  <clipPath id="recorte-setores">
                    {SETORES_ROCINHA.map((s) => {
                      const { x, y } = posicao(s);
                      return <rect key={s.id} x={x + 2} y={y + 2} width={LARG - 4} height={ALT - 4} rx="18" />;
                    })}
                  </clipPath>
                  <filter id="suave-calor" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="16" />
                  </filter>
                </defs>
              )}

              {/* base dos setores (e, no modo contagem, a escala azul) */}
              {SETORES_ROCINHA.map((s) => {
                const c = contagem.get(s.id);
                const f = faixa(c.total);
                const { x, y } = posicao(s);
                const ativo = selecionado === s.id;
                const i = calor ? info(s.id) : null;
                return (
                  <g
                    key={s.id}
                    tabIndex={0}
                    role="button"
                    aria-label={
                      calor
                        ? `${s.nome}: ${camada.rotulo}, ${ehIvm ? `IVM ${i.v ? i.v.toFixed(0) : 'sem leitura'} (${i.nivel}, simulado)` : `${rotuloValor(i.v)}, concentração ${i.nivel.toLowerCase()}`}`
                        : `${s.nome}: ${c.total} ${c.total === 1 ? 'triagem' : 'triagens'}, ${c.urgentes} ${c.urgentes === 1 ? 'urgente' : 'urgentes'}`
                    }
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
                      className={`${calor ? 'fill-slate-100 dark:fill-slate-800' : f.classe} ${ativo ? 'stroke-slate-900 dark:stroke-white' : 'stroke-white dark:stroke-noite'} transition-[stroke-width]`}
                    />
                    {!calor && (
                      <>
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
                      </>
                    )}
                  </g>
                );
              })}

              {/* manchas de calor, suavizadas e recortadas pelo contorno dos setores */}
              {calor && !semIvm && (
                <g clipPath="url(#recorte-setores)" filter="url(#suave-calor)" pointerEvents="none" aria-hidden="true">
                  {SETORES_ROCINHA.map((s) => {
                    const i = info(s.id);
                    if (!i.v) return null;
                    const { x, y } = posicao(s);
                    return (
                      <circle
                        key={s.id}
                        cx={x + LARG / 2}
                        cy={y + ALT / 2}
                        r={ehIvm ? 70 : 52 + 26 * i.razao}
                        opacity={ehIvm ? 0.85 : 0.18 + 0.82 * i.razao}
                        className={ehIvm ? classeCirculoIvm[i.cl?.id] ?? 'fill-slate-400' : 'fill-indigo-600 dark:fill-indigo-400'}
                      />
                    );
                  })}
                </g>
              )}

              {/* rótulos por cima das manchas */}
              {calor &&
                SETORES_ROCINHA.map((s) => {
                  const { x, y } = posicao(s);
                  const i = info(s.id);
                  return (
                    <g key={s.id} pointerEvents="none" aria-hidden="true">
                      <text x={x + 14} y={y + 28} strokeWidth="4" className={`${HALO} fill-slate-900 font-sans text-[13px] font-semibold dark:fill-white`}>
                        {s.nome}
                      </text>
                      <text x={x + 14} y={y + 62} strokeWidth="5" className={`${HALO} fill-slate-900 font-display text-[24px] font-semibold dark:fill-white`}>
                        {i.rotuloCelula}
                      </text>
                      <text x={x + 14} y={y + 80} strokeWidth="4" className={`${HALO} fill-slate-800 font-sans text-[11px] font-semibold dark:fill-slate-100`}>
                        {ehIvm && i.cl ? `${simboloIvm[i.cl.id]} ${i.nivel}` : i.v ? i.nivel : ''}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>

          <div className="space-y-4">
            <div aria-live="polite" className="min-h-[7.5rem] rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              {detalhe && calor ? (
                <>
                  <p className="text-base font-semibold">{nomeSel}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{ehIvm ? (infoSel.v ? infoSel.v.toFixed(0) : '–') : rotuloValor(infoSel.v)}</p>
                  <p className="text-sm texto-suave">
                    {ehIvm ? `IVM · ${infoSel.nivel} (simulado)` : `${camada.rotulo} · concentração ${infoSel.nivel.toLowerCase()}`}
                  </p>
                </>
              ) : detalhe ? (
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

            {calor ? (
              <div>
                <p className="text-sm font-semibold">{ehIvm ? 'IVM por sub-área' : 'Concentração de registros'}</p>
                {ehIvm ? (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    <li className="flex items-center gap-2"><span className="h-3.5 w-6 rounded bg-green-600" aria-hidden="true" />● Normal · abaixo de {LIMIAR_ATENCAO}</li>
                    <li className="flex items-center gap-2"><span className="h-3.5 w-6 rounded bg-amber-500" aria-hidden="true" />▲ Atenção · {LIMIAR_ATENCAO} a {LIMIAR_PERIGO - 1}</li>
                    <li className="flex items-center gap-2"><span className="h-3.5 w-6 rounded bg-red-600" aria-hidden="true" />■ Perigo · {LIMIAR_PERIGO} ou mais</li>
                  </ul>
                ) : (
                  <>
                    <div className="mt-2 h-3 rounded-full bg-gradient-to-r from-indigo-100 via-indigo-400 to-indigo-800 dark:from-indigo-950 dark:via-indigo-500 dark:to-indigo-200" aria-hidden="true" />
                    <div className="mt-1 flex justify-between text-xs texto-suave" aria-hidden="true">
                      <span>Baixa</span>
                      <span>Média</span>
                      <span>Alta</span>
                    </div>
                    <p className="sr-only">Escala de concentração: baixa, média e alta, relativa ao maior valor da camada.</p>
                    <p className="mt-2 text-sm texto-suave">Máximo na camada: {rotuloValor(maximo)} {maximo === 1 ? camada.unidade[0] : camada.unidade[1]}.</p>
                  </>
                )}
                <p className="mt-3 flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm texto-suave dark:bg-slate-900/60">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {ehIvm
                    ? semIvm
                      ? 'Sem leitura de sensor para usar como referência.'
                      : 'Dados simulados: o sensor mede um ponto só; a variação por sub-área é demonstrativa, em torno da última leitura real.'
                    : 'Mais registros não significam mais risco: este mapa mostra concentração, não nível de risco. Valores abaixo de 3 aparecem como “<3”.'}
                </p>
              </div>
            ) : (
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
            )}

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
