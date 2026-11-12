import { useCallback, useState } from 'react';
import { salvarTriagemMorador } from '../services/api';
import { avaliarTriagem, montarPayload, validarTriagem, VALORES_INICIAIS } from '../domain/triagem';

/** Estado e envio do formulário de autotriagem do morador. */
export function useTriagem() {
  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erroEnvio, setErroEnvio] = useState(null);

  const alterarCampo = useCallback((campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => {
      if (!e[campo]) return e;
      const { [campo]: _removido, ...resto } = e;
      return resto;
    });
  }, []);

  const enviar = useCallback(async () => {
    const encontrados = validarTriagem(valores);
    setErros(encontrados);
    if (Object.keys(encontrados).length) return { ok: false, campos: Object.keys(encontrados) };

    setEnviando(true);
    setErroEnvio(null);
    const payload = montarPayload(valores);
    const { error, offline } = await salvarTriagemMorador(payload);
    setEnviando(false);

    if (error) {
      setErroEnvio('Não conseguimos guardar sua triagem. Tente de novo em instantes.');
      return { ok: false };
    }
    setResultado({ ...avaliarTriagem(payload), offline, nome: payload.morador_nome });
    return { ok: true };
  }, [valores]);

  const reiniciar = useCallback(() => {
    setValores(VALORES_INICIAIS);
    setErros({});
    setResultado(null);
    setErroEnvio(null);
  }, []);

  return { valores, erros, enviando, resultado, erroEnvio, alterarCampo, enviar, reiniciar };
}
