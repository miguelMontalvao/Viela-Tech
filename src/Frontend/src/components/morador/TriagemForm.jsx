import { useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, ToggleQuestion } from '../ui/Field';
import { Alert } from '../ui/Alert';
import { LIMITE_TOSSE_DIAS } from '../../domain/risco';

/** Formulário de autotriagem: nome, setor/viela, dias de tosse, febre e suor noturno. */
export function TriagemForm({ valores, erros, enviando, erroEnvio, alterarCampo, enviar }) {
  const formRef = useRef(null);

  async function aoEnviar(e) {
    e.preventDefault();
    const { ok, campos } = await enviar();
    // Leva o foco ao primeiro campo com erro, para quem usa leitor de tela ou teclado.
    if (!ok && campos?.length) formRef.current?.querySelector(`[name="${campos[0]}"]`)?.focus();
  }

  const dias = Number(valores.dias_tosse);
  const tosseLonga = valores.dias_tosse !== '' && Number.isFinite(dias) && dias >= LIMITE_TOSSE_DIAS;

  return (
    <form ref={formRef} onSubmit={aoEnviar} noValidate className="card space-y-6 p-5 sm:p-8">
      <fieldset className="space-y-5">
        <legend className="text-lg font-bold">Quem é você</legend>
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
        <Field
          label="Setor ou viela onde mora"
          name="setor_viela"
          dica="Do jeito que você chama: Valão, Rua 1, Cachopa, Beco do…"
          placeholder="Ex.: Valão"
          value={valores.setor_viela}
          onChange={(e) => alterarCampo('setor_viela', e.target.value)}
          erro={erros.setor_viela}
          maxLength={80}
        />
      </fieldset>

      <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
        <fieldset className="space-y-5">
          <legend className="text-lg font-bold">Como você está</legend>
          <Field
            label="Há quantos dias está com tosse?"
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
            <Alert tipo="erro" titulo="Tosse há 3 semanas ou mais merece atenção">
              Ao enviar, seu caso entra como prioridade para o agente de saúde.
            </Alert>
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
      </div>

      {erroEnvio && (
        <Alert tipo="erro" role="alert">
          {erroEnvio}
        </Alert>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm texto-suave">Seus dados vão só para a equipe de saúde da sua área.</p>
        <Button type="submit" tamanho="lg" icone={Send} carregando={enviando} className="w-full sm:w-auto">
          {enviando ? 'Enviando…' : 'Enviar triagem'}
        </Button>
      </div>
    </form>
  );
}
