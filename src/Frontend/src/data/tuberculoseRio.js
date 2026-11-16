/**
 * Números de tuberculose usados no mapa e na Home.
 * Regra do projeto: só entra número com fonte, ano e link.
 */

export const FONTES = {
  boletimSMS2023: {
    id: 'boletimSMS2023',
    titulo: 'Boletim Epidemiológico: Tuberculose no Município do Rio de Janeiro (2ª ed., março de 2023)',
    veiculo: 'Secretaria Municipal de Saúde do Rio de Janeiro, dados do SINAN (sujeitos a revisão)',
    url: 'https://epirio.svs.rio.br/wp-content/uploads/2023/03/BOLETIM_epidemiologico_TUBERCULOSE_MIOLO_2023_FINAL_v2.pdf',
    nota: 'As taxas por Área de Planejamento aparecem só em gráfico (Figura 2). Os valores do mapa foram lidos desse gráfico e arredondados de 5 em 5.',
  },
  elPais2015: {
    id: 'elPais2015',
    titulo: 'Tuberculose na Rocinha expõe o Brasil que estacionou no século XIX',
    veiculo: 'El País Brasil (reportagem de Felipe Betim, 12/09/2015), republicada pelo IHU Unisinos',
    url: 'https://ihu.unisinos.br/noticias/546729-tuberculose-na-rocinha-expoe-o-brasil-que-estacionou-no-seculo-xix',
    nota: 'A reportagem usa os casos registrados pela Prefeitura do Rio e dados da OMS.',
  },
  limitesBairros: {
    id: 'limitesBairros',
    titulo: 'Limite de Bairros do Município do Rio de Janeiro',
    veiculo: 'Data.Rio / Instituto Pereira Passos (licença ODbL)',
    url: 'https://www.data.rio/',
  },
};

/** Taxa de incidência: casos novos por 100 mil habitantes (mesma fonte e mesmo período). */
export const INCIDENCIA = [
  { id: 'rocinha-2013', local: 'Rocinha', ano: 2013, valor: 372, fonte: 'elPais2015', destaque: true },
  { id: 'rio-2013', local: 'Município do Rio', ano: 2013, valor: 89.7, fonte: 'elPais2015' },
  { id: 'brasil-2014', local: 'Brasil', ano: 2014, valor: 33.8, fonte: 'elPais2015' },
];

/** Série da Rocinha e da cidade, para mostrar a tendência. */
export const SERIE = [
  { local: 'Rocinha', pontos: [{ ano: 2001, valor: 455 }, { ano: 2013, valor: 372 }], fonte: 'elPais2015' },
  { local: 'Município do Rio', pontos: [{ ano: 2001, valor: 107.6 }, { ano: 2013, valor: 89.7 }], fonte: 'elPais2015' },
];

/** Panorama mais recente, escrito no texto do boletim da SMS-RJ (seção 2.1). */
export const PANORAMA_2022 = {
  casosNovos: 7050,
  municipio: 107.0,
  estado: 67.4,
  brasil: 32.0,
  fonte: 'boletimSMS2023',
};

/**
 * Áreas de Planejamento (AP) da saúde, com os bairros agrupados pela Região de Planejamento do IPP.
 * `taxa`: incidência aproximada em 2022, lida da Figura 2 do boletim (arredondada de 5 em 5).
 */
export const AREAS_PLANEJAMENTO = [
  { ap: '1.0', nome: 'Centro e Portuária', rps: ['Centro'], taxa: 235, nota: 'Inclui unidades prisionais, que elevam a taxa da área.' },
  { ap: '2.1', nome: 'Zona Sul', rps: ['Zona Sul'], taxa: 100, nota: 'É a AP da Rocinha. O boletim cita Rocinha, Vidigal e Pavão-Pavãozinho entre as maiores concentrações de casos.' },
  { ap: '2.2', nome: 'Grande Tijuca', rps: ['Tijuca'], taxa: 80 },
  { ap: '3.1', nome: 'Leopoldina e Ilha', rps: ['Ramos', 'Penha', 'Ilha do Governador'], taxa: 100, nota: 'Maré, Complexo do Alemão, Vila Cruzeiro e Manguinhos concentram casos.' },
  { ap: '3.2', nome: 'Grande Méier', rps: ['Méier', 'Inhaúma'], taxa: 115, nota: 'Jacarezinho concentra casos.' },
  { ap: '3.3', nome: 'Madureira e Pavuna', rps: ['Madureira', 'Pavuna'], taxa: 80 },
  { ap: '4.0', nome: 'Barra e Jacarepaguá', rps: ['Jacarepaguá', 'Barra da Tijuca'], taxa: 65, nota: 'Cidade de Deus e Rio das Pedras concentram casos.' },
  { ap: '5.1', nome: 'Bangu e Realengo', rps: ['Bangu'], taxa: 205, nota: 'Abriga o Complexo Penitenciário de Gericinó, que eleva a taxa da área.' },
  { ap: '5.2', nome: 'Campo Grande', rps: ['Campo Grande'], taxa: 70 },
  { ap: '5.3', nome: 'Santa Cruz e Guaratiba', rps: ['Santa Cruz', 'Guaratiba'], taxa: 75 },
];

/** Quantas vezes a taxa da Rocinha supera a da cidade (mesmo ano e mesma fonte). */
export const VEZES_ROCINHA_RIO = Math.round((372 / 89.7) * 10) / 10;

export function fonte(id) {
  return FONTES[id];
}
