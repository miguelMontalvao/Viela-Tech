import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/** Acesso à sessão do profissional de saúde. Precisa estar dentro do AuthProvider. */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return contexto;
}
