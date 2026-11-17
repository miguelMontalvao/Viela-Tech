import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { BotaoLogin, CampoVidro, SignInPage } from '../components/ui/SignIn';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { destinoInicial } from '../domain/perfis';

/** Página aberta pelo link de recuperação enviado por e-mail. */
export default function RedefinirSenhaPage() {
  const { autenticado, papel, carregando } = useAuth();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState(null);
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(e) {
    e.preventDefault();
    if (senha.length < 8) return setErro('Use pelo menos 8 caracteres.');
    if (senha !== confirmacao) return setErro('As duas senhas precisam ser iguais.');
    setEnviando(true);
    const { atualizarSenha } = await import('../services/authService');
    const { error } = await atualizarSenha(senha);
    setEnviando(false);
    if (error) return setErro(error.message);
    setErro(null);
    return setPronto(true);
  }

  return (
    <SignInPage titulo="Crie uma nova senha" descricao="Escolha uma senha que você lembre e que outras pessoas não adivinhem." foto="morro-cristo">
      {!carregando && !autenticado && !pronto && (
        <Alert tipo="aviso" titulo="Link inválido ou vencido">
          Abra de novo o link mais recente que enviamos por e-mail, ou{' '}
          <Link to="/entrar" state={{ modo: 'recuperar' }} className="font-semibold underline">
            peça outro link
          </Link>
          .
        </Alert>
      )}
      {pronto ? (
        <Alert tipo="sucesso" titulo="Senha alterada" role="status">
          Pronto! Sua nova senha já vale.{' '}
          <Link to={destinoInicial(papel)} className="font-semibold underline">
            Continuar
          </Link>
        </Alert>
      ) : (
        <form className="space-y-5" onSubmit={aoEnviar} noValidate>
          <CampoVidro label="Nova senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <CampoVidro label="Repita a nova senha" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
          {erro && (
            <Alert tipo="erro" role="alert">
              {erro}
            </Alert>
          )}
          <BotaoLogin carregando={enviando} disabled={enviando || !autenticado}>
            <KeyRound className="h-5 w-5" aria-hidden="true" />
            Salvar nova senha
          </BotaoLogin>
        </form>
      )}
    </SignInPage>
  );
}
