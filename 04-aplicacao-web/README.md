# 04 · Aplicação web: Front-end Design + Web Development

> **Disciplinas:** Front-end Design (Aplicação Web Funcional) e Web Development (Interatividade e Funcionalidades Dinâmicas)
> **Projeto:** Viela Tech, CitizenTech FIAP Global Solution 2026.2

Aplicação web do Viela Tech:

- **Área do Morador:** autotriagem de tosse, aberta a qualquer pessoa, com ou sem conta. Quem cria conta acompanha as próprias triagens em **Minha área**.
- **Painel ACS:** fila de visitas dos Agentes Comunitários de Saúde. Funciona sem sinal.
- **Dashboard do Gestor:** microclima medido pelo sensor IoT (umidade, insolação, temperatura e IVM), indicadores, gráficos, o mapa das sub-áreas da Rocinha, o simulador didático de 24 h e o boletim comunitário para WhatsApp.
- **Mapa da tuberculose (público):** o Rio por bairros com a Rocinha em destaque, comparação com a cidade e o Brasil e o que fazer. Só usa números com fonte citada.

**Em produção:** [viela-tech-three.vercel.app](https://viela-tech-three.vercel.app), conectado ao Supabase. O banco é o Supabase do projeto Viela Tech (ver [Publicar na Vercel](#publicar-na-vercel)).

Stack: **React 18 + Vite 6 + Tailwind CSS 3 + Supabase + Lucide React**, com React Router e Vitest.

---

## Como rodar

Pré-requisito: Node.js 18 ou superior.

```bash
cd 04-aplicacao-web
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
| `npm run imagens` | gera AVIF/WebP em vários tamanhos em `public/img/` a partir de `fotos-originais/` (veja o `LEIA-ME.md` da pasta) |

### Sem `.env`

O app abre normalmente e avisa que está em **modo local**. As triagens ficam no `LocalStorage` do aparelho e são enviadas quando o Supabase for configurado. O login da equipe fica desabilitado até lá.

### Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas `chamados_coleta`, `leituras_microclima` e `perfis`, os gatilhos (prioridade, dono da triagem e perfil de cada conta nova) e as políticas de segurança (RLS).
   **Projeto criado antes de 17/11/2026:** rode também [`supabase/migracoes/2026-11-17-auditoria.sql`](supabase/migracoes/2026-11-17-auditoria.sql). Ela fecha a leitura anônima de triagens, cria as políticas de exclusão e garante a coluna `temperatura`.
3. Em **Authentication → URL Configuration**, coloque o endereço do site em *Site URL* e adicione `https://seu-site/**` (e `http://localhost:5173/**`) em *Redirect URLs*. Os links de confirmação de cadastro e de nova senha voltam para lá.
4. Em **Authentication → Users**, crie os usuários da equipe. Toda conta nasce como `morador`. Para liberar alguém da equipe, rode no SQL Editor:
   ```sql
   update public.perfis set papel = 'acs'    -- ou 'gestor'
   where id = (select id from auth.users where email = 'pessoa@exemplo.com');
   ```
5. Em **Project Settings → API**, copie a *Project URL* e a *anon public key* para o `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

## Publicar na Vercel

**O endereço oficial é `viela-tech-three.vercel.app`**, projeto na Vercel de Miguel (dono do repositório), usando o Supabase de Pedro. O projeto `viela-tech.vercel.app`, no escopo `provadelli`, usa o mesmo banco e fica como cópia de apoio. Ele **não está ligado ao GitHub** (o app da Vercel só se liga à conta dona do repositório), então um merge na `main` não o atualiza sozinho: a publicação dele é feita pela CLI, como descrito abaixo.

**Pré-requisitos:** Node.js 18+, a CLI (`npm i -g vercel`) e login na conta dona do projeto (`vercel login`).

1. Atualize a `main` e entre na pasta do app:
   ```bash
   git checkout main && git pull
   cd 04-aplicacao-web
   ```
2. Confira que os testes e o build passam antes de publicar:
   ```bash
   npm install
   npm test
   npm run build
   ```
3. Publique em produção. A pasta já está ligada ao projeto `viela-tech` (arquivo `.vercel/`, que não vai para o Git; em outra máquina rode `vercel link --scope provadelli` e escolha `viela-tech`):
   ```bash
   vercel deploy --prod --scope provadelli
   ```
4. Verifique: o comando mostra o status e a URL. Abra `https://viela-tech.vercel.app` (ou o endereço oficial, se o deploy foi no projeto de Miguel), atualize com `Ctrl+F5` e teste a Home, `/acs` e `/gestor`.

**Regras importantes:**

- Rode o comando **de dentro de `04-aplicacao-web/`**. O *Root Directory* do projeto na Vercel é `.` (a própria pasta). Se ele for trocado para `04-aplicacao-web`, a CLI passa a procurar `04-aplicacao-web/04-aplicacao-web` e o deploy falha.
- O Supabase entra **na hora do build**. As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` ficam em *Settings → Environment Variables* do projeto (marcadas para *Production*). Depois de mudá-las é preciso publicar de novo; sem um build novo elas não valem.
- Use só a chave `anon` ou `publishable`. A `service_role` é secreta e nunca vai para o front-end.
- Para voltar a uma versão anterior: *Deployments* → escolha o deploy bom → *Promote to Production*.

**Projeto oficial (`viela-tech-three`):** importado por Miguel no Vercel dele, com *Root Directory* `04-aplicacao-web`. As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apontam para o Supabase `ngapyociufewubyamrtm` (projeto Viela Tech). Em 18/11/2026 o bundle publicado foi conferido: usa esse banco e traz a versão atual da `main`. No Supabase, o *Site URL* de autenticação é `https://viela-tech-three.vercel.app`, e as *Redirect URLs* liberam os dois domínios e o `localhost:5173`.


---

## Rotas e perfis

| Rota | Quem acessa | O que tem |
|---|---|---|
| `/` | todos | apresentação, números com fonte e caminhos por perfil |
| `/morador` | todos | triagem; com conta, fica ligada ao morador |
| `/mapa` | todos | mapa da tuberculose no Rio e unidades de saúde |
| `/entrar` | morador | entrar, criar conta e recuperar senha |
| `/equipe` | ACS e gestor | login da equipe (sem cadastro) |
| `/redefinir-senha` | quem abriu o link do e-mail | nova senha |
| `/minha-area` | morador logado | histórico e andamento das próprias triagens; exclusão de triagem |
| `/acs` | ACS e gestor | fila de visitas |
| `/gestor` | gestor | dashboard, mapa das sub-áreas, simulador de 24 h e boletim |
| `/privacidade`, `/termos` | todos | política de privacidade (LGPD) e termos de uso |

O papel vem da tabela `perfis` e só muda pelo Supabase. A RLS garante no banco o que a tela mostra: o morador lê apenas as próprias triagens, e só `acs` e `gestor` leem a fila completa e o microclima. Depois do login, cada perfil vai para a sua área. Quem tenta abrir a área de outro perfil vê uma explicação no lugar da página.

### Acesso para avaliação

Para ver todas as páginas, entre como **gestor** em [`/equipe`](https://viela-tech-three.vercel.app/equipe):

| Campo | Valor |
|---|---|
| **Endereço** | [viela-tech-three.vercel.app/equipe](https://viela-tech-three.vercel.app/equipe) |
| **E-mail** | `vielatech@hotmail.com` |
| **Senha** | `Vielatech@2026` |
| **Papel** | gestor |

O perfil de gestor abre `/gestor` (dashboard, mapa das sub-áreas, simulador de 24 h e boletim) e `/acs` (fila de visitas). As demais páginas (`/`, `/morador`, `/mapa`, `/privacidade`, `/termos`) são públicas. Para ver `/minha-area`, crie uma conta de morador em `/entrar`.

> Esta conta existe só para a avaliação. As triagens do banco são de teste, e o aviso de privacidade do app explica o tratamento dos dados.

---

## Arquitetura

O código separa **regra de negócio**, **acesso a dados** e **apresentação**:

```text
src/
├── domain/          Regras de negócio puras, sem React (testadas com Vitest)
│   ├── risco.js        Faixas do IVM (40/70), fórmula do IVM e tosse >= 21 dias
│   ├── simulacao.js    Cenário do simulador de 24 h e do boletim (marca valores simulados)
│   ├── chamados.js     Fila de prioridade, etapas do atendimento e indicadores
│   ├── triagem.js      Validação do formulário (inclui consentimento) e payload da API
│   ├── cadastro.js     Validação de e-mail e força da senha
│   ├── unidades.js     Unidades de saúde de referência
│   ├── perfis.js       Papéis, rotas permitidas e destino depois do login
│   └── setores.js      Sub-áreas da Rocinha e normalização do setor digitado
├── data/            Bairros do Rio (SVG), números da tuberculose com fonte, manifesto das imagens
├── services/        Acesso a dados
│   ├── api.js          Contratos com o Supabase (CRUD) e fallback offline
│   ├── config.js       Diz se o Supabase está configurado, sem carregar a biblioteca
│   ├── supabaseClient.js
│   ├── authService.js  Login, cadastro e recuperação de senha (Supabase Auth)
│   ├── perfilService.js Papel do usuário e "minhas triagens"
│   └── sincronizacao.js Trava contra sincronizações simultâneas
├── hooks/           Custom hooks: a ponte entre dados e tela
│   ├── useTriagem.js       formulário + salvarTriagemMorador()
│   ├── useChamados.js      buscarChamadosACS(), atualizarStatusChamado(), sincronização
│   ├── useMicroclima.js    buscarUltimaLeituraMicroclima() com atualização a cada 60 s
│   ├── useEnvioPendente.js reenvio automático das triagens guardadas no aparelho
│   ├── useOnlineStatus.js  eventos online/offline
│   ├── useTheme.js         tema claro/escuro persistido
│   ├── useAnimacao.js      entrada na tela e contadores (respeita movimento reduzido)
│   └── useAuth.js          sessão e papel (AuthContext)
├── context/AuthContext.jsx
├── components/      Apresentação
│   ├── brand/          Logo (SVG)
│   ├── ui/             Button, Alert, Field, Feedback (Spinner, EmptyState, Badge), Foto,
│   │                   SignIn, LiquidNavbar, ConfigNotice, ErrorBoundary
│   ├── layout/         Header (navegação por perfil, Online/Offline, tema), Layout
│   ├── home/           Efeitos de texto e rolagem, MiniMapa
│   ├── painel/         Cabeçalho e blocos dos painéis da equipe
│   ├── auth/           ProtectedRoute (por papel)
│   ├── mapa/           MapaTematico (Rio), MapaRocinha (só equipe)
│   ├── morador/        TriagemForm, ResultadoTriagem
│   ├── acs/            ChamadoCard, ChamadosFilter, SyncBar
│   └── gestor/         MicroclimaPanel, BarChart, BacterialSimulator, CommunityBulletin
└── pages/           Home, Morador, Entrar, Equipe, RedefinirSenha, MinhaArea, Mapa, Acs, Gestor, Legal, NotFound
```

Os componentes não acessam o Supabase diretamente: tudo passa pelos hooks, e os hooks chamam `services/api.js`. As regras (o que é urgente, em que ordem atender, qual faixa de risco) vivem em `domain/`, então dá para testá-las sem navegador.

### Contratos usados (`services/api.js`)

| Função | Onde é usada | O que faz |
|---|---|---|
| `salvarTriagemMorador(dados)` | Área do Morador | grava a triagem ou guarda no aparelho se falhar |
| `buscarChamadosACS()` | Painel ACS e Gestor | lista os chamados e mescla os registros locais |
| `atualizarStatusChamado(id, novoStatus)` | Painel ACS | `EM_ANDAMENTO` → `COLETADO` → `CONCLUÍDO` |
| `sincronizarPendenciasOffline()` | Painel ACS e Morador | envia as triagens e mudanças de status pendentes |
| `buscarUltimaLeituraMicroclima()` | Gestor | última leitura de umidade, insolação, temperatura e IVM |
| `excluirTriagem(id)` | Minha área | apaga a própria triagem (RLS: dono ou gestor) e confere se a linha saiu |

O **CRUD completo** é feito pela API REST do Supabase:

| Operação | Função | Tabela |
|---|---|---|
| **C**reate | `salvarTriagemMorador()` | `chamados_coleta` (insert) |
| **R**ead | `buscarChamadosACS()`, `minhasTriagens()` (perfilService), `buscarUltimaLeituraMicroclima()` | `chamados_coleta`, `leituras_microclima` (select) |
| **U**pdate | `atualizarStatusChamado()`, `sincronizarPendenciasOffline()` | `chamados_coleta` (update) |
| **D**elete | `excluirTriagem()` | `chamados_coleta` (delete) |

Sem `.env`, o `supabaseClient.js` não derruba o app e deixa o `api.js` cair no modo local. A triagem de um morador logado fica ligada a ele pelo próprio banco (coluna `morador_id` com gatilho), sem alterar o contrato.

O envio anônimo usa `insert()` **sem** `.select()`. Assim quem não tem conta não precisa de permissão de leitura, e ninguém consegue ler triagens de outras pessoas.

### Regras de negócio

- **IVM** = 0,6 × Umidade + 0,4 × (100 − Insolação), a mesma fórmula do [ESP32](../01-edge-computing-esp32/main.py), do [Python](../02-python/main.py) e da [Matemática](../03-matematica-modelagem/README.md).
- **Faixas:** Normal abaixo de 40% (`#16A34A`) · Atenção de 40% a menos de 70% (`#D97706`) · Perigo a partir de 70% (`#DC2626`).
- **Tosse de 21 dias ou mais** é urgente: alerta vermelho para o morador, faixa "URGENTE — TOSSE +21 DIAS" e topo da fila para o ACS. O banco reforça a regra com um gatilho.
- **Fila do ACS:** urgentes em aberto, depois os demais em aberto e por fim os concluídos. Dentro de cada grupo, quem espera há mais tempo vem antes.
- **Offline-first (RN-04):** sem sinal, tudo fica no `LocalStorage`. Ao voltar a conexão, a sincronização roda sozinha, e também há o botão **Sincronizar**.
- **Consentimento (LGPD art. 11, I):** a triagem só é enviada com a caixa de consentimento marcada. O morador com conta pode excluir as próprias triagens (art. 18). Ao sair da conta, o cache local da equipe é apagado do aparelho. Uma triagem guardada sem sinal só é enviada pela mesma conta que a criou (ou sem conta, se foi feita sem login), para não ficar ligada a outra pessoa num celular compartilhado.
- **Simulador de 24 h e boletim:** usam o IVM oficial e o semáforo de 3 faixas. Quando o sensor não mandou algum campo, o valor aparece como **(simulado)**. A taxa de crescimento do simulador é uma hipótese didática e não mede risco de tuberculose.

### Interações em JavaScript (Web Development)

| Interação | Onde | O que acontece |
|---|---|---|
| Tema claro/escuro | Header | troca a classe `dark` no `<html>` e salva no `localStorage` |
| Autotriagem com validação | `/morador` | valida cada campo, leva o foco ao primeiro erro e exige o consentimento |
| Alerta de tosse ≥ 21 dias | `/morador` | com 21 dias ou mais, aparece o alerta vermelho e o selo de prioridade |
| Fila do ACS | `/acs` | filtros, busca e mudança de status |
| Modo offline | `/acs`, `/morador` | guarda no aparelho e sincroniza ao reconectar |
| Exclusão de triagem | `/minha-area` | confirmação na própria tela, remoção no banco e aviso de sucesso |
| Simulador de 24 h | `/gestor` | o controle deslizante recalcula fator, faixa e curva |
| Boletim no WhatsApp | `/gestor` | monta a mensagem com os dados e as dicas e abre o `wa.me` |
| Mapas e gráficos | `/mapa`, `/gestor` | foco por teclado, tooltip e alternativa em tabela |

---

## Mapa da tuberculose: fontes

- **Números:** reportagem de Felipe Betim no El País Brasil (12/09/2015), [republicada pelo IHU Unisinos](https://ihu.unisinos.br/noticias/546729-tuberculose-na-rocinha-expoe-o-brasil-que-estacionou-no-seculo-xix), com base nos casos registrados pela Prefeitura do Rio e na OMS:
  - Rocinha: 455 por 100 mil (2001) e 372 (2013);
  - município do Rio: 107,6 (2001) e 89,7 (2013);
  - Brasil: 33,8 (2014).

  Ficam em `src/data/tuberculoseRio.js`, cada um com ano e link.
- **Limites dos bairros:** Limite de Bairros do Município do Rio de Janeiro (Data.Rio / Instituto Pereira Passos, licença ODbL), simplificado com mapshaper.
- Não há tabela pública e atual da taxa de cada bairro. Por isso só a Rocinha é pintada, e a página explica o motivo.
- O mapa das sub-áreas da Rocinha usa só as triagens do app e fica restrito à equipe, porque contagens pequenas de uma doença por área podem identificar pessoas. As posições são aproximadas.

---

## Identidade visual e acessibilidade

A identidade junta a paleta oficial a elementos cariocas: casas coloridas empilhadas, caixas d'água, as ondas do calçadão, bandeirinhas e selos no estilo de letreiro pintado. A logo foi vetorizada a partir da arte original (`src/assets/brand/original/`) e recolorida, com a peça do V em `sky-600` e a do T em `emerald`. As fontes (Bricolage Grotesque nos títulos e Inter no texto) são servidas pelo próprio site.

| Elemento | Cor | Tailwind |
|---|---|---|
| Azul Saúde Cívica | `#0284C7` | `sky-600` |
| Verde Esmeralda | `#059669` | `emerald-600` |
| Fundo claro / escuro | `#F8FAFC` / `#0F172A` | `slate-50` / `slate-900` |
| Cards claro / escuro | `#FFFFFF` / `#1E293B` | `white` / `slate-800` |
| Texto principal | `#0F172A` | `slate-900` |
| Acentos decorativos | sol `#FBBF24`, tijolo `#C2410C`, laje `#DB2777`, mar `#0E7490` | `sol`, `tijolo`, `laje`, `mar` |

Os acentos servem só de decoração. As cores de risco continuam reservadas para status.

- **Tema claro como padrão.** O escuro fica no botão do header, e a escolha é salva no aparelho.
- **Contraste sob luz solar:** texto branco sobre `#0284C7` tem contraste de cerca de 4,1:1, abaixo dos 4,5:1 exigidos pela WCAG AA. Por isso os botões usam o tom `sky-700` (e `emerald-700`) da mesma família. O `sky-600` continua nas marcas, ícones, anéis de foco e gráficos. As cores de risco aparecem com ícone e rótulo escrito, nunca só como cor.
- **Alvos de toque de no mínimo 48px** em botões, links e campos.
- Menu do celular: o foco vai para o primeiro link ao abrir e volta ao botão ao fechar com Esc.
- Se uma página falhar ao carregar (por exemplo, sem internet), o `ErrorBoundary` mostra uma explicação e o botão **Recarregar** em vez de tela branca.
- Link "Pular para o conteúdo", foco sempre visível, `aria-live` só nas mensagens que mudam, `aria-invalid` e mensagens ligadas aos campos, foco movido para o primeiro erro e para o resultado da triagem.
- Gráficos e mapas com tooltip (mouse e teclado) e alternativa em tabela. A escala de cores do mapa da Rocinha foi validada nos dois temas: um só tom, degraus visíveis entre as faixas e contraste com o fundo.
- Respeita `prefers-reduced-motion` e não tem rolagem horizontal do celular (360px) ao monitor grande.

### Desempenho

- As rotas são carregadas sob demanda. A biblioteca do Supabase só é baixada nas áreas com login ou quando já existe sessão no aparelho.
- Imagens em AVIF/WebP com `srcset`, largura e altura definidas, e a foto principal pré-carregada.
- O `vercel.json` define cache longo para `/assets`, `/img` e `/fonts` e os cabeçalhos de segurança.
- **Lighthouse (build local):**
  - desktop: 100 em Desempenho, Acessibilidade, Boas práticas e SEO em todas as páginas testadas;
  - celular (4G simulado): 100 em Acessibilidade, Boas práticas e SEO, e de 94 a 99 em Desempenho.

---

## Testes realizados

- **Unitários (Vitest, 36 testes):** testes de `domain/` cobrindo:
  - a normalização dos setores da Rocinha;
  - os limiares 40/70, a fórmula do IVM e a regra dos 21 dias;
  - a ordenação da fila, os filtros e os indicadores;
  - a validação da triagem, incluindo o consentimento;
  - o cenário do simulador e do boletim, com a marcação de valores simulados.

  Em 17/11/2026: 24 de 24 passaram, e `npm run build` terminou sem erros.
- **Verificação no navegador (17/11/2026, build de produção local):**
  - a triagem sem consentimento é bloqueada, a mensagem aparece e o foco vai para a caixa;
  - o tema alterna e fica salvo;
  - o menu do celular leva o foco ao primeiro link e o devolve ao botão com Esc;
  - nenhum erro no console.

  As telas com login (ACS, gestor e exclusão) não foram verificadas nesta rodada, porque dependem de contas do Supabase.
- **Ponta a ponta (Chrome headless):**
  - triagem normal e urgente, validação e foco, payload salvo no `LocalStorage`;
  - login protegido;
  - fila priorizada, faixa vermelha e mudança de status (PATCH);
  - modo offline com fila de sincronização e envio automático ao reconectar;
  - Dashboard com IVM em "Perigo", indicadores, gráficos, tooltip e tabela;
  - temas claro e escuro, celular e desktop, sem rolagem horizontal.

  Nesses testes, as respostas do Supabase foram simuladas por interceptação de rede.
- **Em produção:** uma triagem urgente enviada em viela-tech.vercel.app chegou ao Supabase com `prioridade_alta = true` e status `PENDENTE`, sem erros no console.

## Limitações conhecidas

- **Migração pendente no Supabase:** enquanto `supabase/migracoes/2026-11-17-auditoria.sql` não for aplicada, duas coisas continuam como antes:
  - a política antiga de leitura anônima de 2 minutos segue ativa no banco;
  - a exclusão devolve "sem permissão".

  O app funciona nos dois estados.
- **Origem da tabela `leituras_microclima`:** o ESP32 publica no ThingSpeak, e nenhum script grava essa tabela automaticamente. Até existir essa integração, ela pode ser populada manualmente ou pelo exemplo de seed comentado no fim do `schema.sql`.
- **Offline:** a fila offline funciona depois que o app foi aberto ao menos uma vez com internet. Não há *service worker*, então abrir o site pela primeira vez sem sinal não funciona.
- **Foto da Home:** é uma ilustração gerada por IA (ver [`AI.md`](../AI.md)), não uma fotografia real da Rocinha.
- **Sem ESLint configurado:** a qualidade é garantida por testes, build e revisão.
- **Dados por bairro:** sem uma fonte pública e atual da taxa de tuberculose por bairro, o mapa do Rio destaca só a Rocinha.
