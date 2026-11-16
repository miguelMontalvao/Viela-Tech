import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabaseConfigurado } from '../services/config';

export const AuthContext = createContext(null);

/*
 * Os serviços de autenticação são carregados sob demanda: a biblioteca do Supabase
 * não entra no carregamento inicial, e a Home abre mais rápido.
 */
const carregarAuth = () => import('../services/authService');
const carregarPerfil = () => import('../services/perfilService');

/** O Supabase guarda a sessão em uma chave "sb-<projeto>-auth-token". */
function temSessaoGuardada() {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
  } catch {
    return true;
  }
}

/** Disponibiliza a sessão do Supabase Auth e o papel (morador, acs, gestor) para as áreas restritas. */
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const userIdRef = useRef(null);

  const aplicarSessao = useCallback(async (novaSessao) => {
    setSessao(novaSessao);
    const userId = novaSessao?.user?.id ?? null;
    if (userId === userIdRef.current) return;
    userIdRef.current = userId;
    if (!userId) {
      setPerfil(null);
      return;
    }
    const { buscarPerfil } = await carregarPerfil();
    const { data } = await buscarPerfil(userId);
    // Sem rede e sem cache, o papel fica desconhecido (null) em vez de travar o carregamento.
    if (userIdRef.current === userId) setPerfil(data ?? { id: userId, nome: null, papel: null });
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) return undefined;
    let ativo = true;
    let cancelar = () => {};

    const iniciar = async () => {
      const { obterSessao, observarSessao } = await carregarAuth();
      const s = await obterSessao();
      if (!ativo) return;
      await aplicarSessao(s);
      if (ativo) setCarregando(false);
      cancelar = observarSessao((novaSessao, evento) => {
        if (evento === 'PASSWORD_RECOVERY') setRecuperandoSenha(true);
        aplicarSessao(novaSessao);
      });
    };

    // Rotas restritas ou links de e-mail precisam da sessão já. Nas páginas públicas, sem sessão
    // guardada no aparelho não há o que restaurar: a biblioteca do Supabase nem é baixada.
    const urgente = /^\/(acs|gestor|minha-area|entrar|equipe|redefinir-senha)/.test(window.location.pathname) || /access_token|code=/.test(window.location.href);
    if (!urgente && !temSessaoGuardada()) {
      setCarregando(false);
      return () => {
        ativo = false;
      };
    }
    if (urgente || typeof requestIdleCallback === 'undefined') iniciar();
    else requestIdleCallback(() => iniciar(), { timeout: 2500 });

    return () => {
      ativo = false;
      cancelar();
    };
  }, [aplicarSessao]);

  const login = useCallback(
    async (email, senha) => {
      const { entrar } = await carregarAuth();
      const { data, error } = await entrar(email, senha);
      if (error) return { error, perfil: null };
      userIdRef.current = null;
      setSessao(data.session);
      const { buscarPerfil } = await carregarPerfil();
      const { data: p } = await buscarPerfil(data.session.user.id);
      userIdRef.current = data.session.user.id;
      const perfilFinal = p ?? { id: data.session.user.id, nome: null, papel: null };
      setPerfil(perfilFinal);
      setCarregando(false);
      return { error: null, perfil: perfilFinal };
    },
    [],
  );

  const cadastro = useCallback(async (dados) => {
    const { cadastrar } = await carregarAuth();
    const { data, error } = await cadastrar(dados);
    if (error) return { error, precisaConfirmar: false };
    if (data?.session) await aplicarSessao(data.session);
    return { error: null, precisaConfirmar: !data?.session };
  }, [aplicarSessao]);

  const logout = useCallback(async () => {
    const [{ sair }, { esquecerPerfil }] = await Promise.all([carregarAuth(), carregarPerfil()]);
    await sair();
    esquecerPerfil();
    userIdRef.current = null;
    setSessao(null);
    setPerfil(null);
  }, []);

  const valor = useMemo(
    () => ({
      sessao,
      usuario: sessao?.user ?? null,
      perfil,
      papel: sessao ? perfil?.papel ?? null : null,
      nome: perfil?.nome || sessao?.user?.user_metadata?.nome || null,
      autenticado: Boolean(sessao),
      carregando: carregando || (Boolean(sessao) && !perfil),
      recuperandoSenha,
      login,
      cadastro,
      logout,
    }),
    [sessao, perfil, carregando, recuperandoSenha, login, cadastro, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
