import { useCallback, useEffect, useState } from 'react';
import { buscarUltimaLeituraMicroclima } from '../services/api';
import { normalizarLeitura } from '../domain/risco';

/** Última leitura do sensor IoT (ESP32) com o IVM classificado. */
export function useMicroclima({ intervaloMs = 60_000 } = {}) {
  const [leitura, setLeitura] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const atualizar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await buscarUltimaLeituraMicroclima();
    setLeitura(normalizarLeitura(data));
    setErro(error ? 'Não foi possível buscar a leitura do sensor agora.' : null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    atualizar();
    if (!intervaloMs) return undefined;
    const timer = setInterval(atualizar, intervaloMs);
    return () => clearInterval(timer);
  }, [atualizar, intervaloMs]);

  return { leitura, carregando, erro, atualizar };
}
