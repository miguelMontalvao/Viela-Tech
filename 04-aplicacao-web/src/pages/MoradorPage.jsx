import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserRound } from 'lucide-react';
import { CabecalhoPainel } from '../components/painel/Painel';
import { TriagemForm } from '../components/morador/TriagemForm';
import { ResultadoTriagem } from '../components/morador/ResultadoTriagem';
import { ConfigNotice } from '../components/ui/ConfigNotice';
import { Alert } from '../components/ui/Alert';
import { useTriagem } from '../hooks/useTriagem';
import { useEnvioPendente } from '../hooks/useEnvioPendente';
import { useAuth } from '../hooks/useAuth';
import { PAPEIS } from '../domain/perfis';

export default function MoradorPage() {
  const triagem = useTriagem();
  const { enviadas } = useEnvioPendente();
  const { papel, nome, autenticado } = useAuth();
  const ehMorador = papel === PAPEIS.MORADOR;
  const preenchido = useRef(false);

  // Morador logado: o nome já vem preenchido (dá para trocar).
  useEffect(() => {
    if (ehMorador && nome && !preenchido.current && !triagem.valores.morador_nome) {
      preenchido.current = true;
      triagem.alterarCampo('morador_nome', nome);
    }
  }, [ehMorador, nome, triagem]);

  return (
    <div className="container-app max-w-5xl">
      <CabecalhoPainel sobrelinha="Área do morador" titulo="Autotriagem de tosse">
        Responde com calma. Suas respostas ajudam o agente de saúde a chegar primeiro em quem mais precisa.
      </CabecalhoPainel>

      <div className="grid gap-6 py-8 lg:grid-cols-[1fr_17rem]">
        <div>
          <ConfigNotice className="mb-6" />
          {enviadas > 0 && (
            <Alert tipo="sucesso" className="mb-6" role="status">
              {enviadas === 1
                ? 'A triagem que estava guardada neste aparelho foi enviada para a equipe de saúde.'
                : `${enviadas} triagens que estavam guardadas neste aparelho foram enviadas para a equipe de saúde.`}
            </Alert>
          )}

          <div aria-live="polite">
            {triagem.resultado ? (
              <ResultadoTriagem resultado={triagem.resultado} aoNovaTriagem={triagem.reiniciar} logado={ehMorador} />
            ) : (
              <>
                <TriagemForm {...triagem} />
                <p className="mt-4 flex items-start gap-2 text-sm texto-suave">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Esta triagem não é um diagnóstico médico. Ela serve para organizar as visitas da equipe de saúde.
                </p>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          {ehMorador ? (
            <div className="rounded-3xl bg-emerald-50 p-6 dark:bg-emerald-950/40">
              <UserRound className="h-7 w-7 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              <p className="mt-3 text-base font-semibold">Triagem ligada à sua conta</p>
              <p className="mt-1 text-sm texto-suave">Depois de enviar, acompanhe o atendimento na sua área.</p>
              <Link to="/minha-area" className="mt-3 inline-flex min-h-toque items-center font-semibold text-emerald-800 hover:underline dark:text-emerald-300">
                Ir para Minha área →
              </Link>
            </div>
          ) : (
            !autenticado && (
              <div className="rounded-3xl bg-sky-50 p-6 dark:bg-sky-950/40">
                <UserRound className="h-7 w-7 text-sky-700 dark:text-sky-400" aria-hidden="true" />
                <p className="mt-3 text-base font-semibold">Quer acompanhar o atendimento?</p>
                <p className="mt-1 text-sm texto-suave">
                  Com uma conta, você vê quando o agente está a caminho e quando a amostra foi coletada. A triagem funciona sem conta também.
                </p>
                <Link to="/entrar" className="mt-3 inline-flex min-h-toque items-center font-semibold text-sky-800 hover:underline dark:text-sky-300">
                  Entrar ou criar conta →
                </Link>
              </div>
            )
          )}
          <div className="painel p-6">
            <p className="text-base font-semibold">Sinais de alerta</p>
            <ul className="mt-3 space-y-2 text-sm texto-suave">
              <li>• Tosse há 3 semanas ou mais</li>
              <li>• Febre no fim da tarde</li>
              <li>• Suor forte à noite</li>
              <li>• Emagrecer sem motivo</li>
            </ul>
            <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-300">
              Falta de ar forte ou tosse com sangue: procure atendimento na hora.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
