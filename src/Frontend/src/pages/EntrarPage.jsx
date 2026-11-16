import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, Check, HeartHandshake, MailCheck, MapPin, Sparkles } from 'lucide-react';
import { BotaoLogin, CampoVidro, CarrosselCartoes, SignInPage } from '../components/ui/SignIn';
import { LogoSimbolo } from '../components/brand/Logo';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { supabaseConfigurado } from '../services/config';
import { destinoInicial, ehEquipe } from '../domain/perfis';
import { avaliarSenha, emailValido, iniciais, primeiroNome } from '../domain/cadastro';

const CARTOES = [
  { icone: CalendarClock, titulo: 'Tosse há 3 semanas?', texto: 'Com 21 dias ou mais, sua triagem entra no topo da fila do agente de saúde.' },
  { icone: MapPin, titulo: 'Exame de escarro gratuito', texto: 'Clínica da Família Rinaldo De Lamare e CMS Albert Sabin atendem a Rocinha.' },
  { icone: HeartHandshake, titulo: 'Tem cura', texto: 'O tratamento é gratuito pelo SUS. Quanto antes começar, melhor.' },
];

const MODOS = {
  entrar: { titulo: 'Bem-vindo de volta', descricao: 'Entre para acompanhar suas triagens e saber quando o agente de saúde vai passar.' },
  criar: { titulo: 'Crie sua conta', descricao: 'Leva menos de um minuto. Veja sua carteirinha ganhar vida enquanto preenche.' },
  recuperar: { titulo: 'Esqueceu a senha?', descricao: 'Sem estresse. Mandamos um link para o seu e-mail para você criar outra.' },
};

/* ---------- Painel vivo: carteirinha do morador ---------- */

function useInclinacao() {
  const [estilo, setEstilo] = useState({});
  const mover = (e) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setEstilo({ transform: `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`, '--brilho-x': `${(x + 0.5) * 100}%` });
  };
  return [estilo, mover, () => setEstilo({})];
}

function Carteirinha({ nome, email, passos }) {
  const [estilo, mover, sair] = useInclinacao();
  const feitos = passos.filter((p) => p.ok).length;
  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-sm font-medium text-sky-200">
        <Sparkles className="h-4 w-4" aria-hidden="true" /> Sua carteirinha da Viela Tech
      </p>
      <div onMouseMove={mover} onMouseLeave={sair} className="transition-transform duration-200 ease-out" style={estilo} aria-hidden="true">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-emerald-700 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle at ${estilo['--brilho-x'] ?? '30%'} 0%, rgba(255,255,255,0.25), transparent 55%)` }}
          />
          <div className="relative flex items-start justify-between">
            <LogoSimbolo className="h-8 w-auto brightness-0 invert" />
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">MORADOR · ROCINHA</span>
          </div>
          <div className="relative mt-8 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-semibold ring-1 ring-white/30 transition-all">
              {iniciais(nome) || '?'}
            </span>
            <div className="min-w-0">
              <p key={primeiroNome(nome)} className={`troca-palavra truncate text-2xl font-semibold ${nome.trim() ? '' : 'text-white/50'}`}>
                {nome.trim() || 'Seu nome aqui'}
              </p>
              <p className={`mt-0.5 truncate text-sm ${email.trim() ? 'text-white/85' : 'text-white/45'}`}>{email.trim() || 'voce@email.com'}</p>
            </div>
          </div>
          <div className="relative mt-8">
            <div className="flex justify-between text-xs text-white/75">
              <span>Cadastro</span>
              <span>{Math.round((feitos / passos.length) * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-700 ease-out" style={{ width: `${(feitos / passos.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {passos.map((p) => (
          <li key={p.rotulo} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
                p.ok ? 'scale-100 bg-emerald-400 text-slate-950' : 'scale-90 bg-white/10 ring-1 ring-white/30'
              }`}
            >
              {p.ok && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
            </span>
            <span className={p.ok ? 'text-white' : 'text-white/70'}>{p.rotulo}</span>
            <span className="sr-only">{p.ok ? ': pronto' : ': falta'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Medidor de senha ---------- */

function MedidorSenha({ senha }) {
  const { nivel, rotulo, criterios } = avaliarSenha(senha);
  const cores = ['bg-slate-200 dark:bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];
  if (!senha) return null;
  return (
    <div className="animate-surgir mt-3" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${n <= nivel ? cores[nivel] : cores[0]}`} />
        ))}
      </div>
      <p className="mt-2 text-sm">
        Senha <strong>{rotulo}</strong>
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {criterios.map((c) => (
          <li key={c.rotulo} className={`flex items-center gap-1.5 transition-colors ${c.ok ? 'text-emerald-700 dark:text-emerald-400' : 'texto-suave'}`}>
            <Check className={`h-3.5 w-3.5 transition-opacity ${c.ok ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
            {c.rotulo}
            <span className="sr-only">{c.ok ? ' (ok)' : ' (falta)'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Abas ---------- */

function Abas({ modo, aoMudar }) {
  const abas = [
    ['entrar', 'Entrar'],
    ['criar', 'Criar conta'],
  ];
  return (
    <div role="tablist" aria-label="Acesso do morador" className="animate-element animate-delay-300 relative grid grid-cols-2 rounded-2xl bg-slate-900/5 p-1 dark:bg-white/5">
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-slate-700"
        style={{ transform: modo === 'criar' ? 'translateX(100%)' : 'none' }}
      />
      {abas.map(([id, rotulo]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={modo === id}
          onClick={() => aoMudar(id)}
          className={`relative min-h-toque rounded-xl font-semibold transition-colors ${
            modo === id ? 'text-slate-900 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

/* ---------- Tela de sucesso do cadastro ---------- */

function ContaCriada({ nome, email, aoVoltar }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="animate-surgir text-center focus:outline-none">
      <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 motion-safe:animate-ping" aria-hidden="true" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white">
          <MailCheck className="h-9 w-9" aria-hidden="true" />
        </span>
      </span>
      <p className="mt-6 text-2xl font-semibold">Quase lá, {primeiroNome(nome)}!</p>
      <p className="mt-2 texto-suave">
        Mandamos um link de confirmação para <strong className="text-slate-900 dark:text-white">{email}</strong>. Abra o e-mail e toque no link para
        ativar a conta.
      </p>
      <p className="mt-4 text-sm texto-suave">Não chegou? Olhe a caixa de spam ou promoções.</p>
      <button type="button" onClick={aoVoltar} className="mt-6 min-h-toque font-semibold text-sky-700 hover:underline dark:text-sky-400">
        Voltar para o login
      </button>
    </div>
  );
}

export default function EntrarPage() {
  const { login, cadastro, autenticado, papel, carregando } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [modo, setModo] = useState(state?.modo === 'recuperar' ? 'recuperar' : 'entrar');
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '' });
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);
  const [criada, setCriada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const avisoRef = useRef(null);

  // Quem já está logado vai direto para a própria área.
  useEffect(() => {
    if (!carregando && autenticado && papel) navigate(state?.voltarPara ?? destinoInicial(papel), { replace: true });
  }, [autenticado, papel, carregando, navigate, state]);

  const alterar = (campo) => (e) => {
    const valor = e.target.value;
    setCampos((c) => ({ ...c, [campo]: valor }));
    if (erros[campo]) setErros(({ [campo]: _x, ...resto }) => resto);
  };

  const criando = modo === 'criar';
  const senhaInfo = avaliarSenha(campos.senha);
  const passos = [
    { rotulo: 'Como podemos te chamar', ok: campos.nome.trim().length >= 2 },
    { rotulo: 'E-mail para avisos', ok: emailValido(campos.email) },
    { rotulo: 'Senha com 8 caracteres ou mais', ok: senhaInfo.minimo },
    { rotulo: 'Aceite dos termos e da privacidade', ok: aceite },
  ];

  function validar() {
    const e = {};
    if (criando && !passos[0].ok) e.nome = 'Diga como podemos te chamar.';
    if (!emailValido(campos.email)) e.email = 'Confira o e-mail. Ele precisa ter @ e um ponto.';
    if (modo !== 'recuperar' && (criando ? !senhaInfo.minimo : !campos.senha)) e.senha = criando ? 'Use pelo menos 8 caracteres.' : 'Digite a sua senha.';
    if (criando && !aceite) e.aceite = 'Para criar a conta, marque que você leu e concorda com os termos.';
    setErros(e);
    // Leva o foco ao primeiro campo com problema.
    const primeiro = ['nome', 'email', 'senha', 'aceite'].find((c) => e[c]);
    if (primeiro) requestAnimationFrame(() => document.querySelector(`[name="${primeiro}"]`)?.focus());
    return !primeiro;
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
    if (criando) {
      const { error, precisaConfirmar } = await cadastro({ nome: campos.nome.trim(), email, senha: campos.senha });
      setEnviando(false);
      if (error) return mostrarAviso({ tipo: 'erro', texto: error.message });
      if (precisaConfirmar) return setCriada(true);
      return navigate('/minha-area', { replace: true });
    }
    const { recuperarSenha } = await import('../services/authService');
    const { error } = await recuperarSenha(email);
    setEnviando(false);
    if (error) return mostrarAviso({ tipo: 'erro', texto: error.message });
    return mostrarAviso({ tipo: 'sucesso', titulo: 'Link enviado', texto: `Se existir uma conta com ${email}, o link para criar uma nova senha chega em alguns minutos.` });
  }

  const trocarModo = (m) => {
    setModo(m);
    setErros({});
    setAviso(null);
    setCriada(false);
    setAceite(false);
  };

  const nome = primeiroNome(campos.nome);
  const textos = MODOS[modo];
  const titulo = criando && nome ? <>Prazer, <span className="text-sky-700 dark:text-sky-400">{nome}</span>!</> : textos.titulo;

  return (
    <SignInPage
      titulo={titulo}
      descricao={textos.descricao}
      legendaFoto="Rocinha, Zona Sul do Rio de Janeiro."
      chamada={criando ? null : 'Sua saúde acompanhada de perto, do beco ao posto.'}
      painel={criando ? <Carteirinha nome={campos.nome} email={campos.email} passos={passos} /> : <CarrosselCartoes cartoes={CARTOES} />}
    >
      {!supabaseConfigurado && (
        <Alert tipo="aviso" titulo="Login indisponível neste ambiente">
          O Supabase não foi configurado. A triagem continua funcionando sem login.
        </Alert>
      )}

      {criada ? (
        <ContaCriada nome={campos.nome} email={campos.email.trim()} aoVoltar={() => trocarModo('entrar')} />
      ) : (
        <>
          {modo !== 'recuperar' && <Abas modo={modo} aoMudar={trocarModo} />}

          {criando && (
            <div className="animate-surgir -mb-1" aria-hidden="true">
              <div className="flex gap-1.5">
                {passos.map((p) => (
                  <span key={p.rotulo} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <span className={`block h-full rounded-full bg-gradient-to-r from-sky-600 to-emerald-500 transition-all duration-700 ease-out ${p.ok ? 'w-full' : 'w-0'}`} />
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs texto-suave">
                {passos.filter((p) => p.ok).length} de {passos.length} prontos
              </p>
            </div>
          )}

          <form key={modo} className="space-y-5" onSubmit={aoEnviar} noValidate>
            {criando && (
              <CampoVidro
                className="animate-element animate-delay-100"
                label="Como podemos te chamar?"
                name="nome"
                autoComplete="given-name"
                placeholder="Seu nome ou apelido"
                value={campos.nome}
                onChange={alterar('nome')}
                erro={erros.nome}
                valido={passos[0].ok}
                maxLength={80}
              />
            )}
            <CampoVidro
              className="animate-element animate-delay-200"
              label="E-mail"
              name="email"
              type="email"
              inputMode="email"
              autoComplete={criando ? 'email' : 'username'}
              placeholder="voce@email.com"
              value={campos.email}
              onChange={alterar('email')}
              erro={erros.email}
              valido={criando && passos[1].ok}
            />
            {modo !== 'recuperar' && (
              <CampoVidro
                className="animate-element animate-delay-300"
                label="Senha"
                name="senha"
                type="password"
                autoComplete={criando ? 'new-password' : 'current-password'}
                placeholder={criando ? 'Pelo menos 8 caracteres' : 'Sua senha'}
                value={campos.senha}
                onChange={alterar('senha')}
                erro={erros.senha}
                valido={criando && senhaInfo.minimo}
              >
                {criando && <MedidorSenha senha={campos.senha} />}
              </CampoVidro>
            )}

            {modo === 'entrar' && (
              <div className="animate-element animate-delay-300 -mt-2 flex justify-end text-sm">
                <button type="button" onClick={() => trocarModo('recuperar')} className="min-h-toque font-semibold text-sky-700 hover:underline dark:text-sky-400">
                  Esqueci minha senha
                </button>
              </div>
            )}

            {criando && (
              <div className="animate-element animate-delay-400">
                <label
                  htmlFor="aceite-termos"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
                    erros.aceite
                      ? 'border-red-600 bg-red-50 dark:border-red-400 dark:bg-red-950/40'
                      : aceite
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-slate-300 hover:border-slate-400 dark:border-slate-600'
                  }`}
                >
                  <input
                    id="aceite-termos"
                    name="aceite"
                    type="checkbox"
                    required
                    checked={aceite}
                    onChange={(e) => {
                      setAceite(e.target.checked);
                      if (erros.aceite) setErros(({ aceite: _x, ...resto }) => resto);
                    }}
                    aria-invalid={erros.aceite ? true : undefined}
                    aria-describedby={erros.aceite ? 'aceite-erro' : undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-sky-700"
                  />
                  <span className="leading-relaxed">
                    Li e concordo com os{' '}
                    <Link to="/termos" target="_blank" className="font-semibold text-sky-700 underline dark:text-sky-400">
                      Termos de uso
                    </Link>{' '}
                    e com a{' '}
                    <Link to="/privacidade" target="_blank" className="font-semibold text-sky-700 underline dark:text-sky-400">
                      Política de privacidade
                    </Link>
                    , e autorizo o uso dos meus dados de saúde para organizar as visitas, conforme a LGPD.
                  </span>
                </label>
                {erros.aceite && (
                  <p id="aceite-erro" className="mt-1.5 text-sm font-medium text-red-700 dark:text-red-300">
                    {erros.aceite}
                  </p>
                )}
              </div>
            )}

            {aviso && (
              <div ref={avisoRef} tabIndex={-1} role={aviso.tipo === 'erro' ? 'alert' : 'status'} className="focus:outline-none">
                <Alert tipo={aviso.tipo} titulo={aviso.titulo}>
                  {aviso.texto}
                </Alert>
              </div>
            )}

            <BotaoLogin carregando={enviando} className="animate-element animate-delay-400" disabled={!supabaseConfigurado || enviando}>
              {enviando ? 'Só um instante…' : criando ? 'Criar minha conta' : modo === 'recuperar' ? 'Enviar link' : 'Entrar'}
              {!enviando && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
            </BotaoLogin>
          </form>

          {modo === 'recuperar' && (
            <button type="button" onClick={() => trocarModo('entrar')} className="min-h-toque text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400">
              Voltar para o login
            </button>
          )}
        </>
      )}

      <div className="animate-element animate-delay-500 relative flex items-center justify-center">
        <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        <span className="absolute bg-slate-50 px-4 text-sm texto-suave dark:bg-noite">ou</span>
      </div>

      <Link
        to="/morador"
        className="animate-element animate-delay-600 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 font-semibold transition-colors hover:bg-slate-900/5 dark:border-slate-600 dark:hover:bg-white/5"
      >
        Fazer a triagem sem conta
      </Link>

      <p className="animate-element animate-delay-700 text-center text-sm texto-suave">
        É da equipe de saúde?{' '}
        <Link to="/equipe" className="inline-flex min-h-toque items-center font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Acesse por aqui
        </Link>
      </p>
    </SignInPage>
  );
}
