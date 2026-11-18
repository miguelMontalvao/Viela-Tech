# Matriz de conformidade: GS 2026.2 CitizenTech

**Auditoria de 17/11/2026, branch `auditoria-final`.**

Legenda:

| Status | Significado |
|---|---|
| **APROVADO** | Atende, com evidência no repositório. |
| **PARCIAL** | Atende em parte; a lacuna está descrita. |
| **PENDENTE** | Não atende ainda. |
| **NÃO VERIFICÁVEL** | Depende de algo fora do repositório. |

## Verificações externas feitas em 17/11/2026

| Item | Resultado |
|---|---|
| Repositório `github.com/miguelMontalvao/Viela-Tech` | público (a API do GitHub respondeu 200) |
| Site `viela-tech.vercel.app` | no ar (HTTP 200); publica a versão da `main`, não esta branch |
| Projeto do Wokwi `480218232420257793` | acessível (HTTP 200); **ainda com o código antigo**, que não tem a faixa ATENÇÃO e usa a chave antiga |
| Canal ThingSpeak 3571901 | público, com **4 leituras** (`last_entry_id: 4`, de 09/11/2026) |

## 1 · Edge Computing & Computer Systems ([`01-edge-computing-esp32/`](../01-edge-computing-esp32/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| ESP32 simulado no Wokwi com sensores | APROVADO | `diagram.json`: DHT22, LDR, OLED SSD1306 e 3 LEDs com resistores |
| Leitura, processamento local e atuação | APROVADO | `main.py`: IVM, faixas 40/70, LEDs verde/amarelo/vermelho e OLED |
| Envio para a nuvem (ThingSpeak) | APROVADO | `enviar_thingspeak()` com os campos 1 a 4; [print do canal](../01-edge-computing-esp32/evidencias/thingspeak-campos.png) |
| Sem credenciais no código | PARCIAL | Marcador `SUA_WRITE_API_KEY` no código. **A chave antiga continua no histórico do git e precisa ser trocada no ThingSpeak.** |
| README com problema, funcionamento, links e evidências | APROVADO | [`README.md`](../01-edge-computing-esp32/README.md) |
| Projeto online atualizado | PENDENTE | A equipe precisa colar o `main.py` e o `diagram.json` novos no Wokwi |

## 2 · Computational Thinking with Python ([`python/`](../python/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Consumo de API com tratamento de erro e timeout | APROVADO | `buscar_leituras()` com `requests.RequestException` e timeout de 5 s |
| Estruturas de dados, funções e menu | APROVADO | `CONFIGURACAO` (dicionário), listas de registros, `menu()` com 4 opções |
| Normalização e validação de parâmetros | APROVADO | `normalizar()` (min-max) e `validar_configuracao()`, que lança `ValueError` |
| Persistência (JSON e CSV) e fallback | APROVADO | `historico.json`, `backup.json` e `relatorio.csv`; usa o backup quando a API falha ou volta vazia |
| Testes | APROVADO | `test_main.py`: 26 testes passando, sem rede |
| Execução real documentada | APROVADO | Saída do terminal no [README](../python/README.md#evidência-de-execução) |
| Volume de dados (mínimo de 20 leituras) | PENDENTE | O canal tem 4 leituras. É preciso rodar o Wokwi atualizado por 5 minutos ou mais e executar de novo. |

## 3 · Differentiated Problem Solving: Matemática ([`03-matematica-modelagem/`](../03-matematica-modelagem/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Modelo matemático do problema | APROVADO | IVM(t) a partir de U(t) e I(t) |
| Limites | APROVADO | Quociente de diferenças convergindo para a derivada exata em t = 9 h; limites laterais às 6 h |
| Derivadas e taxas de variação | APROVADO | `numpy.gradient` e derivada analítica; pico de 11,19 p.p./h |
| Integrais | APROVADO | Simpson e trapézio: 1723,54 %·h; 14,17 h em PERIGO |
| Relatório PDF com capa, interpretação e conclusão | APROVADO | `Relatorio_Matematica.pdf` (6 páginas) |
| Testes | APROVADO | `test_modelo_calculo.py`: 16 testes passando |
| Dados reais | PARCIAL | Com menos de 20 leituras no CSV, o modelo usa uma simulação de 24 h **identificada como tal**. A troca para o CSV real é automática. |

## 4 · Front-end Design ([`04-aplicacao-web/`](../04-aplicacao-web/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Aplicação React funcional e publicada | APROVADO | Vite + React 18; [viela-tech.vercel.app](https://viela-tech.vercel.app) |
| Componentes, props, estado e hooks | APROVADO | `components/`, 8 custom hooks em `hooks/` |
| Separação de camadas | APROVADO | `domain/` → `services/` → `hooks/` → `components/`/`pages/` |
| Integração com API e CRUD completo | APROVADO | `api.js`: insert, select, update e **delete** (`excluirTriagem`) |
| Responsividade e acessibilidade | APROVADO | Alvos de 48 px, foco visível e gerenciado, ARIA, contraste AA, tema claro/escuro, `ErrorBoundary` |
| Testes e build | APROVADO | Vitest: 24 de 24 passando; `npm run build` sem erros |
| Deploy com a nova estrutura | PENDENTE | Na Vercel, o *Root Directory* precisa passar a ser `04-aplicacao-web` antes do merge |
| Banco com as correções de segurança | PENDENTE | É preciso aplicar `supabase/migracoes/2026-11-17-auditoria.sql` no projeto Supabase |

## 5 · Software & Total Experience Design ([`05-software-tx-design/`](../05-software-tx-design/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Capa, integrantes e sumário | APROVADO | Relatório, backlog original, páginas 1 e 2 |
| Escopo | APROVADO | [`README.md` §1](../05-software-tx-design/README.md#1-escopo); não está no PDF |
| Personas e jornada | APROVADO | Relatório, backlog original, página 6 |
| Regras de negócio, RF e RNF | APROVADO | Relatório, backlog original, páginas 7 e 8; status da implementação no README |
| Backlog MoSCoW com critérios de aceite | APROVADO | Relatório, backlog original, páginas 9 a 13, mais US-16 e US-17 em `VielaTech-Backlog.md` |
| Rastreabilidade | APROVADO | Relatório, backlog original, página 14 |
| Conclusão | APROVADO | Seção 13 do relatório único e [`README.md` §9](../05-software-tx-design/README.md#9-conclusão) |
| Relatório único com capa, nomes, índice, justificativa e conclusão | APROVADO | [`VielaTech-SoftwareTX-Relatorio.pdf`](../05-software-tx-design/VielaTech-SoftwareTX-Relatorio.pdf), 21 páginas |

## 6 · Storytelling & Inspiração Empreendedora: Pitch ([`06-pitch-storytelling/`](../06-pitch-storytelling/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Roteiro de até 3 minutos | APROVADO | Roteiro cronometrado com a demonstração real |
| Vídeo publicado (YouTube, não listado) | PENDENTE | Precisa ser gravado e publicado pela equipe |
| Link no README | PENDENTE | Depende do vídeo |

## 7 · Web Development ([`04-aplicacao-web/`](../04-aplicacao-web/))

| Requisito | Status | Evidência / observação |
|---|---|---|
| Interações em JavaScript com efeito real | APROVADO | Tabela "Interações" no [README do app](../04-aplicacao-web/README.md) |
| Manipulação do DOM e eventos | APROVADO | Tema (classe `dark`), formulário com validação e foco, controle deslizante do simulador, menu com Esc |
| Persistência no navegador | APROVADO | Tema e fila offline no `localStorage` |
| Integração com API externa | APROVADO | API REST do Supabase; link `wa.me` do boletim |

## Itens transversais

| Requisito | Status | Evidência / observação |
|---|---|---|
| Pastas por entrega na raiz | APROVADO | `01-` a `06-` e `docs/` |
| README raiz completo | APROVADO | [`README.md`](../README.md) |
| Registro de uso de IA | APROVADO | [`AI.md`](../AI.md) |
| Integrantes com RM | APROVADO | [`Integrantes.md`](../Integrantes.md) |
| Repositório público | APROVADO | API do GitHub respondeu 200 em 17/11/2026 |
| ZIP do repositório | APROVADO | `Viela-Tech.zip` gerado do último commit com `git archive` |
| LGPD (consentimento, exclusão, mínimo de dados) | PARCIAL | Implementado no código; **depende da migração no Supabase** para valer em produção |
| Merge na `main` e submissão no Teams | PENDENTE | Feito pela equipe |
