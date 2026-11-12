import { useMemo } from 'react';
import { ClipboardList, FlaskConical, Siren, Timer } from 'lucide-react';
import { CabecalhoPainel } from '../components/painel/Painel';
import { Revelar } from '../components/home/Efeitos';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MicroclimaPanel } from '../components/gestor/MicroclimaPanel';
import { BarChart } from '../components/gestor/BarChart';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { Alert } from '../components/ui/Alert';
import { useChamados } from '../hooks/useChamados';
import { useMicroclima } from '../hooks/useMicroclima';
import { resumirChamados } from '../domain/chamados';
import { PAPEIS } from '../domain/perfis';
import { MapaRocinha } from '../components/mapa/MapaRocinha';

function Dashboard() {
  const microclima = useMicroclima();
  const { chamados, carregando, erro } = useChamados({ sincronizarAoReconectar: false });
  const resumo = useMemo(() => resumirChamados(chamados), [chamados]);
  const temDados = resumo.total > 0;

  return (
    <div className="container-app">
      <CabecalhoPainel
        sobrelinha="Dashboard do gestor"
        titulo="Vigilância nas vielas"
        kpis={
          carregando && !temDados
            ? null
            : [
                {
                  rotulo: 'Triagens',
                  valor: resumo.total,
                  icone: ClipboardList,
                  detalhe: resumo.pendentesSync ? `${resumo.pendentesSync} ainda no aparelho` : 'registradas no sistema',
                },
                { rotulo: 'Casos urgentes', valor: resumo.urgentes, icone: Siren, destaque: resumo.urgentesAbertos > 0, detalhe: `${resumo.urgentesAbertos} em aberto · tosse +21 dias` },
                {
                  rotulo: 'Coletas concluídas',
                  valor: resumo.concluidos,
                  icone: FlaskConical,
                  detalhe: temDados ? `${Math.round((resumo.concluidos / resumo.total) * 100)}% do total` : 'nenhuma ainda',
                },
                { rotulo: 'Média de dias com tosse', valor: resumo.mediaDiasTosse, casas: 1, icone: Timer, detalhe: 'entre todos os triados' },
              ]
        }
      >
        O ambiente medido pelos sensores e o andamento das triagens e coletas, em um só lugar.
      </CabecalhoPainel>

      <div className="space-y-6 py-8">
        {erro && <Alert tipo="aviso">{erro}</Alert>}
        {carregando && !temDados && <Spinner texto="Calculando indicadores…" />}

        <Revelar>
          <MicroclimaPanel {...microclima} aoAtualizar={microclima.atualizar} />
        </Revelar>

        {temDados ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart titulo="Chamados por etapa" descricao="Onde cada triagem está no fluxo de atendimento." dados={resumo.porStatus} unidade={['chamado', 'chamados']} />
            <BarChart titulo="Triagens por setor" descricao="Setores com mais pedidos de visita." dados={resumo.porSetor.slice(0, 8)} />
          </div>
        ) : null}

        {temDados ? (
          <Revelar>
            <MapaRocinha chamados={chamados} />
          </Revelar>
        ) : (
          !carregando && (
            <div className="painel">
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
