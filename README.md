# Viela Tech — Onde o sol não chega, a saúde chega 

> **Plataforma Cívica de Inteligência Urbana e Vigilância em Saúde na Favela da Rocinha**  
> **FIAP Global Solution 2026.2 — CitizenTech**  
> **Curso:** Engenharia de Software (1º Ano — Semipresencial Rio de Janeiro)  
> **Turma:** 1ESSRA  

---

##  Ficha da CitizenTech

| Campo | Descrição |
| :--- | :--- |
| **Nome da CitizenTech** | **Viela Tech** |
| **Cidade e Bairro** | Rio de Janeiro, Favela da Rocinha (Região dos Becos e Vielas) |
| **Cidadão Beneficiado** | Moradores das vielas de alta densidade/baixa insolação e Agentes Comunitários de Saúde (ACS) |
| **Problema em Uma Frase** | A alta densidade construtiva dos becos bloqueia o sol e a circulação de ar, criando um microclima de alta umidade que favorece a proliferação da tuberculose e atrasa a triagem de sintomáticos. |
| **Como Funciona** | Um ESP32 com sensores de umidade e luz calcula o risco de microclima e envia dados ao ThingSpeak; um script em Python analisa a tendência epidemiológica; uma aplicação React/Tailwind com Supabase permite a autotriagem do morador e o gerenciamento *offline-first* das coletas pelos ACS. |
| **O que cada parte faz** | **Edge:** Coleta telemetria ambiental via ESP32 no Wokwi.<br>**Python:** Processa o IVM, mantém histórico e detecta tendências de piora.<br>**Matemática:** Modelagem das taxas de variação e acúmulo de risco no tempo.<br>**Software Design:** Define requisitos, regras de negócio e backlog MoSCoW.<br>**Front-end:** Interface acessível (WCAG 2.1 AA) em React + Vite + Tailwind CSS.<br>**Web Dev:** Gerencia estado offline (`LocalStorage`) e alternador Light/Dark Mode.<br>**Pitch:** Apresenta a narrativa do produto em vídeo de 3 minutos. |
| **Link do Repositório** | `[https://github.com/miguelMontalvao/Viela-Tech.git]` |
| **Indicador de Impacto** | Redução do tempo médio entre o surgimento dos sintomas respiratórios e a entrega do kit de baciloscopia na Clínica da Família Rinaldo De Lamare. |
| **ODS Conectados** | **ODS 3** (Saúde e Bem-Estar), **ODS 10** (Redução das Desigualdades), **ODS 11** (Cidades e Comunidades Sustentáveis) |

---

##  Integrantes da Equipe

* **Miguel Menezes Montalvão dos Santos** — RM 573825
* **Pedro Lucas Souza Provadelli** — RM 572547
* **Vitor Louzano Gomes Mendes** — RM 573885

---

##  Estrutura das 7 Disciplinas da Global Solution

### 1. Edge Computing & Computer Systems (Sensor)
* **Objetivo:** Telemetria em tempo real nos becos da Rocinha via microcontrolador ESP32.
* **Hardware Simulado:** ESP32 DevKit v4, Sensor DHT22 (Umidade/Temperatura), Sensor LDR (Insolação/Luminosidade), Display OLED SSD1306 (I2C) e LEDs de Status (Verde/Vermelho).
* **Linguagem:** MicroPython (`main.py` e driver `ssd1306.py`).
* **Plataforma IoT:** ThingSpeak (Publicação de dados via API HTTP GET).
* **Links da Disciplina:**
  *  **Simulação Wokwi:** `[https://wokwi.com/projects/480218232420257793]`
  *  **Canal Público ThingSpeak:** `[https://thingspeak.mathworks.com/channels/3571901/edit]`

---

### 2. Computational Thinking with Python (Lógica)
* **Objetivo:** "Cérebro" conectado da aplicação que analisa a série temporal de telemetria.
* **Funcionalidades:**
  * Consumo da API REST do ThingSpeak com tratamento de exceção (`requests.RequestException`) e *timeout*.
  * **Plano B:** Fallback automatizado para `backup.json` em caso de falha de conexão.
  * Cálculo dinâmico do $IVM = 0{,}6 \cdot U_n + 0{,}4 \cdot I_n$.
  * Análise de tendência de risco (Alerta `PIORANDO` para 3 altas consecutivas).
  * Persistência histórica em `historico.json` sem duplicatas (`set` de IDs) e exportação em `relatorio.csv`.
* **Localização:** Pasta `/python` no repositório.

---

### 3. Differentiated Problem Solving (Matemática)
* **Objetivo:** Aplicação de Cálculo Diferencial e Integral na modelagem do microclima urbano.
* **Modelagem:**
  * **Taxa de Variação Instantânea (Derivada):** $\frac{d(IVM)}{dt}$ para identificação de variação abrupta de risco.
  * **Exposição Acumulada (Integral):** $\int_{t_0}^{t_1} IVM(t) \, dt$ para quantificar o indicador ambiental acumulado em `%·h`, com cálculo separado do tempo em zona de `PERIGO`.
* **Entregáveis:** Script em Python (`/math/modelo_calculo.py`) e Relatório Técnico em PDF.

---

### 4. Software & Total Experience Design (Experiência)
* **Objetivo:** Modelagem completa da experiência do usuário, engenharia de requisitos e backlog.
* **Entregáveis Consolidados:**
  * Documentação em formato ABNT (`VielaTech_Backlog_ABNT.pdf`).
  * 3 Personas mapeadas: Morador Sintomático, Agente Comunitário de Saúde (ACS) e Gestor SMS-RJ.
  * Matriz de 4 Regras de Negócio (RN-01 a RN-04), 6 Requisitos Funcionais (RF-01 a RF-06) e 4 Requisitos Não-Funcionais (RNF-01 a RNF-04).
  * Backlog do Produto com 15 Histórias de Usuário priorizadas via MoSCoW e Matriz de Rastreabilidade.

---

### 5. Front-end Design (Interface)
* **Objetivo:** Aplicação web funcional e inclusiva adaptada às diretrizes formais de acessibilidade.
* **Stack Tecnológico:** React + Vite + Tailwind CSS + JavaScript.
* **Diferenciais UX/UI:**
  * Foco nas diretrizes WCAG 2.1 AA (áreas de clique ampliadas $\ge 48\text{px}$, suporte semântico a leitores de tela).
  * Formulário de autotriagem sintomática em 4 etapas.
  * Mapeamento dos postos de apoio para entrega de exames de escarro na Rocinha.

---

### 6. Web Development (Interação)
* **Objetivo:** Interatividade em JavaScript e persistência client-side.
* **Recursos Implementados:**
  * Modo **Light / Dark** com alternância dinâmica de classes Tailwind.
  * **Operação Offline-First (RN-04):** Salvamento de registros dos ACS no `LocalStorage` durante o trabalho em becos sem sinal, com sincronização automatizada com o Supabase ao recuperar conexão.

---

### 7. Storytelling & Inspiração Empreendedora (Pitch)
* **Objetivo:** Apresentação executiva em vídeo demonstrando o produto em funcionamento.
* **Roteiro de 3 Minutos:**
  1. *Gancho (0:00 - 0:20):* O efeito canyon e o cenário epidemiológico da tuberculose na Rocinha.
  2. *O Herói (0:20 - 0:50):* As jornadas do morador e do Agente Comunitário de Saúde.
  3. *A Virada (0:50 - 1:20):* Apresentação da plataforma VielaTech.
  4. *A Prova (1:20 - 2:20):* Demonstração integrada (Wokwi $\rightarrow$ Python $\rightarrow$ Front-end React).
  5. *O Impacto (2:20 - 3:00):* Alinhamento aos ODS 3, 10 e 11 e encerramento.
* **Link do Vídeo (YouTube - Não Listado):** `[INSIRA_LINK_DO_YOUTUBE_AQUI]`

---

##  Como Executar o Projeto

### Pré-requisitos
* Node.js (v18 ou superior)
* Python 3.10+

### 1. Executar o Cérebro em Python
```bash
cd python
pip install requests
python main.py
```

### 2. Executar o Módulo de Matemática

```bash
python -m pip install -r math/requirements.txt
python math/modelo_calculo.py
```
O script lê `python/relatorio.csv` ou usa uma simulação identificada de 24 horas quando o arquivo ainda não existe. Gera `math/grafico_microclima.png` e `math/Relatorio_Matematica.pdf`. Consulte [math/README.md](math/README.md) para os métodos e opções de execução.

### 3. Executar a Aplicação Web (React + Vite)

```bash
npm install
npm run dev
```

---

## 📁 Estrutura do Repositório

```text
├── assets/                  # Imagens e evidências da simulação e gráficos
├── doc/                     # Documentação ABNT (Canyon_Backlog_ABNT.pdf)
├── math/                    # Scripts de Cálculo Diferencial e Integral
├── python/                  # Código do cérebro em Python, backup.json e exportações
│   ├── backup.json
│   ├── main.py
│   ├── prompts.md
│   └── README.md
├── src/                     # Código fonte do Front-end (React + Tailwind CSS)
│   ├── components/
│   ├── services/            # Integração Supabase e ThingSpeak
│   └── App.jsx
├── Wokwi/                   # Arquivos do circuito ESP32 MicroPython (main.py, ssd1306.py, diagram.json)
├── AI.md                    # Registro do uso de Inteligência Artificial como copiloto
├── Integrantes.md           # Identificação oficial da equipe
└── README.md                # Este arquivo
```
