import { describe, expect, it } from 'vitest';
import { contarPorSetor, identificarSetor } from './setores.js';
import { destinoInicial, podeAcessar } from './perfis.js';
import { ehUrgente } from './risco.js';

describe('identificarSetor', () => {
  it('reconhece variações de escrita', () => {
    expect(identificarSetor('Rua 1').id).toBe('rua-1');
    expect(identificarSetor('rua um').id).toBe('rua-1');
    expect(identificarSetor('RUA1').id).toBe('rua-1');
    expect(identificarSetor('Beco do Valão').id).toBe('valao');
    expect(identificarSetor('largo do boiadeiro').id).toBe('largo-do-boiadeiro');
    expect(identificarSetor('Dioneia').id).toBe('dioneia');
  });
  it('não confunde Rua 1 com Rua 10 e manda o resto para Outros', () => {
    expect(identificarSetor('Rua 10').id).toBe('outros');
    expect(identificarSetor('Teste').id).toBe('outros');
    expect(identificarSetor('').id).toBe('outros');
  });
  it('conta triagens e urgentes por sub-área', () => {
    const c = contarPorSetor(
      [
        { setor_viela: 'Valão', dias_tosse: 25 },
        { setor_viela: 'valao', dias_tosse: 3 },
        { setor_viela: 'Gávea', dias_tosse: 2 },
      ],
      ehUrgente,
    );
    expect(c.get('valao')).toMatchObject({ total: 2, urgentes: 1 });
    expect(c.get('outros').total).toBe(1);
  });
});

describe('perfis', () => {
  it('leva cada papel para a sua área', () => {
    expect(destinoInicial('gestor')).toBe('/gestor');
    expect(destinoInicial('acs')).toBe('/acs');
    expect(destinoInicial('morador')).toBe('/minha-area');
  });
  it('morador não entra nas áreas da equipe', () => {
    expect(podeAcessar('morador', '/acs')).toBe(false);
    expect(podeAcessar('acs', '/gestor')).toBe(false);
    expect(podeAcessar('gestor', '/acs')).toBe(true);
    expect(podeAcessar(null, '/minha-area')).toBe(false);
  });
});
