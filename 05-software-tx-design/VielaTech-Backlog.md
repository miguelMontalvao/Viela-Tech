# Viela Tech: histórias adicionadas ao backlog

Este arquivo registra as histórias criadas durante a implementação. O backlog original (US-01 a US-15) está nas seções 1 a 10 do [relatório](VielaTech-SoftwareTX-Relatorio.pdf).

As novas histórias continuam a numeração do PDF (US-16 e US-17) para não colidir com a US-07 (acessibilidade) e a US-08 (tema) que já existem. Elas entram no épico **E4 · Dashboard epidemiológico**. O status de todas as histórias está no [README desta pasta](README.md#7-backlog-do-produto-e-status).

## US-16: Simulador temporal de 24 h

**Prioridade proposta:** COULD HAVE · **Persona:** gestor · **Vínculos:** RN-01, RF-05

**Como** gestor, **quero** deslizar uma linha do tempo de 0 a 24 h e ver um cenário de como o ambiente da viela evolui sem ventilação nem limpeza, **para** explicar à comunidade e à equipe por que agir cedo.

**Critérios de aceite:**

- Controle deslizante acessível de 0 a 24 h, com nome fixo e valor anunciado.
- Exibe a taxa do modelo, o fator exponencial e a faixa no mesmo semáforo de 3 cores do IVM.
- Desenha a curva de progressão.
- Todo valor que não veio do sensor aparece identificado como "(simulado)".

**Nota de modelagem:** a taxa de crescimento é uma hipótese didática do front-end, sem calibração científica. Não mede bactérias nem o risco de tuberculose. O indicador oficial continua sendo o IVM.

**Implementação:** `04-aplicacao-web/src/components/gestor/BacterialSimulator.jsx` e `04-aplicacao-web/src/domain/simulacao.js` (com testes).

## US-17: Boletim comunitário e WhatsApp

**Prioridade proposta:** COULD HAVE · **Persona:** gestor e ACS · **Vínculos:** RN-01, RN-03

**Como** gestor ou agente comunitário de saúde, **quero** ver três recomendações de prevenção baseadas no microclima atual e compartilhá-las pelo WhatsApp, **para** levar orientação simples à comunidade.

**Critérios de aceite:**

- Diagnóstico ambiental em linguagem simples, com a faixa Normal/Atenção/Perigo do IVM.
- Três recomendações adaptadas à umidade, à temperatura e à faixa.
- Botão que abre `https://wa.me/?text=` com os dados, as dicas e o aviso de que o IVM não é diagnóstico.
- Só usa dados ambientais agregados, sem nenhum dado pessoal (RN-03).

**Diferença em relação à US-15 (WON'T HAVE):** a US-15 previa notificações **automáticas** ao morador pela API oficial de mensageria, com o resultado do exame. A US-17 não integra com nenhuma API e não envia nada sozinha: ela monta um texto público e abre o WhatsApp para a pessoa decidir se compartilha.

**Implementação:** `04-aplicacao-web/src/components/gestor/CommunityBulletin.jsx` e `04-aplicacao-web/src/domain/simulacao.js`.
