-- =====================================================================
-- Viela Tech — DADOS DE APRESENTAÇÃO (fictícios) para a gravação do site
-- Rode no SQL Editor do Supabase. Todos os nomes e relatos são inventados;
-- nenhuma pessoa real aparece aqui (só primeiro nome ou apelido, como o
-- próprio formulário pede).
--
-- Para remover depois da gravação, rode o bloco "LIMPEZA" no fim do arquivo.
-- A prioridade (tosse >= 21 dias) é calculada pelo gatilho do banco.
-- =====================================================================

-- Evita duplicar se o script for rodado duas vezes.
delete from public.chamados_coleta
where morador_nome in (select nome from (values
  ('Dona Maria'),('Seu Jorge'),('Aline'),('Ricardo'),('Josefa'),('Marcos'),('Luciana'),('Paulo César'),
  ('Tainá'),('Cleide'),('Wellington'),('Fátima'),('Rogério'),('Vanessa'),('Seu Antônio'),('Bruna'),
  ('Edson'),('Dona Neuza'),('Thiago'),('Carla'),('Lúcio'),('Priscila'),('Dona Rita'),('Anderson'),
  ('Michele'),('Geraldo'),('Simone'),('Felipe')
) as t(nome));

insert into public.chamados_coleta
  (morador_nome, setor_viela, dias_tosse, tem_febre, tem_sudorese, status, created_at)
values
  -- Casos prioritários (tosse há 21 dias ou mais) — a fila do ACS abre com estes
  ('Dona Maria',   'Rua 1',              45, true,  true,  'PENDENTE',     now() - interval '3 hours'),
  ('Seu Jorge',    'Valão',              38, true,  true,  'EM_ANDAMENTO', now() - interval '1 day 2 hours'),
  ('Josefa',       'Cachopa',            30, false, true,  'PENDENTE',     now() - interval '5 hours'),
  ('Paulo César',  'Roupa Suja',         27, true,  false, 'COLETADO',     now() - interval '2 days 4 hours'),
  ('Cleide',       'Rua 2',              60, true,  true,  'EM_ANDAMENTO', now() - interval '20 hours'),
  ('Rogério',      'Largo do Boiadeiro', 22, false, false, 'PENDENTE',     now() - interval '9 hours'),
  ('Seu Antônio',  'Terreirão',          33, true,  true,  'COLETADO',     now() - interval '3 days 1 hour'),
  ('Edson',        'Curva do S',         24, true,  false, 'PENDENTE',     now() - interval '1 day 6 hours'),
  ('Dona Neuza',   'Vila Verde',         52, true,  true,  'CONCLUÍDO',    now() - interval '6 days'),
  ('Anderson',     'Rua 1',              28, false, true,  'PENDENTE',     now() - interval '2 hours'),
  ('Geraldo',      'Bairro Barcelos',    41, true,  true,  'CONCLUÍDO',    now() - interval '9 days'),
  ('Simone',       'Cidade Nova',        21, false, false, 'EM_ANDAMENTO', now() - interval '2 days'),

  -- Tosse recente ou moderada (sem prioridade)
  ('Aline',        'Via Ápia',            7, false, false, 'PENDENTE',     now() - interval '4 hours'),
  ('Ricardo',      'Rua 3',              12, true,  false, 'PENDENTE',     now() - interval '1 day'),
  ('Marcos',       'Laboriaux',           5, false, false, 'CONCLUÍDO',    now() - interval '7 days'),
  ('Luciana',      'Fundação',           15, false, true,  'EM_ANDAMENTO', now() - interval '2 days 9 hours'),
  ('Tainá',        'Dionéia',             3, false, false, 'CONCLUÍDO',    now() - interval '5 days'),
  ('Wellington',   'Portão Vermelho',    10, true,  false, 'PENDENTE',     now() - interval '12 hours'),
  ('Fátima',       'Macega',             18, false, true,  'COLETADO',     now() - interval '4 days'),
  ('Vanessa',      'Rua 4',               9, false, false, 'PENDENTE',     now() - interval '6 hours'),
  ('Bruna',        'Rua 2',               4, false, false, 'CONCLUÍDO',    now() - interval '10 days'),
  ('Thiago',       'Vila Cruzado',       14, true,  false, 'EM_ANDAMENTO', now() - interval '3 days 5 hours'),
  ('Carla',        'Cachopa',             2, false, false, 'CONCLUÍDO',    now() - interval '12 days'),
  ('Lúcio',        'Valão',              19, true,  true,  'PENDENTE',     now() - interval '15 hours'),
  ('Priscila',     'Rua 1',               6, false, false, 'CONCLUÍDO',    now() - interval '8 days'),
  ('Dona Rita',    'Roupa Suja',         16, false, true,  'PENDENTE',     now() - interval '1 day 12 hours'),
  ('Michele',      'Terreirão',           8, false, false, 'CONCLUÍDO',    now() - interval '11 days'),
  ('Felipe',       'Largo do Boiadeiro',  1, false, false, 'CONCLUÍDO',    now() - interval '14 days');

-- Conferência: deve listar 28 linhas, 12 delas com prioridade_alta = true.
-- select status, prioridade_alta, count(*) from public.chamados_coleta group by 1, 2 order by 2 desc, 1;

-- ---------------------------------------------------------------------
-- LIMPEZA (rode depois da gravação; apaga só estes registros fictícios)
-- ---------------------------------------------------------------------
-- delete from public.chamados_coleta
-- where morador_nome in (
--   'Dona Maria','Seu Jorge','Aline','Ricardo','Josefa','Marcos','Luciana','Paulo César',
--   'Tainá','Cleide','Wellington','Fátima','Rogério','Vanessa','Seu Antônio','Bruna',
--   'Edson','Dona Neuza','Thiago','Carla','Lúcio','Priscila','Dona Rita','Anderson',
--   'Michele','Geraldo','Simone','Felipe'
-- );
