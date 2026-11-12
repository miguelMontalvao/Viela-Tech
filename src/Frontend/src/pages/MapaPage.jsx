import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CloudFog, ExternalLink, MapPin, Microscope, SunDim, Wind } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { BAIRROS, VIEWBOX } from '../data/rioBairros';
import { FONTES, INCIDENCIA, SERIE, VEZES_ROCINHA_RIO } from '../data/tuberculoseRio';
import { UNIDADES_SAUDE } from '../domain/unidades';

const ROCINHA = BAIRROS.find((b) => b.id === 'rocinha');
const VIZINHOS = ['sao-conrado', 'gavea', 'vidigal', 'leblon', 'lagoa', 'jardim-botanico', 'alto-da-boa-vista', 'ipanema'];
const fmt = (n) => n.toLocaleString('pt-BR');

function MapaCidade({ aoPassar, destaque }) {
  return (
    <svg viewBox={`0 0 ${VIEWBOX.largura} ${VIEWBOX.altura}`} className="h-auto w-full" role="img" aria-labelledby="mapa-rio-titulo mapa-rio-desc">
      <title id="mapa-rio-titulo">Mapa dos bairros do Rio de Janeiro com a Rocinha em destaque</title>
      <desc id="mapa-rio-desc">
        A Rocinha fica na Zona Sul, entre São Conrado e a Gávea. Em 2013, a taxa de tuberculose da Rocinha foi de 372 casos por
        100 mil habitantes, contra 89,7 na cidade.
      </desc>
      <g onMouseLeave={() => aoPassar(null)}>
        {BAIRROS.map((b) =>
          b.id === 'rocinha' ? null : (
            <path
              key={b.id}
              d={b.d}
              onMouseEnter={() => aoPassar(b)}
              className={`stroke-white stroke-[0.6] transition-colors dark:stroke-noite ${
                destaque?.id === b.id
                  ? 'fill-sky-300 dark:fill-sky-700'
                  : b.rp === 'Zona Sul'
                    ? 'fill-sky-100 dark:fill-slate-700'
                    : 'fill-slate-200 dark:fill-slate-800'
              }`}
            />
          ),
        )}
        {/* Rocinha por último, por cima, com contorno forte */}
        <path d={ROCINHA.d} onMouseEnter={() => aoPassar(ROCINHA)} className="fill-tijolo-600 stroke-slate-900 stroke-[1.5] dark:stroke-white" />
      </g>
      {/* marcador e rótulo da Rocinha */}
      <g aria-hidden="true">
        <circle cx={ROCINHA.cx} cy={ROCINHA.cy} r="14" className="fill-tijolo-600/25 motion-safe:animate-ping" style={{ transformOrigin: `${ROCINHA.cx}px ${ROCINHA.cy}px` }} />
        <line x1={ROCINHA.cx} y1={ROCINHA.cy} x2={ROCINHA.cx - 70} y2={ROCINHA.cy + 70} className="stroke-slate-900 dark:stroke-white" strokeWidth="1.5" />
        <rect x={ROCINHA.cx - 190} y={ROCINHA.cy + 62} width="124" height="34" rx="10" className="fill-slate-900 dark:fill-white" />
        <text x={ROCINHA.cx - 128} y={ROCINHA.cy + 85} textAnchor="middle" className="fill-white font-display text-[17px] font-semibold dark:fill-slate-900">
          Rocinha
        </text>
      </g>
    </svg>
  );
}

function ZoomRocinha() {
  // Janela em volta da Rocinha (coordenadas do mesmo SVG da cidade)
  const vb = { x: ROCINHA.cx - 52, y: ROCINHA.cy - 30, w: 104, h: 60 };
  const vizinhos = BAIRROS.filter((b) => VIZINHOS.includes(b.id));
  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="h-auto w-full" role="img" aria-label="Zoom: a Rocinha e os bairros vizinhos, como São Conrado, Gávea e Vidigal">
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} className="fill-mar-100 dark:fill-mar-900" />
      {BAIRROS.map((b) => (
        <path
          key={b.id}
          d={b.d}
          className={`stroke-white stroke-[0.25] dark:stroke-noite ${b.id === 'rocinha' ? 'fill-tijolo-600' : 'fill-slate-100 dark:fill-slate-700'}`}
        />
      ))}
      {vizinhos.map((b) =>
        b.cx > vb.x + 4 && b.cx < vb.x + vb.w - 4 && b.cy > vb.y + 3 && b.cy < vb.y + vb.h - 2 ? (
          <text key={b.id} x={b.cx} y={b.cy} textAnchor="middle" className="fill-slate-600 font-sans text-[2.6px] font-semibold dark:fill-slate-300">
            {b.nome}
          </text>
        ) : null,
      )}
      <text x={ROCINHA.cx} y={ROCINHA.cy + 1} textAnchor="middle" className="fill-white font-display text-[3.4px] font-semibold">
        Rocinha
      </text>
    </svg>
  );
}

function Comparacao() {
  const max = Math.max(...INCIDENCIA.map((i) => i.valor));
  return (
    <figure className="card p-6">
      <figcaption>
        <p className="font-display text-xl font-semibold">Casos novos por 100 mil habitantes</p>
        <p className="mt-1 text-sm texto-suave">Quanto mais comprida a barra, mais gente adoeceu proporcionalmente.</p>
      </figcaption>
      <ul className="mt-6 space-y-5">
        {INCIDENCIA.map((i) => (
          <li key={i.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">
                {i.local} <span className="text-sm font-normal texto-suave">({i.ano})</span>
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums">{fmt(i.valor)}</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60" aria-hidden="true">
              <div
                className={`h-full rounded-full ${i.destaque ? 'bg-tijolo-600' : 'bg-sky-600 dark:bg-sky-400'}`}
                style={{ width: `${(i.valor / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs texto-suave">
        Os anos são os mais recentes publicados na mesma fonte (o dado do Brasil é de 2014). Fonte:{' '}
        <a href={FONTES.elPais2015.url} target="_blank" rel="noreferrer" className="font-semibold underline">
          El País Brasil, 2015
        </a>
        , com base nos casos registrados pela Prefeitura do Rio e na OMS.
      </p>
    </figure>
  );
}

const PASSOS = [
  {
    icone: SunDim,
    cor: 'bg-sol-300 text-slate-900',
    titulo: 'Pouco sol',
    texto: 'Nas vielas estreitas, as casas coladas fazem sombra o dia todo. A luz do sol ajuda a matar o bacilo da tuberculose.',
  },
  {
    icone: CloudFog,
    cor: 'bg-sky-200 text-slate-900',
    titulo: 'Muita umidade',
    texto: 'Parede úmida e mofo são comuns. É esse microclima que o sensor do Viela Tech mede com o IVM.',
  },
  {
    icone: Wind,
    cor: 'bg-emerald-200 text-slate-900',
    titulo: 'Ar parado',
    texto: 'Sem ventilação, o ar com o bacilo fica circulando dentro de casa e passa de pessoa para pessoa.',
  },
  {
    icone: Microscope,
    cor: 'bg-laje-100 text-slate-900',
    titulo: 'Exame e cura',
    texto: 'Tosse há 3 semanas ou mais? O exame de escarro é simples e gratuito, e a tuberculose tem tratamento pelo SUS.',
  },
];

export default function MapaPage() {
  const [bairro, setBairro] = useState(null);
  const rocinhaSerie = SERIE[0].pontos;
  const queda = useMemo(() => Math.round(((rocinhaSerie[0].valor - rocinhaSerie[1].valor) / rocinhaSerie[0].valor) * 100), [rocinhaSerie]);

  return (
    <div className="relative">
      <div className="container-app pt-6">
        <PageHeader eyebrow="Mapa da tuberculose · Rio de Janeiro" titulo="Onde a tosse pesa mais">
          A Rocinha teve uma taxa de tuberculose <strong className="text-slate-900 dark:text-white">{fmt(VEZES_ROCINHA_RIO)} vezes maior</strong> que a média da
          cidade. Entenda o porquê e o que dá para fazer.
        </PageHeader>

        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="card overflow-hidden" aria-label="Mapa da cidade">
            <div className="relative bg-mar-50 p-3 dark:bg-mar-900/40 sm:p-5">
              <MapaCidade aoPassar={setBairro} destaque={bairro} />
              <div aria-hidden="true" className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-2 text-sm shadow-cartao dark:bg-slate-900/90">
                {bairro ? (
                  <>
                    <strong>{bairro.nome}</strong>
                    <span className="block text-xs texto-suave">
                      {bairro.id === 'rocinha' ? '372 casos por 100 mil hab. (2013)' : 'Sem taxa publicada por bairro nesta fonte'}
                    </span>
                  </>
                ) : (
                  <span className="texto-suave">Passe o mouse pelos bairros</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-700">
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-tijolo-600" aria-hidden="true" /> Rocinha: 372 por 100 mil (2013)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-sky-100 ring-1 ring-slate-300 dark:bg-slate-700" aria-hidden="true" /> Zona Sul
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" aria-hidden="true" /> Demais bairros (sem taxa por bairro publicada)
              </span>
            </div>
            <p className="px-5 pb-4 text-xs texto-suave">
              Limites dos bairros:{' '}
              <a href={FONTES.limitesBairros.url} target="_blank" rel="noreferrer" className="underline">
                Data.Rio / IPP
              </a>{' '}
              (ODbL).
            </p>
          </section>

          <div className="space-y-6">
            <section className="card overflow-hidden" aria-labelledby="zoom-titulo">
              <h2 id="zoom-titulo" className="px-5 pt-5 text-lg font-semibold">
                De perto: a Rocinha
              </h2>
              <p className="px-5 text-sm texto-suave">Entre São Conrado e a Gávea, encostada na Floresta da Tijuca.</p>
              <div className="mt-3">
                <ZoomRocinha />
              </div>
            </section>
            <section className="card p-6" aria-labelledby="tendencia-titulo">
              <h2 id="tendencia-titulo" className="text-lg font-semibold">
                Melhorou, mas ainda é alto
              </h2>
              <p className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-4xl font-semibold tabular-nums text-slate-400">{fmt(rocinhaSerie[0].valor)}</span>
                <ArrowRight className="h-5 w-5 text-slate-300" aria-label="caiu para" />
                <span className="font-display text-4xl font-semibold tabular-nums">{fmt(rocinhaSerie[1].valor)}</span>
              </p>
              <p className="mt-2 text-sm texto-suave">
                Casos por 100 mil habitantes na Rocinha, de {rocinhaSerie[0].ano} para {rocinhaSerie[1].ano}: queda de {queda}%. Na
                cidade, a taxa foi de {fmt(SERIE[1].pontos[0].valor)} para {fmt(SERIE[1].pontos[1].valor)}.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Comparacao />
          <section className="card p-6" aria-labelledby="onde-titulo">
            <h2 id="onde-titulo" className="text-xl font-semibold">
              Onde fazer o exame na Rocinha
            </h2>
            <ul className="mt-4 space-y-3">
              {UNIDADES_SAUDE.map((u) => (
                <li key={u.nome} className="flex gap-3 border-t border-slate-200 py-4 first:border-t-0 first:pt-0 dark:border-slate-800">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                  <span>
                    <strong className="block">{u.nome}</strong>
                    <span className="text-sm texto-suave">{u.descricao}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/morador"
              className="mt-6 inline-flex min-h-toque w-full items-center justify-center gap-2 rounded-full bg-sky-700 px-6 font-semibold text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 sm:w-auto"
            >
              Fazer minha triagem agora
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>

        <section aria-labelledby="porque-titulo" className="mt-16">
          <h2 id="porque-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Por que a viela adoece
          </h2>
          <ol className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map(({ icone: Icone, titulo, texto }) => (
              <li key={titulo}>
                <Icone className="h-6 w-6 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed texto-suave">{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="fontes-titulo" className="mt-16 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          <h2 id="fontes-titulo" className="font-display text-base font-semibold">
            Fontes e limites dos dados
          </h2>
          <ul className="mt-3 space-y-2 texto-suave">
            {Object.values(FONTES).map((f) => (
              <li key={f.id}>
                <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-sky-700 underline dark:text-sky-400">
                  {f.titulo}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>{' '}
                · {f.veiculo}. {f.nota ?? ''}
              </li>
            ))}
            <li>
              Não encontramos uma tabela pública e atual com a taxa de tuberculose de cada bairro do Rio. Por isso, só a Rocinha
              aparece pintada. Os outros bairros não têm cor de risco porque não há dado comparável, e não porque estejam livres
              da doença.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
