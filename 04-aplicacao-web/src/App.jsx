import { lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout, TelaCheia } from './components/layout/Layout';
import HomePage from './pages/HomePage';

// Cada área carrega só quando é aberta: a Home fica leve no celular.
const MoradorPage = lazy(() => import('./pages/MoradorPage'));
const EntrarPage = lazy(() => import('./pages/EntrarPage'));
const EquipePage = lazy(() => import('./pages/EquipePage'));
const RedefinirSenhaPage = lazy(() => import('./pages/RedefinirSenhaPage'));
const MinhaAreaPage = lazy(() => import('./pages/MinhaAreaPage'));
const AcsPage = lazy(() => import('./pages/AcsPage'));
const GestorPage = lazy(() => import('./pages/GestorPage'));
const MapaPage = lazy(() => import('./pages/MapaPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const TITULOS = {
  '/': 'Viela Tech · Saúde nas vielas da Rocinha',
  '/morador': 'Autotriagem de tosse · Viela Tech',
  '/entrar': 'Entrar · Viela Tech',
  '/equipe': 'Acesso da equipe de saúde · Viela Tech',
  '/redefinir-senha': 'Nova senha · Viela Tech',
  '/minha-area': 'Minha área · Viela Tech',
  '/acs': 'Fila de visitas do ACS · Viela Tech',
  '/gestor': 'Dashboard do gestor · Viela Tech',
  '/mapa': 'Mapa da tuberculose no Rio · Viela Tech',
  '/privacidade': 'Política de privacidade · Viela Tech',
  '/termos': 'Termos de uso · Viela Tech',
};

/** Atualiza o título da aba e volta ao topo a cada troca de página. */
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
      {/* Login em tela cheia, sem cabeçalho nem rodapé do site */}
      <Route element={<TelaCheia />}>
        <Route path="entrar" element={<EntrarPage />} />
        <Route path="equipe" element={<EquipePage />} />
        <Route path="redefinir-senha" element={<RedefinirSenhaPage />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="morador" element={<MoradorPage />} />
        <Route path="minha-area" element={<MinhaAreaPage />} />
        <Route path="acs" element={<AcsPage />} />
        <Route path="gestor" element={<GestorPage />} />
        <Route path="mapa" element={<MapaPage />} />
        <Route path="privacidade" element={<LegalPage tipo="privacidade" />} />
        <Route path="termos" element={<LegalPage tipo="termos" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
