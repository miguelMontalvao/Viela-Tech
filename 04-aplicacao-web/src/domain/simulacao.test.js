import { describe, expect, it } from 'vitest';
import { FAIXAS_IVM } from './risco.js';
import {
  CENARIO_PADRAO,
  classificarFator,
  curvaCrescimento,
  fatorCrescimento,
  gerarRecomendacoes,
  mensagemBoletim,
  montarCenario,
  taxaCrescimento,
} from './simulacao.js';

describe('cenário do dashboard', () => {
  it('usa a leitura real e marca só o que faltou como simulado', () => {
    const cenario = montarCenario({ umidade: 80, insolacao: 20, ivm: 80, temperatura: null });
    expect(cenario.umidade).toBe(80);
    expect(cenario.ivm).toBe(80);
    expect(cenario.faixa).toBe(FAIXAS_IVM.PERIGO);
    expect(cenario.simulados).toEqual({ temperatura: true, umidade: false, insolacao: false, ivm: false });
    expect(cenario.temperatura).toBe(CENARIO_PADRAO.temperatura);
  });

  it('sem leitura, tudo é simulado e o IVM usa a fórmula oficial', () => {
    const cenario = montarCenario(null);
    expect(cenario.semLeitura).toBe(true);
    expect(cenario.simulados.ivm).toBe(true);
    // 0,6 · 72 + 0,4 · (100 − 40) = 67,2 → Atenção
    expect(cenario.ivm).toBe(67.2);
    expect(cenario.faixa).toBe(FAIXAS_IVM.ATENCAO);
  });
});

describe('simulador didático', () => {
  it('calcula a taxa e o fator exponencial', () => {
    expect(taxaCrescimento(27, 72)).toBeCloseTo(0.023, 6);
    expect(taxaCrescimento(15, 40)).toBeCloseTo(0.01, 6);
    expect(fatorCrescimento(0.023, 0)).toBe(1);
    expect(fatorCrescimento(0.023, 24)).toBeCloseTo(Math.exp(0.552), 6);
  });

  it('classifica o fator no semáforo de 3 cores', () => {
    expect(classificarFator(1.19)).toBe(FAIXAS_IVM.NORMAL);
    expect(classificarFator(1.2)).toBe(FAIXAS_IVM.ATENCAO);
    expect(classificarFator(1.5)).toBe(FAIXAS_IVM.PERIGO);
  });

  it('gera 25 pontos crescentes de 0 a 24 h', () => {
    const curva = curvaCrescimento(0.02);
    expect(curva).toHaveLength(25);
    expect(curva.every((p, i) => i === 0 || p.fator > curva[i - 1].fator)).toBe(true);
  });
});

describe('boletim comunitário', () => {
  it('adapta as dicas à umidade e marca valores simulados na mensagem', () => {
    const cenario = montarCenario({ umidade: 85, insolacao: 10, ivm: null, temperatura: null });
    const dicas = gerarRecomendacoes(cenario);
    expect(dicas).toHaveLength(3);
    expect(dicas[1]).toMatch(/vazamentos/);
    const texto = mensagemBoletim(cenario, dicas);
    expect(texto).toContain('Temperatura: 27 °C (simulado)');
    expect(texto).toContain('IVM: 87% — faixa Perigo');
    expect(texto).toContain('não um diagnóstico');
  });
});
