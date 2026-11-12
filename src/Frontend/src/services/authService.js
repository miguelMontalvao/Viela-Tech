import { supabase, supabaseConfigurado } from './supabaseClient';

const ERRO_NAO_CONFIGURADO = new Error(
  'O login ainda não está disponível: o Supabase não foi configurado neste ambiente.',
);

/** Traduz as mensagens mais comuns do Supabase Auth para o usuário final. */
function traduzirErro(error) {
  const msg = String(error?.message ?? '');
  if (/invalid login credentials/i.test(msg)) return new Error('E-mail ou senha incorretos.');
  if (/email not confirmed/i.test(msg)) return new Error('Este e-mail ainda não foi confirmado.');
  if (/failed to fetch|network/i.test(msg)) return new Error('Sem conexão com o servidor. Tente de novo quando tiver sinal.');
  return error instanceof Error ? error : new Error('Não foi possível entrar agora.');
}

/** Login do profissional de saúde (ACS ou gestor) com e-mail e senha. */
export async function entrar(email, senha) {
  if (!supabaseConfigurado) return { data: null, error: ERRO_NAO_CONFIGURADO };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: traduzirErro(error) };
  }
}

export async function sair() {
  if (!supabaseConfigurado) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

/** Sessão salva no dispositivo (mantém o ACS logado mesmo sem sinal). */
export async function obterSessao() {
  if (!supabaseConfigurado) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

/** Observa mudanças de sessão. Retorna a função para cancelar a inscrição. */
export function observarSessao(callback) {
  if (!supabaseConfigurado) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(sessao));
  return () => data.subscription.unsubscribe();
}
