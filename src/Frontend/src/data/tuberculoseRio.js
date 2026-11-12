/**
 * Números de tuberculose usados no mapa e na Home.
 * Regra do projeto: só entra número com fonte, ano e link. Nada é estimado pelo app.
 */

export const FONTES = {
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

/** Taxa de incidência: casos novos por 100 mil habitantes. */
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

/** Quantas vezes a taxa da Rocinha supera a da cidade (mesmo ano e mesma fonte). */
export const VEZES_ROCINHA_RIO = Math.round((372 / 89.7) * 10) / 10;

export function fonte(id) {
  return FONTES[id];
}
