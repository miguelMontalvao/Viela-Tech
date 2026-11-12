import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Feedback';
import { destinoInicial, ehEquipe, ROTULOS_PAPEL } from '../../domain/perfis';

/**
 * Libera o conteúdo só para os papéis permitidos.
 * Sem login, manda para a tela certa (morador ou equipe); com o papel errado, explica e oferece o caminho.
 */
export function ProtectedRoute({ papeis, children }) {
  const { autenticado, carregando, papel } = useAuth();
  const { pathname } = useLocation();
  const areaDaEquipe = papeis.some(ehEquipe);

  if (carregando) return <Spinner texto="Verificando acesso…" className="min-h-[50vh]" />;
  if (!autenticado) return <Navigate to={areaDaEquipe ? '/equipe' : '/entrar'} replace state={{ voltarPara: pathname }} />;
  if (papeis.includes(papel)) return children;

  return (
    <div className="container-app py-16">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sol-100 text-slate-900">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Essa área não é do seu perfil</h1>
        <p className="mt-3 texto-suave">
          {papel
            ? `Você entrou como ${ROTULOS_PAPEL[papel]?.toLowerCase() ?? papel}. ${areaDaEquipe ? 'Esta parte é só para a equipe de saúde.' : 'Esta parte é a área pessoal do morador.'}`
            : 'Não conseguimos confirmar o seu perfil agora. Confira a conexão e tente de novo.'}
        </p>
        <p className="mt-2 text-sm texto-suave">Se você é da equipe e deveria ter acesso, peça à coordenação para ajustar o seu perfil.</p>
        {papel && (
          <Link
            to={destinoInicial(papel)}
            className="mt-6 inline-flex min-h-toque items-center justify-center rounded-full bg-sky-700 px-6 font-semibold text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950"
          >
            Ir para a minha área
          </Link>
        )}
      </div>
    </div>
  );
}
