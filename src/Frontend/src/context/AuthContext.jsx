import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { entrar, obterSessao, observarSessao, sair } from '../services/authService';

export const AuthContext = createContext(null);

/** Disponibiliza a sessão do Supabase Auth para as áreas restritas. */
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    obterSessao()
      .then((s) => ativo && setSessao(s))
      .finally(() => ativo && setCarregando(false));
    const cancelar = observarSessao((s) => setSessao(s));
    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await entrar(email, senha);
    if (!error) setSessao(data.session);
    return { error };
  }, []);

  const logout = useCallback(async () => {
    await sair();
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({ sessao, usuario: sessao?.user ?? null, autenticado: Boolean(sessao), carregando, login, logout }),
    [sessao, carregando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
