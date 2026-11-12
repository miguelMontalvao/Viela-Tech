import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Indica se as variáveis do Supabase foram definidas no .env.
 * Sem elas, o app continua funcionando no modo local (offline-first):
 * as funções de api.js caem no tratamento de erro e usam o LocalStorage.
 */
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigurado) {
  console.warn(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env. ' +
      'Os dados ficarão apenas neste dispositivo até a configuração.',
  );
}

/** Cliente Supabase usado pelos serviços do Viela Tech (null quando não configurado). */
export const supabase = supabaseConfigurado ? createClient(supabaseUrl, supabaseAnonKey) : null;
