# AI.md: registro do uso de Inteligência Artificial

> **Projeto:** Viela Tech, plataforma cívica de inteligência urbana e vigilância em saúde
> **Turma:** 1ESSRA · FIAP GS 2026.2

Conforme as diretrizes da FIAP para a Global Solution 2026.2, este documento registra:

- onde a IA generativa foi usada como copiloto;
- o que foi pedido;
- o que ela produziu;
- como a equipe validou o resultado.

## 1. Ferramentas utilizadas

| Ferramenta | Onde foi usada |
|---|---|
| **Gemini 3 Flash** (Google) | brainstorm do problema, escopo epidemiológico, requisitos e regras de negócio, correção do driver MicroPython do ESP32 |
| **Codex** (OpenAI) | módulo de Matemática: cálculos, gráficos, relatório técnico e testes automatizados |
| **Claude Code** (Anthropic, modelo Claude Opus 5.5) | aplicação web em React, publicação na Vercel e Supabase, e a auditoria final de todas as entregas |
| Ferramenta de geração de imagem | ilustração da Rocinha ao pôr do sol usada na Home. **A equipe deve registrar qual ferramenta foi usada.** |

## 2. Principais prompts e finalidades

### A. Definição do problema e contexto urbano (Gemini)

- **Prompt:** *"Pesquise problemas reais da cidade do Rio de Janeiro envolvendo saneamento ou habitabilidade que possam virar um projeto CitizenTech com ODS."*
- **Resultado:** identificação dos *cânions urbanos* da Rocinha. Becos densos bloqueiam sol e ar, a umidade sobe e as taxas de tuberculose são altas.
- **Validação:** os números usados no produto foram conferidos nas fontes originais (Betim, 2015, e boletim da SMS-RJ, 2023) e aparecem com link.

### B. Requisitos e backlog do produto (Gemini)

- **Prompt:** *"Gere a estrutura de Backlog do Produto MoSCoW e matriz de requisitos para uma plataforma web em React + Tailwind + Supabase focada na triagem de tuberculose e operação offline para Agentes Comunitários de Saúde."*
- **Resultado:** base do documento [`VielaTech-Backlog.pdf`](05-software-tx-design/VielaTech-Backlog.pdf), incluindo a formulação do IVM.
- **Validação:** a equipe revisou e reescreveu o documento. O próprio PDF aponta o risco do sentido da insolação, depois corrigido para `100 − I`.

### C. Erro no MicroPython (Gemini)

- **Prompt:** *"O circuito ESP32 no Wokwi com tela OLED SSD1306 apresentou o erro AttributeError: 'module' object has no attribute 'MONO_VLSB0'. Como corrigir no driver ssd1306.py?"*
- **Resultado:** a constante foi ajustada para `framebuf.MONO_VLSB`.
- **Validação:** o display inicializou na simulação do Wokwi.

### D. Cálculo diferencial e integral do microclima (Codex)

- **Prompt (resumido):**

  > *"Crie o módulo de Matemática em Python com NumPy, pandas, SciPy e Matplotlib. Leia o `relatorio.csv` do Python ou simule 24 horas de microclima usando `IVM(t) = 0,6 U(t) + 0,4 (100 − I(t))`. Calcule as derivadas do IVM e da umidade, a integral do IVM e o tempo na faixa PERIGO (IVM ≥ 70%). Gere `modelo_calculo.py`, `grafico_microclima.png` e um relatório PDF com fórmulas, resultados, interpretação e identificação dos integrantes."*

- **Resultado:** módulo que lê os horários reais do CSV ou usa uma simulação identificada. Ele gera os gráficos de derivadas e integrais e o relatório técnico.
- **Validação:** 12 testes automatizados conferiram os cálculos. O relatório apresenta o IVM como indicador ambiental, sem validação clínica.

### E. Interface React (Claude Code)

**Pedido:** desenvolver o Viela Tech em React + Vite + Tailwind + Supabase + Lucide, com estas condições:

- seguir a paleta oficial;
- ter três áreas (Morador, ACS e Gestor);
- atender aos critérios da FIAP e à WCAG 2.1 AA;
- reaproveitar o `api.js` sem mudar os contratos;
- não inventar dados.

**O que a IA fez:**

- analisou o repositório e propôs um plano, que a equipe aprovou;
- escreveu a camada `domain/`, os custom hooks, os componentes, as páginas e o `schema.sql`;
- testou o app no Chrome.

**Correções que surgiram no caminho:**

- o app caía quando faltava o `.env`;
- o contraste do azul `#0284C7` com texto branco ficava abaixo de AA;
- as triagens guardadas sem sinal não eram reenviadas.

**Publicação:** a pedido da equipe, a IA aplicou o `schema.sql` no Supabase, cadastrou a URL e a chave pública na Vercel e publicou o site. A chave secreta do Supabase não foi acessada.

**Redesign:**

- identidade carioca e logo vetorizada;
- mapa da tuberculose com limites do Data.Rio (licença ODbL), só com números de fonte citada;
- dois logins com perfis e RLS.

**O que a IA não fez:**

- não criou usuários nem digitou senhas;
- não inventou estatísticas de saúde nem dados de pacientes.

### F. Simulador de 24 h e boletim comunitário

- **Origem:** commit `68aa6d6` do Miguel, que adicionou as duas telas ao painel do gestor. **A equipe deve registrar aqui qual ferramenta de IA foi usada e o prompt.**
- **Revisão na auditoria (item G):**
  - o simulador e o boletim tinham a própria fórmula de IVM e uma escala de 4 cores;
  - eles passaram a usar a regra oficial (`domain/risco.js`) e o semáforo de 3 faixas;
  - a lógica foi para `domain/simulacao.js`, com testes;
  - todo valor que não veio do sensor passou a aparecer como "(simulado)".

### G. Auditoria final das 7 entregas (Claude Code, novembro de 2026)

**Pedido da equipe:**

- auditar o projeto contra os requisitos das 7 disciplinas;
- corrigir o que faltasse, sem inventar dados, links ou resultados;
- deixar a raiz organizada em pastas numeradas por entrega.

**O que a IA fez:**

- **Repositório:** reorganizou a raiz em `01-` a `06-` e `docs/`.
- **Edge:**
  - criou a faixa ATENÇÃO e o LED amarelo;
  - corrigiu o sentido do LDR, conferido na documentação do Wokwi;
  - removeu a chave do ThingSpeak do código.
- **Python:**
  - adicionou a normalização e a validação da configuração;
  - corrigiu o backup quando o feed vem vazio;
  - escreveu 26 testes e o README, que traz a saída real do programa.
- **Matemática:** adicionou a seção de limites, a capa e a conclusão ao PDF, e mais 3 testes.
- **Aplicação web:**
  - criou a exclusão de triagens, completando o CRUD;
  - fechou a leitura anônima no banco e adicionou o consentimento obrigatório;
  - passou a limpar o cache ao sair da conta;
  - corrigiu o simulador e o boletim;
  - adicionou o `ErrorBoundary` e ajustes de foco e contraste.
- **Documentação:** escreveu o relatório de status do Software & TX Design, o roteiro do pitch, este README e a matriz de conformidade.

**Como foi validado:**

- todos os testes foram executados (Python 26, Matemática 16, Vitest 24) e o build de produção passou;
- a triagem, o tema e o menu do celular foram conferidos no navegador;
- as consultas ao ThingSpeak, ao GitHub e ao site foram feitas na hora, e os resultados estão em [`docs/matriz-de-conformidade.md`](docs/matriz-de-conformidade.md).

**O que a IA não fez:**

- não publicou nada nem fez push;
- não aplicou a migração no Supabase;
- não trocou chaves nem gerou leituras falsas.

O que depende da equipe está listado na matriz. Nos commits da auditoria, a autoria ficou só com o integrante, a pedido dele; este registro é a declaração do uso de IA nesses commits.

### H. Ilustração da Home

A imagem da Rocinha ao pôr do sol na página inicial foi **gerada por IA**. Ela não é uma fotografia real e está identificada como ilustração em [`04-aplicacao-web/fotos-originais/LEIA-ME.md`](04-aplicacao-web/fotos-originais/LEIA-ME.md).

## 3. Validação humana e aprendizado

- Todo código sugerido por IA passou por execução antes de entrar no repositório:
  - **Edge:** simulação no Wokwi;
  - **Python e Matemática:** execução local e testes automatizados;
  - **Aplicação web:** testes unitários, build e testes no navegador.
- Os números de saúde vêm de fontes públicas citadas, nunca da IA.
- A equipe só considera uma parte validada quando cada integrante consegue explicar como funcionam:
  - a fórmula do IVM;
  - a fila de prioridade;
  - o modo offline;
  - a segurança no banco (RLS).
