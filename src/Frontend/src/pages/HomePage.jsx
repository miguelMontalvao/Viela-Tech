import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Droplets,
  Lock,
  Map as MapIcon,
  RefreshCw,
  ShieldCheck,
  Siren,
  Stethoscope,
  Sun,
  WifiOff,
} from 'lucide-react';
import { Foto } from '../components/ui/Foto';
import { PalavraQueTroca, Revelar, moverHolofote } from '../components/home/Efeitos';
import { FONTES, PANORAMA_2022, VEZES_ROCINHA_RIO } from '../data/tuberculoseRio';
import { useContador, useNaTela } from '../hooks/useAnimacao';

const MiniMapa = lazy(() => import('../components/home/MiniMapa'));
const fmt = (n, casas = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
// Com a abertura na tela, o hero espera a cortina subir para animar.
const ATRASO_INTRO = typeof document !== 'undefined' && document.documentElement.classList.contains('com-intro') ? 1350 : 0;
const atraso = (ms) => ({ animationDelay: `${ATRASO_INTRO + ms}ms` });
const menosMovimento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ============================== HERO ============================== */

function useParallax(fator = 0.08) {
  const ref = useRef(null);
  useEffect(() => {
    if (menosMovimento()) return undefined;
    let id;
    const aoRolar = () => {
      cancelAnimationFrame(id);
      id = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translate3d(0, ${Math.min(window.scrollY * fator, 36)}px, 0)`;
      });
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      window.removeEventListener('scroll', aoRolar);
      cancelAnimationFrame(id);
    };
  }, [fator]);
  return ref;
}

function CartaoFlutuante({ className = '', atraso = 0, children }) {
  return (
    <div
      className={`boiar absolute rounded-2xl border border-white/60 bg-white/85 p-4 text-sm shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 ${className}`}
      style={{ animationDelay: `${atraso}ms` }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function Hero() {
  const foto = useParallax(0.06);
  return (
    <section className="relative isolate overflow-hidden">
      {/* fundo: grade + manchas de luz */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="grade-hero absolute inset-0" />
        <div className="mancha -left-24 top-10 h-[28rem] w-[28rem] bg-sky-300/40 dark:bg-sky-600/25" />
        <div className="mancha right-0 top-1/3 h-[24rem] w-[24rem] bg-emerald-300/35 dark:bg-emerald-600/20" style={{ animationDelay: '-6s' }} />
      </div>

      <div className="container-app grid min-h-[calc(100svh-4.5rem)] items-center gap-14 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-6">
          <p style={atraso(0)} className="animate-surgir inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Saúde cívica na Rocinha · Rio de Janeiro
          </p>

          <h1 className="animate-surgir mt-7 text-5xl font-semibold leading-[0.95] tracking-[-0.035em] sm:text-6xl xl:text-7xl 2xl:text-8xl" style={atraso(80)}>
            Onde o sol não chega,{' '}
            <span className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-emerald-400">
              a saúde chega.
            </span>
          </h1>

          <p className="animate-surgir mt-7 max-w-xl text-lg leading-relaxed texto-suave sm:text-xl" style={atraso(160)}>
            Sensor nas vielas, triagem de tosse e a fila dos agentes de saúde num só sistema. Feito para{' '}
            <PalavraQueTroca palavras={['os moradores.', 'os agentes de saúde.', 'a gestão.']} className="font-semibold text-slate-900 dark:text-white" />
          </p>

          <div className="animate-surgir mt-9 flex flex-col gap-3 sm:flex-row" style={atraso(240)}>
            <Link
              to="/morador"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-700 px-7 text-base font-semibold text-white shadow-lg shadow-sky-700/25 transition hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-xl hover:shadow-sky-700/30 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Fazer a triagem
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/mapa"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white/70 px-7 text-base font-semibold text-slate-900 ring-1 ring-slate-300 backdrop-blur transition hover:-translate-y-0.5 hover:ring-slate-400 dark:bg-slate-900/60 dark:text-white dark:ring-slate-600"
            >
              <MapIcon className="h-5 w-5" aria-hidden="true" />
              Explorar o mapa
            </Link>
          </div>

          <dl className="animate-surgir mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 dark:border-slate-800" style={atraso(320)}>
            {[
              [`${fmt(VEZES_ROCINHA_RIO, 1)}×`, 'mais TB na Rocinha'],
              ['21 dias', 'de tosse viram prioridade'],
              ['Sem sinal', 'o app continua'],
            ].map(([n, t]) => (
              <div key={t} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm texto-suave">{t}</dt>
                <dd className="text-2xl font-semibold tracking-tight">{n}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* composição: foto + telas do produto */}
        <div className="relative lg:col-span-6">
          <div className="animate-surgir relative mx-auto max-w-xl lg:ml-auto lg:mr-0" style={atraso(200)}>
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5">
              <div ref={foto} className="will-change-transform">
                <Foto
                  nome="rocinha-por-do-sol"
                  alt="Vista do alto da favela ao pôr do sol: casas de tijolo, roupa no varal, gente na rua e o Morro Dois Irmãos com o mar ao fundo"
                  prioridade
                  sizes="(min-width: 1024px) 576px, 100vw"
                  imgClassName="aspect-[4/5] w-full scale-[1.14] object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" aria-hidden="true" />
            </div>

            <CartaoFlutuante className="-left-4 top-8 w-60 sm:-left-12" atraso={0}>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ClipboardList className="h-4 w-4" /> Nova triagem
              </p>
              <p className="mt-2 font-semibold">Tosse há mais de 3 semanas</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                <Siren className="h-3.5 w-3.5" /> Prioridade
              </p>
            </CartaoFlutuante>

            <CartaoFlutuante className="-right-3 bottom-28 w-64 sm:-right-10" atraso={-2000}>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Cpu className="h-4 w-4" /> Sensor da viela
              </p>
              <div className="mt-3 space-y-2">
                {[
                  [Droplets, 'Umidade', 'w-4/5 bg-sky-500'],
                  [Sun, 'Luz do sol', 'w-1/4 bg-amber-400'],
                ].map(([I, r, c]) => (
                  <div key={r} className="flex items-center gap-2 text-xs">
                    <I className="h-3.5 w-3.5 text-slate-400" />
                    <span className="w-16">{r}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      <span className={`block h-full rounded-full ${c}`} />
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs texto-suave">Índice do microclima (IVM)</p>
            </CartaoFlutuante>

            <CartaoFlutuante className="-left-2 bottom-6 flex items-center gap-3 sm:-left-8" atraso={-4000}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <RefreshCw className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">Fila sincronizada</span>
                <span className="block text-xs texto-suave">quando o sinal voltou</span>
              </span>
            </CartaoFlutuante>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ NÚMEROS ============================ */

function Numero({ valor, casas = 0, sufixo = '', texto, ativo, atraso }) {
  const v = useContador(valor, 1400, valor, ativo);
  return (
    <div className={`revelar ${ativo ? 'visivel' : ''} flex flex-col-reverse border-l border-white/10 pl-6`} style={{ transitionDelay: `${atraso}ms` }}>
      <dt className="mt-2 text-sm text-slate-400">{texto}</dt>
      <dd className="text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
        {fmt(v, casas)}
        {sufixo}
      </dd>
    </div>
  );
}

function Numeros() {
  const [ref, naTela] = useNaTela();
  return (
    <section ref={ref} aria-label="A tuberculose em números" className="relative isolate overflow-hidden bg-slate-950 py-20 text-white">
      <div aria-hidden="true" className="mancha -right-20 -top-20 -z-10 h-80 w-80 bg-sky-600/30" />
      <div className="container-app grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-sm font-medium text-sky-400">O tamanho do problema</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">A tuberculose tem cura. E ainda adoece milhares de cariocas.</h2>
          <Link to="/mapa" className="group mt-6 inline-flex min-h-toque items-center gap-1.5 font-semibold text-sky-300 hover:text-sky-200">
            Ver no mapa <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-8 lg:grid-cols-4">
          <Numero ativo={naTela} atraso={0} valor={VEZES_ROCINHA_RIO} casas={1} sufixo="×" texto="mais casos na Rocinha que na média do Rio (2013)" />
          <Numero ativo={naTela} atraso={100} valor={372} texto="casos por 100 mil habitantes na Rocinha (2013)" />
          <Numero ativo={naTela} atraso={200} valor={PANORAMA_2022.municipio} casas={1} texto="casos por 100 mil na cidade em 2022" />
          <Numero ativo={naTela} atraso={300} valor={PANORAMA_2022.casosNovos} texto="casos novos na cidade em 2022" />
        </dl>
      </div>
      <p className="container-app mt-12 text-xs text-slate-400">
        Fontes:{' '}
        <a href={FONTES.elPais2015.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
          El País Brasil (2015)
        </a>{' '}
        e{' '}
        <a href={FONTES.boletimSMS2023.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
          Boletim de Tuberculose da SMS-Rio (2023)
        </a>
        .
      </p>
    </section>
  );
}

/* ============================ PROPOSTA ============================ */

const PILARES = [
  {
    id: 'medir',
    verbo: 'Medir',
    icone: Cpu,
    titulo: 'O sensor mostra onde o risco mora',
    texto: 'Um ESP32 na viela lê a umidade e a luz e calcula o IVM. A gestão vê quais becos são úmidos e escuros, o ambiente onde o bacilo sobrevive.',
    publico: 'a gestão',
  },
  {
    id: 'priorizar',
    verbo: 'Priorizar',
    icone: ClipboardList,
    titulo: 'A triagem diz quem precisa de visita primeiro',
    texto: 'Quatro perguntas pelo celular, com ou sem conta. Tosse há 21 dias ou mais vai para o topo da fila. A tela avisa que não é diagnóstico e indica onde fazer o exame.',
    publico: 'moradores',
  },
  {
    id: 'agir',
    verbo: 'Agir',
    icone: Stethoscope,
    titulo: 'O agente sobe o morro com a fila pronta',
    texto: 'O Agente Comunitário de Saúde recebe a lista por urgência, registra a visita e a coleta e continua trabalhando sem sinal.',
    publico: 'agentes de saúde',
  },
];
const TEMPO_ABA = 6500;

function VisualPilar({ id }) {
  if (id === 'medir') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-semibold">
            <Cpu className="h-5 w-5 text-sky-600" /> Sensor ESP32 · viela
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs texto-suave">
            <Activity className="h-3.5 w-3.5 text-emerald-500" /> lendo
          </span>
        </div>
        {[
          ['Umidade do ar', 'bg-sky-500', '82%'],
          ['Luz do sol', 'bg-amber-400', '22%'],
          ['IVM (risco do microclima)', 'bg-gradient-to-r from-amber-400 to-red-500', '66%'],
        ].map(([r, c, w], i) => (
          <div key={r}>
            <p className="text-sm texto-suave">{r}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`encher h-full rounded-full ${c}`} style={{ width: w, animationDuration: '1.1s', animationDelay: `${i * 150}ms` }} />
            </div>
          </div>
        ))}
        <p className="text-xs texto-suave">IVM = 0,6 × umidade + 0,4 × (100 − luz)</p>
      </div>
    );
  }
  if (id === 'priorizar') {
    return (
      <div className="space-y-3">
        {[
          ['Há quantos dias está com tosse?', '24 dias'],
          ['Teve febre?', 'Sim'],
          ['Sua muito à noite?', 'Sim'],
        ].map(([q, r], i) => (
          <div key={q} className="animate-surgir flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60" style={{ animationDelay: `${i * 120}ms` }}>
            <span>{q}</span>
            <span className="font-semibold">{r}</span>
          </div>
        ))}
        <div className="animate-surgir flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/50" style={{ animationDelay: '420ms' }}>
          <Siren className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            <strong className="block text-red-800 dark:text-red-200">Prioridade: tosse há mais de 21 dias</strong>
            <span className="texto-suave">Procure a Clínica da Família. Isto não é diagnóstico.</span>
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {[
        ['Rua 1', 'Urgente', 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300', Siren],
        ['Cachopa', 'Em andamento', 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300', RefreshCw],
        ['Valão', 'Coletado', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', CheckCircle2],
      ].map(([setor, st, c, I], i) => (
        <div key={setor} className="animate-surgir flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60" style={{ animationDelay: `${i * 120}ms` }}>
          <span>
            <span className="block font-semibold">Visita · {setor}</span>
            <span className="text-xs texto-suave">Triagem do morador</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>
            <I className="h-3.5 w-3.5" /> {st}
          </span>
        </div>
      ))}
      <p className="flex items-center gap-1.5 pt-1 text-xs texto-suave">
        <WifiOff className="h-3.5 w-3.5" /> Sem sinal? As mudanças ficam no aparelho e sobem depois.
      </p>
    </div>
  );
}

function Proposta() {
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [ref, naTela] = useNaTela();
  const auto = naTela && !pausado && !menosMovimento();

  useEffect(() => {
    if (!auto) return undefined;
    const id = setTimeout(() => setAtivo((n) => (n + 1) % PILARES.length), TEMPO_ABA);
    return () => clearTimeout(id);
  }, [ativo, auto]);

  const pilar = PILARES[ativo];

  return (
    <section ref={ref} aria-labelledby="proposta" className="container-app py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Revelar>
            <p className="sobrelinha">A proposta</p>
            <h2 id="proposta" className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Encurtar o caminho entre a primeira tosse e o exame.
            </h2>
            <p className="mt-6 text-lg leading-relaxed texto-suave">
              Nas vielas fechadas, a tuberculose é descoberta tarde: a tosse vira rotina e o bacilo passa para a família. O Viela
              Tech junta o ambiente, o morador e o agente de saúde para achar os casos mais cedo.
            </p>
          </Revelar>

          <div
            role="tablist"
            aria-label="Pilares da proposta"
            className="mt-10 space-y-2"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={() => setPausado(false)}
          >
            {PILARES.map((p, i) => {
              const I = p.icone;
              const sel = i === ativo;
              return (
                <button
                  key={p.id}
                  id={`aba-${p.id}`}
                  role="tab"
                  type="button"
                  aria-selected={sel}
                  aria-controls="painel-pilar"
                  onClick={() => setAtivo(i)}
                  className={`relative block w-full overflow-hidden rounded-2xl px-5 py-4 text-left transition-colors duration-300 ${
                    sel ? 'bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${sel ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      <I className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-semibold">{p.verbo}</span>
                    <span className="ml-auto text-xs texto-suave">Para {p.publico}</span>
                  </span>
                  <span className={`grid transition-all duration-500 ${sel ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <span className="overflow-hidden text-sm leading-relaxed texto-suave">{p.texto}</span>
                  </span>
                  {sel && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                      <span
                        key={`${ativo}-${auto}`}
                        className={`block h-full bg-sky-600 dark:bg-sky-400 ${auto ? 'encher' : ''}`}
                        style={{ animationDuration: `${TEMPO_ABA}ms`, width: auto ? '100%' : '0%' }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
          <Revelar atraso={150} className="h-full">
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 ring-1 ring-slate-200 dark:from-sky-950/40 dark:via-slate-900 dark:to-emerald-950/30 dark:ring-slate-800 sm:p-10">
              <div aria-hidden="true" className="grade-hero absolute inset-0 opacity-60" />
              <div id="painel-pilar" role="tabpanel" aria-labelledby={`aba-${pilar.id}`} className="relative flex h-full flex-col">
                <div key={pilar.id} className="animate-surgir">
                  <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
                    0{ativo + 1} · {pilar.verbo}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{pilar.titulo}</h3>
                </div>
                <div key={`${pilar.id}-v`} className="mt-8 rounded-2xl bg-white/90 p-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-800 sm:p-6" aria-hidden="true">
                  <VisualPilar id={pilar.id} />
                </div>
                <p className="mt-4 text-xs texto-suave">Ilustração das telas do sistema.</p>
              </div>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}

/* ============================ PLATAFORMA (bento) ============================ */

function CartaoBento({ className = '', atraso = 0, children, to }) {
  const Tag = to ? Link : 'div';
  return (
    <Revelar atraso={atraso} className={className}>
      <Tag
        to={to}
        onMouseMove={moverHolofote}
        className="holofote group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-900"
      >
        {children}
      </Tag>
    </Revelar>
  );
}

function Plataforma() {
  const [refMapa, mapaVisivel] = useNaTela('200px');
  return (
    <section aria-labelledby="plataforma" className="bg-white py-24 dark:bg-slate-950/40 sm:py-32">
      <div className="container-app">
        <Revelar className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="sobrelinha">A plataforma</p>
            <h2 id="plataforma" className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Uma ferramenta para cada ponta do cuidado.
            </h2>
          </div>
          <p className="max-w-md texto-suave">Do sensor na viela ao painel da gestão, tudo conectado e pensado para funcionar no morro.</p>
        </Revelar>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <CartaoBento to="/mapa" className="md:col-span-6 lg:col-span-4 lg:row-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <MapIcon className="h-5 w-5 text-sky-600" aria-hidden="true" /> Mapa da tuberculose
                </p>
                <p className="mt-2 max-w-md text-sm texto-suave">
                  As 10 regiões de saúde do Rio pintadas pela incidência, com a Rocinha em destaque e zoom no território.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-600" aria-hidden="true" />
            </div>
            <div ref={refMapa} className="fundo-grade mt-6 flex flex-1 items-center rounded-2xl p-4">
              {mapaVisivel ? (
                <Suspense fallback={<div className="aspect-[1000/525] w-full" />}>
                  <MiniMapa />
                </Suspense>
              ) : (
                <div className="aspect-[1000/525] w-full" />
              )}
            </div>
          </CartaoBento>

          <CartaoBento to="/morador" atraso={80} className="md:col-span-3 lg:col-span-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-5 font-semibold">Triagem em 1 minuto</p>
            <p className="mt-2 flex-1 text-sm texto-suave">Quatro perguntas, com ou sem conta. O resultado indica onde fazer o exame.</p>
            <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-400">
              Começar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </p>
          </CartaoBento>

          <CartaoBento to="/equipe" atraso={160} className="md:col-span-3 lg:col-span-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-5 font-semibold">Fila do agente de saúde</p>
            <p className="mt-2 flex-1 text-sm texto-suave">Urgentes no topo, registro da coleta e sincronização quando o sinal volta.</p>
            <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Acesso da equipe <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </p>
          </CartaoBento>

          <CartaoBento atraso={0} className="md:col-span-2">
            <BarChart3 className="h-6 w-6 text-sky-600" aria-hidden="true" />
            <p className="mt-5 font-semibold">Painel da gestão</p>
            <p className="mt-2 text-sm texto-suave">Microclima das vielas, triagens por sub-área e andamento das coletas.</p>
          </CartaoBento>
          <CartaoBento atraso={80} className="md:col-span-2">
            <WifiOff className="h-6 w-6 text-sky-600" aria-hidden="true" />
            <p className="mt-5 font-semibold">Funciona sem sinal</p>
            <p className="mt-2 text-sm texto-suave">Tudo fica guardado no aparelho e sobe sozinho quando a internet volta.</p>
          </CartaoBento>
          <CartaoBento atraso={160} className="md:col-span-2">
            <Lock className="h-6 w-6 text-sky-600" aria-hidden="true" />
            <p className="mt-5 font-semibold">Dados protegidos</p>
            <p className="mt-2 text-sm texto-suave">Cada morador vê só o que é dele. A fila completa é só da equipe.</p>
          </CartaoBento>
        </div>
      </div>
    </section>
  );
}

/* ============================ CHAMADA FINAL ============================ */

function ChamadaFinal() {
  return (
    <section className="container-app py-24 sm:py-32">
      <Revelar>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-white sm:px-14 sm:py-20">
          <Foto nome="rocinha-por-do-sol" alt="" sizes="100vw" className="absolute inset-0 -z-20" imgClassName="h-full w-full object-cover opacity-40" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> A tuberculose tem cura e o tratamento é gratuito
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Tosse há 3 semanas? <span className="text-sky-300">Não deixa pra depois.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg text-slate-300">A triagem leva um minuto e ajuda o agente de saúde a chegar até você.</p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Link
                to="/morador"
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-8 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Fazer a triagem agora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link to="/entrar" className="inline-flex min-h-toque items-center justify-center px-4 font-semibold text-slate-200 hover:text-white">
                Criar minha conta
              </Link>
            </div>
          </div>
          <p className="mt-14 border-t border-white/10 pt-6 text-sm text-slate-400">
            FIAP Global Solution 2026.2 · Objetivos de Desenvolvimento Sustentável 3, 10 e 11
          </p>
        </div>
      </Revelar>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Numeros />
      <Proposta />
      <Plataforma />
      <ChamadaFinal />
    </>
  );
}
