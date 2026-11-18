import { SETORES_ROCINHA, identificarSetor } from './setores.js';
import { ehUrgente, percentual } from './risco.js';

/** Camadas do mapa de calor. Só "ivm" tem classificação de risco (semáforo); as demais medem concentração. */
export const CAMADAS = [
  { id: 'notificacoes', rotulo: 'Notificações', descricao: 'Todas as triagens de saúde registradas', unidade: ['triagem', 'triagens'] },
  { id: 'respiratorios', rotulo: 'Sintomas respiratórios', descricao: 'Triagens com tosse (1 dia ou mais)', unidade: ['registro', 'registros'] },
  { id: 'atencao', rotulo: 'Atenção epidemiológica', descricao: 'Tosse há 21 dias ou mais, ou prioridade alta', unidade: ['caso de atenção', 'casos de atenção'] },
  { id: 'acs', rotulo: 'Registros dos ACS', descricao: 'Chamados já atendidos por agentes (visita iniciada ou além)', unidade: ['registro', 'registros'] },
  { id: 'ivm', rotulo: 'IVM (simulado)', descricao: 'Índice de Vulnerabilidade Microclimática por sub-área, com variação simulada', unidade: ['ponto', 'pontos'] },
];

/** Contagens abaixo disso são ocultadas ("<3") para não identificar pessoas em sub-áreas pequenas. */
export const LIMITE_ANONIMATO = 3;

const FILTROS = {
  notificacoes: () => true,
  respiratorios: (c) => (Number(c.dias_tosse) || 0) > 0,
  atencao: (c) => ehUrgente(c),
  acs: (c) => c.status && c.status !== 'PENDENTE',
};

/** Contagem agregada por sub-área para uma camada de concentração (Map id → número, 0 se nada). */
export function contarCamada(chamados, camadaId) {
  const filtro = FILTROS[camadaId];
  const mapa = new Map(SETORES_ROCINHA.map((s) => [s.id, 0]));
  if (!filtro) return mapa;
  for (const c of chamados ?? []) {
    if (!filtro(c)) continue;
    const setor = identificarSetor(c.setor_viela);
    if (mapa.has(setor.id)) mapa.set(setor.id, mapa.get(setor.id) + 1);
  }
  return mapa;
}

/** Intensidade de 0 a 1 em relação ao maior valor da camada. */
export function intensidade(valor, maximo) {
  if (!maximo || maximo <= 0 || !valor) return 0;
  return Math.min(1, valor / maximo);
}

/** Nível textual da concentração (não é nível de risco). */
export function nivelConcentracao(razao) {
  if (razao <= 0) return 'Nenhuma';
  if (razao <= 1 / 3) return 'Baixa';
  if (razao <= 2 / 3) return 'Média';
  return 'Alta';
}

/** Valor exibível respeitando o limite de anonimato. */
export function rotuloValor(n) {
  if (!n) return '0';
  return n < LIMITE_ANONIMATO ? `<${LIMITE_ANONIMATO}` : String(n);
}

/** Variação fixa e determinística (-1 a 1) por sub-área, para a demonstração do IVM. */
function ruido(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return ((h % 2001) / 1000) - 1;
}

/**
 * IVM SIMULADO por sub-área: as leituras reais do sensor não têm localização, então a referência
 * (último IVM medido) recebe uma variação fixa de até ±25 pontos. Serve só para demonstrar a camada.
 * Retorna null sem leitura de referência.
 */
export function ivmSimuladoPorSetor(ivmReferencia) {
  const base = percentual(ivmReferencia);
  if (base === null) return null;
  return new Map(
    SETORES_ROCINHA.map((s) => [s.id, Math.round(Math.min(100, Math.max(0, base + ruido(s.id) * 25)) * 10) / 10]),
  );
}
