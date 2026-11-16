# Viela Tech: Front-end

Aplicação web do Viela Tech:

- **Área do Morador:** autotriagem de tosse, aberta a qualquer pessoa, com ou sem conta. Quem cria conta acompanha as próprias triagens em **Minha área**.
- **Painel ACS:** fila de visitas dos Agentes Comunitários de Saúde. Funciona sem sinal.
- **Dashboard do Gestor:** microclima medido pelo sensor IoT, indicadores, gráficos e o mapa das sub-áreas da Rocinha.
- **Mapa da tuberculose (público):** o Rio por bairros com a Rocinha em destaque, comparação com a cidade e o Brasil e o que fazer. Só usa números com fonte citada.

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
| `npm run imagens` | gera AVIF/WebP em vários tamanhos em `public/img/` a partir de `fotos-originais/` (veja o `LEIA-ME.md` da pasta) |

### Sem `.env`

O app abre normalmente e avisa que está em **modo local**. As triagens ficam no `LocalStorage` do aparelho e são enviadas quando o Supabase for configurado. O login da equipe fica desabilitado até lá.

### Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas `chamados_coleta`, `leituras_microclima` e `perfis`, os gatilhos (prioridade, dono da triagem e perfil de cada conta nova) e as políticas de segurança (RLS).
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
| `/minha-area` | morador logado | histórico e andamento das próprias triagens |
| `/acs` | ACS e gestor | fila de visitas |
| `/gestor` | gestor | dashboard e mapa das sub-áreas |

O papel vem da tabela `perfis` e só muda pelo Supabase. A RLS garante no banco o que a tela mostra: o morador lê apenas as próprias triagens, e só `acs` e `gestor` leem a fila completa e o microclima. Depois do login, cada perfil vai para a sua área. Quem tenta abrir a área de outro perfil vê uma explicação no lugar da página.

---

## Arquitetura

O código separa **regra de negócio**, **acesso a dados** e **apresentação**:

```text
src/
├── domain/          Regras de negócio puras, sem React (testadas com Vitest)
│   ├── risco.js        Faixas do IVM (40/70), fórmula do IVM e tosse >= 21 dias
│   ├── chamados.js     Fila de prioridade, etapas do atendimento e indicadores
│   ├── triagem.js      Validação do formulário e payload da API
│   ├── unidades.js     Unidades de saúde de referência
│   ├── perfis.js       Papéis, rotas permitidas e destino depois do login
│   └── setores.js      Sub-áreas da Rocinha e normalização do setor digitado
├── data/            Bairros do Rio (SVG), números da tuberculose com fonte, manifesto das imagens
├── services/        Acesso a dados
│   ├── api.js          Contratos com o Supabase e fallback offline (já existia)
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
│   └── useAuth.js          sessão e papel (AuthContext)
├── context/AuthContext.jsx
├── components/      Apresentação
│   ├── brand/          Logo (SVG), skyline da favela, ondas do calçadão, bandeirinhas, selos
│   ├── ui/             Button, Alert, Field, Foto, SignIn (tela de login), Spinner, Badge…
│   ├── layout/         Header (navegação por perfil, Online/Offline, tema), Layout
│   ├── auth/           ProtectedRoute (por papel)
│   ├── mapa/           MapaRocinha (esquemático, só para a equipe)
│   ├── morador/        TriagemForm, ResultadoTriagem
│   ├── acs/            ChamadoCard, ChamadosFilter, SyncBar
│   └── gestor/         MicroclimaPanel, StatCard, BarChart
└── pages/           Home, Morador, Entrar, Equipe, RedefinirSenha, MinhaArea, Mapa, Acs, Gestor, NotFound
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

O CRUD completo é feito pela API REST do Supabase: **C**reate (triagem), **R**ead (fila e microclima) e **U**pdate (status). O `api.js` não mudou. Sem `.env`, o `supabaseClient.js` não derruba o app e deixa o `api.js` cair no modo local. A triagem de um morador logado fica ligada a ele pelo próprio banco (coluna `morador_id` com `default auth.uid()` e um gatilho), sem alterar o contrato.

### Regras de negócio

- **IVM** = 0,6 × Umidade + 0,4 × (100 − Insolação), a mesma fórmula do ESP32 (`wokwi/main.py`) e do Python.
- **Faixas:** Normal abaixo de 40% (`#16A34A`) · Atenção de 40% a menos de 70% (`#D97706`) · Perigo a partir de 70% (`#DC2626`).
- **Tosse de 21 dias ou mais** é urgente: alerta vermelho para o morador, faixa "URGENTE — TOSSE +21 DIAS" e topo da fila para o ACS. O banco reforça a regra com um gatilho.
- **Fila do ACS:** urgentes em aberto, depois os demais em aberto e por fim os concluídos. Dentro de cada grupo, quem espera há mais tempo vem antes.
- **Offline-first (RN-04):** sem sinal, tudo fica no `LocalStorage`. Ao voltar a conexão, a sincronização roda sozinha, e também há o botão **Sincronizar**.

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
- Link "Pular para o conteúdo", foco sempre visível, `aria-live` nos resultados, `aria-invalid` e mensagens ligadas aos campos, foco movido para o primeiro erro e para o resultado da triagem.
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

- **Unitários (Vitest):** testes de `domain/` cobrindo a normalização dos setores da Rocinha, os limiares 40/70, a fórmula do IVM, a regra dos 21 dias, a ordenação da fila, os filtros, os indicadores e a validação da triagem.
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

- **Leitura anônima recente:** `salvarTriagemMorador()` faz `insert().select().single()`. Para o morador anônimo receber a confirmação, a política RLS libera a leitura das linhas criadas nos últimos 2 minutos. Uma melhoria futura é trocar por uma função RPC que só devolva o `id`.
- **Origem da tabela `leituras_microclima`:** hoje o ESP32 publica no ThingSpeak, e nenhum script grava essa tabela automaticamente. Até existir essa integração, ela pode ser populada pelo seed do `schema.sql` (com leituras reais de `python/historico.json`) ou manualmente.
- **Fotos:** enquanto as fotos da equipe não chegam, o site usa recortes da arte da logo. Para trocar, coloque as fotos em `fotos-originais/` e rode `npm run imagens`.
- **Dados por bairro:** sem uma fonte pública e atual da taxa de tuberculose por bairro, o mapa do Rio destaca só a Rocinha.
