import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardList, Cpu, Lock, ShieldCheck, Stethoscope, Users, WifiOff } from 'lucide-react';
import { Foto } from '../components/ui/Foto';
import { FONTES, VEZES_ROCINHA_RIO } from '../data/tuberculoseRio';
import { useNaTela } from '../hooks/useAnimacao';

const fmt = (n) => n.toLocaleString('pt-BR');

/* Os três pilares da proposta: medir, priorizar e agir. */
const PILARES = [
  {
    id: 'medir',
    verbo: 'Medir',
    icone: Cpu,
    titulo: 'O sensor mostra onde o risco mora',
    texto:
      'Um ESP32 instalado na viela lê a umidade e a luz e calcula o IVM, o índice de vulnerabilidade do microclima. A gestão enxerga quais becos são úmidos e escuros, o ambiente onde o bacilo da tuberculose sobrevive.',
    publico: 'Gestão da saúde',
    publicoIcone: BarChart3,
  },
  {
    id: 'priorizar',
    verbo: 'Priorizar',
    icone: ClipboardList,
    titulo: 'A triagem diz quem precisa de visita primeiro',
    texto:
      'O morador responde quatro perguntas pelo celular, com ou sem conta. Tosse há 21 dias ou mais vira prioridade e vai para o topo da fila. A tela avisa que não é diagnóstico e indica onde fazer o exame.',
    publico: 'Moradores',
    publicoIcone: Users,
  },
  {
    id: 'agir',
    verbo: 'Agir',
    icone: Stethoscope,
    titulo: 'O agente sobe o morro com a fila pronta',
    texto:
      'O Agente Comunitário de Saúde recebe a lista organizada por urgência, registra a visita e a coleta do escarro e continua trabalhando sem sinal. Tudo sincroniza quando a internet volta.',
    publico: 'Agentes de saúde',
    publicoIcone: Stethoscope,
  },
];

const COMPROMISSOS = [
  { icone: ShieldCheck, titulo: 'Orienta, não diagnostica', texto: 'Quem confirma é o exame, feito de graça no SUS.' },
  { icone: WifiOff, titulo: 'Feito para a viela', texto: 'Funciona com sinal fraco ou sem internet.' },
  { icone: Lock, titulo: 'Dados protegidos', texto: 'Cada morador vê só o que é dele. A fila completa é da equipe.' },
];

function Proposta() {
  const [ativo, setAtivo] = useState(0);
  const [ref, naTela] = useNaTela();
  const pilar = PILARES[ativo];
  const Icone = pilar.icone;
  const Publico = pilar.publicoIcone;

  return (
    <section ref={ref} aria-labelledby="proposta" className="container-app py-20 sm:py-28">
      <div className={`max-w-3xl transition duration-700 ${naTela ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <p className="sobrelinha">A proposta</p>
        <h2 id="proposta" className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Encurtar o caminho entre a primeira tosse e o exame.
        </h2>
        <p className="mt-5 text-lg leading-relaxed texto-suave">
          A tuberculose tem cura, mas nas vielas fechadas da Rocinha ela costuma ser descoberta tarde. A tosse vira rotina, a
          pessoa não procura a clínica e o bacilo passa para a família. O Viela Tech junta três peças que já existem no
          território (o ambiente, o morador e o agente de saúde) para achar os casos mais cedo.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div role="tablist" aria-label="Pilares da proposta" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
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
                className={`flex min-h-14 shrink-0 items-center gap-3 rounded-2xl px-4 text-left transition-all duration-300 lg:w-full ${
                  sel
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-sm tabular-nums ${sel ? 'opacity-70' : ''}`}>0{i + 1}</span>
                <I className="h-5 w-5" aria-hidden="true" />
                <span className="font-semibold">{p.verbo}</span>
              </button>
            );
          })}
        </div>

        <div id="painel-pilar" role="tabpanel" aria-labelledby={`aba-${pilar.id}`} className="card relative overflow-hidden p-8 sm:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-8 text-[9rem] font-semibold leading-none text-slate-900/[0.03] dark:text-white/[0.04]">
            0{ativo + 1}
          </span>
          <div key={pilar.id} className="animate-surgir relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <Icone className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{pilar.titulo}</h3>
            <p className="mt-4 max-w-2xl leading-relaxed texto-suave">{pilar.texto}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium dark:bg-slate-800">
              <Publico className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden="true" />
              Para: {pilar.publico}
            </p>
          </div>
          <div className="relative mt-10 flex gap-2" aria-hidden="true">
            {PILARES.map((p, i) => (
              <span key={p.id} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <span className={`block h-full bg-sky-600 transition-[width] duration-500 dark:bg-sky-400 ${i <= ativo ? 'w-full' : 'w-0'}`} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-800 sm:grid-cols-3">
        {COMPROMISSOS.map(({ icone: I, titulo, texto }, i) => (
          <li
            key={titulo}
            className={`bg-slate-50 p-6 transition duration-700 dark:bg-noite ${naTela ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
            style={{ transitionDelay: `${300 + i * 120}ms` }}
          >
            <I className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <p className="mt-3 font-semibold">{titulo}</p>
            <p className="mt-1 text-sm texto-suave">{texto}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm texto-suave">
        Projeto da FIAP Global Solution 2026.2, ligado aos Objetivos de Desenvolvimento Sustentável 3 (saúde e bem-estar), 10
        (redução das desigualdades) e 11 (cidades sustentáveis).
      </p>
    </section>
  );
}

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

      <Proposta />
    </>
  );
}
