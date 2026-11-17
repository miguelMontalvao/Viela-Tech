-- =====================================================================
-- Viela Tech — migração da auditoria final (17/11/2026)
-- Rode UMA vez no SQL Editor do Supabase de um projeto que já tinha o
-- schema anterior. É idempotente: pode ser executada de novo sem efeito.
-- =====================================================================

-- 1. Privacidade (LGPD): o visitante anônimo deixava de ver as triagens só
--    depois de 2 minutos. Qualquer pessoa podia consultar a tabela nesse
--    intervalo e ler nome e sintomas de triagens alheias. O app não precisa
--    mais dessa leitura (insert sem .select()).
drop policy if exists "morador confirma envio recente" on public.chamados_coleta;

-- 2. Exclusão (o "D" do CRUD e o direito de eliminação da LGPD).
drop policy if exists "morador exclui as proprias triagens" on public.chamados_coleta;
create policy "morador exclui as proprias triagens" on public.chamados_coleta
  for delete to authenticated
  using (morador_id = auth.uid());

drop policy if exists "gestor exclui chamados" on public.chamados_coleta;
create policy "gestor exclui chamados" on public.chamados_coleta
  for delete to authenticated
  using (public.papel_atual() = 'gestor');

-- 3. Temperatura do DHT22 (field4 do ThingSpeak), caso ainda não exista.
alter table public.leituras_microclima
  add column if not exists temperatura numeric(5,2) check (temperatura between -40 and 125);
