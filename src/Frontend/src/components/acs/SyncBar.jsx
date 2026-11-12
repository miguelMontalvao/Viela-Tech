import { CloudUpload, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

/** Barra de conexão do ACS: status online/offline, pendências e sincronização manual. */
export function SyncBar({ online, pendentes, sincronizando, aoSincronizar, aoRecarregar, carregando }) {
  const ocupado = sincronizando || carregando;
  return (
    <div
      className={`painel relative flex flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
        online ? '' : 'border-amber-400 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/30'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
          {online && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>
        <div role="status">
          <p className="font-semibold">{online ? 'Conectado' : 'Sem sinal: trabalhando offline'}</p>
          <p className="text-sm texto-suave">
            {pendentes === 0 ? (
              'Tudo enviado. Nenhum registro esperando.'
            ) : (
              <>
                <span className="mr-1 inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                  {pendentes}
                </span>
                {pendentes === 1 ? 'registro guardado no aparelho.' : 'registros guardados no aparelho.'}
              </>
            )}
            {!online && ' Pode continuar: tudo fica salvo aqui.'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variante="secundaria" icone={RefreshCw} onClick={aoRecarregar} carregando={carregando}>
          Atualizar
        </Button>
        <Button
          variante="sucesso"
          icone={CloudUpload}
          onClick={aoSincronizar}
          carregando={sincronizando}
          disabled={!online}
          title={online ? undefined : 'Disponível quando o sinal voltar'}
        >
          {sincronizando ? 'Sincronizando…' : 'Sincronizar'}
        </Button>
      </div>
      {ocupado && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-sky-100 dark:bg-sky-950" aria-hidden="true">
          <span className="barra-indeterminada block h-full w-2/5 bg-gradient-to-r from-sky-500 to-emerald-500" />
        </span>
      )}
    </div>
  );
}
