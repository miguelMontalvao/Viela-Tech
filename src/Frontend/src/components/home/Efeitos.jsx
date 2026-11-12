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

/** Troca a palavra em ciclo, com transição suave. */
export function PalavraQueTroca({ palavras, intervalo = 2600, className = '' }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % palavras.length), intervalo);
    return () => clearInterval(id);
  }, [palavras.length, intervalo]);
  return (
    <span className={`relative inline-block overflow-hidden align-bottom ${className}`}>
      <span key={i} className="troca-palavra" aria-hidden="true">
        {palavras[i]}
      </span>
      <span className="sr-only">{palavras.join(', ')}</span>
    </span>
  );
}
