import { useCallback, useSyncExternalStore } from 'react';

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

/*
 * Um só tema para o app inteiro: todo componente que usa useTheme lê o mesmo valor
 * e é avisado quando ele muda (antes cada um guardava o seu e o header só via a troca
 * depois de recarregar a página).
 */
let temaAtual = typeof window === 'undefined' ? 'light' : temaInicial();
const ouvintes = new Set();

function aplicar(tema) {
  const raiz = document.documentElement;
  raiz.classList.toggle('dark', tema === 'dark');
  raiz.style.colorScheme = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'dark' ? '#0B1222' : '#F8FAFC');
}

function definirTema(tema, salvar = true) {
  if (tema === temaAtual) return;
  temaAtual = tema;
  aplicar(tema);
  if (salvar) {
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      /* sem persistência, o tema vale só para esta visita */
    }
  }
  ouvintes.forEach((avisar) => avisar());
}

if (typeof window !== 'undefined') {
  aplicar(temaAtual);
  // Trocou o tema em outra aba: acompanha aqui também.
  window.addEventListener('storage', (e) => {
    if (e.key === CHAVE_TEMA && (e.newValue === 'dark' || e.newValue === 'light')) definirTema(e.newValue, false);
  });
}

function assinar(avisar) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

/** Alterna entre tema claro e escuro (classe "dark" no <html>, darkMode: 'class'). */
export function useTheme() {
  const tema = useSyncExternalStore(
    assinar,
    () => temaAtual,
    () => 'light',
  );
  const alternarTema = useCallback(() => definirTema(temaAtual === 'dark' ? 'light' : 'dark'), []);
  return { tema, escuro: tema === 'dark', alternarTema };
}
