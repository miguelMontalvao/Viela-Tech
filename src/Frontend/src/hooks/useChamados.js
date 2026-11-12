import { useCallback, useEffect, useRef, useState } from 'react';
import { atualizarStatusChamado, buscarChamadosACS, sincronizarPendenciasOffline } from '../services/api';
import { comDadosDoMorador, idDoChamado, ordenarPorPrioridade, semDuplicados } from '../domain/chamados';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Lista de chamados do ACS com atualização de status e sincronização offline.
 * Toda a persistência passa por services/api.js.
 */
export function useChamados({ sincronizarAoReconectar = true } = {}) {
  const online = useOnlineStatus();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [atualizandoId, setAtualizandoId] = useState(null);
  const estavaOffline = useRef(!online);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await buscarChamadosACS();
    setChamados(ordenarPorPrioridade(semDuplicados(comDadosDoMorador(data ?? []))));
    setErro(error ? 'Mostrando apenas os registros salvos neste aparelho.' : null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizarStatus = useCallback(
    async (chamado, novoStatus) => {
      const id = idDoChamado(chamado);
      setAtualizandoId(id);
      // Atualização otimista: o ACS vê a mudança na hora, mesmo sem sinal.
      setChamados((lista) =>
        ordenarPorPrioridade(lista.map((c) => (idDoChamado(c) === id ? { ...c, status: novoStatus } : c))),
      );
      const { error, offline } = await atualizarStatusChamado(id, novoStatus);
      setAtualizandoId(null);
      if (error) {
        setMensagem({ tipo: 'erro', texto: 'Não foi possível atualizar o chamado.' });
        await carregar();
        return;
      }
      setMensagem(
        offline
          ? { tipo: 'aviso', texto: 'Atualização guardada no aparelho. Ela será enviada na próxima sincronização.' }
          : { tipo: 'sucesso', texto: 'Chamado atualizado.' },
      );
      if (offline) await carregar();
    },
    [carregar],
  );

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    const { sincronizados, error } = await sincronizarPendenciasOffline();
    setSincronizando(false);
    if (error) {
      setMensagem({
        tipo: 'aviso',
        texto: sincronizados
          ? `${sincronizados} item(ns) enviados. Alguns continuam no aparelho para nova tentativa.`
          : 'Ainda não deu para sincronizar. Os registros continuam salvos no aparelho.',
      });
    } else {
      setMensagem({
        tipo: 'sucesso',
        texto: sincronizados ? `${sincronizados} item(ns) sincronizados com a central.` : 'Tudo em dia. Nada pendente.',
      });
    }
    await carregar();
  }, [carregar]);

  // Ao recuperar o sinal, envia sozinho o que ficou pendente (RN-04).
  useEffect(() => {
    if (online && estavaOffline.current && sincronizarAoReconectar) sincronizar();
    estavaOffline.current = !online;
  }, [online, sincronizar, sincronizarAoReconectar]);

  const pendentes = chamados.filter((c) => c._offline).length;

  return {
    chamados,
    carregando,
    erro,
    online,
    sincronizando,
    pendentes,
    mensagem,
    limparMensagem: () => setMensagem(null),
    atualizandoId,
    recarregar: carregar,
    atualizarStatus,
    sincronizar,
  };
}
