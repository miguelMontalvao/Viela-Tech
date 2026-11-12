import { CloudUpload, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';

/** Barra de conexão do ACS: status online/offline, pendências e sincronização manual. */
export function SyncBar({ online, pendentes, sincronizando, aoSincronizar, aoRecarregar, carregando }) {
  return (
    <div
      className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between ${
        online ? '' : 'border-amber-400 dark:border-amber-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            online
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          {online ? <Wifi className="h-6 w-6" aria-hidden="true" /> : <WifiOff className="h-6 w-6" aria-hidden="true" />}
        </span>
        <div>
          <p className="font-bold">{online ? 'Conectado' : 'Sem sinal: trabalhando offline'}</p>
          <p className="text-sm texto-suave">
            {pendentes === 0
              ? 'Nenhum registro esperando envio.'
              : `${pendentes} ${pendentes === 1 ? 'registro guardado' : 'registros guardados'} no aparelho.`}
            {!online && ' Pode continuar: tudo fica salvo aqui.'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variante="secundaria" icone={RefreshCw} onClick={aoRecarregar} carregando={carregando}>
          Atualizar lista
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
    </div>
  );
}
