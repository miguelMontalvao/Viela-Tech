# Viela Tech: Front-end

Aplicação web do Viela Tech, com três áreas:

- **Área do Morador:** autotriagem de tosse, aberta a qualquer pessoa.
- **Painel ACS:** fila de visitas dos Agentes Comunitários de Saúde. Funciona sem sinal.
- **Dashboard do Gestor:** microclima medido pelo sensor IoT, indicadores e gráficos.

**Em produção:** [viela-tech.vercel.app](https://viela-tech.vercel.app), conectado ao Supabase e com deploy pela Vercel CLI (`vercel deploy --prod` a partir de `src/Frontend`).

Stack: **React 18 + Vite 6 + Tailwind CSS 3 + Supabase + Lucide React**, com React Router e Vitest.

---

## Como rodar

Pré-requisito: Node.js 18 ou superior.

```bash
cd src/Frontend
npm install
cp .env.example .env      # preencha com os dados do seu projeto Supabase
npm run dev               # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build localmente |
| `npm test` | testes unitários das regras de negócio (Vitest) |

### Sem `.env`

O app abre normalmente e avisa que está em **modo local**. As triagens ficam no `LocalStorage` do aparelho e são enviadas quando o Supabase for configurado. O login da equipe fica desabilitado até lá.

### Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas `chamados_coleta` e `leituras_microclima`, o gatilho de prioridade e as políticas de segurança (RLS).
3. Em **Authentication → Users**, crie os usuários da equipe (ACS e gestores) com e-mail e senha.
4. Em **Project Settings → API**, copie a *Project URL* e a *anon public key* para o `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

---

## Arquitetura

O código separa **regra de negócio**, **acesso a dados** e **apresentação**:

```text
src/
├── domain/          Regras de negócio puras, sem React (testadas com Vitest)
│   ├── risco.js        Faixas do IVM (40/70), fórmula do IVM e tosse >= 21 dias
│   ├── chamados.js     Fila de prioridade, etapas do atendimento e indicadores
│   ├── triagem.js      Validação do formulário e payload da API
│   └── unidades.js     Unidades de saúde de referência
├── services/        Acesso a dados
│   ├── api.js          Contratos com o Supabase e fallback offline (já existia)
│   ├── supabaseClient.js
│   ├── authService.js  Login da equipe (Supabase Auth)
│   └── sincronizacao.js Trava contra sincronizações simultâneas
├── hooks/           Custom hooks: a ponte entre dados e tela
│   ├── useTriagem.js       formulário + salvarTriagemMorador()
│   ├── useChamados.js      buscarChamadosACS(), atualizarStatusChamado(), sincronização
│   ├── useMicroclima.js    buscarUltimaLeituraMicroclima() com atualização a cada 60 s
│   ├── useEnvioPendente.js reenvio automático das triagens guardadas no aparelho
│   ├── useOnlineStatus.js  eventos online/offline
│   ├── useTheme.js         tema claro/escuro persistido
│   └── useAuth.js          sessão da equipe (AuthContext)
├── context/AuthContext.jsx
├── components/      Apresentação
│   ├── ui/             Button, Alert, Field, ToggleQuestion, Spinner, EmptyState, Badge
│   ├── layout/         Header (navegação, Online/Offline, tema), Layout, Logo
│   ├── auth/           LoginForm, ProtectedRoute
│   ├── morador/        TriagemForm, ResultadoTriagem
│   ├── acs/            ChamadoCard, ChamadosFilter, SyncBar
│   └── gestor/         MicroclimaPanel, StatCard, BarChart
└── pages/           HomePage, MoradorPage, AcsPage, GestorPage, NotFoundPage
```

Os componentes não acessam o Supabase diretamente: tudo passa pelos hooks, e os hooks chamam `services/api.js`. As regras (o que é urgente, em que ordem atender, qual faixa de risco) vivem em `domain/`, então dá para testá-las sem navegador.

### Contratos usados (`services/api.js`)

| Função | Onde é usada | O que faz |
|---|---|---|
| `salvarTriagemMorador(dados)` | Área do Morador | grava a triagem ou guarda no aparelho se falhar |
| `buscarChamadosACS()` | Painel ACS e Gestor | lista os chamados e mescla os registros locais |
| `atualizarStatusChamado(id, novoStatus)` | Painel ACS | `EM_ANDAMENTO` → `COLETADO` → `CONCLUÍDO` |
| `sincronizarPendenciasOffline()` | Painel ACS e Morador | envia as triagens e mudanças de status pendentes |
| `buscarUltimaLeituraMicroclima()` | Gestor | última leitura de umidade, insolação e IVM |

O CRUD completo é feito pela API REST do Supabase: **C**reate (triagem), **R**ead (fila e microclima) e **U**pdate (status). A única mudança na camada de dados foi no `supabaseClient.js`: sem `.env`, ele não derruba mais o app e deixa o `api.js` cair no modo local.

### Regras de negócio

- **IVM** = 0,6 × Umidade + 0,4 × (100 − Insolação), a mesma fórmula do ESP32 (`wokwi/main.py`) e do Python.
- **Faixas:** Normal abaixo de 40% (`#16A34A`) · Atenção de 40% a menos de 70% (`#D97706`) · Perigo a partir de 70% (`#DC2626`).
- **Tosse de 21 dias ou mais** é urgente: alerta vermelho para o morador, faixa "URGENTE — TOSSE +21 DIAS" e topo da fila para o ACS. O banco reforça a regra com um gatilho.
- **Fila do ACS:** urgentes em aberto, depois os demais em aberto e por fim os concluídos. Dentro de cada grupo, quem espera há mais tempo vem antes.
- **Offline-first (RN-04):** sem sinal, tudo fica no `LocalStorage`. Ao voltar a conexão, a sincronização roda sozinha, e também há o botão **Sincronizar**.

---

## Identidade visual e acessibilidade

| Elemento | Cor | Tailwind |
|---|---|---|
| Azul Saúde Cívica | `#0284C7` | `sky-600` |
| Verde Esmeralda | `#059669` | `emerald-600` |
| Fundo claro / escuro | `#F8FAFC` / `#0F172A` | `slate-50` / `slate-900` |
| Cards claro / escuro | `#FFFFFF` / `#1E293B` | `white` / `slate-800` |
| Texto principal | `#0F172A` | `slate-900` |

- **Tema claro/escuro** com `darkMode: 'class'`. O botão no header salva a escolha, e na primeira visita o tema segue o sistema.
- **Contraste sob luz solar:** texto branco sobre `#0284C7` tem contraste de cerca de 4,1:1, abaixo dos 4,5:1 exigidos pela WCAG AA. Por isso os botões usam o tom `sky-700` (e `emerald-700`) da mesma família. O `sky-600` continua nas marcas, ícones, anéis de foco e gráficos. As cores de risco aparecem com ícone e rótulo escrito, nunca só como cor.
- **Alvos de toque de no mínimo 48px** em botões, links e campos.
- Link "Pular para o conteúdo", foco sempre visível, `aria-live` nos resultados, `aria-invalid` e mensagens ligadas aos campos, foco movido para o primeiro erro e para o resultado da triagem.
- Gráficos com tooltip (mouse e teclado) e alternativa em tabela. A cor das barras foi validada contra os dois fundos de card.
- Respeita `prefers-reduced-motion` e não tem rolagem horizontal em 375px.

---

## Testes realizados

- **Unitários (Vitest):** 10 testes de `domain/` cobrindo os limiares 40/70, a fórmula do IVM, a regra dos 21 dias, a ordenação da fila, os filtros, os indicadores e a validação da triagem.
- **Ponta a ponta (Chrome headless):**
  - triagem normal e urgente, validação e foco, payload salvo no `LocalStorage`;
  - login protegido;
  - fila priorizada, faixa vermelha e mudança de status (PATCH);
  - modo offline com fila de sincronização e envio automático ao reconectar;
  - Dashboard com IVM em "Perigo", indicadores, gráficos, tooltip e tabela;
  - temas claro e escuro, 375px e desktop.

  As respostas do Supabase foram simuladas por interceptação de rede, porque o ambiente de testes não tinha credenciais.

## Limitações conhecidas

- **Leitura anônima recente:** `salvarTriagemMorador()` faz `insert().select().single()`. Para o morador anônimo receber a confirmação, a política RLS libera a leitura das linhas criadas nos últimos 2 minutos. Uma melhoria futura é trocar por uma função RPC que só devolva o `id`.
- **Origem da tabela `leituras_microclima`:** hoje o ESP32 publica no ThingSpeak, e nenhum script grava essa tabela automaticamente. Até existir essa integração, ela pode ser populada pelo seed do `schema.sql` (com leituras reais de `python/historico.json`) ou manualmente.
- **Perfis de acesso:** ACS e gestor usam o mesmo tipo de login. Separar perfis por papel exigiria uma tabela de perfis no Supabase.
