/** Papéis de acesso (coluna perfis.papel no Supabase). */
export const PAPEIS = {
  MORADOR: 'morador',
  ACS: 'acs',
  GESTOR: 'gestor',
};

export const PAPEIS_EQUIPE = [PAPEIS.ACS, PAPEIS.GESTOR];

export const ROTULOS_PAPEL = {
  [PAPEIS.MORADOR]: 'Morador',
  [PAPEIS.ACS]: 'Agente Comunitário de Saúde',
  [PAPEIS.GESTOR]: 'Gestão de saúde',
};

/** Quais papéis podem abrir cada área restrita. */
export const ACESSO = {
  '/minha-area': [PAPEIS.MORADOR],
  '/acs': [PAPEIS.ACS, PAPEIS.GESTOR],
  '/gestor': [PAPEIS.GESTOR],
};

export function ehEquipe(papel) {
  return PAPEIS_EQUIPE.includes(papel);
}

export function podeAcessar(papel, rota) {
  const permitidos = ACESSO[rota];
  return !permitidos || permitidos.includes(papel);
}

/** Para onde cada pessoa vai depois de entrar. */
export function destinoInicial(papel) {
  if (papel === PAPEIS.GESTOR) return '/gestor';
  if (papel === PAPEIS.ACS) return '/acs';
  return '/minha-area';
}

/** Status do chamado contado do jeito que o morador entende. */
export const STATUS_PARA_MORADOR = {
  PENDENTE: 'Aguardando a visita do agente',
  EM_ANDAMENTO: 'Agente de saúde a caminho',
  COLETADO: 'Amostra coletada, aguardando resultado',
  'CONCLUÍDO': 'Atendimento concluído',
};
