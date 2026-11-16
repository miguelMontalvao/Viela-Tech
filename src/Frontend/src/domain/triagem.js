import { ehTosseProlongada } from './risco.js';

export const VALORES_INICIAIS = {
  morador_nome: '',
  setor_viela: '',
  dias_tosse: '',
  tem_febre: false,
  tem_sudorese: false,
};

/**
 * Valida o formulário de autotriagem.
 * @returns {Record<string,string>} mensagem de erro por campo (objeto vazio = válido)
 */
export function validarTriagem(valores) {
  const erros = {};
  const nome = String(valores.morador_nome ?? '').trim();
  const setor = String(valores.setor_viela ?? '').trim();
  const diasTexto = String(valores.dias_tosse ?? '').trim();
  const dias = Number(diasTexto);

  if (nome.length < 2) erros.morador_nome = 'Escreva seu nome. Pode ser o primeiro nome ou o apelido.';
  else if (nome.length > 80) erros.morador_nome = 'Use no máximo 80 caracteres.';

  if (setor.length < 2) erros.setor_viela = 'Diga em qual setor ou viela você mora.';
  else if (setor.length > 80) erros.setor_viela = 'Use no máximo 80 caracteres.';

  if (diasTexto === '') erros.dias_tosse = 'Informe há quantos dias está tossindo. Se não tem tosse, coloque 0.';
  else if (!Number.isInteger(dias) || dias < 0 || dias > 365) erros.dias_tosse = 'Use um número inteiro entre 0 e 365.';

  return erros;
}

/** Converte os valores do formulário para o contrato de salvarTriagemMorador(dados). */
export function montarPayload(valores) {
  return {
    morador_nome: String(valores.morador_nome).trim(),
    setor_viela: String(valores.setor_viela).trim(),
    dias_tosse: Number(valores.dias_tosse),
    tem_febre: Boolean(valores.tem_febre),
    tem_sudorese: Boolean(valores.tem_sudorese),
  };
}

/** Resumo do resultado mostrado ao morador depois do envio. */
export function avaliarTriagem(payload) {
  const sintomasAssociados = [payload.tem_febre && 'febre', payload.tem_sudorese && 'suor noturno'].filter(Boolean);
  return {
    urgente: ehTosseProlongada(payload.dias_tosse),
    sintomasAssociados,
  };
}
