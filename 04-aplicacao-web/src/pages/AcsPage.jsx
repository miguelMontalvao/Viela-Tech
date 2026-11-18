import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, ClipboardList, LayoutGrid, Rows3, Siren, Stethoscope } from 'lucide-react';
import { CabecalhoPainel } from '../components/painel/Painel';
import { Revelar } from '../components/home/Efeitos';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ChamadoCard } from '../components/acs/ChamadoCard';
import { ChamadoLinha } from '../components/acs/ChamadoLinha';
import { ChamadosFilter } from '../components/acs/ChamadosFilter';
import { SyncBar } from '../components/acs/SyncBar';
import { Alert } from '../components/ui/Alert';
import { EmptyState, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../hooks/useAuth';
import { useChamados } from '../hooks/useChamados';
import { ehUrgente } from '../domain/risco';
import { STATUS, agruparChamados, estaFinalizado, filtrarChamados, idDoChamado } from '../domain/chamados';
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
  const [visao, setVisao] = useState(() => {
    try {
      return localStorage.getItem('viela_visao_chamados') === 'lista' ? 'lista' : 'cards';
    } catch {
      return 'cards';
    }
  });
  const mudarVisao = (v) => {
    setVisao(v);
    try {
      localStorage.setItem('viela_visao_chamados', v);
    } catch {
      /* sem armazenamento: a escolha vale só nesta sessão */
    }
  };

  const visiveis = useMemo(() => filtrarChamados(chamados, { filtro, busca }), [chamados, filtro, busca]);
  const grupos = useMemo(() => agruparChamados(visiveis), [visiveis]);
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
                <button type="button" onClick={limparMensagem} className="min-h-toque rounded-xl px-3 text-sm font-semibold underline">
                  Fechar
                </button>
              }
            >
              {mensagem.texto}
            </Alert>
          )}
          {erro && <Alert tipo="aviso">{erro}</Alert>}
        </div>

        <div className="sticky top-16 z-20 -mx-4 space-y-3 bg-slate-50/90 px-4 py-3 backdrop-blur dark:bg-slate-950/90 sm:mx-0 sm:rounded-2xl sm:px-3">
          <ChamadosFilter filtro={filtro} aoMudarFiltro={setFiltro} busca={busca} aoMudarBusca={setBusca} contagens={contagens} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm texto-suave" aria-live="polite">
              {visiveis.length} {visiveis.length === 1 ? 'chamado' : 'chamados'}
            </p>
            <div role="group" aria-label="Modo de exibição" className="inline-flex gap-1 rounded-2xl bg-slate-900/5 p-1 dark:bg-white/5">
              {[
                { id: 'cards', rotulo: 'Cards', icone: LayoutGrid },
                { id: 'lista', rotulo: 'Lista', icone: Rows3 },
              ].map(({ id, rotulo, icone: Icone }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={visao === id}
                  onClick={() => mudarVisao(id)}
                  className={`inline-flex min-h-toque items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                    visao === id ? 'bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-700 dark:ring-white/10' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden="true" /> {rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            <div className="space-y-8">
              {grupos.map((g) => (
                <section key={g.id} aria-labelledby={`grupo-${g.id}`}>
                  <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 id={`grupo-${g.id}`} className="flex items-center gap-2 text-lg font-semibold">
                      {g.id === 'urgentes' && <Siren className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />}
                      {g.rotulo}
                      <span className={`min-w-7 rounded-full px-2 text-center text-sm tabular-nums leading-7 ${g.id === 'urgentes' ? 'bg-red-600 text-white' : 'bg-slate-900/5 dark:bg-white/10'}`}>
                        {g.itens.length}
                      </span>
                    </h2>
                    <p className="text-sm texto-suave">{g.descricao}</p>
                  </header>
                  <ul className={visao === 'cards' ? 'grid gap-5 md:grid-cols-2 2xl:grid-cols-3' : 'space-y-3'}>
                    {g.itens.map((c, i) => (
                      <Revelar as="li" key={idDoChamado(c)} atraso={Math.min(i, 5) * 40} className={visao === 'cards' ? '' : 'list-none'}>
                        {visao === 'cards' ? (
                          <ChamadoCard chamado={c} aoAtualizar={atualizarStatus} atualizando={atualizandoId === idDoChamado(c)} />
                        ) : (
                          <ChamadoLinha chamado={c} aoAtualizar={atualizarStatus} atualizando={atualizandoId === idDoChamado(c)} />
                        )}
                      </Revelar>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
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
