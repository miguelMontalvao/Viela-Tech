import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import MoradorPage from './pages/MoradorPage';
import AcsPage from './pages/AcsPage';
import GestorPage from './pages/GestorPage';
import NotFoundPage from './pages/NotFoundPage';

const TITULOS = {
  '/': 'Viela Tech — Saúde nas vielas da Rocinha',
  '/morador': 'Autotriagem do morador · Viela Tech',
  '/acs': 'Painel do ACS · Viela Tech',
  '/gestor': 'Dashboard do gestor · Viela Tech',
};

/** Atualiza o título da aba e leva o foco ao conteúdo a cada troca de página. */
function useAnuncioDeRota() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITULOS[pathname] ?? 'Página não encontrada · Viela Tech';
    window.scrollTo(0, 0);
  }, [pathname]);
}

export default function App() {
  useAnuncioDeRota();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="morador" element={<MoradorPage />} />
        <Route path="acs" element={<AcsPage />} />
        <Route path="gestor" element={<GestorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
