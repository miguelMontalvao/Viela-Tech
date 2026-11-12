import { supabase } from './supabaseClient';

const TRIAGENS_KEY = 'canyon_triagens_pendentes';
const SYNC_QUEUE_KEY = 'canyon_sync_queue';
const CHAMADOS_CACHE_KEY = 'canyon_chamados_locais';

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

    const { data, error } = await supabase
      .from('chamados_coleta')
      .insert(triagem)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null, offline: false };
  } catch (error) {
    console.error('Falha ao salvar triagem no Supabase; armazenando localmente.', error);
    const pendentes = lerLocal(TRIAGENS_KEY, []);
    const local = {
      ...normalizarTriagem(dados),
      _localId: novoIdLocal(),
      _offline: true,
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
    const pendentes = lerLocal(TRIAGENS_KEY, []);
    const aindaPendentes = [];
    const idsSincronizados = new Map();

    for (const item of pendentes) {
      try {
        const { _localId, _offline, ...registro } = item;
        const { data, error } = await supabase.from('chamados_coleta').insert(registro).select().single();
        if (error) throw error;
        if (_localId) idsSincronizados.set(String(_localId), data.id);
        sincronizados += 1;
      } catch (error) {
        console.error('Triagem pendente não foi sincronizada.', error);
        aindaPendentes.push(item);
      }
    }
    gravarLocal(TRIAGENS_KEY, aindaPendentes);

    const fila = lerLocal(SYNC_QUEUE_KEY, []);
    const filaRestante = [];
    const idsAtualizados = new Set();
    for (const item of fila) {
      try {
        const id = idsSincronizados.get(String(item.id)) ?? item.id;
        if (String(id).startsWith('local-')) throw new Error('O chamado ainda não foi sincronizado.');
        const { error } = await supabase.from('chamados_coleta').update({ status: item.novoStatus }).eq('id', id);
        if (error) throw error;
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
