import { useEffect, useState } from 'react';
import { existemTriagensPendentes, sincronizarComTrava } from '../services/sincronizacao';
import { supabaseConfigurado } from '../services/supabaseClient';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Reenvia, em segundo plano, triagens do morador que ficaram no aparelho.
 * Roda ao abrir a página e sempre que a conexão volta (RN-04).
 */
export function useEnvioPendente() {
  const online = useOnlineStatus();
  const [enviadas, setEnviadas] = useState(0);

  useEffect(() => {
    if (!online || !supabaseConfigurado || !existemTriagensPendentes()) return;
    let ativo = true;
    sincronizarComTrava().then(({ sincronizados }) => {
      if (ativo && sincronizados) setEnviadas((n) => n + sincronizados);
    });
    return () => {
      ativo = false;
    };
  }, [online]);

  return { enviadas };
}
