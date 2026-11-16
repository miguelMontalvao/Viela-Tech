import { describe, expect, it } from 'vitest';
import { calcularIVM, classificarIVM, ehTosseProlongada, ehUrgente, normalizarLeitura } from './risco.js';
import { filtrarChamados, ordenarPorPrioridade, proximasAcoes, resumirChamados, STATUS } from './chamados.js';
import { avaliarTriagem, montarPayload, validarTriagem } from './triagem.js';

describe('risco', () => {
  it('classifica o IVM nas faixas oficiais', () => {
    expect(classificarIVM(39.9).id).toBe('NORMAL');
    expect(classificarIVM(40).id).toBe('ATENCAO');
    expect(classificarIVM(69.9).id).toBe('ATENCAO');
    expect(classificarIVM(70).id).toBe('PERIGO');
    expect(classificarIVM(null)).toBeNull();
  });

  it('usa a mesma fórmula do ESP32', () => {
    // Leitura real do histórico: umidade 53%, insolação 24,44% → IVM 62,02
    expect(calcularIVM(53, 24.444444)).toBeCloseTo(62.0, 1);
    expect(calcularIVM(undefined, 10)).toBeNull();
  });

  it('marca tosse de 21 dias ou mais como prolongada', () => {
    expect(ehTosseProlongada(20)).toBe(false);
    expect(ehTosseProlongada(21)).toBe(true);
    expect(ehUrgente({ dias_tosse: 5, prioridade_alta: true })).toBe(true);
  });

  it('prefere o IVM gravado pelo sensor', () => {
    const leitura = normalizarLeitura({ umidade: 80, insolacao: 10, ivm: 50, created_at: '2026-11-09T13:26:01Z' });
    expect(leitura.ivm).toBe(50);
    expect(leitura.ivmCalculado).toBe(false);
    expect(normalizarLeitura({ umidade: 80, insolacao: 10 }).ivmCalculado).toBe(true);
  });
});

describe('chamados', () => {
  const lista = [
    { id: 1, dias_tosse: 3, status: STATUS.PENDENTE, created_at: '2026-11-01T10:00:00Z' },
    { id: 2, dias_tosse: 30, status: STATUS.CONCLUIDO, created_at: '2026-11-01T09:00:00Z' },
    { id: 3, dias_tosse: 25, status: STATUS.PENDENTE, created_at: '2026-11-02T10:00:00Z' },
    { id: 4, dias_tosse: 22, status: STATUS.EM_ANDAMENTO, created_at: '2026-11-01T08:00:00Z' },
  ];

  it('coloca urgentes em aberto no topo e concluídos no fim', () => {
    expect(ordenarPorPrioridade(lista).map((c) => c.id)).toEqual([4, 3, 1, 2]);
  });

  it('oferece a próxima ação de cada etapa', () => {
    expect(proximasAcoes(STATUS.PENDENTE)[0].status).toBe(STATUS.EM_ANDAMENTO);
    expect(proximasAcoes(STATUS.CONCLUIDO)).toEqual([]);
  });

  it('filtra urgentes em aberto', () => {
    expect(filtrarChamados(lista, { filtro: 'urgentes' }).map((c) => c.id)).toEqual([3, 4]);
  });

  it('resume os indicadores do gestor', () => {
    const r = resumirChamados(lista);
    expect(r.total).toBe(4);
    expect(r.urgentes).toBe(3);
    expect(r.urgentesAbertos).toBe(2);
    expect(r.concluidos).toBe(1);
  });
});

describe('triagem', () => {
  it('valida campos obrigatórios e faixa de dias', () => {
    expect(Object.keys(validarTriagem({ morador_nome: '', setor_viela: '', dias_tosse: '' }))).toHaveLength(3);
    expect(validarTriagem({ morador_nome: 'Ana', setor_viela: 'Valão', dias_tosse: '2.5' }).dias_tosse).toBeDefined();
    expect(validarTriagem({ morador_nome: 'Ana', setor_viela: 'Valão', dias_tosse: '0' })).toEqual({});
  });

  it('monta o payload do contrato e avalia urgência', () => {
    const payload = montarPayload({ morador_nome: ' Ana ', setor_viela: 'Valão', dias_tosse: '21', tem_febre: true, tem_sudorese: false });
    expect(payload).toEqual({ morador_nome: 'Ana', setor_viela: 'Valão', dias_tosse: 21, tem_febre: true, tem_sudorese: false });
    expect(avaliarTriagem(payload)).toEqual({ urgente: true, sintomasAssociados: ['febre'] });
  });
});
