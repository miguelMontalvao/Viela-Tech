import { describe, expect, it } from 'vitest';
import { avaliarSenha, emailValido, iniciais, primeiroNome } from './cadastro.js';

describe('cadastro do morador', () => {
  it('pega o primeiro nome e as iniciais', () => {
    expect(primeiroNome('  Maria da Silva ')).toBe('Maria');
    expect(iniciais('Maria da Silva')).toBe('MS');
    expect(iniciais('zé')).toBe('Z');
    expect(iniciais('')).toBe('');
  });

  it('valida o e-mail', () => {
    expect(emailValido('a@b.co')).toBe(true);
    expect(emailValido('ab.co')).toBe(false);
  });

  it('mede a força da senha e exige só 8 caracteres', () => {
    expect(avaliarSenha('').nivel).toBe(0);
    expect(avaliarSenha('abc').minimo).toBe(false);
    expect(avaliarSenha('abcdefgh')).toMatchObject({ minimo: true, nivel: 1 });
    expect(avaliarSenha('Abcdefg1!')).toMatchObject({ minimo: true, nivel: 4, rotulo: 'forte' });
  });
});
