import { supabase, supabaseConfigurado } from './supabaseClient';

const ERRO_NAO_CONFIGURADO = new Error(
  'O login ainda não está disponível: o Supabase não foi configurado neste ambiente.',
);

/** Traduz as mensagens mais comuns do Supabase Auth para o usuário final. */
function traduzirErro(error) {
  const msg = String(error?.message ?? '');
  if (/invalid login credentials/i.test(msg)) return new Error('E-mail ou senha incorretos.');
  if (/email not confirmed/i.test(msg)) return new Error('Falta confirmar o e-mail. Abra a mensagem que enviamos e toque no link.');
  if (/already registered|already exists/i.test(msg)) return new Error('Já existe uma conta com este e-mail. Tente entrar.');
  if (/password should be at least|weak password/i.test(msg)) return new Error('A senha precisa ter pelo menos 8 caracteres.');
  if (/rate limit|too many/i.test(msg)) return new Error('Muitas tentativas seguidas. Espere um minuto e tente de novo.');
  if (/failed to fetch|network/i.test(msg)) return new Error('Sem conexão com o servidor. Tente de novo quando tiver sinal.');
  return error instanceof Error ? error : new Error('Não foi possível concluir agora.');
}

async function executar(acao) {
  if (!supabaseConfigurado) return { data: null, error: ERRO_NAO_CONFIGURADO };
  try {
    const { data, error } = await acao();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: traduzirErro(error) };
  }
}

const urlDoSite = (caminho) => `${window.location.origin}${caminho}`;

/** Login com e-mail e senha (morador ou equipe; o papel vem da tabela perfis). */
export function entrar(email, senha) {
  return executar(() => supabase.auth.signInWithPassword({ email, password: senha }));
}

/** Cadastro do morador. Toda conta nasce com o papel "morador" (gatilho no banco). */
export function cadastrar({ nome, email, senha }) {
  return executar(() =>
    supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome }, emailRedirectTo: urlDoSite('/minha-area') },
    }),
  );
}

/** Envia o e-mail com o link para criar uma nova senha. */
export function recuperarSenha(email) {
  return executar(() => supabase.auth.resetPasswordForEmail(email, { redirectTo: urlDoSite('/redefinir-senha') }));
}

/** Define a nova senha depois de abrir o link de recuperação. */
export function atualizarSenha(senha) {
  return executar(() => supabase.auth.updateUser({ password: senha }));
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
  const { data } = supabase.auth.onAuthStateChange((evento, sessao) => callback(sessao, evento));
  return () => data.subscription.unsubscribe();
}
