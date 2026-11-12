import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Feedback';
import { LoginForm } from './LoginForm';

/** Mostra o conteúdo apenas para profissionais autenticados; caso contrário, o login. */
export function ProtectedRoute({ titulo, descricao, children }) {
  const { autenticado, carregando } = useAuth();
  if (carregando) return <Spinner texto="Verificando acesso…" />;
  if (!autenticado) return <LoginForm titulo={titulo} descricao={descricao} />;
  return children;
}
