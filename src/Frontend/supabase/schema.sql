-- =====================================================================
-- Viela Tech — schema do Supabase (PostgreSQL)
-- Execute no SQL Editor do projeto Supabase.
-- As colunas seguem exatamente os contratos de src/services/api.js.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Chamados de coleta (autotriagem do morador)
-- ---------------------------------------------------------------------
create table if not exists public.chamados_coleta (
  id               bigint generated always as identity primary key,
  morador_nome     text        not null check (char_length(morador_nome) between 2 and 80),
  setor_viela      text        not null check (char_length(setor_viela) between 2 and 80),
  dias_tosse       integer     not null check (dias_tosse between 0 and 365),
  tem_febre        boolean     not null default false,
  tem_sudorese     boolean     not null default false,
  prioridade_alta  boolean     not null default false,
  status           text        not null default 'PENDENTE'
                   check (status in ('PENDENTE', 'EM_ANDAMENTO', 'COLETADO', 'CONCLUÍDO')),
  created_at       timestamptz not null default now()
);

-- Regra de negócio garantida também no banco: tosse >= 21 dias é prioridade.
create or replace function public.definir_prioridade_chamado()
returns trigger language plpgsql as $$
begin
  new.prioridade_alta := new.dias_tosse >= 21;
  return new;
end;
$$;

drop trigger if exists trg_prioridade_chamado on public.chamados_coleta;
create trigger trg_prioridade_chamado
  before insert or update of dias_tosse on public.chamados_coleta
  for each row execute function public.definir_prioridade_chamado();

create index if not exists idx_chamados_fila
  on public.chamados_coleta (prioridade_alta desc, status, created_at desc);

-- ---------------------------------------------------------------------
-- 2. Leituras de microclima (ESP32 → ThingSpeak → Supabase)
-- ---------------------------------------------------------------------
create table if not exists public.leituras_microclima (
  id          bigint generated always as identity primary key,
  umidade     numeric(5,2) check (umidade between 0 and 100),
  insolacao   numeric(5,2) check (insolacao between 0 and 100),
  ivm         numeric(5,2) check (ivm between 0 and 100),
  created_at  timestamptz not null default now()
);

create index if not exists idx_leituras_recentes on public.leituras_microclima (created_at desc);

-- ---------------------------------------------------------------------
-- 3. Segurança (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.chamados_coleta     enable row level security;
alter table public.leituras_microclima enable row level security;

-- Morador (anônimo) pode registrar a própria triagem.
drop policy if exists "morador registra triagem" on public.chamados_coleta;
create policy "morador registra triagem" on public.chamados_coleta
  for insert to anon
  with check (status = 'PENDENTE');

-- salvarTriagemMorador() faz insert().select().single(), então o anônimo precisa
-- ler a linha recém-criada. A leitura fica limitada aos últimos 2 minutos para
-- reduzir a exposição. Ver "Limitações conhecidas" no README do front-end.
drop policy if exists "morador confirma envio recente" on public.chamados_coleta;
create policy "morador confirma envio recente" on public.chamados_coleta
  for select to anon
  using (created_at > now() - interval '2 minutes');

-- Equipe de saúde (usuários do Supabase Auth): leitura, atualização e
-- inserção (triagens feitas no aparelho do ACS e sincronizadas depois).
drop policy if exists "equipe le chamados" on public.chamados_coleta;
create policy "equipe le chamados" on public.chamados_coleta
  for select to authenticated using (true);

drop policy if exists "equipe atualiza chamados" on public.chamados_coleta;
create policy "equipe atualiza chamados" on public.chamados_coleta
  for update to authenticated using (true) with check (true);

drop policy if exists "equipe registra chamados" on public.chamados_coleta;
create policy "equipe registra chamados" on public.chamados_coleta
  for insert to authenticated with check (true);

-- Microclima: leitura para a equipe. A gravação é feita com a service_role
-- (script de integração), que ignora RLS.
drop policy if exists "equipe le microclima" on public.leituras_microclima;
create policy "equipe le microclima" on public.leituras_microclima
  for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- 4. Seed opcional: leituras reais do canal ThingSpeak 3571901,
--    copiadas de python/historico.json (não são dados inventados).
-- ---------------------------------------------------------------------
-- insert into public.leituras_microclima (umidade, insolacao, ivm, created_at) values
--   (53.0, 24.44, 62.02, '2026-11-09T13:26:01Z'),
--   (53.0, 24.44, 62.02, '2026-11-09T13:26:27Z'),
--   (79.5, 95.53, 49.49, '2026-11-09T13:26:47Z'),
--   (79.5, 95.09, 49.66, '2026-11-09T14:41:09Z');
