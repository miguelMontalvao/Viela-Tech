/**
 * Indica se as variáveis do Supabase foram definidas no .env.
 * Fica separado do cliente para que as telas possam consultar a configuração
 * sem carregar a biblioteca do Supabase (a Home abre mais rápido).
 */
export const supabaseConfigurado = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
