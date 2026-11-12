import { supabaseConfigurado } from '../../services/config';
import { Alert } from './Alert';

/** Avisa, sem alarmar, quando o app está rodando sem a conexão com o Supabase. */
export function ConfigNotice({ className = '' }) {
  if (supabaseConfigurado) return null;
  return (
    <Alert tipo="aviso" titulo="Modo local: servidor não configurado" className={className}>
      Este ambiente ainda não está ligado ao banco de dados. As triagens ficam guardadas neste aparelho e
      serão enviadas quando o Supabase for configurado (arquivo <code className="font-mono">.env</code>).
    </Alert>
  );
}
