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
-- 3. Perfis de acesso: morador, acs, gestor
--    Toda conta nova nasce como "morador". ACS e gestor são definidos
--    pela coordenação direto no Supabase (Table Editor → perfis → papel).
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text check (nome is null or char_length(nome) between 1 and 80),
  papel       text not null default 'morador' check (papel in ('morador', 'acs', 'gestor')),
  created_at  timestamptz not null default now()
);

-- Cria o perfil automaticamente a cada cadastro (nome vem do formulário de cadastro).
create or replace function public.criar_perfil_novo_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, nullif(left(trim(new.raw_user_meta_data ->> 'nome'), 80), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_criar_perfil on auth.users;
create trigger trg_criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Contas que já existiam antes desta versão viram "morador".
insert into public.perfis (id, nome)
select u.id, nullif(left(trim(u.raw_user_meta_data ->> 'nome'), 80), '')
from auth.users u
on conflict (id) do nothing;

-- Papel de quem está logado (usado nas políticas). security definer evita recursão de RLS.
create or replace function public.papel_atual()
returns text language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid();
$$;

-- Liga a triagem à conta do morador logado. Triagem anônima ou registrada pela equipe fica sem dono.
alter table public.chamados_coleta add column if not exists morador_id uuid references auth.users (id) on delete set null;
create index if not exists idx_chamados_morador on public.chamados_coleta (morador_id);

create or replace function public.definir_dono_chamado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.morador_id := case when public.papel_atual() = 'morador' then auth.uid() else null end;
  return new;
end;
$$;

drop trigger if exists trg_dono_chamado on public.chamados_coleta;
create trigger trg_dono_chamado
  before insert on public.chamados_coleta
  for each row execute function public.definir_dono_chamado();

-- ---------------------------------------------------------------------
-- 4. Segurança (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.chamados_coleta     enable row level security;
alter table public.leituras_microclima enable row level security;
alter table public.perfis              enable row level security;

-- Políticas antigas (versão sem perfis)
drop policy if exists "equipe le chamados" on public.chamados_coleta;
drop policy if exists "equipe atualiza chamados" on public.chamados_coleta;
drop policy if exists "equipe registra chamados" on public.chamados_coleta;
drop policy if exists "equipe le microclima" on public.leituras_microclima;

-- Visitante anônimo: registra a triagem sem conta.
drop policy if exists "morador registra triagem" on public.chamados_coleta;
create policy "morador registra triagem" on public.chamados_coleta
  for insert to anon
  with check (status = 'PENDENTE');

-- salvarTriagemMorador() faz insert().select().single(), então o anônimo precisa
-- ler a linha recém-criada. A leitura fica limitada aos últimos 2 minutos e a
-- linhas sem dono. Ver "Limitações conhecidas" no README do front-end.
drop policy if exists "morador confirma envio recente" on public.chamados_coleta;
create policy "morador confirma envio recente" on public.chamados_coleta
  for select to anon
  using (created_at > now() - interval '2 minutes' and morador_id is null);

-- Morador com conta: registra e vê só as próprias triagens.
drop policy if exists "morador logado registra triagem" on public.chamados_coleta;
create policy "morador logado registra triagem" on public.chamados_coleta
  for insert to authenticated
  with check (public.papel_atual() = 'morador' and status = 'PENDENTE');

drop policy if exists "morador ve as proprias triagens" on public.chamados_coleta;
create policy "morador ve as proprias triagens" on public.chamados_coleta
  for select to authenticated
  using (morador_id = auth.uid());

-- Equipe (ACS e gestor): lê, registra e atualiza todos os chamados.
drop policy if exists "equipe le todos os chamados" on public.chamados_coleta;
create policy "equipe le todos os chamados" on public.chamados_coleta
  for select to authenticated
  using (public.papel_atual() in ('acs', 'gestor'));

drop policy if exists "equipe registra chamados por papel" on public.chamados_coleta;
create policy "equipe registra chamados por papel" on public.chamados_coleta
  for insert to authenticated
  with check (public.papel_atual() in ('acs', 'gestor'));

drop policy if exists "equipe atualiza chamados por papel" on public.chamados_coleta;
create policy "equipe atualiza chamados por papel" on public.chamados_coleta
  for update to authenticated
  using (public.papel_atual() in ('acs', 'gestor'))
  with check (public.papel_atual() in ('acs', 'gestor'));

-- Microclima: leitura para a equipe. A gravação é feita com a service_role
-- (script de integração), que ignora RLS.
drop policy if exists "equipe le microclima por papel" on public.leituras_microclima;
create policy "equipe le microclima por papel" on public.leituras_microclima
  for select to authenticated
  using (public.papel_atual() in ('acs', 'gestor'));

-- Perfis: cada pessoa lê só o próprio. Não há política de insert/update:
-- ninguém muda o próprio papel pela API.
drop policy if exists "cada um le o proprio perfil" on public.perfis;
create policy "cada um le o proprio perfil" on public.perfis
  for select to authenticated
  using (id = auth.uid());

-- Para tornar alguém da equipe (rode no SQL Editor, trocando o e-mail):
-- update public.perfis set papel = 'acs'    where id = (select id from auth.users where email = 'agente@exemplo.com');
-- update public.perfis set papel = 'gestor' where id = (select id from auth.users where email = 'gestor@exemplo.com');

-- ---------------------------------------------------------------------
-- 5. Seed opcional: leituras reais do canal ThingSpeak 3571901,
--    copiadas de python/historico.json (não são dados inventados).
-- ---------------------------------------------------------------------
-- insert into public.leituras_microclima (umidade, insolacao, ivm, created_at) values
--   (53.0, 24.44, 62.02, '2026-11-09T13:26:01Z'),
--   (53.0, 24.44, 62.02, '2026-11-09T13:26:27Z'),
--   (79.5, 95.53, 49.49, '2026-11-09T13:26:47Z'),
--   (79.5, 95.09, 49.66, '2026-11-09T14:41:09Z');
