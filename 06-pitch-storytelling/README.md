# 06 · Storytelling & Inspiração Empreendedora (Pitch)

> **Entrega:** vídeo de até 3 minutos, publicado no YouTube como **não listado**.
> **Link do vídeo:** [youtu.be/txnj1lGB5_c](https://youtu.be/txnj1lGB5_c)

## Mensagem central

> **"Na Rocinha, a tuberculose mora onde o sol não chega. O Viela Tech mede o beco, escuta o morador e leva o agente de saúde primeiro a quem mais precisa."**

## Roteiro cronometrado (3:00)

A coluna **Quem fala** é uma sugestão; a equipe confirma antes de gravar. Todo número citado tem fonte no [`04-aplicacao-web/src/data/tuberculoseRio.js`](../04-aplicacao-web/src/data/tuberculoseRio.js).

| Tempo | Bloco | O que mostrar na tela | Fala (resumo) | Quem fala |
|---|---|---|---|---|
| **0:00–0:20** | Gancho | Foto da Home e o número 372 | "Em 2013, a Rocinha teve 372 casos de tuberculose por 100 mil habitantes, mais de 4 vezes a taxa da cidade do Rio. Nos becos onde o sol não chega, o ar fica parado e úmido." | a definir |
| **0:20–0:50** | Problema e personas | Página 6 do PDF do backlog (personas) | "Três pessoas sofrem com isso: o morador que tosse há semanas e não sabe se deve procurar a clínica; o agente comunitário que fica sem sinal no fundo da viela; e o gestor que não cruza o clima do beco com os casos." | a definir |
| **0:50–1:20** | A solução | Diagrama do README raiz | "O Viela Tech liga quatro peças: um sensor no beco calcula o IVM, um índice de risco ambiental; o morador faz a triagem no celular; o ACS recebe a fila priorizada, mesmo offline; e o gestor vê tudo agregado no painel." | a definir |
| **1:20–2:20** | A prova (demo) | Sequência de telas abaixo | Narrar cada passo enquanto ele acontece | a definir |
| **2:20–2:45** | Impacto | Selos ODS 3, 10 e 11; indicador de impacto | "Nosso indicador é o tempo entre a tosse e a entrega do exame na Clínica da Família. Menos tempo significa menos transmissão. Isso é ODS 3, 10 e 11." | a definir |
| **2:45–3:00** | Fechamento | Logo, link do app e nomes | "Viela Tech: inteligência urbana que chega onde a cidade não enxerga." | todos |

### Sequência da demo (1:20–2:20, cerca de 60 s)

Mostre só o que funciona de verdade e foi gravado na hora:

1. **Wokwi (10 s):** o ESP32 rodando, o OLED com IVM e faixa, e o LED mudando quando se arrasta o DHT22 ou o LDR para as faixas Atenção e Perigo.
2. **ThingSpeak (5 s):** o gráfico do canal 3571901 recebendo o ponto novo.
3. **Python (10 s):** o terminal com as opções 1 (buscar leituras), 2 (análise de risco e tendência) e 3 (exportar o `relatorio.csv`).
4. **Matemática (5 s):** o gráfico com a derivada e a área de risco acumulado (`grafico_microclima.png`).
5. **Morador (10 s):** a triagem com 3 semanas de tosse; o alerta vermelho e o selo de prioridade aparecem.
6. **ACS (10 s):** a mesma triagem no topo da fila, em vermelho; a mudança de status com o modo avião ligado e o selo "Aguardando sincronização".
7. **Gestor (10 s):** os indicadores, o mapa das sub-áreas e a troca para o tema escuro.

> Se o canal do ThingSpeak ainda não tiver leituras recentes, rode o Wokwi alguns minutos antes de gravar. Não use dados inventados na tela.

## O que **não** dizer

- Não dizer que o app diagnostica tuberculose. A triagem orienta, e o IVM é ambiental.
- Não dizer que o sensor está instalado na Rocinha. Ele é simulado no Wokwi.
- Não apresentar o simulador de 24 h como previsão científica. Ele é um cenário didático.
- Não citar números sem fonte.

## Checklist de gravação

- [ ] Roteiro ensaiado e cronometrado em no máximo 3:00.
- [ ] Projeto online do Wokwi atualizado com o `main.py` e o `diagram.json` de `01-edge-computing-esp32/`, usando a chave nova do ThingSpeak.
- [ ] Contas de teste de ACS e gestor prontas no Supabase, sem dados reais de pessoas.
- [ ] Navegador com zoom de 125% ou mais, abas extras fechadas e notificações desligadas.
- [ ] Áudio sem eco (microfone de fone serve) e tela em 1080p.
- [ ] Legenda ou texto na tela nos números principais (acessibilidade).
- [x] Vídeo exportado em MP4 e publicado no YouTube como **não listado**.
- [ ] Link testado em uma janela anônima.
- [ ] Link preenchido neste README, no README raiz e no `Integrantes.md`.

## Referências usadas no pitch

- BETIM, Felipe. *Tuberculose na Rocinha expõe o Brasil que estacionou no século XIX*. El País Brasil, 12 set. 2015 ([republicação no IHU Unisinos](https://ihu.unisinos.br/noticias/546729-tuberculose-na-rocinha-expoe-o-brasil-que-estacionou-no-seculo-xix)).
- NAÇÕES UNIDAS BRASIL. [Objetivos de Desenvolvimento Sustentável](https://brasil.un.org/pt-br/sdgs).
