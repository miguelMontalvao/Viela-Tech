/**
 * Regras de risco do Viela Tech.
 * As faixas do IVM e o limite de tosse vêm do backlog (regras de negócio)
 * e já são usados no firmware do ESP32 (wokwi/main.py) e no módulo Python.
 */

export const LIMIAR_ATENCAO = 40;
export const LIMIAR_PERIGO = 70;
export const LIMITE_TOSSE_DIAS = 21;

export const FAIXAS_IVM = {
  NORMAL: {
    id: 'NORMAL',
    rotulo: 'Normal',
    descricao: 'Microclima dentro do esperado.',
    cor: '#16A34A',
  },
  ATENCAO: {
    id: 'ATENCAO',
    rotulo: 'Atenção',
    descricao: 'Umidade alta ou pouca luz. Vale acompanhar de perto.',
    cor: '#D97706',
  },
  PERIGO: {
    id: 'PERIGO',
    rotulo: 'Perigo',
    descricao: 'Ambiente favorável à tuberculose. Priorize a busca ativa na área.',
    cor: '#DC2626',
  },
};

/** Garante um número finito entre 0 e 100, ou null. @param {unknown} valor */
export function percentual(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, n));
}

/**
 * IVM = 0,6 · Umidade + 0,4 · (100 − Insolação), mesma fórmula do ESP32.
 * @param {number} umidade @param {number} insolacao @returns {number|null}
 */
export function calcularIVM(umidade, insolacao) {
  const u = percentual(umidade);
  const i = percentual(insolacao);
  if (u === null || i === null) return null;
  return Math.round((0.6 * u + 0.4 * (100 - i)) * 10) / 10;
}

/** Classifica o IVM: abaixo de 40 normal, de 40 a menos de 70 atenção, 70 ou mais perigo. */
export function classificarIVM(ivm) {
  const valor = percentual(ivm);
  if (valor === null) return null;
  if (valor >= LIMIAR_PERIGO) return FAIXAS_IVM.PERIGO;
  if (valor >= LIMIAR_ATENCAO) return FAIXAS_IVM.ATENCAO;
  return FAIXAS_IVM.NORMAL;
}

/** Tosse por 21 dias ou mais é alerta prioritário. @param {number|string} diasTosse */
export function ehTosseProlongada(diasTosse) {
  return Number(diasTosse) >= LIMITE_TOSSE_DIAS;
}

/** Um chamado é urgente quando tem prioridade_alta ou tosse por 21 dias ou mais. */
export function ehUrgente(chamado) {
  return Boolean(chamado?.prioridade_alta) || ehTosseProlongada(chamado?.dias_tosse);
}

/**
 * Normaliza a leitura de microclima vinda do Supabase.
 * Usa o IVM gravado pelo sensor e só calcula quando ele não vier.
 */
export function normalizarLeitura(leitura) {
  if (!leitura) return null;
  const umidade = percentual(leitura.umidade);
  const insolacao = percentual(leitura.insolacao);
  const ivmGravado = percentual(leitura.ivm);
  const ivm = ivmGravado ?? calcularIVM(umidade, insolacao);
  return {
    umidade,
    insolacao,
    ivm,
    ivmCalculado: ivmGravado === null && ivm !== null,
    faixa: classificarIVM(ivm),
    dataHora: leitura.created_at ? new Date(leitura.created_at) : null,
  };
}
