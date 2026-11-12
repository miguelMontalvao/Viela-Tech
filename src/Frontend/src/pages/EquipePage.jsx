import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CloudOff, ListOrdered, Thermometer } from 'lucide-react';
import { BotaoLogin, CampoVidro, SignInPage } from '../components/ui/SignIn';
import { Alert } from '../components/ui/Alert';
import { Selo } from '../components/brand/Enfeites';
import { useAuth } from '../hooks/useAuth';
import { supabaseConfigurado } from '../services/config';
import { destinoInicial, ehEquipe } from '../domain/perfis';

const CARTOES = [
  { icone: ListOrdered, titulo: 'Fila que se organiza sozinha', texto: 'Tosse de 21 dias ou mais vai para o topo, com a faixa vermelha.' },
  { icone: CloudOff, titulo: 'Funciona sem sinal', texto: 'As visitas ficam salvas no aparelho e sobem quando a conexão volta.' },
  { icone: Thermometer, titulo: 'Microclima das vielas', texto: 'O gestor acompanha umidade, luz e o IVM medido pelo sensor.' },
];

/** Login da equipe de saúde (ACS e gestores). Não há cadastro: o acesso é liberado pela coordenação. */
export default function EquipePage() {
  const { login, logout, autenticado, papel, carregando } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const avisoRef = useRef(null);

  useEffect(() => {
    if (!carregando && autenticado && ehEquipe(papel)) navigate(state?.voltarPara ?? destinoInicial(papel), { replace: true });
  }, [autenticado, papel, carregando, navigate, state]);

  async function aoEnviar(e) {
    e.preventDefault();
    const novos = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) novos.email = 'Confira o e-mail cadastrado pela coordenação.';
    if (!senha) novos.senha = 'Digite a sua senha.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    setEnviando(true);
    setAviso(null);
    const { error, perfil } = await login(email.trim(), senha);
    setEnviando(false);
    if (error) {
      setAviso(error.message);
    } else if (!ehEquipe(perfil?.papel)) {
      // Conta de morador tentando entrar pela porta da equipe.
      await logout();
      setAviso('Esta conta não é da equipe de saúde. Moradores entram pela área do morador.');
    } else {
      navigate(state?.voltarPara ?? destinoInicial(perfil.papel), { replace: true });
      return;
    }
    requestAnimationFrame(() => avisoRef.current?.focus());
  }

  return (
    <SignInPage
      titulo={
        <>
          Bom plantão, <span className="text-emerald-700 dark:text-emerald-400">equipe</span>.
        </>
      }
      descricao="Acesso dos Agentes Comunitários de Saúde e da gestão. Use o e-mail liberado pela coordenação."
      foto="rocinha-por-do-sol"
      legendaFoto="Fim de tarde no morro: hora de subir a viela."
      cartoes={CARTOES}
    >
      <div className="animate-element animate-delay-200 flex flex-wrap gap-2">
        <Selo tom="verde">ACS</Selo>
        <Selo tom="azul" inclinacao="rotate-1">Gestão</Selo>
      </div>

      {!supabaseConfigurado && (
        <Alert tipo="aviso" titulo="Login indisponível neste ambiente">
          Defina <code className="font-mono">VITE_SUPABASE_URL</code> e <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> no{' '}
          <code className="font-mono">.env</code>.
        </Alert>
      )}

      <form className="space-y-5" onSubmit={aoEnviar} noValidate>
        <CampoVidro
          className="animate-element animate-delay-300"
          label="E-mail profissional"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="nome@saude.rio"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={erros.email}
        />
        <CampoVidro
          className="animate-element animate-delay-400"
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erros.senha}
        />
        <div className="animate-element animate-delay-500 flex justify-end text-sm">
          <Link to="/entrar" state={{ modo: 'recuperar' }} className="inline-flex min-h-toque items-center font-semibold text-sky-700 hover:underline dark:text-sky-400">
            Esqueci minha senha
          </Link>
        </div>

        {aviso && (
          <div ref={avisoRef} tabIndex={-1} role="alert" className="focus:outline-none">
            <Alert tipo="erro">{aviso}</Alert>
          </div>
        )}

        <BotaoLogin carregando={enviando} className="animate-element animate-delay-600" disabled={!supabaseConfigurado || enviando}>
          {enviando ? 'Entrando…' : 'Entrar no painel'}
          {!enviando && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
        </BotaoLogin>
      </form>

      <p className="animate-element animate-delay-700 text-sm texto-suave">
        Ainda sem acesso? Peça à coordenação para liberar o seu perfil. Depois do primeiro login, o
        painel continua abrindo mesmo sem sinal.
      </p>
      <p className="animate-element animate-delay-800 text-center text-sm texto-suave">
        É morador?{' '}
        <Link to="/entrar" className="inline-flex min-h-toque items-center font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Entre pela área do morador
        </Link>
      </p>
    </SignInPage>
  );
}
