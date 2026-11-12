import { useMemo } from 'react';
import { ClipboardList, FlaskConical, LogOut, Siren, Timer } from 'lucide-react';
import { PageHeader } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MicroclimaPanel } from '../components/gestor/MicroclimaPanel';
import { StatCard } from '../components/gestor/StatCard';
import { BarChart } from '../components/gestor/BarChart';
import { Button } from '../components/ui/Button';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { useChamados } from '../hooks/useChamados';
import { useMicroclima } from '../hooks/useMicroclima';
import { resumirChamados } from '../domain/chamados';
import { PAPEIS } from '../domain/perfis';
import { MapaRocinha } from '../components/mapa/MapaRocinha';

function Dashboard() {
  const { logout } = useAuth();
  const microclima = useMicroclima();
  const { chamados, carregando, erro } = useChamados({ sincronizarAoReconectar: false });
  const resumo = useMemo(() => resumirChamados(chamados), [chamados]);
  const temDados = resumo.total > 0;

  return (
    <div className="container-app">
      <PageHeader
        eyebrow="Dashboard do gestor"
        titulo="Vigilância nas vielas"
        acoes={
          <Button variante="fantasma" icone={LogOut} onClick={logout}>
            Sair
          </Button>
        }
      >
        O ambiente medido pelos sensores e o andamento das triagens e coletas, em um só lugar.
      </PageHeader>

      <div className="space-y-6">
        <MicroclimaPanel {...microclima} aoAtualizar={microclima.atualizar} />

        <section aria-labelledby="indicadores-titulo">
          <h2 id="indicadores-titulo" className="mb-3 text-xl font-bold">
            Triagens e coletas
          </h2>
          {erro && <Alert tipo="aviso" className="mb-4">{erro}</Alert>}
          {carregando && !temDados ? (
            <Spinner texto="Calculando indicadores…" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icone={ClipboardList} rotulo="Total de triagens" valor={resumo.total} detalhe={resumo.pendentesSync ? `${resumo.pendentesSync} ainda no aparelho` : 'Registradas no sistema'} />
              <StatCard
                icone={Siren}
                tom="vermelho"
                rotulo="Casos urgentes"
                valor={resumo.urgentes}
                detalhe={`${resumo.urgentesAbertos} em aberto · tosse +21 dias`}
              />
              <StatCard icone={FlaskConical} tom="verde" rotulo="Coletas concluídas" valor={resumo.concluidos} detalhe={temDados ? `${Math.round((resumo.concluidos / resumo.total) * 100)}% do total` : 'Nenhuma ainda'} />
              <StatCard icone={Timer} tom="neutro" rotulo="Média de dias com tosse" valor={resumo.mediaDiasTosse.toLocaleString('pt-BR')} detalhe="Entre todos os triados" />
            </div>
          )}
        </section>

        {temDados ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <BarChart titulo="Chamados por etapa" descricao="Onde cada triagem está no fluxo de atendimento." dados={resumo.porStatus} unidade={['chamado', 'chamados']} />
            <BarChart titulo="Triagens por setor" descricao="Setores com mais pedidos de visita." dados={resumo.porSetor.slice(0, 8)} />
          </div>
        ) : null}

        {temDados ? (
          <MapaRocinha chamados={chamados} />
        ) : (
          !carregando && (
            <div className="card">
              <EmptyState icone={ClipboardList} titulo="Ainda não há triagens para exibir">
                Os gráficos aparecem assim que os primeiros moradores fizerem a autotriagem.
              </EmptyState>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function GestorPage() {
  return (
    <ProtectedRoute papeis={[PAPEIS.GESTOR]}>
      <Dashboard />
    </ProtectedRoute>
  );
}
