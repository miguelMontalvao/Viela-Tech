# Viela Tech: onde o sol não chega, a saúde chega

> **Plataforma cívica de inteligência urbana e vigilância em saúde para a prevenção da tuberculose na Rocinha (RJ)**
> FIAP · Engenharia de Software · **Global Solution 2026.2: CitizenTech** · Turma 1ESSRA

| | |
|---|---|
| **Aplicação web** | [viela-tech.vercel.app](https://viela-tech.vercel.app) |
| **Repositório** | [github.com/miguelMontalvao/Viela-Tech](https://github.com/miguelMontalvao/Viela-Tech) |
| **Simulação ESP32 (Wokwi)** | [wokwi.com/projects/480218232420257793](https://wokwi.com/projects/480218232420257793) |
| **Canal público ThingSpeak** | [thingspeak.mathworks.com/channels/3571901](https://thingspeak.mathworks.com/channels/3571901) |
| **Vídeo do pitch (YouTube)** | ⏳ pendente (ver [`06-pitch-storytelling/`](06-pitch-storytelling/README.md)) |

## Sumário

1. [Integrantes](#1-integrantes)
2. [Problema](#2-problema)
3. [Cidadão beneficiado](#3-cidadão-beneficiado)
4. [Solução](#4-solução)
5. [Como funciona](#5-como-funciona)
6. [Arquitetura](#6-arquitetura)
7. [Entregas por disciplina](#7-entregas-por-disciplina)
8. [Estrutura do repositório](#8-estrutura-do-repositório)
9. [O índice IVM](#9-o-índice-ivm)
10. [Como executar](#10-como-executar)
11. [Testes](#11-testes)
12. [Evidências](#12-evidências)
13. [Segurança e privacidade](#13-segurança-e-privacidade)
14. [Dados reais e simulados](#14-dados-reais-e-simulados)
15. [Impacto e ODS](#15-impacto-e-ods)
16. [Limitações e roadmap](#16-limitações-e-roadmap)
17. [Uso de IA e referências](#17-uso-de-ia-e-referências)

---

## 1. Integrantes

| Nome | RM |
|---|---|
| Miguel Menezes Montalvão dos Santos | 573825 |
| Pedro Lucas Souza Provadelli | 572547 |
| Vitor Louzano Gomes Mendes | 573885 |

Responsabilidades em [`Integrantes.md`](Integrantes.md).

## 2. Problema

Na Rocinha, os becos estreitos formam **cânions urbanos**: o sol direto não chega ao chão, o ar não circula e a umidade se acumula. Esse ambiente favorece a tuberculose.

Em 2013, a Rocinha registrou **372 casos por 100 mil habitantes**. Na cidade do Rio, a taxa foi de 89,7, ou seja, a Rocinha teve **4,1 vezes** mais casos (Betim, *El País Brasil*, 2015).

**Em uma frase:** a falta de sol e de ventilação nos becos cria um microclima de risco, e a triagem de quem tosse há semanas chega tarde.

## 3. Cidadão beneficiado

- **Morador das vielas** de baixa insolação: descobre se deve procurar a Clínica da Família, sem diagnóstico e sem deslocamento desnecessário.
- **Agente Comunitário de Saúde (ACS):** recebe a fila de visitas priorizada e trabalha mesmo sem sinal.
- **Gestor da SMS-RJ:** vê o microclima e as triagens agregadas por sub-área para decidir onde agir.

## 4. Solução

O Viela Tech liga um **sensor de microclima** a uma **aplicação web de triagem e gestão**:

1. Um ESP32 mede umidade, luz e temperatura no beco e calcula o **IVM** (Índice de Vulnerabilidade de Microclima).
2. Os dados vão para o ThingSpeak e são analisados em **Python** (tendência e relatório) e em **Matemática** (derivadas, integrais e limites).
3. Na aplicação web, o **morador** faz a autotriagem; tosse há 21 dias ou mais vira **prioridade**.
4. O **ACS** atende a fila na ordem certa, mesmo offline.
5. O **gestor** acompanha indicadores, mapa e microclima.

## 5. Como funciona

| Passo | O que acontece | Onde |
|---|---|---|
| 1 | O DHT22 e o LDR são lidos a cada 15 s; o ESP32 calcula o IVM, acende o LED da faixa e mostra no OLED | `01-edge-computing-esp32/` |
| 2 | A leitura é publicada no ThingSpeak (`field1` a `field4`) | canal 3571901 |
| 3 | O Python busca as leituras, valida, normaliza, classifica, detecta tendência de piora e exporta o CSV | `02-python-processamento/` |
| 4 | A Matemática modela o IVM no tempo, com limites, derivadas e integral do risco acumulado | `03-matematica-modelagem/` |
| 5 | O morador envia a triagem com consentimento; o banco marca a prioridade | `04-aplicacao-web/` + Supabase |
| 6 | O ACS muda o status (pendente → em atendimento → coletado → concluído), mesmo offline | `/acs` |
| 7 | O gestor vê indicadores, o mapa por sub-área, o simulador de 24 h e o boletim | `/gestor` |

## 6. Arquitetura

```mermaid
flowchart LR
  E[ESP32 + DHT22 + LDR<br/>Wokwi] -->|HTTP| T[(ThingSpeak)]
  T --> P[Python<br/>análise e CSV]
  P --> M[Matemática<br/>cálculo e PDF]
  MO[Morador] -->|insert| DB[(Supabase<br/>Postgres + Auth + RLS)]
  DB --> AC[ACS<br/>offline-first]
  DB --> GE[Gestor<br/>painel e mapa]
  T -. carga manual .-> DB
```

Detalhes, contrato de dados e camadas da aplicação: [`docs/arquitetura.md`](docs/arquitetura.md).

**Stack:**

- **Edge:** MicroPython no ESP32 (Wokwi).
- **Python:** Python 3.10+ com `requests`.
- **Matemática:** NumPy, SciPy, pandas e Matplotlib.
- **Web:** React 18, Vite 6, Tailwind CSS 3, React Router, Lucide e Vitest.
- **Backend e deploy:** Supabase (Postgres, Auth e RLS) e Vercel.

## 7. Entregas por disciplina

| # | Disciplina | Pasta | O que entrega |
|---|---|---|---|
| 1 | Edge Computing & Computer Systems | [`01-edge-computing-esp32/`](01-edge-computing-esp32/README.md) | Circuito no Wokwi, `main.py` com IVM, 3 faixas, LEDs, OLED e envio ao ThingSpeak |
| 2 | Computational Thinking with Python | [`02-python-processamento/`](02-python-processamento/README.md) | Consumo da API, validação, normalização, tendência, histórico, backup, CSV e 22 testes |
| 3 | Differentiated Problem Solving | [`03-matematica-modelagem/`](03-matematica-modelagem/README.md) | Limites, derivadas e integrais do IVM; PDF de 6 páginas; 15 testes |
| 4 | Front-end Design | [`04-aplicacao-web/`](04-aplicacao-web/README.md) | Aplicação React com 3 perfis, CRUD completo, acessibilidade e 24 testes |
| 5 | Software & Total Experience Design | [`05-software-tx-design/`](05-software-tx-design/README.md) | Backlog em PDF (personas, RN, RF, RNF, MoSCoW, rastreabilidade), escopo, status e conclusão |
| 6 | Storytelling & Inspiração Empreendedora | [`06-pitch-storytelling/`](06-pitch-storytelling/README.md) | Roteiro de 3 minutos com a demonstração real e checklist de gravação |
| 7 | Web Development | [`04-aplicacao-web/`](04-aplicacao-web/README.md#interações-em-javascript-web-development) | Interações em JavaScript, persistência no navegador e integração com a API do Supabase |

O status de cada requisito está em [`docs/matriz-de-conformidade.md`](docs/matriz-de-conformidade.md).

## 8. Estrutura do repositório

```text
Viela-Tech/
├── 01-edge-computing-esp32/   ESP32 MicroPython: main.py, ssd1306.py, diagram.json, evidencias/
├── 02-python-processamento/   main.py, test_main.py, historico.json, backup.json, relatorio.csv
├── 03-matematica-modelagem/   modelo_calculo.py, relatorio_matematica.py, PDF, gráfico, testes
├── 04-aplicacao-web/          React + Vite + Tailwind + Supabase (src/, supabase/, public/)
├── 05-software-tx-design/     VielaTech-Backlog.pdf, histórias novas e relatório de status
├── 06-pitch-storytelling/     roteiro e checklist do vídeo
├── docs/                      arquitetura e matriz de conformidade
├── AI.md                      registro do uso de IA
├── Integrantes.md             equipe, RMs e responsabilidades
└── README.md                  este arquivo
```

## 9. O índice IVM

```text
IVM = 0,6 × Umidade + 0,4 × (100 − Insolação)
```

| Faixa | IVM | Cor | Ação |
|---|---|---|---|
| **Normal** | abaixo de 40 | verde `#16A34A` | monitoramento de rotina |
| **Atenção** | de 40 a menos de 70 | âmbar `#D97706` | setor acompanhado pelo gestor |
| **Perigo** | 70 ou mais | vermelho `#DC2626` | busca ativa e visitas priorizadas |

- A umidade pesa mais (0,6) porque é a variável mais ligada à proliferação do patógeno.
- `100 − Insolação` representa a **falta** de sol.
- A mesma fórmula e as mesmas faixas estão no ESP32, no Python, na Matemática e no app.

O IVM é um **indicador ambiental didático** e não mede o risco clínico de uma pessoa.

## 10. Como executar

**Pré-requisitos:** Python 3.10+ e Node.js 18+.

```bash
# 1 · Edge: abra o link do Wokwi acima e clique em ▶ (ou copie os arquivos de 01-edge-computing-esp32/)

# 2 · Python
cd 02-python-processamento
pip install -r requirements.txt
python main.py                 # menu: 1 buscar · 2 analisar · 3 exportar CSV · 4 sair

# 3 · Matemática
cd ../03-matematica-modelagem
pip install -r requirements.txt
python modelo_calculo.py       # gera grafico_microclima.png e Relatorio_Matematica.pdf

# 4 · Aplicação web
cd ../04-aplicacao-web
npm install
cp .env.example .env           # URL e chave anon do Supabase (opcional: sem .env roda em modo local)
npm run dev                    # http://localhost:5173
```

Como configurar o Supabase (schema, migração e usuários da equipe): [`04-aplicacao-web/README.md`](04-aplicacao-web/README.md#configurando-o-supabase).

## 11. Testes

Execução de 17/11/2026:

| Módulo | Comando | Resultado |
|---|---|---|
| Python | `python -m unittest test_main.py` | 22 de 22 passaram |
| Matemática | `python -m pytest test_modelo_calculo.py` | 15 de 15 passaram |
| Aplicação web | `npm test` | 24 de 24 passaram |
| Aplicação web | `npm run build` | build sem erros |
| Edge | `ast.parse` do `main.py` | sintaxe válida (a simulação roda no Wokwi) |

## 12. Evidências

| ESP32 no Wokwi | Campos no ThingSpeak |
|---|---|
| ![ESP32 rodando no Wokwi](01-edge-computing-esp32/evidencias/esp32-wokwi-funcionando.png) | ![Gráficos do canal no ThingSpeak](01-edge-computing-esp32/evidencias/thingspeak-campos.png) |

![Modelo matemático do microclima](03-matematica-modelagem/grafico_microclima.png)

As demais evidências estão nas pastas de cada entrega:

- a saída real do terminal Python está no [README do Python](02-python-processamento/README.md#evidência-de-execução);
- o relatório de Matemática é o [`Relatorio_Matematica.pdf`](03-matematica-modelagem/Relatorio_Matematica.pdf);
- a aplicação está publicada em [viela-tech.vercel.app](https://viela-tech.vercel.app).

## 13. Segurança e privacidade

- **RLS no Supabase:**
  - quem não tem conta só consegue **enviar** uma triagem, nunca ler;
  - o morador lê e exclui as próprias triagens;
  - ACS e gestor acessam a fila conforme o papel.
- **LGPD:** consentimento explícito antes do envio (art. 11, I), exclusão pelo próprio morador (art. 18) e coleta mínima (nome, setor e sintomas, sem endereço). A política fica em `/privacidade`.
- **No aparelho:** ao sair da conta, o cache local de chamados é apagado.
- **Segredos:** nenhuma chave no código. O `.env` é ignorado pelo git, e a chave do ThingSpeak é um marcador. A chave usada antes desta auditoria aparece no histórico e **deve ser trocada**.
- **Mapa público:** só números agregados de fontes citadas. O mapa por sub-área é restrito à equipe.

## 14. Dados reais e simulados

| Dado | Origem | Situação |
|---|---|---|
| Leituras do sensor | ThingSpeak, canal 3571901 | **reais (simuladas no Wokwi)**: 4 leituras até 17/11/2026 |
| Gráfico e PDF de Matemática | simulação de 24 h identificada | o modelo passa a usar o CSV real quando houver 20 leituras ou mais |
| Taxas de tuberculose | Betim (2015) e boletim SMS-RJ (2023) | públicas, com fonte e ano na tela |
| Simulador de 24 h e boletim | leitura do sensor e cenário padrão | campos sem leitura aparecem como "(simulado)" |
| Foto da Home | ilustração gerada por IA | identificada no `AI.md` |

## 15. Impacto e ODS

- **Indicador de impacto:** tempo médio entre o início da tosse e a entrega do exame na Clínica da Família Rinaldo De Lamare.
- **ODS 3 (Saúde e Bem-Estar):** triagem precoce da tuberculose.
- **ODS 10 (Redução das Desigualdades):** tecnologia de saúde para quem mora onde a cidade não enxerga.
- **ODS 11 (Cidades e Comunidades Sustentáveis):** o microclima urbano como dado de planejamento.

## 16. Limitações e roadmap

**Limitações atuais:**

- A carga ThingSpeak → Supabase (`leituras_microclima`) ainda é manual.
- O canal tem poucas leituras, e a calibração do IVM com dados reais está pendente.
- Não há *service worker*: o modo offline funciona depois que o app foi aberto com internet.
- O ACS ainda vê a fila inteira, sem filtro por microárea.

**Próximos passos:**

1. Script agendado que copia as leituras do ThingSpeak para o Supabase.
2. RLS por microárea do ACS.
3. Controle de alto contraste e tamanho de fonte (US-07).
4. Painel em tempo real (Supabase Realtime).
5. Testes de usabilidade com moradores e ACS da Rocinha.

**Pendências da equipe para a submissão:** ver a [matriz de conformidade](docs/matriz-de-conformidade.md).

## 17. Uso de IA e referências

O uso de IA (Gemini, Codex e Claude Code), com os prompts e a forma de validação, está registrado em [`AI.md`](AI.md).

**Referências:**

- BETIM, Felipe. Tuberculose na Rocinha expõe o Brasil que estacionou no século XIX. *El País Brasil*, 12 set. 2015. [Republicação no IHU Unisinos](https://ihu.unisinos.br/noticias/546729-tuberculose-na-rocinha-expoe-o-brasil-que-estacionou-no-seculo-xix).
- RIO DE JANEIRO (Município). Secretaria Municipal de Saúde. [*Boletim Epidemiológico: Tuberculose no Município do Rio de Janeiro*](https://epirio.svs.rio.br/wp-content/uploads/2023/03/BOLETIM_epidemiologico_TUBERCULOSE_MIOLO_2023_FINAL_v2.pdf), 2. ed., mar. 2023.
- BRASIL. Lei nº 13.709, de 14 de agosto de 2018 (LGPD).
- W3C. Web Content Accessibility Guidelines (WCAG) 2.1, 2018.
- NAÇÕES UNIDAS BRASIL. [Objetivos de Desenvolvimento Sustentável](https://brasil.un.org/pt-br/sdgs).
