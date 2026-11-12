import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, HeartHandshake, MailCheck, MapPin } from 'lucide-react';
import { BotaoLogin, CampoVidro, SignInPage } from '../components/ui/SignIn';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { supabaseConfigurado } from '../services/config';
import { destinoInicial, ehEquipe } from '../domain/perfis';

const CARTOES = [
  { icone: CalendarClock, titulo: 'Tosse há 3 semanas?', texto: 'Com 21 dias ou mais, sua triagem entra no topo da fila do agente de saúde.' },
  { icone: MapPin, titulo: 'Exame de escarro gratuito', texto: 'Clínica da Família Rinaldo De Lamare e CMS Albert Sabin atendem a Rocinha.' },
  { icone: HeartHandshake, titulo: 'Tem cura', texto: 'O tratamento é gratuito pelo SUS. Quanto antes começar, melhor.' },
];

const MODOS = {
  entrar: { titulo: 'Bem-vindo de volta', descricao: 'Entre para acompanhar suas triagens e saber quando o agente de saúde vai passar.' },
  criar: { titulo: 'Crie sua conta', descricao: 'Leva menos de um minuto. Com a conta, você acompanha cada triagem que fizer.' },
  recuperar: { titulo: 'Esqueceu a senha?', descricao: 'Sem estresse. Mandamos um link para o seu e-mail para você criar outra.' },
};

function Abas({ modo, aoMudar }) {
  const abas = [
    ['entrar', 'Entrar'],
    ['criar', 'Criar conta'],
  ];
  return (
    <div role="tablist" aria-label="Acesso do morador" className="animate-element animate-delay-300 grid grid-cols-2 gap-1 rounded-2xl bg-slate-900/5 p-1 dark:bg-white/5">
      {abas.map(([id, rotulo]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={modo === id}
          onClick={() => aoMudar(id)}
          className={`min-h-toque rounded-xl font-semibold transition-colors ${
            modo === id ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

export default function EntrarPage() {
  const { login, cadastro, autenticado, papel, carregando } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [modo, setModo] = useState(state?.modo === 'recuperar' ? 'recuperar' : 'entrar');
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const avisoRef = useRef(null);

  // Quem já está logado vai direto para a própria área.
  useEffect(() => {
    if (!carregando && autenticado && papel) navigate(state?.voltarPara ?? destinoInicial(papel), { replace: true });
  }, [autenticado, papel, carregando, navigate, state]);

  const alterar = (campo) => (e) => setCampos((c) => ({ ...c, [campo]: e.target.value }));

  function validar() {
    const e = {};
    if (modo === 'criar' && campos.nome.trim().length < 2) e.nome = 'Diga como podemos te chamar.';
    if (!/^\S+@\S+\.\S+$/.test(campos.email.trim())) e.email = 'Confira o e-mail. Ele precisa ter @ e um ponto.';
    if (modo !== 'recuperar' && campos.senha.length < (modo === 'criar' ? 8 : 1))
      e.senha = modo === 'criar' ? 'Use pelo menos 8 caracteres.' : 'Digite a sua senha.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function mostrarAviso(a) {
    setAviso(a);
    requestAnimationFrame(() => avisoRef.current?.focus());
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setAviso(null);
    if (!validar()) return;
    setEnviando(true);
    const email = campos.email.trim();
    if (modo === 'entrar') {
      const { error, perfil } = await login(email, campos.senha);
      setEnviando(false);
      if (error) return mostrarAviso({ tipo: 'erro', texto: error.message });
      if (ehEquipe(perfil?.papel)) return navigate(destinoInicial(perfil.papel), { replace: true });
      return navigate(state?.voltarPara ?? '/minha-area', { replace: true });
    }
    if (modo === 'criar') {
      const { error, precisaConfirmar } = await cadastro({ nome: campos.nome.trim(), email, senha: campos.senha });
      setEnviando(false);
      if (error) return mostrarAviso({ tipo: 'erro', texto: error.message });
      if (precisaConfirmar)
        return mostrarAviso({ tipo: 'sucesso', titulo: 'Quase lá!', texto: `Mandamos um link de confirmação para ${email}. Abra o e-mail e toque no link para ativar a conta.` });
      return navigate('/minha-area', { replace: true });
    }
    const { recuperarSenha } = await import('../services/authService');
    const { error } = await recuperarSenha(email);
    setEnviando(false);
    if (error) return mostrarAviso({ tipo: 'erro', texto: error.message });
    return mostrarAviso({ tipo: 'sucesso', titulo: 'Link enviado', texto: `Se existir uma conta com ${email}, o link para criar uma nova senha chega em alguns minutos.` });
  }

  const textos = MODOS[modo];
  const trocarModo = (m) => {
    setModo(m);
    setErros({});
    setAviso(null);
  };

  return (
    <SignInPage
      titulo={textos.titulo}
      descricao={textos.descricao}
      foto="rocinha-por-do-sol"
      legendaFoto="Rocinha, Zona Sul do Rio de Janeiro."
      cartoes={CARTOES}
    >
      {!supabaseConfigurado && (
        <Alert tipo="aviso" titulo="Login indisponível neste ambiente">
          O Supabase não foi configurado. A triagem continua funcionando sem login.
        </Alert>
      )}

      {modo !== 'recuperar' && <Abas modo={modo} aoMudar={trocarModo} />}

      <form className="space-y-5" onSubmit={aoEnviar} noValidate>
        {modo === 'criar' && (
          <CampoVidro
            className="animate-element animate-delay-300"
            label="Como podemos te chamar?"
            name="nome"
            autoComplete="given-name"
            placeholder="Seu nome ou apelido"
            value={campos.nome}
            onChange={alterar('nome')}
            erro={erros.nome}
          />
        )}
        <CampoVidro
          className="animate-element animate-delay-400"
          label="E-mail"
          name="email"
          type="email"
          inputMode="email"
          autoComplete={modo === 'criar' ? 'email' : 'username'}
          placeholder="voce@email.com"
          value={campos.email}
          onChange={alterar('email')}
          erro={erros.email}
        />
        {modo !== 'recuperar' && (
          <CampoVidro
            className="animate-element animate-delay-500"
            label="Senha"
            name="senha"
            type="password"
            autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
            placeholder={modo === 'criar' ? 'Pelo menos 8 caracteres' : 'Sua senha'}
            value={campos.senha}
            onChange={alterar('senha')}
            erro={erros.senha}
          />
        )}

        {modo === 'entrar' && (
          <div className="animate-element animate-delay-500 flex justify-end text-sm">
            <button type="button" onClick={() => trocarModo('recuperar')} className="min-h-toque font-semibold text-sky-700 hover:underline dark:text-sky-400">
              Esqueci minha senha
            </button>
          </div>
        )}

        {aviso && (
          <div ref={avisoRef} tabIndex={-1} role={aviso.tipo === 'erro' ? 'alert' : 'status'} className="focus:outline-none">
            <Alert tipo={aviso.tipo} titulo={aviso.titulo}>
              {aviso.tipo === 'sucesso' && <MailCheck className="mb-1 inline h-4 w-4" aria-hidden="true" />} {aviso.texto}
            </Alert>
          </div>
        )}

        <BotaoLogin carregando={enviando} className="animate-element animate-delay-600" disabled={!supabaseConfigurado || enviando}>
          {enviando ? 'Só um instante…' : modo === 'criar' ? 'Criar minha conta' : modo === 'recuperar' ? 'Enviar link' : 'Entrar'}
          {!enviando && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
        </BotaoLogin>
      </form>

      {modo === 'recuperar' && (
        <button type="button" onClick={() => trocarModo('entrar')} className="min-h-toque text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Voltar para o login
        </button>
      )}

      <div className="animate-element animate-delay-700 relative flex items-center justify-center">
        <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        <span className="absolute bg-slate-50 px-4 text-sm texto-suave dark:bg-noite">ou</span>
      </div>

      <Link
        to="/morador"
        className="animate-element animate-delay-800 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 font-semibold transition-colors hover:bg-slate-900/5 dark:border-slate-600 dark:hover:bg-white/5"
      >
        Fazer a triagem sem conta
      </Link>

      <p className="animate-element animate-delay-800 text-center text-sm texto-suave">
        É da equipe de saúde?{' '}
        <Link to="/equipe" className="inline-flex min-h-toque items-center font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Acesse por aqui
        </Link>
      </p>
    </SignInPage>
  );
}
