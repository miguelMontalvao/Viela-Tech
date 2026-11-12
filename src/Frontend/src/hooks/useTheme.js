import { useCallback, useEffect, useState } from 'react';

const CHAVE_TEMA = 'viela_tema';

function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo === 'dark' || salvo === 'light') return salvo;
  } catch {
    /* armazenamento indisponível: fica no padrão */
  }
  // O tema claro é o padrão do Viela Tech (leitura sob sol forte); o escuro é escolha da pessoa.
  return 'light';
}

/** Alterna entre tema claro e escuro (classe "dark" no <html>, darkMode: 'class'). */
export function useTheme() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('dark', tema === 'dark');
    raiz.style.colorScheme = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#0B1222' : '#F8FAFC');
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      /* sem persistência, o tema vale só para esta visita */
    }
  }, [tema]);

  const alternarTema = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { tema, escuro: tema === 'dark', alternarTema };
}
