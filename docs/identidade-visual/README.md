# Identidade visual: timbrado Viela Tech

Todo documento das entregas usa este timbrado: faixa em degradê azul→verde, logo horizontal, slogan, marca d'água do símbolo e rodapé com site, e-mail, nome do documento e página.

Cores (as mesmas do app, em `04-aplicacao-web/tailwind.config.js`): Azul Saúde Cívica `#0284C7` / `#0369A1`, Verde Esmeralda `#059669` / `#10B981` e grafite `#0F172A`. Fonte: Inter.

| Arquivo | Para quê |
|---|---|
| [`Timbrado-VielaTech.docx`](Timbrado-VielaTech.docx) | Modelo para escrever novos documentos no Word (cabeçalho e rodapé já prontos). |
| [`Timbrado-VielaTech.pdf`](Timbrado-VielaTech.pdf) | Prévia do modelo. |
| [`aplicar_timbrado.py`](aplicar_timbrado.py) | Coloca o timbrado em qualquer PDF já gerado (requer `pymupdf`). |
| [`recursos/`](recursos/) | Logo, fundo e as fontes Inter usadas pela ferramenta e pelo modelo. |

## PDFs já com timbrado

- `03-matematica-modelagem/Relatorio_Matematica.pdf`: aplicado por `modelo_calculo.py` ao gerar o relatório.
- `05-software-tx-design/VielaTech-SoftwareTX-Relatorio.pdf`: aplicado por `ferramentas/gerar_relatorio_unico.py`, em todas as páginas menos a capa, que tem arte própria em página cheia.
- `05-software-tx-design/VielaTech-Backlog.pdf` é a fonte do relatório único e fica sem alteração.

## Um documento novo

```powershell
python docs/identidade-visual/aplicar_timbrado.py entrada.pdf --documento "Nome no rodapé" --topo 84 --base 780
```

`--topo` e `--base` recortam o cabeçalho e o rodapé antigos (em pontos); `--pular 1` deixa a capa como está. O script recusa aplicar duas vezes no mesmo arquivo.
