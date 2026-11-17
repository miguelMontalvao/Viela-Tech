import { useMemo } from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { ESTILO_FAIXA, ICONE_FAIXA } from '../ui/faixas';
import { formatoNumero, gerarRecomendacoes, mensagemBoletim, montarCenario } from '../../domain/simulacao';

/**
 * Boletim comunitário (US-17): orientações de prevenção a partir do microclima,
 * com compartilhamento por link do WhatsApp (não envia notificações automáticas).
 */
export function CommunityBulletin({ leitura }) {
  const cenario = useMemo(() => montarCenario(leitura), [leitura]);
  const recomendacoes = useMemo(() => gerarRecomendacoes(cenario), [cenario]);
  const faixa = cenario.faixa;
  const IconeFaixa = faixa ? ICONE_FAIXA[faixa.id] : null;
  const linkWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagemBoletim(cenario, recomendacoes))}`;

  return (
    <section className="painel p-6 sm:p-8" aria-labelledby="boletim-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-emerald-100 p-3 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <ShieldCheck aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Informação comunitária</p>
            <h2 id="boletim-titulo" className="text-2xl font-semibold">
              Boletim da viela
            </h2>
          </div>
        </div>
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Compartilhar no WhatsApp
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-200">
        <span>Indicador ambiental da viela:</span>
        {faixa && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${ESTILO_FAIXA[faixa.id]}`}>
            <IconeFaixa className="h-4 w-4" aria-hidden="true" style={{ color: faixa.cor }} />
            {faixa.rotulo} · IVM {formatoNumero(cenario.ivm)}%
          </span>
        )}
        {cenario.simulados.ivm && <span className="text-sm texto-suave">(valor simulado, sem leitura do sensor)</span>}
      </div>
      <p className="mt-3 text-slate-700 dark:text-slate-200">
        {cenario.umidade >= 70
          ? 'A umidade está elevada; vale reforçar a circulação de ar e observar pontos úmidos.'
          : 'Mantenha os cuidados de ventilação e higiene no dia a dia.'}
      </p>

      <h3 className="mt-6 font-semibold">Três ações para hoje</h3>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {recomendacoes.map((dica, index) => (
          <li key={dica} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" aria-hidden="true">
              {index + 1}
            </span>
            <p className="text-sm">{dica}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs texto-suave">
        Valores simulados são identificados como tal. O IVM descreve condições ambientais e não indica que uma pessoa tenha tuberculose.
      </p>
    </section>
  );
}
