import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardList, Cpu, HeartPulse, Map, Siren, Stethoscope, Users } from 'lucide-react';
import { Foto } from '../components/ui/Foto';
import { SkylineFavela } from '../components/brand/SkylineFavela';
import { Bandeirinhas, Selo } from '../components/brand/Enfeites';
import { FONTES, INCIDENCIA, VEZES_ROCINHA_RIO } from '../data/tuberculoseRio';

const fmt = (n) => n.toLocaleString('pt-BR');
const ROCINHA = INCIDENCIA.find((i) => i.id === 'rocinha-2013');
const RIO = INCIDENCIA.find((i) => i.id === 'rio-2013');

const PASSOS = [
  {
    icone: Cpu,
    cor: 'bg-sol-300',
    titulo: 'O sensor mede a viela',
    texto: 'Um ESP32 lê a umidade e a luz e calcula o IVM, o índice de vulnerabilidade do microclima.',
  },
  {
    icone: ClipboardList,
    cor: 'bg-sky-300',
    titulo: 'O morador faz a triagem',
    texto: 'Quatro perguntas, menos de um minuto. Quem tosse há 21 dias ou mais vira prioridade.',
  },
  {
    icone: Users,
    cor: 'bg-emerald-300',
    titulo: 'O ACS sobe o morro',
    texto: 'O agente recebe a fila organizada, registra a coleta e sincroniza quando o sinal volta.',
  },
];

const PERFIS = [
  {
    to: '/morador',
    icone: HeartPulse,
    titulo: 'Sou morador',
    texto: 'Tá com tosse? Faz a triagem, com ou sem conta. O agente de saúde da sua área fica sabendo.',
    acao: 'Fazer minha triagem',
    estilo: 'bg-sky-700 text-white dark:bg-sky-600',
    icon: 'bg-white/15 text-white',
    textoSec: 'text-sky-50',
  },
  {
    to: '/equipe',
    icone: Stethoscope,
    titulo: 'Sou agente de saúde',
    texto: 'Fila com os casos de tosse longa no topo, registro da coleta e tudo funcionando sem sinal.',
    acao: 'Entrar no painel',
    estilo: 'bg-emerald-700 text-white dark:bg-emerald-600',
    icon: 'bg-white/15 text-white',
    textoSec: 'text-emerald-50',
  },
  {
    to: '/equipe',
    icone: BarChart3,
    titulo: 'Sou da gestão',
    texto: 'Microclima das vielas, triagens por sub-área e o andamento das coletas num painel só.',
    acao: 'Ver o dashboard',
    estilo: 'bg-white text-slate-900 ring-2 ring-slate-900 dark:bg-slate-800 dark:text-white dark:ring-slate-600',
    icon: 'bg-sol-300 text-slate-900',
    textoSec: 'texto-suave',
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50 dark:from-sky-950/40 dark:via-noite dark:to-noite">
        <div aria-hidden="true" className="textura-calcadao-clara absolute inset-0 opacity-70" />
        <div className="container-app relative grid items-center gap-10 pb-8 pt-10 sm:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pb-0">
          <div className="animate-nascer">
            <div className="flex flex-wrap items-center gap-2">
              <Selo tom="sol">Rocinha · Rio de Janeiro</Selo>
              <Selo tom="branco" inclinacao="rotate-1">Tecnologia cívica</Selo>
            </div>
            <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Onde o sol não chega,{' '}
              <span className="relative whitespace-nowrap text-sky-700 dark:text-sky-400">
                a saúde chega.
                <svg aria-hidden="true" viewBox="0 0 300 16" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none">
                  <path d="M3 11C70 3 160 2 297 9" className="stroke-sol-400" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed texto-suave sm:text-xl">
              Nas vielas mais fechadas, a luz não entra e o ar fica parado. É ali que a tuberculose se espalha. O Viela Tech
              junta sensor, triagem e o corre dos agentes comunitários para encurtar o caminho entre a primeira tosse e o exame.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/morador"
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-700 px-7 font-display text-lg font-bold text-white shadow-flutuante transition hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                Tô com tosse
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/mapa"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-slate-900 bg-white px-7 font-display text-lg font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-slate-900"
              >
                <Map className="h-5 w-5" aria-hidden="true" />
                Ver o mapa da TB
              </Link>
            </div>
          </div>

          {/* Foto em moldura, com adesivos */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative rotate-2 overflow-hidden rounded-4xl border-[6px] border-white shadow-flutuante dark:border-slate-800">
              <Foto
                nome="rocinha-por-do-sol"
                alt="Vista do alto da favela ao pôr do sol: casas de tijolo, roupa no varal, gente na rua e o Morro Dois Irmãos com o mar ao fundo"
                prioridade
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 384px, 90vw"
                imgClassName="aspect-[4/5] h-full w-full object-cover"
              />
            </div>
            <div className="absolute -left-3 bottom-10 max-w-[13.5rem] -rotate-3 rounded-2xl border-2 border-slate-900 bg-white p-3 shadow-selo dark:bg-slate-900 sm:-left-8">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
                <Siren className="h-4 w-4" aria-hidden="true" /> Prioridade
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug">Tosse há 21 dias ou mais vai para o topo da fila do ACS.</p>
            </div>
            <div className="absolute -right-2 top-8 rotate-6 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-selo sm:-right-6">
              Funciona sem sinal
            </div>
          </div>
        </div>
        <SkylineFavela className="relative mt-6 block h-28 w-full sm:h-40 lg:-mt-6 lg:h-52" />
      </section>

      {/* FAIXA DE NÚMEROS */}
      <section aria-labelledby="numeros" className="bg-slate-900 text-white dark:bg-black/40">
        <div className="container-app grid gap-8 py-14 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="sobrelinha text-sol-300 dark:text-sol-300">O tamanho do problema</p>
            <h2 id="numeros" className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              Na Rocinha, a tuberculose foi <span className="text-sol-300">{fmt(VEZES_ROCINHA_RIO)}× mais frequente</span> que na média do Rio.
            </h2>
            <Link to="/mapa" className="mt-6 inline-flex min-h-toque items-center gap-2 font-semibold text-sky-300 hover:underline">
              Entender no mapa <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-tijolo-600 p-5">
              <dt className="text-sm font-semibold text-tijolo-50">Rocinha ({ROCINHA.ano})</dt>
              <dd className="mt-1 font-display text-5xl font-extrabold tabular-nums">{fmt(ROCINHA.valor)}</dd>
              <dd className="text-xs text-tijolo-50">casos por 100 mil hab.</dd>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <dt className="text-sm font-semibold text-slate-300">Cidade do Rio ({RIO.ano})</dt>
              <dd className="mt-1 font-display text-5xl font-extrabold tabular-nums">{fmt(RIO.valor)}</dd>
              <dd className="text-xs text-slate-300">casos por 100 mil hab.</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-400 md:col-start-2 md:-mt-4">
            Fonte:{' '}
            <a href={FONTES.elPais2015.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
              El País Brasil (2015)
            </a>
            , com base nos casos registrados pela Prefeitura do Rio.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section aria-labelledby="como-funciona" className="relative pt-16">
        <Bandeirinhas className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full" />
        <div className="container-app pt-6">
          <p className="sobrelinha">Como funciona</p>
          <h2 id="como-funciona" className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Do sensor na viela até a visita na porta de casa
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {PASSOS.map(({ icone: Icone, cor, titulo, texto }, i) => (
              <li key={titulo} className="card relative overflow-hidden p-7">
                <span className="absolute -right-2 -top-6 font-display text-[7rem] font-extrabold leading-none text-slate-900/[0.04] dark:text-white/5" aria-hidden="true">
                  {i + 1}
                </span>
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-slate-900 ${cor}`}>
                  <Icone className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">
                  <span className="sr-only">Passo {i + 1}: </span>
                  {titulo}
                </h3>
                <p className="mt-2 leading-relaxed texto-suave">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PERFIS */}
      <section aria-labelledby="perfis" className="container-app pt-20">
        <p className="sobrelinha">Pra quem é</p>
        <h2 id="perfis" className="mt-2 text-3xl font-extrabold sm:text-4xl">
          Escolha o seu caminho
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {PERFIS.map(({ to, icone: Icone, titulo, texto, acao, estilo, icon, textoSec }) => (
            <li key={titulo}>
              <Link to={to} className={`group flex h-full flex-col rounded-4xl p-7 transition hover:-translate-y-1 ${estilo}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${icon}`}>
                  <Icone className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="mt-5 font-display text-2xl font-extrabold">{titulo}</span>
                <span className={`mt-2 flex-1 leading-relaxed ${textoSec}`}>{texto}</span>
                <span className="mt-6 inline-flex min-h-toque items-center gap-2 font-semibold underline-offset-4 group-hover:underline">
                  {acao}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CHAMADA FINAL COM FOTO */}
      <section className="container-app pt-20" aria-labelledby="chamada">
        <div className="relative overflow-hidden rounded-4xl bg-noite">
          <Foto
            nome="morro-casas"
            alt=""
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noite via-noite/80 to-transparent" aria-hidden="true" />
          <div className="relative max-w-xl p-8 sm:p-12">
            <h2 id="chamada" className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Tosse que não passa não é normal. <span className="text-sol-300">Não deixa pra depois.</span>
            </h2>
            <p className="mt-4 text-slate-200">
              A triagem não é diagnóstico, mas organiza quem precisa de visita primeiro. O exame é gratuito e a tuberculose tem
              cura.
            </p>
            <Link
              to="/morador"
              className="mt-7 inline-flex min-h-14 items-center gap-2 rounded-full bg-sol-300 px-7 font-display text-lg font-bold text-slate-900 transition hover:bg-sol-400"
            >
              Começar a triagem
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
