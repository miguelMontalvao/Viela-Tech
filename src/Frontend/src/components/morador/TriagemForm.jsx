import { useId, useRef } from 'react';
import { Check, MapPin, Send, Siren, UserRound } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, ToggleQuestion } from '../ui/Field';
import { Alert } from '../ui/Alert';
import { LIMITE_TOSSE_DIAS, ehTosseProlongada } from '../../domain/risco';
import { SETORES_ROCINHA, SETOR_OUTROS, identificarSetor } from '../../domain/setores';

const MAX_DESLIZANTE = 60;
const ATALHOS_DIAS = [
  [0, 'Sem tosse'],
  [7, '1 semana'],
  [14, '2 semanas'],
  [21, '3 semanas'],
  [30, '1 mês'],
];

/** "24" → "3 semanas e 3 dias". */
export function descreverDias(dias) {
  if (!Number.isFinite(dias) || dias < 0) return '';
  if (dias === 0) return 'Sem tosse';
  if (dias < 7) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  const semanas = Math.floor(dias / 7);
  const resto = dias % 7;
  const s = `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  return resto ? `${s} e ${resto} ${resto === 1 ? 'dia' : 'dias'}` : s;
}

function Progresso({ passos }) {
  const feitos = passos.filter(Boolean).length;
  const pronto = feitos === passos.length;
  return (
    <div className="sticky top-[4.5rem] z-10 -mx-5 -mt-5 rounded-t-2xl border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:-mt-8 sm:px-8 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{pronto ? 'Tudo pronto para enviar' : 'Sua triagem'}</span>
        <span className="tabular-nums texto-suave" aria-live="polite">
          {feitos} de {passos.length} respostas
        </span>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {passos.map((ok, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <span className={`block h-full rounded-full transition-all duration-700 ease-out ${ok ? 'w-full' : 'w-0'} ${pronto ? 'bg-emerald-500' : 'bg-sky-600'}`} />
          </span>
        ))}
      </div>
    </div>
  );
}

function SeletorDias({ valor, aoMudar }) {
  const id = useId();
  const dias = valor === '' ? null : Number(valor);
  const valido = dias !== null && Number.isInteger(dias) && dias >= 0;
  const longa = valido && ehTosseProlongada(dias);
  const pos = valido ? Math.min(dias, MAX_DESLIZANTE) : 0;
  const pct = (pos / MAX_DESLIZANTE) * 100;
  const limitePct = (LIMITE_TOSSE_DIAS / MAX_DESLIZANTE) * 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de tempo de tosse">
        {ATALHOS_DIAS.map(([d, rotulo]) => (
          <button
            key={d}
            type="button"
            onClick={() => aoMudar(String(d))}
            aria-pressed={dias === d}
            className={`min-h-toque rounded-full px-4 text-sm font-semibold ring-1 transition-all active:scale-95 ${
              dias === d
                ? 'bg-sky-700 text-white ring-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:ring-sky-500'
                : 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-600'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {valido ? dias : '—'}
            <span className="ml-1.5 text-base font-medium texto-suave">{dias === 1 ? 'dia' : 'dias'}</span>
          </p>
          <p className={`text-sm font-semibold transition-colors ${longa ? 'text-red-700 dark:text-red-300' : 'texto-suave'}`}>{valido ? descreverDias(dias) : 'Arraste ou toque num atalho'}</p>
        </div>
        <div className="relative mt-4 pb-6">
          <div className="absolute inset-x-0 top-[11px] h-2 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-[width,background-color] duration-200 ${longa ? 'bg-gradient-to-r from-amber-400 to-red-500' : 'bg-sky-600 dark:bg-sky-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span aria-hidden="true" className="absolute top-1 h-6 w-0.5 bg-red-500/70" style={{ left: `${limitePct}%` }} />
          <span aria-hidden="true" className="absolute top-8 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-red-700 dark:text-red-300" style={{ left: `${limitePct}%` }}>
            21 dias
          </span>
          <input
            id={id}
            type="range"
            min={0}
            max={MAX_DESLIZANTE}
            step={1}
            value={pos}
            onChange={(e) => aoMudar(e.target.value)}
            aria-label="Ajustar dias de tosse"
            aria-valuetext={valido ? descreverDias(dias) : 'Não informado'}
            className="deslizante relative w-full"
          />
        </div>
        <p className="text-xs texto-suave">Mais de {MAX_DESLIZANTE} dias? Digite o número no campo abaixo.</p>
      </div>
    </div>
  );
}

function Resumo({ valores }) {
  const dias = Number(valores.dias_tosse);
  const temDias = valores.dias_tosse !== '' && Number.isFinite(dias);
  const urgente = temDias && ehTosseProlongada(dias);
  const sintomas = [valores.tem_febre && 'febre', valores.tem_sudorese && 'suor noturno'].filter(Boolean);
  return (
    <div className={`rounded-2xl border-2 p-5 transition-colors duration-500 ${urgente ? 'border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Como a equipe vai ver</p>
        {temDias && (
          <span
            key={String(urgente)}
            className={`animate-surgir inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              urgente ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {urgente ? <Siren className="h-3.5 w-3.5" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {urgente ? 'Prioridade' : 'Fila normal'}
          </span>
        )}
      </div>
      <p className="mt-3 flex items-center gap-2 font-semibold">
        <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {valores.morador_nome.trim() || <span className="font-normal texto-suave">Seu nome</span>}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {valores.setor_viela.trim() || <span className="texto-suave">Setor ou viela</span>}
      </p>
      <p className="mt-3 text-sm texto-suave">
        {temDias ? `Tosse: ${descreverDias(dias).toLowerCase()}` : 'Tosse: não informado'}
        {sintomas.length > 0 && ` · ${sintomas.join(' e ')}`}
      </p>
    </div>
  );
}

/** Formulário de autotriagem: nome, setor/viela, dias de tosse, febre e suor noturno. */
export function TriagemForm({ valores, erros, enviando, erroEnvio, alterarCampo, enviar }) {
  const formRef = useRef(null);
  const listaId = useId();

  async function aoEnviar(e) {
    e.preventDefault();
    const { ok, campos } = await enviar();
    // Leva o foco ao primeiro campo com erro, para quem usa leitor de tela ou teclado.
    if (!ok && campos?.length) formRef.current?.querySelector(`[name="${campos[0]}"]`)?.focus();
  }

  const dias = Number(valores.dias_tosse);
  const diasOk = valores.dias_tosse !== '' && Number.isInteger(dias) && dias >= 0 && dias <= 365;
  const tosseLonga = diasOk && dias >= LIMITE_TOSSE_DIAS;
  const nomeOk = valores.morador_nome.trim().length >= 2;
  const setorOk = valores.setor_viela.trim().length >= 2;
  const setor = setorOk ? identificarSetor(valores.setor_viela) : null;

  return (
    <form ref={formRef} onSubmit={aoEnviar} noValidate className="card space-y-8 p-5 sm:p-8">
      <Progresso passos={[nomeOk, setorOk, diasOk]} />

      <fieldset className="space-y-5">
        <legend className="flex items-center gap-3 text-lg font-semibold">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${nomeOk && setorOk ? 'bg-emerald-500 text-white' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'}`}>
            {nomeOk && setorOk ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : '1'}
          </span>
          Quem é você
        </legend>
        <Field
          label="Seu nome"
          name="morador_nome"
          autoComplete="given-name"
          placeholder="Ex.: Maria"
          value={valores.morador_nome}
          onChange={(e) => alterarCampo('morador_nome', e.target.value)}
          erro={erros.morador_nome}
          maxLength={80}
        />
        <div>
          <Field
            label="Setor ou viela onde mora"
            name="setor_viela"
            dica="Do jeito que você chama: Valão, Rua 1, Cachopa, Beco do…"
            placeholder="Comece a digitar"
            list={listaId}
            value={valores.setor_viela}
            onChange={(e) => alterarCampo('setor_viela', e.target.value)}
            erro={erros.setor_viela}
            maxLength={80}
          />
          <datalist id={listaId}>
            {SETORES_ROCINHA.map((s) => (
              <option key={s.id} value={s.nome} />
            ))}
          </datalist>
          {setor && (
            <p key={setor.id} className="animate-surgir mt-2 flex items-center gap-1.5 text-sm" aria-live="polite">
              {setor.id !== SETOR_OUTROS.id ? (
                <>
                  <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>
                    Reconhecemos: <strong>{setor.nome}</strong>
                  </span>
                </>
              ) : (
                <span className="texto-suave">Tudo bem: o agente de saúde vai localizar pelo nome que você escreveu.</span>
              )}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-slate-200 pt-8 dark:border-slate-700">
        <legend className="sr-only">Como você está</legend>
        <p className="flex items-center gap-3 text-lg font-semibold" aria-hidden="true">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${diasOk ? 'bg-emerald-500 text-white' : 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'}`}>
            {diasOk ? <Check className="h-4 w-4" strokeWidth={3} /> : '2'}
          </span>
          Como você está
        </p>
        <div>
          <p className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Há quanto tempo está com tosse?</p>
          <SeletorDias valor={valores.dias_tosse} aoMudar={(v) => alterarCampo('dias_tosse', v)} />
        </div>
        <Field
          label="Número de dias"
          name="dias_tosse"
          type="number"
          inputMode="numeric"
          min={0}
          max={365}
          step={1}
          dica="Se não lembra o número exato, chute perto. Três semanas são 21 dias."
          placeholder="0"
          value={valores.dias_tosse}
          onChange={(e) => alterarCampo('dias_tosse', e.target.value)}
          erro={erros.dias_tosse}
          inputClassName="max-w-[12rem] text-lg"
        />
        {tosseLonga && (
          <div className="animate-surgir">
            <Alert tipo="erro" titulo="Tosse há 3 semanas ou mais merece atenção">
              Ao enviar, seu caso entra como prioridade para o agente de saúde.
            </Alert>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleQuestion
            label="Tive febre"
            descricao="Principalmente no fim da tarde ou à noite."
            checked={valores.tem_febre}
            onChange={(v) => alterarCampo('tem_febre', v)}
          />
          <ToggleQuestion
            label="Suo muito à noite"
            descricao="Acordo com a roupa ou o lençol molhados."
            checked={valores.tem_sudorese}
            onChange={(v) => alterarCampo('tem_sudorese', v)}
          />
        </div>
      </fieldset>

      <div className="border-t border-slate-200 pt-8 dark:border-slate-700">
        <Resumo valores={valores} />
      </div>

      {erroEnvio && (
        <Alert tipo="erro" role="alert">
          {erroEnvio}
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm texto-suave">Seus dados vão só para a equipe de saúde da sua área.</p>
        <Button type="submit" tamanho="lg" icone={Send} carregando={enviando} className="w-full sm:w-auto">
          {enviando ? 'Enviando…' : 'Enviar triagem'}
        </Button>
      </div>
    </form>
  );
}
