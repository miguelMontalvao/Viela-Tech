/** Regras do cadastro do morador (puras, testáveis). */

export const emailValido = (email) => /^\S+@\S+\.\S+$/.test(String(email ?? '').trim());

export function primeiroNome(nome) {
  return String(nome ?? '').trim().split(/\s+/)[0] ?? '';
}

const CONECTIVOS = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

/** Até duas iniciais: "Maria da Silva" → "MS". */
export function iniciais(nome) {
  const partes = String(nome ?? '')
    .trim()
    .split(/\s+/)
    .filter((p, i, todas) => i === 0 || !CONECTIVOS.has(p.toLowerCase()) || todas.length === 1);
  if (!partes.length || !partes[0]) return '';
  const letras = partes.length === 1 ? partes[0][0] : partes[0][0] + partes[partes.length - 1][0];
  return letras.toUpperCase();
}

/**
 * Força da senha. Só o mínimo de 8 caracteres é obrigatório; o resto são dicas.
 * @returns {{ nivel: 0|1|2|3|4, rotulo: string, minimo: boolean, criterios: {rotulo:string, ok:boolean}[] }}
 */
export function avaliarSenha(senha = '') {
  const criterios = [
    { rotulo: '8 caracteres ou mais', ok: senha.length >= 8 },
    { rotulo: 'Letras e números', ok: /[a-zA-Z]/.test(senha) && /\d/.test(senha) },
    { rotulo: 'Maiúscula e minúscula', ok: /[a-z]/.test(senha) && /[A-Z]/.test(senha) },
    { rotulo: 'Um símbolo (!@#…)', ok: /[^a-zA-Z0-9]/.test(senha) },
  ];
  const minimo = criterios[0].ok;
  const pontos = criterios.filter((c) => c.ok).length;
  const nivel = !senha ? 0 : minimo ? Math.max(1, pontos) : 1;
  const rotulo = ['', minimo ? 'fraca' : 'curta demais', 'média', 'boa', 'forte'][nivel];
  return { nivel, rotulo, minimo, criterios };
}
