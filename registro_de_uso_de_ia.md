# AI.md — Registro do Uso de Inteligência Artificial como Copiloto

> **Projeto:** CANYON — Plataforma Cívica de Inteligência Urbana e Vigilância em Saúde  
> **Turma:** 1ESSRA — FIAP GS 2026.2  

Em conformidade com as diretrizes da FIAP para a Global Solution 2026.2, este documento detalha como a Inteligência Artificial Generativa foi empregada como ferramenta de copiloto, revisão de código e auxílio na estruturação de documentação durante o desenvolvimento da solução **CANYON**.

---

## 🤖 1. Ferramentas Utilizadas

* **Gemini 3 Flash (Google):** Utilizado para brainstorm de ideias de CitizenTech aplicadas ao Rio de Janeiro, estruturação do escopo epidemiológico de tuberculose na Rocinha, especificação de requisitos funcionais/não-funcionais, modelagem de regras de negócio e auxílio na correção de código MicroPython para ESP32.

---

## 📝 2. Principais Prompts e Finalidades

### A. Definição do Problema e Contexto Urbano
* **Prompt:** *"Pesquise problemas reais da cidade do Rio de Janeiro envolvendo saneamento ou habitabilidade que possam virar um projeto CitizenTech com ODS."*
* **Resultado Obtido:** Identificação da problemática dos *canyons urbanos* na Favela da Rocinha (alta densidade construtiva nos becos bloqueando luz solar e ar, gerando alta umidade e elevadas taxas de tuberculose).

### B. Especificação de Requisitos e Backlog do Produto (Software Design)
* **Prompt:** *"Gere a estrutura de Backlog do Produto MoSCoW e matriz de requisitos para uma plataforma web em React + Tailwind + Supabase focada na triagem de tuberculose e operação offline para Agentes Comunitários de Saúde."*
* **Resultado Obtido:** Base completa para o documento ABNT (`Canyon_Backlog_ABNT.pdf`), incluindo a formulação do Índice de Vulnerabilidade de Microclima ($IVM$).

### C. Resolução de Erros no MicroPython (Edge Computing)
* **Prompt:** *"O circuito ESP32 no Wokwi com tela OLED SSD1306 apresentou o erro AttributeError: 'module' object has no attribute 'MONO_VLSB0'. Como corrigir no driver ssd1306.py?"*
* **Resultado Obtido:** Ajuste da constante para `framebuf.MONO_VLSB`, corrigindo a inicialização da tela I2C no MicroPython.

---

## 🛡️ 3. Validação Humana e Aprendizado

Todas as sugestões, trechos de código e estruturas geradas por IA foram revisadas, testadas e compreendidas por todos os integrantes da equipe. Nenhum código foi inserido no repositório sem prévia simulação no ambiente Wokwi ou testes no servidor local de desenvolvimento.