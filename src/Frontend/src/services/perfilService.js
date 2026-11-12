import { supabase, supabaseConfigurado } from './supabaseClient';

const CHAVE_PAPEL = 'viela_papel';

/** Último papel conhecido, guardado para o ACS abrir o painel mesmo sem sinal. */
function papelGuardado(userId) {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_PAPEL) || 'null');
    return salvo?.id === userId ? salvo : null;
  } catch {
    return null;
  }
}

/**
 * Busca o perfil (papel e nome) do usuário logado na tabela `perfis`.
 * O papel só é alterado no Supabase; o app apenas lê.
 */
export async function buscarPerfil(userId) {
  if (!supabaseConfigurado || !userId) return { data: null, error: null };
  try {
    const { data, error } = await supabase.from('perfis').select('id, nome, papel').eq('id', userId).maybeSingle();
    if (error) throw error;
    const perfil = data ?? { id: userId, nome: null, papel: 'morador' };
    try {
      localStorage.setItem(CHAVE_PAPEL, JSON.stringify(perfil));
    } catch {
      /* sem cache: o papel é consultado de novo na próxima visita */
    }
    return { data: perfil, error: null };
  } catch (error) {
    return { data: papelGuardado(userId), error };
  }
}

export function esquecerPerfil() {
  try {
    localStorage.removeItem(CHAVE_PAPEL);
  } catch {
    /* nada a limpar */
  }
}

/** Triagens do próprio morador (a política RLS só devolve as linhas dele). */
export async function minhasTriagens() {
  if (!supabaseConfigurado) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('chamados_coleta')
      .select('id, setor_viela, dias_tosse, tem_febre, tem_sudorese, prioridade_alta, status, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (error) {
    return { data: [], error };
  }
}
