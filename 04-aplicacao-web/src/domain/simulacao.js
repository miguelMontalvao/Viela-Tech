/**
 * Cenário didático do dashboard do gestor (simulador de 24 h e boletim comunitário).
 *
 * IMPORTANTE: a taxa de crescimento abaixo é uma hipótese ilustrativa do front-end,
 * sem calibração científica. Não estima risco de tuberculose nem substitui o IVM,
 * que continua sendo o indicador oficial do projeto (domain/risco.js).
 */
import { FAIXAS_IVM, calcularIVM, classificarIVM, percentual } from './risco.js';

/** Valores usados quando o sensor ainda não enviou a medida. Sempre identificados na tela. */
export const CENARIO_PADRAO = { temperatura: 27, umidade: 72, insolacao: 40 };

/** Faixas do fator projetado, com o mesmo semáforo de 3 cores do IVM. */
export const LIMIAR_FATOR_ATENCAO = 1.2;
export const LIMIAR_FATOR_PERIGO = 1.5;
export const HORAS_SIMULADAS = 24;

const numeroOuNull = (valor) => (valor === null || valor === undefined || valor === '' || !Number.isFinite(Number(valor)) ? null : Number(valor));

/**
 * Junta a leitura do sensor com o cenário padrão, marcando o que foi simulado.
 * @param {{ temperatura?: number|null, umidade?: number|null, insolacao?: number|null, ivm?: number|null } | null} leitura
 */
export function montarCenario(leitura) {
  const medidos = {
    temperatura: numeroOuNull(leitura?.temperatura),
    umidade: percentual(leitura?.umidade),
    insolacao: percentual(leitura?.insolacao),
  };
  const simulados = {
    temperatura: medidos.temperatura === null,
    umidade: medidos.umidade === null,
    insolacao: medidos.insolacao === null,
  };
  const temperatura = medidos.temperatura ?? CENARIO_PADRAO.temperatura;
  const umidade = medidos.umidade ?? CENARIO_PADRAO.umidade;
  const insolacao = medidos.insolacao ?? CENARIO_PADRAO.insolacao;
  const ivmGravado = percentual(leitura?.ivm);
  const ivmSimulado = ivmGravado === null && (simulados.umidade || simulados.insolacao);
  const ivm = ivmGravado ?? calcularIVM(umidade, insolacao);
  return {
    temperatura,
    umidade,
    insolacao,
    ivm,
    faixa: classificarIVM(ivm),
    simulados: { ...simulados, ivm: ivmSimulado },
    algumSimulado: simulados.temperatura || simulados.umidade || simulados.insolacao,
    semLeitura: !leitura,
  };
}

/**
 * Taxa didática por hora: r = 0,01 + 0,001·máx(T − 20, 0) + 0,0005·máx(U − 60, 0).
 * @param {number} temperatura em °C @param {number} umidade em %
 */
export function taxaCrescimento(temperatura, umidade) {
  return 0.01 + Math.max(0, temperatura - 20) * 0.001 + Math.max(0, umidade - 60) * 0.0005;
}

/** Fator do modelo exponencial N(t)/N₀ = e^(r·t). */
export function fatorCrescimento(taxa, horas) {
  return Math.exp(taxa * horas);
}

/** Classifica o fator no semáforo de 3 cores (mesmos rótulos e cores do IVM). */
export function classificarFator(fator) {
  if (fator >= LIMIAR_FATOR_PERIGO) return FAIXAS_IVM.PERIGO;
  if (fator >= LIMIAR_FATOR_ATENCAO) return FAIXAS_IVM.ATENCAO;
  return FAIXAS_IVM.NORMAL;
}

/** Pontos (hora, fator) de 0 a 24 h para desenhar a curva. */
export function curvaCrescimento(taxa, horas = HORAS_SIMULADAS) {
  return Array.from({ length: horas + 1 }, (_, h) => ({ h, fator: fatorCrescimento(taxa, h) }));
}

const formatoNumero = (valor, casas = 1) => Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: casas });

/** Três recomendações práticas a partir do microclima e da faixa do IVM. */
export function gerarRecomendacoes({ temperatura, umidade, faixa }) {
  const umido = umidade >= 70;
  const critico = faixa?.id === FAIXAS_IVM.PERIGO.id;
  return [
    umido || critico
      ? 'Abra portas e janelas em lados opostos, quando for seguro, para renovar o ar.'
      : 'Mantenha a ventilação cruzada abrindo portas e janelas sempre que possível.',
    umido
      ? 'Seque áreas úmidas e conserte vazamentos; evite deixar água acumulada em recipientes.'
      : 'Limpe e seque superfícies de uso frequente e mantenha os ambientes arejados.',
    temperatura >= 28
      ? 'Em dias quentes, ventile nos horários mais frescos e beba água.'
      : 'Quem tem tosse há 3 semanas ou mais deve procurar a Clínica da Família.',
  ];
}

/** Texto do boletim compartilhado no WhatsApp. Valores simulados vão identificados. */
export function mensagemBoletim(cenario, recomendacoes) {
  const marca = (simulado) => (simulado ? ' (simulado)' : '');
  return [
    '*Boletim Viela Tech — Rocinha*',
    `Temperatura: ${formatoNumero(cenario.temperatura)} °C${marca(cenario.simulados.temperatura)}`,
    `Umidade: ${formatoNumero(cenario.umidade)}%${marca(cenario.simulados.umidade)}`,
    `IVM: ${formatoNumero(cenario.ivm)}% — faixa ${cenario.faixa?.rotulo ?? '—'}${marca(cenario.simulados.ivm)}`,
    '',
    'Dicas de prevenção:',
    ...recomendacoes.map((dica, i) => `${i + 1}. ${dica}`),
    '',
    'O IVM é um indicador ambiental, não um diagnóstico de saúde.',
  ].join('\n');
}

export { formatoNumero };
