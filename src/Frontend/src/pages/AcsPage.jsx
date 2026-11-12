import { useMemo, useState } from 'react';
import { ClipboardCheck, LogOut } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ChamadoCard } from '../components/acs/ChamadoCard';
import { ChamadosFilter } from '../components/acs/ChamadosFilter';
import { SyncBar } from '../components/acs/SyncBar';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { useChamados } from '../hooks/useChamados';
import { ehUrgente } from '../domain/risco';
import { estaFinalizado, filtrarChamados, idDoChamado } from '../domain/chamados';
import { PAPEIS } from '../domain/perfis';

function PainelACS() {
  const { nome, usuario, logout } = useAuth();
  const {
    chamados, carregando, erro, online, sincronizando, pendentes, mensagem, limparMensagem,
    atualizandoId, recarregar, atualizarStatus, sincronizar,
  } = useChamados();
  const [filtro, setFiltro] = useState('abertos');
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => filtrarChamados(chamados, { filtro, busca }), [chamados, filtro, busca]);
  const contagens = useMemo(
    () => ({
      abertos: chamados.filter((c) => !estaFinalizado(c)).length,
      urgentes: chamados.filter((c) => ehUrgente(c) && !estaFinalizado(c)).length,
      concluidos: chamados.filter(estaFinalizado).length,
      todos: chamados.length,
    }),
    [chamados],
  );

  return (
    <div className="container-app">
      <PageHeader
        eyebrow="Painel do agente comunitário"
        titulo="Fila de visitas"
        acoes={
          <Button variante="fantasma" icone={LogOut} onClick={logout}>
            Sair
          </Button>
        }
      >
        {`Olá, ${nome ?? usuario?.email ?? 'agente'}. `}Os casos de tosse há 21 dias ou mais aparecem primeiro.
      </PageHeader>

      <div className="space-y-5">
        <SyncBar
          online={online}
          pendentes={pendentes}
          sincronizando={sincronizando}
          aoSincronizar={sincronizar}
          aoRecarregar={recarregar}
          carregando={carregando}
        />

        <div aria-live="polite" className="space-y-3">
          {mensagem && (
            <Alert
              tipo={mensagem.tipo}
              acao={
                <button type="button" onClick={limparMensagem} className="min-h-toque rounded-lg px-3 text-sm font-semibold underline">
                  Fechar
                </button>
              }
            >
              {mensagem.texto}
            </Alert>
          )}
          {erro && <Alert tipo="aviso">{erro}</Alert>}
        </div>

        <ChamadosFilter filtro={filtro} aoMudarFiltro={setFiltro} busca={busca} aoMudarBusca={setBusca} contagens={contagens} />

        <section aria-label="Chamados">
          {carregando && chamados.length === 0 ? (
            <Spinner texto="Buscando chamados…" />
          ) : visiveis.length === 0 ? (
            <div className="card">
              <EmptyState icone={ClipboardCheck} titulo={chamados.length ? 'Nada neste filtro' : 'Nenhum chamado por enquanto'}>
                {chamados.length
                  ? 'Troque o filtro ou limpe a busca para ver os outros chamados.'
                  : 'Quando um morador fizer a autotriagem, o chamado aparece aqui.'}
              </EmptyState>
            </div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {visiveis.map((c) => (
                <li key={idDoChamado(c)}>
                  <ChamadoCard chamado={c} aoAtualizar={atualizarStatus} atualizando={atualizandoId === idDoChamado(c)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AcsPage() {
  return (
    <ProtectedRoute papeis={[PAPEIS.ACS, PAPEIS.GESTOR]}>
      <PainelACS />
    </ProtectedRoute>
  );
}
