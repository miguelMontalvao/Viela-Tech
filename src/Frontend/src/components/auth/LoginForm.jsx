import { useRef, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabaseConfigurado } from '../../services/supabaseClient';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';

/** Login dos profissionais de saúde (Supabase Auth, e-mail e senha). */
export function LoginForm({ titulo = 'Acesso da equipe de saúde', descricao }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const erroRef = useRef(null);

  async function aoEnviar(e) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setEnviando(true);
    setErro(null);
    const { error } = await login(email.trim(), senha);
    setEnviando(false);
    if (error) {
      setErro(error.message);
      requestAnimationFrame(() => erroRef.current?.focus());
    }
  }

  return (
    <div className="container-app py-10 sm:py-16">
      <div className="card mx-auto max-w-md p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{titulo}</h1>
        <p className="mt-2 texto-suave">
          {descricao ?? 'Área restrita a Agentes Comunitários de Saúde e gestores. Entre com o e-mail cadastrado pela coordenação.'}
        </p>

        {!supabaseConfigurado && (
          <Alert tipo="aviso" titulo="Login indisponível neste ambiente" className="mt-5">
            O Supabase ainda não foi configurado. Defina <code className="font-mono">VITE_SUPABASE_URL</code> e{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="font-mono">.env</code> e
            cadastre o profissional em Authentication → Users.
          </Alert>
        )}

        <form className="mt-6 space-y-5" onSubmit={aoEnviar} noValidate>
          <Field
            label="E-mail"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!supabaseConfigurado}
            required
          />
          <Field
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={!supabaseConfigurado}
            required
          />
          {erro && (
            <div ref={erroRef} tabIndex={-1} role="alert">
              <Alert tipo="erro">{erro}</Alert>
            </div>
          )}
          <Button type="submit" icone={LogIn} carregando={enviando} disabled={!supabaseConfigurado} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
