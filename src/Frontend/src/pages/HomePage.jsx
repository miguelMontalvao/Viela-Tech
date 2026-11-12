import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Cpu, Users } from 'lucide-react';
import { Foto } from '../components/ui/Foto';
import { FONTES, VEZES_ROCINHA_RIO } from '../data/tuberculoseRio';

const fmt = (n) => n.toLocaleString('pt-BR');

const PASSOS = [
  { icone: Cpu, titulo: 'O sensor mede a viela', texto: 'Umidade e luz viram o índice de risco do microclima.' },
  { icone: ClipboardList, titulo: 'O morador faz a triagem', texto: 'Quatro perguntas. Tosse há 21 dias ou mais é prioridade.' },
  { icone: Users, titulo: 'O agente sobe o morro', texto: 'A fila chega organizada e funciona mesmo sem sinal.' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="container-app grid items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-24">
        <div className="animate-nascer">
          <p className="sobrelinha">Rocinha · Rio de Janeiro</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Onde o sol não chega, <span className="text-sky-700 dark:text-sky-400">a saúde chega.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed texto-suave sm:text-xl">
            Triagem de tosse e apoio aos agentes de saúde nas vielas onde a tuberculose mais se espalha.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/morador"
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-sky-700 px-7 text-base font-semibold text-white transition hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Tô com tosse
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/mapa"
              className="inline-flex min-h-14 items-center justify-center rounded-full px-7 text-base font-semibold text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-900/5 dark:text-white dark:ring-slate-600 dark:hover:bg-white/10"
            >
              Ver o mapa
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl">
          <Foto
            nome="rocinha-por-do-sol"
            alt="Vista do alto da favela ao pôr do sol: casas de tijolo, roupa no varal, gente na rua e o Morro Dois Irmãos com o mar ao fundo"
            prioridade
            sizes="(min-width: 1024px) 480px, (min-width: 640px) 600px, 100vw"
            imgClassName="aspect-[4/3] h-full w-full object-cover lg:aspect-[4/5]"
          />
        </div>
      </section>

      {/* NÚMERO */}
      <section aria-labelledby="numero" className="border-y border-slate-900/5 dark:border-white/10">
        <div className="container-app flex flex-col gap-4 py-14 sm:flex-row sm:items-center sm:gap-10">
          <p className="text-6xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white sm:text-7xl">
            {fmt(VEZES_ROCINHA_RIO)}×
          </p>
          <div>
            <h2 id="numero" className="text-2xl font-semibold leading-snug sm:text-3xl">
              mais tuberculose na Rocinha do que na média do Rio.
            </h2>
            <p className="mt-2 text-sm texto-suave">
              Dados de 2013.{' '}
              <a href={FONTES.elPais2015.url} target="_blank" rel="noreferrer" className="underline hover:text-sky-700 dark:hover:text-sky-300">
                Fonte: El País Brasil
              </a>
              {' · '}
              <Link to="/mapa" className="font-semibold text-sky-700 hover:underline dark:text-sky-400">
                Ver no mapa
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section aria-labelledby="como-funciona" className="container-app py-16 sm:py-20">
        <h2 id="como-funciona" className="sr-only">
          Como funciona
        </h2>
        <ol className="grid gap-10 md:grid-cols-3">
          {PASSOS.map(({ icone: Icone, titulo, texto }, i) => (
            <li key={titulo}>
              <Icone className="h-7 w-7 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">
                <span className="sr-only">Passo {i + 1}: </span>
                {titulo}
              </h3>
              <p className="mt-1 texto-suave">{texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
