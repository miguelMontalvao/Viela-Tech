import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useContador, useNaTela } from '../../hooks/useAnimacao';
import { ORDEM_STATUS, STATUS } from '../../domain/chamados';

/*
 * Peças comuns dos painéis da equipe (ACS e gestor), no mesmo padrão visual
 * do cabeçalho e da Home: faixa escura com grade e luz, números que contam
 * e entradas suaves. Tudo respeita "reduzir movimento".
 */

const formatoData = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

/** Indicador numérico que conta até o valor quando aparece. */
export function Kpi({ rotulo, valor, casas = 0, sufixo = '', detalhe, icone: Icone, destaque, atraso = 0, ativo }) {
  const numero = Number(valor) || 0;
  const v = useContador(numero, 1100, numero, ativo);
  return (
    <div className={`revelar ${ativo ? 'visivel' : ''}`} style={{ transitionDelay: `${atraso}ms` }}>
      <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {Icone && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${destaque ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-sky-300'}`}>
            <Icone className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        {rotulo}
      </dt>
      <dd className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-white">
        {v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}
        {sufixo}
      </dd>
      {detalhe && <dd className="mt-1 text-sm text-slate-400">{detalhe}</dd>}
    </div>
  );
}

/** Cabeçalho escuro dos painéis, com saudação, data, ações e uma faixa de indicadores. */
export function CabecalhoPainel({ sobrelinha, titulo, children, acoes, kpis }) {
  const agora = useRelogio();
  const [ref, naTela] = useNaTela('0px');
  return (
    <section ref={ref} className="relative isolate mt-6 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
      <div aria-hidden="true" className="grade-hero absolute inset-0 -z-10 opacity-40" />
      <div aria-hidden="true" className="mancha -right-24 -top-24 -z-10 h-80 w-80 bg-sky-600/35" />
      <div aria-hidden="true" className="mancha -bottom-32 left-1/4 -z-10 h-72 w-72 bg-emerald-600/20" style={{ animationDelay: '-7s' }} />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="animate-surgir max-w-2xl">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-sky-300">
            {sobrelinha}
            <span className="text-slate-500" aria-hidden="true">
              ·
            </span>
            <time dateTime={agora.toISOString()} className="text-slate-400">
              {maiuscula(formatoData.format(agora))}, {formatoHora.format(agora)}
            </time>
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{titulo}</h1>
          {children && <p className="mt-3 text-lg leading-relaxed text-slate-300">{children}</p>}
        </div>
        {acoes && <div className="animate-surgir flex shrink-0 gap-2">{acoes}</div>}
      </div>

      {kpis && (
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Kpi key={k.rotulo} {...k} ativo={naTela} atraso={i * 90} />
          ))}
        </dl>
      )}
    </section>
  );
}

const ETAPAS = {
  [STATUS.PENDENTE]: 'Aguardando',
  [STATUS.EM_ANDAMENTO]: 'Atendimento',
  [STATUS.COLETADO]: 'Coleta',
  [STATUS.CONCLUIDO]: 'Concluído',
};

/** Linha do tempo das 4 etapas do chamado, com a etapa atual em destaque. */
export function EtapasAtendimento({ status = STATUS.PENDENTE }) {
  const atual = Math.max(0, ORDEM_STATUS.indexOf(status));
  return (
    <ol aria-label="Etapas do atendimento" className="grid grid-cols-4 gap-1">
      {ORDEM_STATUS.map((s, i) => {
        const feito = i < atual || (i === atual && s === STATUS.CONCLUIDO);
        const agora = i === atual && !feito;
        return (
          <li key={s} aria-current={agora ? 'step' : undefined} className="flex flex-col gap-2">
            <span className="relative h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
              <span
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                  feito ? 'w-full bg-emerald-500' : agora ? 'w-1/2 bg-sky-600 dark:bg-sky-400' : 'w-0'
                }`}
              />
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                feito ? 'text-emerald-700 dark:text-emerald-400' : agora ? 'text-slate-900 dark:text-white' : 'texto-suave'
              }`}
            >
              {feito && <Check className="h-3 w-3 shrink-0" strokeWidth={3} aria-hidden="true" />}
              <span className="truncate">{ETAPAS[s]}</span>
              <span className="sr-only">{feito ? ' (feito)' : agora ? ' (etapa atual)' : ' (a fazer)'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
