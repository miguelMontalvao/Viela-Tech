import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, ClipboardList, Siren, Stethoscope } from 'lucide-react';
import { CabecalhoPainel } from '../components/painel/Painel';
import { Revelar } from '../components/home/Efeitos';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ChamadoCard } from '../components/acs/ChamadoCard';
import { ChamadosFilter } from '../components/acs/ChamadosFilter';
import { SyncBar } from '../components/acs/SyncBar';
import { Alert } from '../components/ui/Alert';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { useChamados } from '../hooks/useChamados';
import { ehUrgente } from '../domain/risco';
import { STATUS, estaFinalizado, filtrarChamados, idDoChamado } from '../domain/chamados';
import { primeiroNome } from '../domain/cadastro';
import { PAPEIS } from '../domain/perfis';

function PainelACS() {
  const { nome, usuario } = useAuth();
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
      emAtendimento: chamados.filter((c) => c.status === STATUS.EM_ANDAMENTO || c.status === STATUS.COLETADO).length,
      todos: chamados.length,
    }),
    [chamados],
  );

  return (
    <div className="container-app">
      <CabecalhoPainel
        sobrelinha="Painel do agente comunitário"
        titulo="Fila de visitas"
        kpis={[
          { rotulo: 'Em aberto', valor: contagens.abertos, icone: ClipboardList, detalhe: 'esperando visita ou coleta' },
          { rotulo: 'Urgentes', valor: contagens.urgentes, icone: Siren, destaque: contagens.urgentes > 0, detalhe: 'tosse há 21 dias ou mais' },
          { rotulo: 'Em atendimento', valor: contagens.emAtendimento, icone: Stethoscope, detalhe: 'visita iniciada ou amostra colhida' },
          { rotulo: 'Concluídos', valor: contagens.concluidos, icone: CheckCircle2, detalhe: 'chamados encerrados' },
        ]}
      >
        {`Bom plantão, ${primeiroNome(nome) || usuario?.email || 'agente'}. `}Os casos de tosse há 21 dias ou mais aparecem primeiro.
      </CabecalhoPainel>

      <div className="space-y-5 py-8">
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
            <div className="painel">
              <EmptyState icone={ClipboardCheck} titulo={chamados.length ? 'Nada neste filtro' : 'Nenhum chamado por enquanto'}>
                {chamados.length
                  ? 'Troque o filtro ou limpe a busca para ver os outros chamados.'
                  : 'Quando um morador fizer a autotriagem, o chamado aparece aqui.'}
              </EmptyState>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {visiveis.map((c, i) => (
                <Revelar as="li" key={idDoChamado(c)} atraso={Math.min(i, 5) * 60}>
                  <ChamadoCard chamado={c} aoAtualizar={atualizarStatus} atualizando={atualizandoId === idDoChamado(c)} />
                </Revelar>
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
