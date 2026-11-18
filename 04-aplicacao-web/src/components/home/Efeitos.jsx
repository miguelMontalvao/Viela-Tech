import { useEffect, useState } from 'react';
import { useNaTela } from '../../hooks/useAnimacao';

/** Mostra o conteúdo com fade + subida quando entra na tela. */
export function Revelar({ as: Tag = 'div', atraso = 0, className = '', children, ...props }) {
  const [ref, visivel] = useNaTela();
  return (
    <Tag ref={ref} className={`revelar ${visivel ? 'visivel' : ''} ${className}`} style={{ transitionDelay: `${atraso}ms` }} {...props}>
      {children}
    </Tag>
  );
}

/** Atualiza --x/--y para o efeito de luz que segue o mouse (.holofote). */
export function moverHolofote(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
}

/** Acompanha a preferência de "reduzir movimento", inclusive se ela mudar com a página aberta. */
function useMovimentoReduzido() {
  const [reduz, setReduz] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const aoMudar = (e) => setReduz(e.matches);
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);
  return reduz;
}

/**
 * Troca a palavra em ciclo, sem alterar o layout: todas as palavras ocupam a mesma célula,
 * então a largura é a da maior e a altura nunca muda. Pausa com a aba oculta, mouse ou foco.
 * Com "reduzir movimento", mostra todas de uma vez.
 */
export function PalavraQueTroca({ palavras, intervalo = 3000, atrasoInicial = 0, className = '' }) {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const reduz = useMovimentoReduzido();

  useEffect(() => {
    if (reduz || pausado) return undefined;
    let id;
    const inicio = setTimeout(() => {
      id = setInterval(() => {
        if (!document.hidden) setI((n) => (n + 1) % palavras.length);
      }, intervalo);
    }, atrasoInicial);
    return () => {
      clearTimeout(inicio);
      clearInterval(id);
    };
  }, [palavras.length, intervalo, atrasoInicial, reduz, pausado]);

  if (reduz) {
    const lista = palavras.map((p) => p.replace(/\.$/, ''));
    const texto = `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}.`;
    return <span className={className}>{texto}</span>;
  }

  return (
    <span
      className={`troca-grupo ${className}`}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      {palavras.map((p, n) => (
        <span key={p} className="troca-palavra" data-ativa={n === i ? 'true' : 'false'} aria-hidden="true">
          {p}
        </span>
      ))}
      <span className="sr-only">{palavras.join(', ')}</span>
    </span>
  );
}

/**
 * Texto que entra palavra por palavra (sobe e desfoca → nítido).
 * `segmentos`: [{ texto, className }]; cada palavra herda a classe do seu segmento.
 * `imediato` anima ao montar (hero); senão, quando entra na tela.
 */
export function TextoRevelado({ as: Tag = 'p', segmentos, className = '', atraso = 0, passo = 70, imediato = false, ...props }) {
  const [ref, naTela] = useNaTela();
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    if (!imediato) return undefined;
    const id = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(id);
  }, [imediato]);
  const visivel = imediato ? montado : naTela;
  let n = 0;
  return (
    <Tag ref={ref} className={`texto-revelado ${visivel ? 'visivel' : ''} ${className}`} {...props}>
      {segmentos.map((s, i) => (
        <span key={i}>
          {s.quebra && <br />}
          {s.texto.split(' ').map((p, j, arr) => (
            <span key={j}>
              <span className={`palavra ${s.className ?? ''}`} style={{ transitionDelay: `${atraso + n++ * passo}ms` }}>
                {p}
              </span>
              {j < arr.length - 1 || i < segmentos.length - 1 ? ' ' : ''}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
