import { useCallback, useEffect, useRef, useState } from 'react';

const menosMovimento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Diz se o elemento já apareceu na tela (dispara uma vez). */
export function useNaTela(margem = '0px 0px -10% 0px') {
  const [visivel, setVisivel] = useState(false);
  const observador = useRef(null);
  const ref = useCallback(
    (el) => {
      observador.current?.disconnect();
      if (!el) return;
      if (typeof IntersectionObserver === 'undefined') {
        setVisivel(true);
        return;
      }
      observador.current = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setVisivel(true);
            observador.current?.disconnect();
          }
        },
        { rootMargin: margem },
      );
      observador.current.observe(el);
    },
    [margem],
  );
  return [ref, visivel];
}

/** Conta de 0 até o valor (efeito de painel de monitoramento). Reinicia quando `chave` muda. */
export function useContador(alvo, duracao = 900, chave = alvo, ativo = true) {
  const [valor, setValor] = useState(menosMovimento() ? alvo : 0);
  useEffect(() => {
    if (!ativo) return undefined;
    if (menosMovimento()) {
      setValor(alvo);
      return undefined;
    }
    const inicio = performance.now();
    let id;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / duracao);
      setValor(alvo * (1 - (1 - p) ** 3));
      if (p < 1) id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [alvo, duracao, chave, ativo]);
  return valor;
}
