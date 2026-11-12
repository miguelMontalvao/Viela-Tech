import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ClipboardCheck, CloudFog, ExternalLink, HeartPulse, MapPin, Microscope, Pill, SunDim, Wind } from 'lucide-react';
import { MapaTematico } from '../components/mapa/MapaTematico';
import { FONTES, INCIDENCIA, PANORAMA_2022, SERIE } from '../data/tuberculoseRio';
import { UNIDADES_SAUDE } from '../domain/unidades';
import { useContador, useNaTela } from '../hooks/useAnimacao';

const fmt = (n, casas = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/* ---------- Indicadores no estilo painel de vigilância ---------- */
const INDICADORES = [
  { rotulo: 'Rocinha', valor: 372, casas: 0, ano: '2013', destaque: true },
  { rotulo: 'Cidade do Rio', valor: PANORAMA_2022.municipio, casas: 1, ano: '2022' },
  { rotulo: 'Estado do RJ', valor: PANORAMA_2022.estado, casas: 1, ano: '2022' },
  { rotulo: 'Brasil', valor: PANORAMA_2022.brasil, casas: 1, ano: 'referência do boletim' },
];

function Indicador({ item, ativo, atraso }) {
  const v = useContador(item.valor, 1100, item.rotulo, ativo);
  return (
    <div
      className={`animate-surgir rounded-2xl p-5 ${item.destaque ? 'bg-tijolo-600 text-white' : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800'}`}
      style={{ animationDelay: `${atraso}ms` }}
    >
      <dt className={`text-sm ${item.destaque ? 'text-tijolo-50' : 'texto-suave'}`}>{item.rotulo}</dt>
      <dd className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">{fmt(v, item.casas)}</dd>
      <dd className={`mt-1 text-xs ${item.destaque ? 'text-tijolo-100' : 'texto-suave'}`}>por 100 mil hab. · {item.ano}</dd>
    </div>
  );
}

function Indicadores() {
  const [ref, naTela] = useNaTela();
  return (
    <dl ref={ref} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {INDICADORES.map((i, n) => (
        <Indicador key={i.rotulo} item={i} ativo={naTela} atraso={n * 80} />
      ))}
    </dl>
  );
}

/* ---------- Tendência (gráfico de inclinação) ---------- */
function Tendencia() {
  const [ref, naTela] = useNaTela();
  const [roc, rio] = SERIE;
  const L = 320;
  const A = 180;
  const y = (v) => A - 24 - (v / 500) * (A - 48);
  return (
    <figure ref={ref} className="card p-6">
      <figcaption>
        <p className="font-semibold">Melhorou, mas segue alto</p>
        <p className="mt-1 text-sm texto-suave">Casos por 100 mil habitantes, 2001 e 2013</p>
      </figcaption>
      <svg viewBox={`0 0 ${L} ${A}`} className="mt-4 h-auto w-full" role="img" aria-label={`Rocinha: de ${roc.pontos[0].valor} em 2001 para ${roc.pontos[1].valor} em 2013. Cidade: de 107,6 para 89,7.`}>
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={i ? L - 60 : 60} x2={i ? L - 60 : 60} y1={12} y2={A - 24} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
            <text x={i ? L - 60 : 60} y={A - 6} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {roc.pontos[i].ano}
            </text>
          </g>
        ))}
        {[
          [roc, 'stroke-tijolo-500', 'fill-tijolo-500'],
          [rio, 'stroke-sky-600 dark:stroke-sky-400', 'fill-sky-600 dark:fill-sky-400'],
        ].map(([s, traco, ponto]) => (
          <g key={s.local}>
            {naTela && (
              <line x1={60} y1={y(s.pontos[0].valor)} x2={L - 60} y2={y(s.pontos[1].valor)} className={`${traco} ecg-linha`} strokeWidth="2.5" strokeLinecap="round" />
            )}
            {s.pontos.map((p, i) => (
              <g key={p.ano}>
                <circle cx={i ? L - 60 : 60} cy={y(p.valor)} r="4.5" className={`${ponto} stroke-white dark:stroke-slate-900`} strokeWidth="2" />
                <text x={i ? L - 50 : 50} y={y(p.valor) + 4} textAnchor={i ? 'start' : 'end'} className="fill-slate-700 text-[12px] font-semibold tabular-nums dark:fill-slate-200">
                  {fmt(p.valor, p.valor % 1 ? 1 : 0)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
      <ul className="mt-2 flex gap-5 text-xs texto-suave">
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-tijolo-500" aria-hidden="true" /> Rocinha
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-sky-600 dark:bg-sky-400" aria-hidden="true" /> Cidade do Rio
        </li>
      </ul>
    </figure>
  );
}

/* ---------- Comparação em barras ---------- */
function Comparacao() {
  const [ref, naTela] = useNaTela();
  const max = Math.max(...INCIDENCIA.map((i) => i.valor));
  return (
    <figure ref={ref} className="card p-6">
      <figcaption>
        <p className="font-semibold">Mesma fonte, mesmo período</p>
        <p className="mt-1 text-sm texto-suave">Quanto mais longa a barra, mais gente adoeceu.</p>
      </figcaption>
      <ul className="mt-6 space-y-5">
        {INCIDENCIA.map((i, n) => (
          <li key={i.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">
                {i.local} <span className="texto-suave">· {i.ano}</span>
              </span>
              <span className="text-lg font-semibold tabular-nums">{fmt(i.valor, i.valor % 1 ? 1 : 0)}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-out ${i.destaque ? 'bg-tijolo-500' : 'bg-sky-600 dark:bg-sky-400'}`}
                style={{ width: naTela ? `${(i.valor / max) * 100}%` : '0%', transitionDelay: `${n * 120}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs texto-suave">
        Fonte:{' '}
        <a href={FONTES.elPais2015.url} target="_blank" rel="noreferrer" className="underline">
          El País Brasil, 2015
        </a>
        , com casos da Prefeitura do Rio e dados da OMS.
      </p>
    </figure>
  );
}

/* ---------- Conteúdo didático ---------- */
const CAUSAS = [
  { icone: SunDim, titulo: 'Pouco sol', texto: 'Casas coladas fazem sombra o dia todo. A luz do sol ajuda a matar o bacilo.' },
  { icone: CloudFog, titulo: 'Muita umidade', texto: 'Parede úmida e mofo. É esse microclima que o sensor do Viela Tech mede.' },
  { icone: Wind, titulo: 'Ar parado', texto: 'Sem ventilação, o ar com o bacilo circula dentro de casa.' },
];

const CUIDADO = [
  { icone: Activity, titulo: 'Sinal', texto: 'Tosse há 3 semanas ou mais, febre no fim da tarde ou suor à noite.' },
  { icone: ClipboardCheck, titulo: 'Triagem', texto: 'Responda no Viela Tech. Casos longos vão para o topo da fila do agente.' },
  { icone: Microscope, titulo: 'Exame', texto: 'O exame de escarro é simples e gratuito na Clínica da Família.' },
  { icone: Pill, titulo: 'Tratamento', texto: 'A tuberculose tem cura, com remédio gratuito e acompanhamento pelo SUS.' },
];

function CaminhoDoCuidado() {
  const [ref, naTela] = useNaTela();
  return (
    <ol ref={ref} className="relative grid gap-8 md:grid-cols-4 md:gap-6">
      {/* trilho que se preenche */}
      <span aria-hidden="true" className="absolute left-5 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] bg-slate-200 dark:bg-slate-800 md:block">
        <span className={`block h-full bg-emerald-500 transition-[width] duration-[1600ms] ease-out ${naTela ? 'w-full' : 'w-0'}`} />
      </span>
      {CUIDADO.map(({ icone: Icone, titulo, texto }, i) => (
        <li key={titulo} className="relative">
          <span
            className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-slate-50 transition-colors duration-500 dark:ring-noite ${
              naTela ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
            }`}
            style={{ transitionDelay: `${i * 350}ms` }}
          >
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-semibold">
            <span className="mr-1.5 text-sm tabular-nums texto-suave">0{i + 1}</span>
            {titulo}
          </h3>
          <p className="mt-1 text-sm leading-relaxed texto-suave">{texto}</p>
        </li>
      ))}
    </ol>
  );
}

export default function MapaPage() {
  return (
    <div className="container-app pb-8 pt-10 sm:pt-14">
      {/* cabeçalho */}
      <header className="relative">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-900">
          <HeartPulse className="h-3.5 w-3.5" aria-hidden="true" /> Vigilância em saúde · dados oficiais
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Mapa da tuberculose no Rio de Janeiro
        </h1>
        <p className="mt-4 max-w-2xl text-lg texto-suave">
          A cidade toda tem taxas acima da média do Brasil. Na Rocinha, o problema é ainda maior. Veja onde, por quê e o que fazer.
        </p>
        <svg viewBox="0 0 600 40" className="mt-6 h-8 w-full max-w-xl text-emerald-500" aria-hidden="true" preserveAspectRatio="none">
          <polyline
            points="0,20 170,20 190,20 200,6 212,34 224,4 236,26 246,20 600,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="ecg-linha"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </header>

      <section aria-label="Indicadores" className="mt-6">
        <Indicadores />
        <p className="mt-3 text-xs texto-suave">
          Rocinha: El País Brasil (2015). Demais:{' '}
          <a href={FONTES.boletimSMS2023.url} target="_blank" rel="noreferrer" className="underline">
            Boletim de Tuberculose da SMS-Rio (2023)
          </a>
          , que registrou {fmt(PANORAMA_2022.casosNovos)} casos novos na cidade em 2022.
        </p>
      </section>

      <div className="mt-10">
        <MapaTematico />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Tendencia />
        <Comparacao />
      </div>

      <section aria-labelledby="porque-titulo" className="mt-20">
        <h2 id="porque-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Por que a viela adoece
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {CAUSAS.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="card group p-6 transition hover:-translate-y-0.5 hover:border-sky-300 dark:hover:border-sky-700">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-950 dark:text-sky-300">
                <Icone className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">{titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed texto-suave">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cuidado-titulo" className="mt-20">
        <h2 id="cuidado-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          O caminho do cuidado
        </h2>
        <p className="mt-2 texto-suave">Da primeira tosse até a cura, tudo pelo SUS.</p>
        <div className="mt-10">
          <CaminhoDoCuidado />
        </div>
      </section>

      <section aria-labelledby="onde-titulo" className="mt-20 grid gap-6 rounded-3xl bg-sky-700 p-6 text-white sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center dark:bg-sky-900">
        <div>
          <h2 id="onde-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Onde fazer o exame na Rocinha
          </h2>
          <p className="mt-2 text-white">Gratuito, sem precisar de encaminhamento.</p>
          <Link
            to="/morador"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-sky-800 transition hover:bg-sky-50"
          >
            Fazer minha triagem
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="grid gap-3">
          {UNIDADES_SAUDE.map((u) => (
            <li key={u.nome} className="flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-200" aria-hidden="true" />
              <span>
                <strong className="block font-semibold">{u.nome}</strong>
                <span className="text-sm text-white">{u.descricao}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="fontes-titulo" className="mt-16 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
        <h2 id="fontes-titulo" className="font-semibold">
          Fontes e limites dos dados
        </h2>
        <ul className="mt-3 space-y-2 texto-suave">
          {Object.values(FONTES).map((f) => (
            <li key={f.id}>
              <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-sky-700 underline dark:text-sky-400">
                {f.titulo}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>{' '}
              · {f.veiculo}. {f.nota ?? ''}
            </li>
          ))}
          <li>
            As Áreas de Planejamento 1.0 e 5.1 têm unidades prisionais, onde a tuberculose se espalha com mais facilidade. Isso
            eleva a taxa dessas áreas. A taxa da Rocinha (2013) é de outro ano e de outra fonte que as das áreas (2022). Por isso ela
            aparece com cor própria, sem entrar na mesma escala.
          </li>
        </ul>
      </section>
    </div>
  );
}
