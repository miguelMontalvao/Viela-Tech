import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CloudOff, MapPin, RotateCcw, Siren } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { UNIDADES_SAUDE } from '../../domain/unidades';

function UnidadesDeSaude() {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {UNIDADES_SAUDE.map((u) => (
        <li key={u.nome} className="flex gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <div>
            <p className="font-semibold">{u.nome}</p>
            <p className="text-sm texto-suave">{u.descricao}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Resultado mostrado depois do envio da triagem. */
export function ResultadoTriagem({ resultado, aoNovaTriagem, logado = false }) {
  const tituloRef = useRef(null);

  // Move o foco para o resultado: quem usa leitor de tela ouve a resposta na hora.
  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const { urgente, sintomasAssociados, offline, nome } = resultado;

  return (
    <section aria-labelledby="resultado-titulo" className="space-y-5">
      {urgente ? (
        <div className="overflow-hidden rounded-2xl border-2 border-red-600 bg-white shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
            <Siren className="h-7 w-7 shrink-0" aria-hidden="true" />
            <h2 id="resultado-titulo" ref={tituloRef} tabIndex={-1} className="text-xl font-extrabold focus:outline-none">
              Alerta prioritário: tosse há 21 dias ou mais
            </h2>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-lg">
              {nome}, tosse que dura três semanas ou mais precisa ser avaliada. <strong>Procure uma unidade de saúde o quanto
              antes</strong> e peça o exame de escarro. Ele é simples e gratuito.
            </p>
            {sintomasAssociados.length > 0 && (
              <p className="mt-3 texto-suave">Você também informou {sintomasAssociados.join(' e ')}. Conte isso no atendimento.</p>
            )}
            <UnidadesDeSaude />
            <p className="mt-4 text-sm texto-suave">
              Seu caso já está no topo da fila do agente comunitário de saúde da sua área.
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <div>
              <h2 id="resultado-titulo" ref={tituloRef} tabIndex={-1} className="text-xl font-extrabold focus:outline-none">
                Obrigado, {nome}. Sua triagem foi registrada.
              </h2>
              <p className="mt-2 texto-suave">
                O agente comunitário de saúde da sua área vai receber suas respostas. Se a tosse continuar, piorar ou
                chegar a três semanas, procure uma das unidades abaixo.
              </p>
            </div>
          </div>
          <UnidadesDeSaude />
        </div>
      )}

      {offline && (
        <Alert tipo="aviso" titulo="Guardada neste aparelho">
          <span className="inline-flex items-start gap-1.5">
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Não deu para enviar agora. Sua triagem ficou salva aqui e segue para a equipe assim que a conexão voltar.
          </span>
        </Alert>
      )}

      <Alert tipo="info" titulo="Isto não é um diagnóstico">
        A triagem ajuda a organizar quem precisa de visita primeiro. Só o exame feito na unidade de saúde confirma ou
        descarta a tuberculose. Em caso de falta de ar forte ou tosse com sangue, procure atendimento imediatamente.
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row">
        {logado && (
          <Link
            to="/minha-area"
            className="inline-flex min-h-toque items-center justify-center rounded-xl bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:text-slate-950"
          >
            Acompanhar na Minha área
          </Link>
        )}
        <Button variante="secundaria" icone={RotateCcw} onClick={aoNovaTriagem}>
          Fazer outra triagem
        </Button>
        <Link to="/mapa" className="inline-flex min-h-toque items-center justify-center rounded-xl px-5 font-semibold text-sky-700 hover:underline dark:text-sky-400">
          Ver o mapa da tuberculose
        </Link>
      </div>
    </section>
  );
}
