import { describe, expect, it } from 'vitest';
import { LIMITE_ANONIMATO, contarCamada, intensidade, ivmSimuladoPorSetor, nivelConcentracao, rotuloValor } from './heatmap.js';
import { agruparChamados, tempoRelativo } from './chamados.js';

const chamados = [
  { setor_viela: 'Rua 1', dias_tosse: 3, status: 'PENDENTE' },
  { setor_viela: 'rua um', dias_tosse: 25, status: 'EM_ANDAMENTO' },
  { setor_viela: 'Valão', dias_tosse: 0, status: 'CONCLUÍDO' },
  { setor_viela: 'lugar desconhecido', dias_tosse: 30, status: 'PENDENTE' },
];

describe('contarCamada', () => {
  it('notificações conta todas as triagens reconhecidas por setor', () => {
    const m = contarCamada(chamados, 'notificacoes');
    expect(m.get('rua-1')).toBe(2);
    expect(m.get('valao')).toBe(1);
  });
  it('sintomas respiratórios exige tosse', () => {
    expect(contarCamada(chamados, 'respiratorios').get('valao')).toBe(0);
    expect(contarCamada(chamados, 'respiratorios').get('rua-1')).toBe(2);
  });
  it('atenção usa a regra de urgência (21 dias)', () => {
    expect(contarCamada(chamados, 'atencao').get('rua-1')).toBe(1);
  });
  it('ACS conta chamados fora de PENDENTE', () => {
    const m = contarCamada(chamados, 'acs');
    expect(m.get('rua-1')).toBe(1);
    expect(m.get('valao')).toBe(1);
  });
  it('setor não reconhecido fica fora do mapa e camada inválida zera', () => {
    expect([...contarCamada(chamados, 'notificacoes').values()].reduce((a, b) => a + b, 0)).toBe(3);
    expect([...contarCamada(chamados, 'x').values()].every((v) => v === 0)).toBe(true);
  });
});

describe('intensidade e rótulos', () => {
  it('normaliza de 0 a 1', () => {
    expect(intensidade(0, 5)).toBe(0);
    expect(intensidade(5, 5)).toBe(1);
    expect(intensidade(1, 4)).toBe(0.25);
    expect(intensidade(3, 0)).toBe(0);
  });
  it('níveis de concentração', () => {
    expect(nivelConcentracao(0)).toBe('Nenhuma');
    expect(nivelConcentracao(0.3)).toBe('Baixa');
    expect(nivelConcentracao(0.5)).toBe('Média');
    expect(nivelConcentracao(0.9)).toBe('Alta');
  });
  it('oculta contagens pequenas', () => {
    expect(rotuloValor(0)).toBe('0');
    expect(rotuloValor(1)).toBe(`<${LIMITE_ANONIMATO}`);
    expect(rotuloValor(3)).toBe('3');
  });
});

describe('ivmSimuladoPorSetor', () => {
  it('é nulo sem referência e limitado a 0–100', () => {
    expect(ivmSimuladoPorSetor(null)).toBeNull();
    const m = ivmSimuladoPorSetor(95);
    expect([...m.values()].every((v) => v >= 0 && v <= 100)).toBe(true);
  });
  it('é determinístico', () => {
    expect([...ivmSimuladoPorSetor(50).values()]).toEqual([...ivmSimuladoPorSetor(50).values()]);
  });
});

describe('fila do ACS', () => {
  it('agrupa por prioridade e omite grupos vazios', () => {
    const g = agruparChamados(chamados);
    expect(g.map((x) => x.id)).toEqual(['urgentes', 'atendimento', 'aguardando', 'concluidos'].filter((id) => g.some((x) => x.id === id)));
    expect(g[0].id).toBe('urgentes');
  });
  it('tempo relativo', () => {
    const agora = Date.parse('2026-11-18T12:00:00Z');
    expect(tempoRelativo('2026-11-18T11:59:30Z', agora)).toBe('agora');
    expect(tempoRelativo('2026-11-18T11:30:00Z', agora)).toBe('há 30 min');
    expect(tempoRelativo('2026-11-18T09:00:00Z', agora)).toBe('há 3 h');
    expect(tempoRelativo('2026-11-16T12:00:00Z', agora)).toBe('há 2 dias');
    expect(tempoRelativo(undefined, agora)).toBe('');
  });
});
