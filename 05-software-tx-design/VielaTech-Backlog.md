# Viela Tech — Backlog do Produto (fonte textual)

Este Markdown registra as histórias adicionadas ao backlog do produto e serve como fonte textual atualizada. O arquivo `VielaTech-Backlog.pdf` original foi mantido sem alteração.

## Novas histórias de usuário

### US-07 — Simulador Temporal 24h

**Como** avaliador ou gestor, **quero** deslizar uma linha do tempo de 0h a 24h para prever a multiplicação bacteriana sob o microclima atual da viela, **para** explorar visualmente um cenário de crescimento sem intervenções.

- **Critérios de aceite:** slider acessível de 0 a 24 horas; exibição da taxa estimada, fator exponencial e faixa de risco; curva de progressão; valores simulados identificados quando não há leitura disponível.
- **Nota de modelagem:** a fórmula bacteriana do simulador é uma hipótese didática do frontend. Não consta no modelo matemático Python existente e não é uma previsão epidemiológica ou clínica validada.

### US-08 — Boletim Comunitário & WhatsApp

**Como** morador ou agente comunitário de saúde, **quero** visualizar recomendações práticas de prevenção baseadas no clima atual e compartilhá-las facilmente via WhatsApp, **para** disseminar orientações úteis na comunidade.

- **Critérios de aceite:** diagnóstico ambiental em linguagem simples; três recomendações adaptadas às medições; compartilhamento via `https://wa.me/?text=` com dados, dicas e contexto; IVM apresentado como indicador ambiental, sem alegar diagnóstico.

## Atualização do backlog

As histórias acima complementam o backlog existente do projeto (PDF original). A exportação/substituição do PDF pode ser feita a partir deste arquivo Markdown após incorporar o conteúdo original desejado.
