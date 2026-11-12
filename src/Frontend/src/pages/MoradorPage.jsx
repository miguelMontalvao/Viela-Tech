import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { TriagemForm } from '../components/morador/TriagemForm';
import { ResultadoTriagem } from '../components/morador/ResultadoTriagem';
import { ConfigNotice } from '../components/ui/ConfigNotice';
import { Alert } from '../components/ui/Alert';
import { useTriagem } from '../hooks/useTriagem';
import { useEnvioPendente } from '../hooks/useEnvioPendente';

export default function MoradorPage() {
  const triagem = useTriagem();
  const { enviadas } = useEnvioPendente();

  return (
    <div className="container-app max-w-3xl">
      <PageHeader eyebrow="Área do morador" titulo="Autotriagem de tosse">
        Responda com calma. Leva menos de um minuto e ajuda o agente de saúde a chegar primeiro em quem mais precisa.
      </PageHeader>

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
          <ResultadoTriagem resultado={triagem.resultado} aoNovaTriagem={triagem.reiniciar} />
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
  );
}
