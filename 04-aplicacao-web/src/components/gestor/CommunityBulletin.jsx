import { useMemo } from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';

function gerarRecomendacoes(temperatura, umidade) {
  const dicas = [];
  dicas.push(umidade >= 70 ? 'Abra portas e janelas em lados opostos, quando for seguro, para renovar o ar.' : 'Mantenha a ventilação cruzada abrindo portas e janelas sempre que possível.');
  dicas.push(umidade >= 70 ? 'Seque áreas úmidas e conserte vazamentos; evite deixar água acumulada em recipientes.' : 'Limpe e seque superfícies de uso frequente e mantenha os ambientes arejados.');
  dicas.push(temperatura >= 28 ? 'Em dias quentes, ventile nos horários mais frescos e hidrate-se.' : 'Higienize regularmente superfícies tocadas por muitas pessoas.');
  return dicas;
}

export function CommunityBulletin({ leitura }) {
  const temperatura = Number.isFinite(leitura?.temperatura) ? leitura.temperatura : 27;
  const umidade = Number.isFinite(leitura?.umidade) ? leitura.umidade : 72;
  const ivm = Number.isFinite(leitura?.ivm) ? leitura.ivm : Math.round((umidade * 0.6 + (100 - (leitura?.insolacao ?? 40)) * 0.4) * 10) / 10;
  const faixa = ivm >= 70 ? 'alto' : ivm >= 40 ? 'atenção' : 'baixo';
  const recomendacoes = useMemo(() => gerarRecomendacoes(temperatura, umidade), [temperatura, umidade]);
  const compartilhar = () => {
    const mensagem = `🌿 *Boletim Viela Tech — Rocinha*\n🌡️ Temperatura: ${temperatura} °C${leitura?.temperatura == null ? ' (simulada)' : ''}\n💧 Umidade: ${umidade}%${leitura?.umidade == null ? ' (simulada)' : ''}\n📊 IVM: ${ivm}% — faixa de ${faixa}\n\n✅ Dicas de prevenção:\n${recomendacoes.map((dica, i) => `${i + 1}. ${dica}`).join('\n')}\n\nO IVM é um indicador ambiental, não um diagnóstico de saúde.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="painel p-6 sm:p-8" aria-labelledby="boletim-titulo">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3"><span className="rounded-xl bg-emerald-100 p-3 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"><ShieldCheck aria-hidden="true" /></span><div><p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Informação comunitária</p><h2 id="boletim-titulo" className="text-2xl font-semibold">Boletim da viela</h2></div></div>
        <button type="button" onClick={compartilhar} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><MessageCircle className="h-5 w-5" aria-hidden="true" />Compartilhar no WhatsApp</button>
      </div>
      <p className="mt-5 text-slate-700 dark:text-slate-200">O indicador ambiental da viela está na faixa de <strong>{faixa}</strong> (IVM {ivm}%). {umidade >= 70 ? 'A umidade está elevada; vale reforçar a circulação de ar e observar pontos úmidos.' : 'Mantenha os cuidados de ventilação e higiene no dia a dia.'}</p>
      <h3 className="mt-6 font-semibold">Três ações para hoje</h3>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">{recomendacoes.map((dica, index) => <li key={dica} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"><span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{index + 1}</span><p className="text-sm">{dica}</p></li>)}</ol>
      <p className="mt-4 text-xs texto-suave">Valores simulados são identificados como tal. O IVM descreve condições ambientais e não indica que uma pessoa tenha tuberculose.</p>
    </section>
  );
}
