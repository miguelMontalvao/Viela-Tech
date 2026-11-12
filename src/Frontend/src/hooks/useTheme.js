import { useCallback, useEffect, useState } from 'react';

const CHAVE_TEMA = 'viela_tema';

function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo === 'dark' || salvo === 'light') return salvo;
  } catch {
    /* armazenamento indisponível: segue a preferência do sistema */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Alterna entre tema claro e escuro (classe "dark" no <html>, darkMode: 'class'). */
export function useTheme() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('dark', tema === 'dark');
    raiz.style.colorScheme = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#0F172A' : '#0284C7');
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      /* sem persistência, o tema vale só para esta visita */
    }
  }, [tema]);

  const alternarTema = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { tema, escuro: tema === 'dark', alternarTema };
}
