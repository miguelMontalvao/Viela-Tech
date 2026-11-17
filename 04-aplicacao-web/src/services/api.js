import { supabase } from './supabaseClient';

// Os nomes das chaves vêm da primeira versão do projeto (CANYON) e foram mantidos
// para não perder triagens já guardadas nos aparelhos.
export const TRIAGENS_KEY = 'canyon_triagens_pendentes';
const SYNC_QUEUE_KEY = 'canyon_sync_queue';
const CHAMADOS_CACHE_KEY = 'canyon_chamados_locais';

/** Remove do aparelho os dados de saúde em cache da equipe (usado ao sair da conta). */
export function limparDadosLocaisDaEquipe() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(CHAMADOS_CACHE_KEY);
  } catch (error) {
    console.error('Não foi possível limpar o cache local.', error);
  }
}

/** @typedef {{ id?: string|number, morador_nome: string, setor_viela: string, dias_tosse: number, tem_febre: boolean, tem_sudorese: boolean, prioridade_alta?: boolean, status?: string, created_at?: string, _localId?: string, _offline?: boolean }} Triagem */

/** @returns {boolean} */
function estaOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/** Lê JSON do LocalStorage sem propagar conteúdo inválido. @template T @param {string} key @param {T} fallback @returns {T} */
function lerLocal(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const valor = localStorage.getItem(key);
    return valor ? JSON.parse(valor) : fallback;
  } catch (error) {
    console.error(`Não foi possível ler ${key} do LocalStorage.`, error);
    return fallback;
  }
}

/** Grava JSON no LocalStorage. @param {string} key @param {unknown} valor @returns {boolean} */
function gravarLocal(key, valor) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`Não foi possível gravar ${key} no LocalStorage.`, error);
    return false;
  }
}

/** Id da conta logada neste aparelho, ou null para quem usa sem conta. */
async function usuarioAtual() {
  try {
    const { data } = (await supabase.auth?.getSession?.()) ?? {};
    return data?.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Papel (morador, acs ou gestor) da conta logada; null quando não dá para saber. */
async function papelDe(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.from('perfis').select('papel').eq('id', userId).maybeSingle();
    return error ? null : data?.papel ?? null;
  } catch {
    return null;
  }
}

/** @returns {string} */
function novoIdLocal() {
  return `local-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

/** @param {Triagem} dados */
function normalizarTriagem(dados) {
  return {
    ...dados,
    prioridade_alta: Number(dados.dias_tosse) >= 21,
    status: dados.status ?? 'PENDENTE',
  };
}

/** Registra uma triagem; sem rede ou em caso de erro, guarda para envio posterior. @param {Triagem} dados */
export async function salvarTriagemMorador(dados) {
  try {
    const triagem = normalizarTriagem(dados);
    if (!estaOnline()) throw new Error('Dispositivo sem conexão.');

    // Sem .select(): quem envia sem conta não tem permissão de leitura (LGPD),
    // e a tela de resultado usa apenas os dados que o próprio morador digitou.
    const { error } = await supabase.from('chamados_coleta').insert(triagem);
    if (error) throw error;
    return { data: triagem, error: null, offline: false };
  } catch (error) {
    console.error('Falha ao salvar triagem no Supabase; armazenando localmente.', error);
    const pendentes = lerLocal(TRIAGENS_KEY, []);
    const local = {
      ...normalizarTriagem(dados),
      _localId: novoIdLocal(),
      _offline: true,
      // Quem criou a triagem: só essa mesma conta (ou o uso sem conta) a envia depois,
      // para a triagem não ficar ligada a outra pessoa num celular compartilhado.
      _autor: await usuarioAtual(),
      created_at: new Date().toISOString(),
    };
    const salvo = gravarLocal(TRIAGENS_KEY, [...pendentes, local]);
    return { data: local, error: salvo ? null : error, offline: true };
  }
}

/** Busca chamados remotos e mescla os registros ainda não sincronizados do dispositivo. */
export async function buscarChamadosACS() {
  try {
    let chamadosBanco = [];
    if (estaOnline()) {
      const { data, error } = await supabase
        .from('chamados_coleta')
        .select('*')
        .order('prioridade_alta', { ascending: false })
        .order('status', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      chamadosBanco = data ?? [];
    }
    const locais = lerLocal(TRIAGENS_KEY, []);
    const cache = lerLocal(CHAMADOS_CACHE_KEY, []);
    const locaisPorId = new Map(cache.map((item) => [String(item.id), item]));
    const remotosMesclados = chamadosBanco.map((item) => ({ ...item, ...(locaisPorId.get(String(item.id)) ?? {}) }));
    const idsRemotos = new Set(chamadosBanco.map((item) => String(item.id)));
    const pendentes = locais.filter((item) => !item.id || !idsRemotos.has(String(item.id)));
    const cacheSemRepeticao = cache.filter((item) => !idsRemotos.has(String(item.id)) && !pendentes.some((p) => p._localId && p._localId === item._localId));
    return { data: [...remotosMesclados, ...cacheSemRepeticao, ...pendentes], error: null };
  } catch (error) {
    console.error('Falha ao buscar chamados.', error);
    return { data: [...lerLocal(CHAMADOS_CACHE_KEY, []), ...lerLocal(TRIAGENS_KEY, [])], error };
  }
}

/** Atualiza status remoto ou registra a alteração para sincronização. @param {string|number} id @param {'EM_ANDAMENTO'|'COLETADO'|'CONCLUÍDO'} novoStatus */
export async function atualizarStatusChamado(id, novoStatus) {
  const statusPermitidos = ['EM_ANDAMENTO', 'COLETADO', 'CONCLUÍDO'];
  if (!statusPermitidos.includes(novoStatus)) {
    return { data: null, error: new Error(`Status inválido: ${novoStatus}`), offline: false };
  }

  try {
    if (!estaOnline() || String(id).startsWith('local-')) throw new Error('Atualização aguardando sincronização.');
    const { data, error } = await supabase
      .from('chamados_coleta')
      .update({ status: novoStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null, offline: false };
  } catch (error) {
    console.warn('Status ficará salvo localmente até a sincronização.', error);
    const fila = lerLocal(SYNC_QUEUE_KEY, []);
    const chave = String(id);
    const filaAtualizada = [...fila.filter((item) => String(item.id) !== chave), { id, novoStatus }];
    gravarLocal(SYNC_QUEUE_KEY, filaAtualizada);

    const pendentes = lerLocal(TRIAGENS_KEY, []);
    const pendentesAtualizados = pendentes.map((item) =>
      String(item._localId) === chave || String(item.id) === chave ? { ...item, status: novoStatus } : item,
    );
    gravarLocal(TRIAGENS_KEY, pendentesAtualizados);
    const cache = lerLocal(CHAMADOS_CACHE_KEY, []);
    const encontrado = cache.some((item) => String(item.id) === chave || String(item._localId) === chave);
    const cacheAtualizado = encontrado
      ? cache.map((item) => String(item.id) === chave || String(item._localId) === chave ? { ...item, status: novoStatus } : item)
      : [...cache, { id, ...(String(id).startsWith('local-') ? { _localId: String(id) } : {}), status: novoStatus, _offline: true }];
    gravarLocal(CHAMADOS_CACHE_KEY, cacheAtualizado);
    return { data: { id, status: novoStatus }, error: null, offline: true };
  }
}

/** Envia primeiro triagens pendentes e depois as atualizações de status acumuladas. */
export async function sincronizarPendenciasOffline() {
  if (!estaOnline()) return { sincronizados: 0, error: new Error('Dispositivo sem conexão.') };
  let sincronizados = 0;
  try {
    const autor = await usuarioAtual();
    const pendentes = lerLocal(TRIAGENS_KEY, []);
    const aindaPendentes = [];
    const deOutraConta = [];
    const idsSincronizados = new Map();

    for (const item of pendentes) {
      const { _localId, _offline, _autor, ...registro } = item;
      // Triagens antigas não têm `_autor` e seguem o comportamento anterior.
      if (_autor !== undefined && _autor !== autor) {
        deOutraConta.push(item);
        continue;
      }
      try {
        if (autor) {
          // Com conta, o envio devolve o id definitivo (morador lê as próprias; a equipe lê todas).
          // Ele é usado pelas mudanças de status feitas antes da sincronização.
          const { data, error } = await supabase.from('chamados_coleta').insert(registro).select('id').single();
          if (error) throw error;
          if (_localId) idsSincronizados.set(String(_localId), data.id);
        } else {
          // Sem conta: sem .select(), não depende de permissão de leitura.
          const { error } = await supabase.from('chamados_coleta').insert(registro);
          if (error) throw error;
          if (_localId) idsSincronizados.set(String(_localId), null);
        }
        sincronizados += 1;
      } catch (error) {
        console.error('Triagem pendente não foi sincronizada.', error);
        aindaPendentes.push(item);
      }
    }
    gravarLocal(TRIAGENS_KEY, [...aindaPendentes, ...deOutraConta]);

    const fila = lerLocal(SYNC_QUEUE_KEY, []);
    const filaRestante = [];
    const idsAtualizados = new Set();
    let papel;
    for (const item of fila) {
      try {
        const id = idsSincronizados.get(String(item.id)) ?? item.id;
        if (String(id).startsWith('local-')) throw new Error('O chamado ainda não foi sincronizado.');
        const { data, error } = await supabase
          .from('chamados_coleta')
          .update({ status: item.novoStatus })
          .eq('id', id)
          .select('id');
        if (error) throw error;
        if (!data?.length) {
          // Nada foi atualizado: ou falta a sessão da equipe (o RLS não devolve erro),
          // ou o chamado foi excluído depois da mudança offline. A equipe lê todos os
          // chamados, então, com sessão da equipe, dá para saber se ele ainda existe.
          papel ??= await papelDe(autor);
          if (papel !== 'acs' && papel !== 'gestor') throw new Error('Nenhum chamado foi atualizado (sessão da equipe ausente).');
          const { data: existe, error: erroBusca } = await supabase.from('chamados_coleta').select('id').eq('id', id).maybeSingle();
          if (erroBusca || existe) throw erroBusca ?? new Error('O chamado não pôde ser atualizado.');
          console.warn(`O chamado ${id} foi excluído; a mudança de status pendente foi descartada.`);
          idsAtualizados.add(String(item.id));
          continue;
        }
        idsAtualizados.add(String(item.id));
        sincronizados += 1;
      } catch (error) {
        console.error('Atualização de status não foi sincronizada.', error);
        filaRestante.push(item);
      }
    }
    gravarLocal(SYNC_QUEUE_KEY, filaRestante);
    // Remove as cópias de cache cuja versão oficial já está confirmada no servidor.
    const idsLocaisSincronizados = new Set(idsSincronizados.keys());
    const cache = lerLocal(CHAMADOS_CACHE_KEY, []);
    gravarLocal(
      CHAMADOS_CACHE_KEY,
      cache.filter((item) => !idsAtualizados.has(String(item.id)) && !idsAtualizados.has(String(item._localId)) && !idsLocaisSincronizados.has(String(item._localId))),
    );
    const falhou = aindaPendentes.length > 0 || filaRestante.length > 0;
    return {
      sincronizados,
      error: falhou ? new Error('Algumas pendências permaneceram no dispositivo para nova tentativa.') : null,
    };
  } catch (error) {
    console.error('Falha na sincronização offline.', error);
    return { sincronizados, error };
  }
}

/**
 * Exclui uma triagem do banco (o "D" do CRUD).
 * O RLS só permite excluir as próprias triagens (morador) ou qualquer uma (gestor).
 * @param {string|number} id
 */
export async function excluirTriagem(id) {
  try {
    if (!estaOnline()) throw new Error('Sem conexão. Tente excluir quando a internet voltar.');
    const { data, error } = await supabase.from('chamados_coleta').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('A triagem não foi encontrada ou você não tem permissão para excluí-la.');
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Falha ao excluir a triagem.', error);
    return { data: null, error };
  }
}

/** Retorna a leitura mais recente de microclima. */
export async function buscarUltimaLeituraMicroclima() {
  try {
    if (!estaOnline()) throw new Error('Dispositivo sem conexão.');
    const { data, error } = await supabase
      .from('leituras_microclima')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Falha ao buscar a leitura mais recente de microclima.', error);
    return { data: null, error };
  }
}
