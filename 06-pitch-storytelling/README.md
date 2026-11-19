# 06 · Storytelling & Inspiração Empreendedora (Pitch)

> **Vídeo:** [youtu.be/txnj1lGB5_c](https://youtu.be/txnj1lGB5_c) · publicado no YouTube como **não listado**
> **Duração:** 2:30 (limite de 3:00) · **Formato:** 1080p, 30 fps, áudio a -14 LUFS

## Mensagem central

> **"Viela Tech: transformando dados invisíveis em saúde viva dentro da favela."**

O pitch conta a história como uma jornada em três atos: o problema que ninguém vê, a solução que nasce da própria comunidade e a tecnologia que torna o risco visível. Cada integrante narra um ato com a própria voz, sobre slides animados em tela cheia e gravações reais do sistema.

## Estrutura em três atos

| Tempo | Ato | Quem fala | Tema | O que aparece na tela |
|---|---|---|---|---|
| 0:00–0:50 | **1 · O problema** | Miguel | A Rocinha, o "vilão invisível" das vielas sem sol e sem ar, a tuberculose e a saúde que chega tarde | Abertura com o logo, voo por uma viela até a Rocinha, calor + umidade → tuberculose, linha do tempo do atendimento tardio, "o CEP define quem tem direito à saúde" |
| 0:50–1:36 | **2 · A solução** | Vitor | A comunidade como mentora, a autotriagem do morador e o alerta ao agente comunitário de saúde | Nascimento do Viela Tech, tela de acesso do morador, autotriagem com alerta prioritário, fila de visitas do ACS |
| 1:36–2:30 | **3 · Tecnologia e impacto** | Pedro | Sensores no microclima, modelo matemático, painel do gestor, mapa de calor, simulador e boletim | Wokwi com ESP32 e DHT22, fórmula do IVM, painel do gestor, mapa de calor por sub-área, simulador de 24 h, boletim no WhatsApp, encerramento com os nomes |

## Roteiro falado (versão final gravada)

Transcrição das falas como foram gravadas, só com a pontuação ajustada.

### Ato 1 · Miguel: o problema

> Toda grande história começa em um lugar real, cheio de vida e movimento. Na Rocinha, milhares de famílias acordam todos os dias encarando uma rotina intensa. Mas existe um vilão invisível, escondido na arquitetura das vielas mais fechadas, onde o sol não entra e o ar não circula. O calor e a umidade criam um abrigo perfeito para a proliferação de bactérias respiratórias, como a tuberculose. Esse foi o nosso chamado. Percebemos que o sistema de saúde tradicional sempre chegava tarde demais: só depois que o morador já estava em estado grave e o contágio já tinha se espalhado. Ignorar esse problema seria aceitar que o CEP continue definindo quem tem direito à saúde.

### Ato 2 · Vitor: a solução

> Para cruzar essa barreira, precisávamos de um mentor, e a nossa mentora foi a própria realidade da comunidade, unida à tecnologia acessível. Assim nasceu o Viela Tech. Em vez de esperar o paciente bater na porta do posto, colocamos o protagonismo na mão de quem vive ali. Quando um morador sente febre ou tosse persistente, ele registra os sintomas em segundos pelo celular, mesmo se a internet falhar no meio da viela. Ao atravessar esse limiar digital, a informação ganha vida: o agente comunitário de saúde do setor recebe um alerta imediato, sabendo exatamente quem visitar primeiro. O morador deixa de ser uma estatística atrasada e se torna um herói da própria prevenção.

### Ato 3 · Pedro: tecnologia e impacto

> Mas, para vencer essa provação, não bastava apenas remediar os sintomas. Precisávamos enxergar o invisível antes do surto acontecer. Na ponta, instalamos sensores ESP32 com DHT22, monitorando o microclima real das vielas. No coração do sistema, nossa modelagem matemática cruza a temperatura, a umidade e os relatos críticos em tempo real. A recompensa aparece diante dos olhos do gestor: esse mapa de calor exclusivo da Rocinha, onde as manchas vermelhas revelam com precisão cirúrgica as zonas de risco biológico. Com o simulador de 24 horas, prevemos o avanço bacteriano e entregamos o elixir de volta à comunidade: um boletim preventivo disparado direto no WhatsApp, com ações práticas para proteger cada família. Viela Tech: transformando dados invisíveis em saúde viva dentro da favela.

## Sequência de telas

| Tempo | Slide | Conteúdo |
|---|---|---|
| 0:00 | Abertura | Logo do Viela Tech sobre a Rocinha: "Saúde nas vielas · Rocinha, Rio de Janeiro" |
| 0:05 | Rocinha | Transição pela viela até a vista da Rocinha: "Milhares de famílias. Uma rotina intensa." / "Um vilão invisível" |
| 0:23 | Tuberculose | Calor + umidade formando a palavra TUBERCULOSE |
| 0:32 | Atendimento tardio | Linha do tempo: sintomas → estado grave → contágio espalhado |
| 0:43 | CEP | "Ignorar esse problema seria aceitar que o CEP continue definindo quem tem direito à saúde." |
| 0:51 | Mentor | "Para cruzar essa barreira, precisávamos de um mentor." · A realidade da comunidade |
| 1:00 | Nascimento | "Assim nasceu o Viela Tech." |
| 1:02 | Acesso do morador | Gravação da tela de entrada do site |
| 1:09 | Autotriagem | Celular com a triagem e o alerta prioritário de tosse há mais de 21 dias |
| 1:23 | Fila do ACS | Gravação da fila de visitas, com urgentes primeiro |
| 1:36 | Enxergar o invisível | "Não bastava apenas remediar sintomas." |
| 1:44 | Monitoramento IoT | Wokwi: ESP32, DHT22, OLED e envio ao ThingSpeak (acelerado) |
| 1:50 | Modelo matemático | IVM = 0,6·U + 0,4·(100 − I); IVM ≥ 70 aciona PERIGO |
| 1:57 | Dashboard do gestor | Triagens, urgências e coletas em um só lugar |
| 2:00 | Mapa de calor | Risco por sub-área; Curva do S em PERIGO, Via Ápia e Valão em atenção |
| 2:07 | Simulador de 24 h | Projeção do microclima e da faixa de risco |
| 2:13 | Boletim comunitário | Boletim preventivo e o botão "Compartilhar no WhatsApp" |
| 2:20 | Encerramento | Logo, frase final, Miguel · Vitor · Pedro e o link do app |

## Como o vídeo foi produzido

- **Vozes:** cada integrante gravou o próprio ato. O áudio passou por redução de ruído, equalização para igualar o timbre das três vozes, de-esser, compressão leve e um expansor que corta o eco da sala entre as palavras. A mixagem final ficou em -14 LUFS, o padrão do YouTube.
- **Gravações de tela:** o site publicado ([viela-tech-three.vercel.app](https://viela-tech-three.vercel.app)), o painel do gestor com o mapa de calor e o simulador, e a simulação do Wokwi. A barra do navegador foi recortada e o trecho longo do Wokwi foi acelerado em cerca de 2,25x.
- **Slides animados:** texto revelado palavra por palavra no ritmo da fala (sincronizado pela transcrição com marcação de tempo de cada palavra), janelas de navegador para as telas do app com os tópicos entrando conforme o narrador fala, etiqueta do narrador com barras de voz animadas e barra de progresso dos três atos.
- **Identidade visual:** as cores do site e do logo (azul `#0284C7`, verde `#059669`, fundo `#0F172A` e vermelho `#DC2626` para risco).
- **Transições com a cara da Rocinha:**
  - um voo em 3D por uma viela (casas de laje coloridas, caixas d'água azuis, fios, varal, valão no chão) que sai na cena seguinte, usado nas viradas de ato;
  - uma cortina com a silhueta da favela que sobe revelando a próxima cena;
  - uma passagem lateral com motion blur entre as telas do app;
  - no fundo dos slides do app, um skyline com janelas acesas e pipas no céu.
- **Ferramentas:** Python (Pillow e NumPy) para desenhar cada quadro, FFmpeg para áudio e codificação em H.264 e faster-whisper para a marcação de tempo das falas.

## Notas para quem avalia

- **Sensor:** o ESP32 com DHT22 roda na simulação do Wokwi ([wokwi.com/projects/480218232420257793](https://wokwi.com/projects/480218232420257793)); ainda não há um sensor físico instalado nas vielas.
- **Simulador de 24 h:** é um cenário didático do modelo, não uma previsão científica do avanço da doença.
- **IVM:** é um índice ambiental de vulnerabilidade, não um diagnóstico. A triagem orienta o morador e prioriza a visita do ACS.
- **Autotriagem:** a tela da autotriagem no celular é uma ilustração animada com dados fictícios (Dona Tereza, setor Valão). As demais telas são gravações reais do sistema, com dados de demonstração.

## Referências usadas no pitch

- BETIM, Felipe. *Tuberculose na Rocinha expõe o Brasil que estacionou no século XIX*. El País Brasil, 12 set. 2015 ([republicação no IHU Unisinos](https://ihu.unisinos.br/noticias/546729-tuberculose-na-rocinha-expoe-o-brasil-que-estacionou-no-seculo-xix)).
- NAÇÕES UNIDAS BRASIL. [Objetivos de Desenvolvimento Sustentável](https://brasil.un.org/pt-br/sdgs).
