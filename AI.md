# AI.md — Registro do Uso de Inteligência Artificial como Copiloto

> **Projeto:** Viela Tech — Plataforma Cívica de Inteligência Urbana e Vigilância em Saúde  
> **Turma:** 1ESSRA — FIAP GS 2026.2  

Em conformidade com as diretrizes da FIAP para a Global Solution 2026.2, este documento detalha como a Inteligência Artificial Generativa foi empregada como ferramenta de copiloto, revisão de código e auxílio na estruturação de documentação durante o desenvolvimento da solução **Viela Tech**.

---

##  1. Ferramentas Utilizadas

* **Gemini 3 Flash (Google):** Utilizado para brainstorm de ideias de CitizenTech aplicadas ao Rio de Janeiro, estruturação do escopo epidemiológico de tuberculose na Rocinha, especificação de requisitos funcionais/não-funcionais, modelagem de regras de negócio e auxílio na correção de código MicroPython para ESP32.
* **Claude Code (Anthropic, modelo Claude Opus 5.5):** Usado como copiloto de programação para montar a aplicação React em `src/Frontend/` a partir da camada de dados que já existia (`api.js`). Os commits feitos com ele têm a linha `Co-Authored-By: Claude` na mensagem, o que deixa claro no histórico o que saiu dessa parceria.

---

##  2. Principais Prompts e Finalidades

### A. Definição do Problema e Contexto Urbano
* **Prompt:** *"Pesquise problemas reais da cidade do Rio de Janeiro envolvendo saneamento ou habitabilidade que possam virar um projeto CitizenTech com ODS."*
* **Resultado Obtido:** Identificação da problemática dos *canyons urbanos* na Favela da Rocinha (alta densidade construtiva nos becos bloqueando luz solar e ar, gerando alta umidade e elevadas taxas de tuberculose).

### B. Especificação de Requisitos e Backlog do Produto (Software Design)
* **Prompt:** *"Gere a estrutura de Backlog do Produto MoSCoW e matriz de requisitos para uma plataforma web em React + Tailwind + Supabase focada na triagem de tuberculose e operação offline para Agentes Comunitários de Saúde."*
* **Resultado Obtido:** Base completa para o documento ABNT (`VielaTech-Backlog.pdf`), incluindo a formulação do Índice de Vulnerabilidade de Microclima ($IVM$).

### C. Resolução de Erros no MicroPython (Edge Computing)
* **Prompt:** *"O circuito ESP32 no Wokwi com tela OLED SSD1306 apresentou o erro AttributeError: 'module' object has no attribute 'MONO_VLSB0'. Como corrigir no driver ssd1306.py?"*
* **Resultado Obtido:** Ajuste da constante para `framebuf.MONO_VLSB`, corrigindo a inicialização da tela I2C no MicroPython.

### D. Integração com Banco de Dados e Suporte Offline (Front-end & Web Dev)
- **Prompt:** *"Crie os arquivos src/services/supabaseClient.js e api.js para integrar o React ao Supabase, aplicando a prioridade por tempo de tosse e salvamento em LocalStorage para operação offline."*
- **Resultado Obtido:** Geração da camada de integração com a base PostgreSQL, suporte à operação sem sinal de dados (RN-04) e rotina de sincronização automática ao reconectar.

### E. Construção da interface React (Front-end Design & Web Development)
* **Pedido feito ao Claude Code:** desenvolver o Viela Tech em React + Vite + Tailwind + Supabase + Lucide, seguindo a paleta oficial, as três áreas (Morador, ACS e Gestor), os critérios da FIAP e WCAG 2.1 AA, reaproveitando o `api.js` sem mudar os contratos e sem inventar dados. Depois pedimos para organizar tudo em `src/Frontend/`, porque o repositório tem outras entregas.
* **O que a IA fez:**
  * analisou o repositório antes de mexer;
  * propôs um plano, que a equipe aprovou, e fez perguntas onde havia decisão nossa a tomar (como seria o login, o que fazer sem credenciais do Supabase e como organizar os commits);
  * escreveu a camada `domain/`, os custom hooks, os componentes e as páginas;
  * criou o `schema.sql` a partir dos contratos e testou o app no Chrome em modo headless.
* **Decisões e correções que surgiram no caminho:**
  * O `supabaseClient.js` derrubava o app quando faltava o `.env`. Foi ajustado para cair no modo local que o `api.js` já oferecia.
  * Texto branco sobre o azul `#0284C7` não atinge o contraste AA. Os botões passaram a usar o tom 700 da mesma família.
  * Triagens do morador guardadas sem sinal não eram reenviadas por ninguém. Foi criado o reenvio automático, com uma trava para não duplicar registros.
  * Como o `insert().select()` do `api.js` exige leitura logo após a gravação, a política RLS do morador anônimo foi limitada a registros recentes. A limitação está documentada no README do front-end.
* **O que a IA não fez:** não criou o projeto no Supabase, não usou credenciais reais e não publicou nada no GitHub. Também não inventou estatísticas de saúde nem dados de pacientes. Os nomes que aparecem nos testes eram fictícios e ficaram fora do repositório.

---

##  3. Validação Humana e Aprendizado

As sugestões de código e as estruturas geradas por IA passam por revisão da equipe antes de irem para o branch principal. Nas entregas de Edge, Python e Matemática, o código foi simulado no Wokwi ou executado localmente antes de entrar no repositório. No front-end, a aplicação passou por:

- testes unitários das regras de negócio (`npm test`);
- build de produção sem erros;
- testes de ponta a ponta das três áreas, nos temas claro e escuro, em celular (375px) e desktop.

Mesmo assim, consideramos o código do front-end validado só depois que cada integrante leu as partes principais e conseguiu explicar como a fila de prioridade, o modo offline e o cálculo do IVM funcionam.