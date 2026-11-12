import { sincronizarPendenciasOffline } from './api';

let emAndamento = null;

/**
 * Executa sincronizarPendenciasOffline() uma vez por vez.
 * Se uma sincronização já estiver rodando, devolve a mesma promessa,
 * evitando que a mesma triagem pendente seja inserida duas vezes.
 */
export function sincronizarComTrava() {
  if (!emAndamento) {
    emAndamento = sincronizarPendenciasOffline().finally(() => {
      emAndamento = null;
    });
  }
  return emAndamento;
}

/** Há triagens do morador guardadas no aparelho? (mesma chave usada em api.js) */
export function existemTriagensPendentes() {
  try {
    return JSON.parse(localStorage.getItem('canyon_triagens_pendentes') || '[]').length > 0;
  } catch {
    return false;
  }
}
