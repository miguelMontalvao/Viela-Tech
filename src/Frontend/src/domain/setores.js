/**
 * Sub-áreas da Rocinha, como os moradores costumam chamar.
 * As posições formam um mapa ESQUEMÁTICO (grade 6 × 4, do alto do morro até a pista),
 * não os limites reais, que não têm base oficial publicada.
 */
export const SETORES_ROCINHA = [
  // linha 0: parte alta do morro
  { id: 'dioneia', nome: 'Dionéia', col: 0, lin: 0, apelidos: ['dioneia'] },
  { id: 'macega', nome: 'Macega', col: 1, lin: 0, apelidos: ['macega'] },
  { id: 'vila-verde', nome: 'Vila Verde', col: 2, lin: 0, apelidos: ['vila verde'] },
  { id: 'rua-4', nome: 'Rua 4', col: 3, lin: 0, apelidos: ['rua 4', 'rua quatro'] },
  { id: 'vila-cruzado', nome: 'Vila Cruzado', col: 4, lin: 0, apelidos: ['vila cruzado', 'cruzado'] },
  { id: 'laboriaux', nome: 'Laboriaux', col: 5, lin: 0, apelidos: ['laboriaux', 'laborieux', 'laboriau', 'laborio'] },
  // linha 1
  { id: 'cidade-nova', nome: 'Cidade Nova', col: 0, lin: 1, apelidos: ['cidade nova'] },
  { id: 'terreirao', nome: 'Terreirão', col: 1, lin: 1, apelidos: ['terreirao'] },
  { id: 'rua-3', nome: 'Rua 3', col: 2, lin: 1, apelidos: ['rua 3', 'rua tres'] },
  { id: 'portao-vermelho', nome: 'Portão Vermelho', col: 3, lin: 1, apelidos: ['portao vermelho'] },
  { id: 'curva-do-s', nome: 'Curva do S', col: 4, lin: 1, apelidos: ['curva do s'] },
  // linha 2
  { id: 'roupa-suja', nome: 'Roupa Suja', col: 0, lin: 2, apelidos: ['roupa suja'] },
  { id: 'cachopa', nome: 'Cachopa', col: 1, lin: 2, apelidos: ['cachopa', 'cachopinha'] },
  { id: 'rua-2', nome: 'Rua 2', col: 2, lin: 2, apelidos: ['rua 2', 'rua dois'] },
  { id: 'via-apia', nome: 'Via Ápia', col: 3, lin: 2, apelidos: ['via apia'] },
  { id: 'fundacao', nome: 'Fundação', col: 4, lin: 2, apelidos: ['fundacao'] },
  // linha 3: parte baixa, perto da pista e de São Conrado
  { id: 'bairro-barcelos', nome: 'Bairro Barcelos', col: 1, lin: 3, apelidos: ['barcelos', 'bairro barcelos'] },
  { id: 'rua-1', nome: 'Rua 1', col: 2, lin: 3, apelidos: ['rua 1', 'rua um'] },
  { id: 'valao', nome: 'Valão', col: 3, lin: 3, apelidos: ['valao'] },
  { id: 'largo-do-boiadeiro', nome: 'Largo do Boiadeiro', col: 4, lin: 3, apelidos: ['boiadeiro', 'largo do boiadeiro'] },
];

export const SETOR_OUTROS = { id: 'outros', nome: 'Outros / não identificado' };

/** Minúsculas, sem acento, sem pontuação e com espaços simples. */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Descobre a sub-área a partir do setor digitado livremente pelo morador.
 * "Rua 1", "rua um", "RUA1" e "Beco da Rua 1" caem em "Rua 1"; o que não for reconhecido vai para "Outros".
 */
export function identificarSetor(textoDigitado) {
  const texto = ` ${normalizarTexto(textoDigitado).replace(/\brua(\d)/g, 'rua $1')} `;
  if (!texto.trim()) return SETOR_OUTROS;
  for (const setor of SETORES_ROCINHA) {
    if (setor.apelidos.some((a) => texto.includes(` ${a} `))) return setor;
  }
  return SETOR_OUTROS;
}

/** Conta triagens e urgentes por sub-área. */
export function contarPorSetor(chamados, ehUrgente) {
  const contagem = new Map([...SETORES_ROCINHA, SETOR_OUTROS].map((s) => [s.id, { setor: s, total: 0, urgentes: 0 }]));
  for (const c of chamados) {
    const item = contagem.get(identificarSetor(c.setor_viela).id);
    item.total += 1;
    if (ehUrgente(c)) item.urgentes += 1;
  }
  return contagem;
}
