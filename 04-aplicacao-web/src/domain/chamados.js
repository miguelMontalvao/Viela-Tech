import { ehUrgente } from './risco.js';

/** Status aceitos pela tabela chamados_coleta (ver services/api.js). */
export const STATUS = {
  PENDENTE: 'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  COLETADO: 'COLETADO',
  CONCLUIDO: 'CONCLUÍDO',
};

export const ROTULOS_STATUS = {
  [STATUS.PENDENTE]: 'Aguardando visita',
  [STATUS.EM_ANDAMENTO]: 'Em atendimento',
  [STATUS.COLETADO]: 'Amostra coletada',
  [STATUS.CONCLUIDO]: 'Concluído',
};

export const ORDEM_STATUS = [STATUS.PENDENTE, STATUS.EM_ANDAMENTO, STATUS.COLETADO, STATUS.CONCLUIDO];

/** Próximo passo do ACS em cada etapa do atendimento. */
const ACOES = {
  [STATUS.PENDENTE]: [{ status: STATUS.EM_ANDAMENTO, rotulo: 'Iniciar atendimento' }],
  [STATUS.EM_ANDAMENTO]: [{ status: STATUS.COLETADO, rotulo: 'Registrar coleta' }],
  [STATUS.COLETADO]: [{ status: STATUS.CONCLUIDO, rotulo: 'Concluir chamado' }],
  [STATUS.CONCLUIDO]: [],
};

export function rotuloStatus(status) {
  return ROTULOS_STATUS[status ?? STATUS.PENDENTE] ?? status;
}

export function proximasAcoes(status) {
  return ACOES[status ?? STATUS.PENDENTE] ?? [];
}

/** Identificador estável de um chamado, remoto (id) ou ainda local (_localId). */
export function idDoChamado(chamado) {
  return chamado?.id ?? chamado?._localId;
}

export function estaFinalizado(chamado) {
  return chamado?.status === STATUS.CONCLUIDO;
}

/**
 * Ordem da fila do ACS: urgentes em aberto primeiro, depois os demais em aberto
 * e, por último, os concluídos. Dentro de cada grupo, quem espera há mais tempo vem antes.
 */
export function ordenarPorPrioridade(chamados) {
  const peso = (c) => (estaFinalizado(c) ? 2 : ehUrgente(c) ? 0 : 1);
  const data = (c) => (c.created_at ? new Date(c.created_at).getTime() : 0);
  return [...chamados].sort((a, b) => peso(a) - peso(b) || data(a) - data(b));
}

/** Remove registros repetidos que possam surgir da mescla entre dados locais e remotos. */
export function semDuplicados(chamados) {
  const vistos = new Set();
  return chamados.filter((c) => {
    const chave = String(idDoChamado(c));
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Descarta entradas de cache que só têm id/status (sem dados do morador). */
export function comDadosDoMorador(chamados) {
  return chamados.filter((c) => c && (c.morador_nome || c.setor_viela));
}

/** Filtra a lista por texto (nome ou setor) e pelo grupo selecionado. */
export function filtrarChamados(chamados, { busca = '', filtro = 'abertos' } = {}) {
  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  return chamados.filter((c) => {
    if (filtro === 'urgentes' && !(ehUrgente(c) && !estaFinalizado(c))) return false;
    if (filtro === 'abertos' && estaFinalizado(c)) return false;
    if (filtro === 'concluidos' && !estaFinalizado(c)) return false;
    if (!termo) return true;
    return `${c.morador_nome ?? ''} ${c.setor_viela ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo);
  });
}

export const GRUPOS_FILA = [
  { id: 'urgentes', rotulo: 'Urgentes', descricao: 'Tosse há 21 dias ou mais' },
  { id: 'atendimento', rotulo: 'Em atendimento', descricao: 'Visita iniciada ou amostra colhida' },
  { id: 'aguardando', rotulo: 'Aguardando visita', descricao: 'Ainda sem atendimento' },
  { id: 'concluidos', rotulo: 'Concluídos', descricao: 'Chamados encerrados' },
];

/** Grupo da fila em que o chamado se encaixa (urgência só vale enquanto está aberto). */
export function grupoDoChamado(chamado) {
  if (estaFinalizado(chamado)) return 'concluidos';
  if (ehUrgente(chamado)) return 'urgentes';
  if (chamado.status === STATUS.EM_ANDAMENTO || chamado.status === STATUS.COLETADO) return 'atendimento';
  return 'aguardando';
}

/** Agrupa a lista na ordem de GRUPOS_FILA, omitindo grupos vazios. */
export function agruparChamados(chamados) {
  const mapa = new Map(GRUPOS_FILA.map((g) => [g.id, []]));
  for (const c of ordenarPorPrioridade(chamados)) mapa.get(grupoDoChamado(c)).push(c);
  return GRUPOS_FILA.map((g) => ({ ...g, itens: mapa.get(g.id) })).filter((g) => g.itens.length > 0);
}

/** "agora", "há 5 min", "há 3 h", "há 2 dias"; vazio se a data for inválida. */
export function tempoRelativo(data, agora = Date.now()) {
  const t = data ? new Date(data).getTime() : NaN;
  if (Number.isNaN(t)) return '';
  const min = Math.max(0, Math.floor((agora - t) / 60000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
}

/** Indicadores agregados para o dashboard do gestor. */
export function resumirChamados(chamados) {
  const porStatus = Object.fromEntries(ORDEM_STATUS.map((s) => [s, 0]));
  const porSetor = new Map();
  let urgentes = 0;
  let urgentesAbertos = 0;
  let pendentesSync = 0;
  let somaDias = 0;
  let comFebre = 0;
  let comSudorese = 0;

  for (const c of chamados) {
    const status = c.status ?? STATUS.PENDENTE;
    porStatus[status] = (porStatus[status] ?? 0) + 1;
    if (ehUrgente(c)) {
      urgentes += 1;
      if (!estaFinalizado(c)) urgentesAbertos += 1;
    }
    if (c._offline) pendentesSync += 1;
    if (c.tem_febre) comFebre += 1;
    if (c.tem_sudorese) comSudorese += 1;
    somaDias += Number(c.dias_tosse) || 0;
    const setor = String(c.setor_viela ?? '').trim() || 'Não informado';
    porSetor.set(setor, (porSetor.get(setor) ?? 0) + 1);
  }

  return {
    total: chamados.length,
    urgentes,
    urgentesAbertos,
    concluidos: porStatus[STATUS.CONCLUIDO] ?? 0,
    pendentesSync,
    comFebre,
    comSudorese,
    mediaDiasTosse: chamados.length ? Math.round((somaDias / chamados.length) * 10) / 10 : 0,
    porStatus: ORDEM_STATUS.map((s) => ({ chave: s, rotulo: rotuloStatus(s), valor: porStatus[s] ?? 0 })),
    porSetor: [...porSetor.entries()]
      .map(([rotulo, valor]) => ({ chave: rotulo, rotulo, valor }))
      .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
  };
}
