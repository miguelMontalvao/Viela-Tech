# prompts.md: prompts de IA usados no Viela Tech

Os combinados da GS pedem que a equipe registre os prompts em um arquivo `prompts.md` e saiba explicar cada linha do que foi gerado. Este arquivo é o índice dos prompts por entrega. O registro completo, com as ferramentas, o que foi gerado e como foi validado, está no [`AI.md`](AI.md).

| Entrega | Ferramenta | Onde estão os prompts |
|---|---|---|
| Problema e contexto | Gemini 3 Flash | [`AI.md` §2.A](AI.md#a-definição-do-problema-e-contexto-urbano-gemini) |
| Software & TX Design (backlog) | Gemini 3 Flash | [`AI.md` §2.B](AI.md#b-requisitos-e-backlog-do-produto-gemini) |
| Edge (ESP32) | Gemini 3 Flash | [`AI.md` §2.C](AI.md#c-erro-no-micropython-gemini) |
| Python | Codex e Gemini 3 Flash | [`02-python/prompts.md`](02-python/prompts.md) |
| Matemática | Codex | [`AI.md` §2.D](AI.md#d-cálculo-diferencial-e-integral-do-microclima-codex) |
| Front-end e Web Dev | Claude Code | [`AI.md` §2.E](AI.md#e-interface-react-claude-code) |
| Simulador e boletim | a registrar pela equipe | [`AI.md` §2.F](AI.md#f-simulador-de-24-h-e-boletim-comunitário) |
| Auditoria final | Claude Code | [`AI.md` §2.G](AI.md#g-auditoria-final-das-7-entregas-claude-code-novembro-de-2026) |

## Prompts principais

**Problema (Gemini):**
> "Pesquise problemas reais da cidade do Rio de Janeiro envolvendo saneamento ou habitabilidade que possam virar um projeto CitizenTech com ODS."

**Backlog (Gemini):**
> "Gere a estrutura de Backlog do Produto MoSCoW e matriz de requisitos para uma plataforma web em React + Tailwind + Supabase focada na triagem de tuberculose e operação offline para Agentes Comunitários de Saúde."

**Edge (Gemini):**
> "O circuito ESP32 no Wokwi com tela OLED SSD1306 apresentou o erro AttributeError: 'module' object has no attribute 'MONO_VLSB0'. Como corrigir no driver ssd1306.py?"

**Python (Codex):**
> "Escreva o código completo de 02-python/main.py para consumir a API REST pública do ThingSpeak (Channel 3571901), processar os campos de umidade e insolação, aplicar a fórmula do IVM, tratar fallback via backup.json e manter histórico sem duplicatas em historico.json."

**Matemática (Codex), versão resumida:**
> "Crie o módulo de Matemática em Python com NumPy, pandas, SciPy e Matplotlib. Leia o relatorio.csv do Python ou simule 24 horas de microclima usando IVM(t) = 0,6 U(t) + 0,4 (100 − I(t)). Calcule as derivadas do IVM e da umidade, a integral do IVM e o tempo na faixa PERIGO. Gere o código, o gráfico e um relatório PDF com fórmulas, resultados, interpretação e os integrantes."

**Aplicação web (Claude Code), pedido resumido:**
> Desenvolver o Viela Tech em React + Vite + Tailwind + Supabase + Lucide, seguindo a paleta oficial, com as áreas do Morador, do ACS e do Gestor, os critérios da FIAP e a WCAG 2.1 AA, reaproveitando o `api.js` sem mudar os contratos e sem inventar dados.

**Auditoria final (Claude Code), pedido resumido:**
> Auditar o projeto contra os requisitos das 7 disciplinas, corrigir o que faltar sem inventar dados, links ou resultados, e organizar a raiz em uma pasta por entrega.

## Como validamos

Nenhum código gerado entrou sem ser executado: Wokwi para o ESP32, testes automáticos para Python, Matemática e o app, e build de produção para o site. Cada integrante deve conseguir explicar a fórmula do IVM, a fila de prioridade, o modo offline e a segurança no banco.
