import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Maximize2, MousePointerClick, ScanSearch } from 'lucide-react';
import { BAIRROS, VIEWBOX } from '../../data/rioBairros';
import { AREAS_PLANEJAMENTO, FONTES, INCIDENCIA, PANORAMA_2022, VEZES_ROCINHA_RIO } from '../../data/tuberculoseRio';
import { useContador, useNaTela } from '../../hooks/useAnimacao';

/*
 * Mapa temático (coroplético) da tuberculose no Rio por Área de Planejamento.
 * Escala sequencial de um só tom (azul saúde), validada com o validate_palette (modo ordinal):
 * claro sky-400→900 sobre branco, escuro sky-700→100 sobre slate-900.
 * A Rocinha é a exceção proposital: cor de destaque (tijolo), contorno, pulso e rótulo fixo.
 */
export const CLASSES = [
  { id: 0, ate: 75, rotulo: 'até 75', fill: 'fill-sky-400 dark:fill-sky-700', bg: 'bg-sky-400 dark:bg-sky-700' },
  { id: 1, ate: 99, rotulo: '76 a 99', fill: 'fill-sky-500 dark:fill-sky-500', bg: 'bg-sky-500' },
  { id: 2, ate: 149, rotulo: '100 a 149', fill: 'fill-sky-700 dark:fill-sky-300', bg: 'bg-sky-700 dark:bg-sky-300' },
  { id: 3, ate: Infinity, rotulo: '150 ou mais', fill: 'fill-sky-900 dark:fill-sky-100', bg: 'bg-sky-900 dark:bg-sky-100' },
];
const classeDe = (taxa) => CLASSES.find((c) => taxa <= c.ate);

const AP_DO_RP = Object.fromEntries(AREAS_PLANEJAMENTO.flatMap((a) => a.rps.map((rp) => [rp, a])));
const ROCINHA = BAIRROS.find((b) => b.id === 'rocinha');
const ROCINHA_TAXA = INCIDENCIA.find((i) => i.id === 'rocinha-2013');
const VIZINHOS = ['sao-conrado', 'gavea', 'vidigal', 'leblon', 'jardim-botanico', 'alto-da-boa-vista'];

const VB_CIDADE = { x: 0, y: 0, w: VIEWBOX.largura, h: VIEWBOX.altura };
const VB_ROCINHA = { x: ROCINHA.cx - 60, y: ROCINHA.cy - 33, w: 120, h: 63 };
const fmt = (n, casas = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Anima o viewBox do SVG (zoom suave), respeitando quem prefere menos movimento. */
function useViewBox(alvo) {
  const [vb, setVb] = useState(alvo);
  const atual = useRef(alvo);
  useEffect(() => {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduzir) {
      atual.current = alvo;
      setVb(alvo);
      return undefined;
    }
    const de = atual.current;
    const inicio = performance.now();
    const duracao = 750;
    let id;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / duracao);
      const e = 1 - (1 - p) ** 4;
      const novo = { x: de.x + (alvo.x - de.x) * e, y: de.y + (alvo.y - de.y) * e, w: de.w + (alvo.w - de.w) * e, h: de.h + (alvo.h - de.h) * e };
      atual.current = novo;
      setVb(novo);
      if (p < 1) id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [alvo]);
  return vb;
}

function Painel({ foco }) {
  const rocinha = foco === 'rocinha';
  const area = rocinha ? null : AREAS_PLANEJAMENTO.find((a) => a.ap === foco);
  const valor = rocinha ? ROCINHA_TAXA.valor : area.taxa;
  const contado = useContador(valor, 600, foco);
  const maximo = 400;

  return (
    <div key={foco} className="animate-surgir flex h-full flex-col">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {rocinha ? 'Destaque · bairro' : `Área de Planejamento ${area.ap}`}
      </p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight">{rocinha ? 'Rocinha' : area.nome}</h3>

      <p className="mt-5 flex items-baseline gap-2">
        <span className={`text-5xl font-semibold tabular-nums tracking-tight ${rocinha ? 'text-tijolo-600 dark:text-tijolo-400' : ''}`}>
          {rocinha ? '' : '≈'}
          {fmt(contado)}
        </span>
        <span className="text-sm texto-suave">casos por 100 mil hab. · {rocinha ? ROCINHA_TAXA.ano : 2022}</span>
      </p>

      {/* régua: o valor da área contra a média da cidade no mesmo ano */}
      <div className="mt-5" aria-hidden="true">
        <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out ${rocinha ? 'bg-tijolo-500' : 'bg-sky-600 dark:bg-sky-400'}`}
            style={{ width: `${Math.min(100, (valor / maximo) * 100)}%` }}
          />
          <div
            className="absolute -top-1.5 h-5 w-0.5 rounded bg-slate-900 dark:bg-white"
            style={{ left: `${((rocinha ? 89.7 : PANORAMA_2022.municipio) / maximo) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs texto-suave">
          Traço preto: média da cidade em {rocinha ? '2013 (89,7)' : `2022 (${fmt(PANORAMA_2022.municipio, 1)})`}
        </p>
      </div>

      <p className="mt-5 text-sm leading-relaxed texto-suave">
        {rocinha
          ? `No mesmo ano, a taxa da Rocinha foi ${fmt(VEZES_ROCINHA_RIO, 1)} vezes a média do Rio. Casas coladas, pouca luz e pouca ventilação ajudam o bacilo a passar de pessoa para pessoa.`
          : area.nota ?? 'Taxa lida do gráfico do boletim da Secretaria Municipal de Saúde.'}
      </p>
    </div>
  );
}

export function MapaTematico() {
  const [foco, setFoco] = useState('rocinha');
  const [hover, setHover] = useState(null);
  const [realce, setRealce] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [ref, naTela] = useNaTela();
  const vb = useViewBox(zoom ? VB_ROCINHA : VB_CIDADE);
  const ativo = hover ?? foco;

  const bairros = useMemo(
    () => BAIRROS.filter((b) => b.id !== 'rocinha').map((b) => ({ ...b, area: AP_DO_RP[b.rp] })),
    [],
  );

  const apagado = (area) => {
    if (realce !== null) return classeDe(area.taxa).id !== realce;
    if (ativo === 'rocinha') return false;
    return area.ap !== ativo;
  };

  const escala = vb.w / VIEWBOX.largura; // < 1 quando aproximado

  return (
    <section ref={ref} aria-labelledby="mapa-titulo" className="card overflow-hidden">
      {/* barra do painel */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="mapa-titulo" className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Incidência de tuberculose no Rio
          </h2>
          <p className="text-xs texto-suave">Casos novos por 100 mil habitantes, por Área de Planejamento da saúde</p>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm dark:bg-slate-800" role="group" aria-label="Enquadramento do mapa">
          {[
            [false, 'Cidade', Maximize2],
            [true, 'Rocinha de perto', ScanSearch],
          ].map(([valor, rotulo, Icone]) => (
            <button
              key={rotulo}
              type="button"
              aria-pressed={zoom === valor}
              onClick={() => {
                setZoom(valor);
                if (valor) setFoco('rocinha');
              }}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-medium transition ${
                zoom === valor ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem]">
        {/* mapa */}
        <div className="fundo-grade relative min-h-[16rem]">
          <svg
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            className={`h-auto w-full transition-opacity duration-700 ${naTela ? 'opacity-100' : 'opacity-0'}`}
            role="img"
            aria-labelledby="mapa-svg-titulo mapa-svg-desc"
            onMouseLeave={() => setHover(null)}
          >
            <title id="mapa-svg-titulo">Mapa da incidência de tuberculose por Área de Planejamento, com a Rocinha em destaque</title>
            <desc id="mapa-svg-desc">
              As maiores taxas aproximadas em 2022 estão nas áreas 1.0 (Centro) e 5.1 (Bangu e Realengo), que têm unidades prisionais.
              A Rocinha, na área 2.1 (Zona Sul), teve 372 casos por 100 mil habitantes em 2013. A lista abaixo do mapa traz todos os valores.
            </desc>
            {bairros.map((b) => (
              <path
                key={b.id}
                d={b.d}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => setHover(b.area.ap)}
                onClick={() => {
                  setFoco(b.area.ap);
                  setZoom(false);
                }}
                className={`cursor-pointer stroke-white transition-[opacity,fill] duration-300 dark:stroke-slate-900 ${classeDe(b.area.taxa).fill} ${
                  apagado(b.area) ? 'opacity-25' : 'opacity-100'
                }`}
                strokeWidth={0.5}
              />
            ))}

            {/* rótulos dos bairros vizinhos, só no zoom */}
            {zoom &&
              BAIRROS.filter((b) => VIZINHOS.includes(b.id)).map((b) => (
                <text
                  key={b.id}
                  x={b.cx}
                  y={b.cy}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-[2.6px] font-semibold animate-surgir"
                  style={{ paintOrder: 'stroke', stroke: 'rgb(15 23 42 / .55)', strokeWidth: 0.6 }}
                >
                  {b.nome}
                </text>
              ))}

            {/* Rocinha: sempre por cima */}
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHover('rocinha')}
              onClick={() => setFoco('rocinha')}
            >
              <circle
                cx={ROCINHA.cx}
                cy={ROCINHA.cy}
                r={16 * escala}
                className="fill-tijolo-500/30 motion-safe:animate-ping"
                style={{ transformOrigin: `${ROCINHA.cx}px ${ROCINHA.cy}px`, transformBox: 'view-box' }}
              />
              <path d={ROCINHA.d} vectorEffect="non-scaling-stroke" strokeWidth={ativo === 'rocinha' ? 2.5 : 1.5} className="fill-tijolo-500 stroke-white transition-all dark:stroke-slate-950" />
            </g>

            {/* rótulo fixo da Rocinha */}
            <g className="pointer-events-none" aria-hidden="true">
              {!zoom && (
                <line x1={ROCINHA.cx} y1={ROCINHA.cy} x2={ROCINHA.cx - 40} y2={ROCINHA.cy + 52} className="stroke-slate-900 dark:stroke-white" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              )}
              <g transform={zoom ? `translate(${ROCINHA.cx} ${ROCINHA.cy - 12}) scale(${escala})` : `translate(${ROCINHA.cx - 40} ${ROCINHA.cy + 60})`}>
                <rect x={-62} y={-14} width={124} height={30} rx={15} className="fill-slate-900 dark:fill-white" />
                <text x={0} y={6} textAnchor="middle" className="fill-white text-[15px] font-semibold dark:fill-slate-900">
                  Rocinha · {ROCINHA_TAXA.valor}
                </text>
              </g>
            </g>
          </svg>

          <p className="pointer-events-none absolute bottom-3 left-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs texto-suave shadow-sm dark:bg-slate-900/90 sm:inline-flex">
            <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" /> Passe o mouse ou toque numa área
          </p>
        </div>

        {/* painel de detalhe */}
        <aside className="border-t border-slate-200 p-6 dark:border-slate-800 lg:border-l lg:border-t-0" aria-live="polite">
          <Painel foco={ativo} />
        </aside>
      </div>

      {/* legenda interativa */}
      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap items-center gap-1" aria-label="Legenda">
          {CLASSES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseEnter={() => setRealce(c.id)}
                onMouseLeave={() => setRealce(null)}
                onFocus={() => setRealce(c.id)}
                onBlur={() => setRealce(null)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className={`h-3 w-6 rounded-full ${c.bg}`} aria-hidden="true" />
                {c.rotulo}
              </button>
            </li>
          ))}
          <li className="inline-flex min-h-10 items-center gap-2 px-3">
            <span className="h-3 w-6 rounded-full bg-tijolo-500" aria-hidden="true" />
            Rocinha (2013)
          </li>
        </ul>
        <p className="flex items-start gap-1.5 text-xs texto-suave md:max-w-xs">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Valores de 2022 aproximados, lidos do gráfico do{' '}
            <a href={FONTES.boletimSMS2023.url} target="_blank" rel="noreferrer" className="underline">
              boletim da SMS-Rio
            </a>
            .
          </span>
        </p>
      </div>

      {/* lista acessível: também serve para escolher a área pelo teclado */}
      <details className="group border-t border-slate-200 dark:border-slate-800">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50">
          Ver todas as áreas em lista
          <span className="text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>
        <ul className="grid gap-px bg-slate-200 dark:bg-slate-800 sm:grid-cols-2">
          {[...AREAS_PLANEJAMENTO]
            .sort((a, b) => b.taxa - a.taxa)
            .map((a) => (
              <li key={a.ap} className="bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setFoco(a.ap);
                    setZoom(false);
                  }}
                  aria-pressed={foco === a.ap}
                  className="flex min-h-12 w-full items-center gap-3 px-5 text-left text-sm hover:bg-slate-50 aria-pressed:bg-sky-50 dark:hover:bg-slate-800/50 dark:aria-pressed:bg-sky-950/50"
                >
                  <span className={`h-3 w-3 shrink-0 rounded-full ${classeDe(a.taxa).bg}`} aria-hidden="true" />
                  <span className="flex-1">
                    <span className="font-medium">AP {a.ap}</span> · {a.nome}
                  </span>
                  <span className="tabular-nums texto-suave">≈ {a.taxa}</span>
                </button>
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}
