"""Monta o relatório único de Software & TX Design.

Entrada: VielaTech-Backlog.pdf (16 páginas, intocado) + README.md da pasta.
Saída: VielaTech-SoftwareTX-Relatorio.pdf =
  capa e resumo originais + índice completo + páginas originais + 11 Escopo e
  justificativa + 12 Status da implementação + 13 Conclusão.
"""
import html
import re
import sys
from pathlib import Path

import pymupdf

PASTA = Path(sys.argv[1])
ORIGINAL = PASTA / "VielaTech-Backlog.pdf"
SAIDA = PASTA / "VielaTech-SoftwareTX-Relatorio.pdf"
README = (PASTA / "README.md").read_text(encoding="utf-8")
RODAPE = "Viela Tech · Backlog do Produto · FIAP GS 2026.2"
A4 = pymupdf.paper_rect("a4")
CINZA, ESCURO = (0.58, 0.64, 0.72), (0.06, 0.09, 0.16)


def secao(numero: int) -> str:
    m = re.search(rf"^## {numero}\. .*?$(.*?)(?=^## )", README, re.S | re.M)
    return m.group(1).strip()


def md_inline(t: str) -> str:
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)
    return re.sub(r"`(.+?)`", r"<code>\1</code>", t)


def md_bloco(texto: str) -> str:
    """Converte o Markdown simples do README (parágrafos, listas, tabelas)."""
    saida, lista, tabela = [], None, []

    def fecha():
        nonlocal lista, tabela
        if lista:
            saida.append(f"</{lista}>")
            lista = None
        if tabela:
            cab, *linhas = tabela
            th = "".join(f"<th>{md_inline(c)}</th>" for c in cab)
            tr = "".join("<tr>" + "".join(f"<td>{md_inline(c)}</td>" for c in l) + "</tr>" for l in linhas)
            saida.append(f"<table><tr>{th}</tr>{tr}</table>")
            tabela = []

    em_codigo = False
    for linha in texto.splitlines():
        if linha.startswith("```"):
            em_codigo = not em_codigo
            continue
        if em_codigo:
            continue
        s = linha.strip()
        if s.startswith("|"):
            celulas = [c.strip() for c in s.strip("|").split("|")]
            if not all(set(c) <= set("-: ") for c in celulas):
                tabela.append(celulas)
            continue
        if re.match(r"^(- |\d+\. )", s):
            tipo = "ul" if s.startswith("- ") else "ol"
            if lista != tipo:
                fecha()
                saida.append(f"<{tipo}>")
                lista = tipo
            saida.append(f"<li>{md_inline(re.sub(r'^(- |\d+\. )', '', s))}</li>")
            continue
        fecha()
        if s.startswith("### "):
            saida.append(f"<h3>{md_inline(s[4:])}</h3>")
        elif s:
            saida.append(f"<p>{md_inline(s)}</p>")
    fecha()
    return "\n".join(saida)


CSS = """
* { font-family: sans-serif; color: #0f172a; }
body { font-size: 10pt; line-height: 1.45; }
.rotulo { font-size: 7.5pt; color: #64748b; letter-spacing: 1.5px; margin: 0; }
.num { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 2px 6px; }
h1 { font-size: 20pt; margin: 4px 0 10px 0; }
h3 { font-size: 11.5pt; margin: 14px 0 4px 0; }
p { margin: 0 0 7px 0; }
ul, ol { margin: 0 0 8px 0; }
li { margin-bottom: 3px; }
code { font-family: monospace; font-size: 8.5pt; color: #334155; }
table { border-collapse: collapse; width: 100%; margin: 4px 0 10px 0; }
th { font-size: 7.5pt; color: #64748b; text-align: left; border-bottom: 1px solid #0f172a; padding: 4px; }
td { font-size: 8.5pt; border-bottom: 1px solid #e2e8f0; padding: 4px; vertical-align: top; }
.indice td { font-size: 10.5pt; padding: 7px 4px; }
"""


def cabecalho(numero: str, rotulo: str, titulo: str) -> str:
    return (f'<p class="rotulo"><span class="num">{numero}</span>&#160;&#160;{rotulo}</p>'
            f"<h1>{titulo}</h1>")


def renderizar(corpo: str) -> pymupdf.Document:
    story = pymupdf.Story(html=f"<body>{corpo}</body>", user_css=CSS)
    buffer = pymupdf.open()
    escritor_mem = __import__("io").BytesIO()
    escritor = pymupdf.DocumentWriter(escritor_mem)
    area = pymupdf.Rect(42, 48, A4.width - 42, A4.height - 60)
    mais = True
    while mais:
        dispositivo = escritor.begin_page(A4)
        mais, _ = story.place(area)
        story.draw(dispositivo)
        escritor.end_page()
    escritor.close()
    buffer = pymupdf.open("pdf", escritor_mem.getvalue())
    return buffer


def rodape(pagina: pymupdf.Page, numero: int, apagar: bool) -> None:
    caixa = pymupdf.Rect(520, 806, 560, 824)
    if apagar:
        pagina.add_redact_annot(caixa, fill=(1, 1, 1))
        pagina.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    else:
        pagina.insert_text((42.5, 819), RODAPE, fontsize=8, fontname="helv", color=CINZA)
    texto = str(numero)
    largura = pymupdf.get_text_length(texto, "helv", 8)
    pagina.insert_text((553.5 - largura, 819), texto, fontsize=8, fontname="helv", color=(0.39, 0.45, 0.55))


# --- Conteúdo novo -------------------------------------------------------
escopo = secao(1)
justificativa = secao(2)
status = secao(7)
conclusao = secao(9)

orig = pymupdf.open(ORIGINAL)
# Páginas finais: 1-2 originais, 3 índice, 4-19 = originais 3-16 (+1), 20+ novas.
itens = [
    ("01", "Território e problema"), ("02", "A solução e a arquitetura"), ("03", "Linguagem visual"),
    ("04", "Personas"), ("05", "Regras de negócio e IVM"), ("06", "Requisitos"),
    ("07", "Backlog do produto"), ("08", "Rastreabilidade"), ("09", "Qualidade e roadmap"),
    ("10", "Riscos, próximos passos e referências"),
]
# Página de início de cada seção original, procurando o rótulo numerado no topo.
inicio = {}
for i in range(2, orig.page_count):
    topo = orig[i].get_text(clip=pymupdf.Rect(0, 0, A4.width, 80)).split()
    if topo and topo[0] in dict(itens) and topo[0] not in inicio:
        inicio[topo[0]] = i + 2  # +1 base 1, +1 página de índice

novas = renderizar(
    cabecalho("11", "ESCOPO E JUSTIFICATIVA", "O que entra, o que fica de fora e por quê")
    + "<h3>Escopo</h3>" + md_bloco(escopo)
    + "<h3>Justificativa</h3>" + md_bloco(justificativa)
    + '<p style="page-break-before: always"></p>'
    + cabecalho("12", "STATUS DA IMPLEMENTAÇÃO", "Do backlog ao produto")
    + md_bloco(status)
    + '<p style="page-break-before: always"></p>'
    + cabecalho("13", "CONCLUSÃO", "O que o backlog entregou")
    + md_bloco(conclusao)
)
# Story não faz page-break; descobrir página de início de 11/12/13 pelo texto.
base = orig.page_count + 2
pos_nova = {}
for j, p in enumerate(novas):
    t = p.get_text()
    for k, marca in (("11", "ESCOPO E JUSTIFICATIVA"), ("12", "STATUS DA IMPLEMENTAÇÃO"), ("13", "CONCLUSÃO\n")):
        if marca in t and k not in pos_nova:
            pos_nova[k] = base + j

linhas = itens + [("11", "Escopo e justificativa"), ("12", "Status da implementação"), ("13", "Conclusão")]
paginas = {**inicio, **pos_nova}
tabela = "".join(
    f"<tr><td><code>{n}</code></td><td>{t}</td><td style='text-align:right'>{paginas.get(n, '')}</td></tr>"
    for n, t in linhas
)
indice = renderizar(
    '<p class="rotulo">RELATÓRIO ÚNICO · SOFTWARE &amp; TOTAL EXPERIENCE DESIGN</p>'
    "<h1>Índice</h1>"
    "<p>Este relatório reúne o backlog do produto (seções 1 a 10) e o fechamento da entrega: "
    "escopo e justificativa, status de cada requisito e história na implementação e a conclusão (seções 11 a 13).</p>"
    f"<table class='indice'><tr><th>Nº</th><th>Seção</th><th style='text-align:right'>Página</th></tr>{tabela}</table>"
    "<p><b>Equipe:</b> Miguel Menezes Montalvão dos Santos (RM 573825) · Pedro Lucas Souza Provadelli (RM 572547) · "
    "Vitor Louzano Gomes Mendes (RM 573885)</p>"
)

final = pymupdf.open()
final.insert_pdf(orig, from_page=0, to_page=1)
final.insert_pdf(indice)
final.insert_pdf(orig, from_page=2)
final.insert_pdf(novas)
for i in range(2, final.page_count):
    rodape(final[i], i + 1, apagar=2 + indice.page_count <= i < 2 + indice.page_count + orig.page_count - 2)
final.set_metadata({"title": "Viela Tech: relatório de Software & Total Experience Design",
                    "author": "Miguel Montalvão, Pedro Provadelli, Vitor Mendes"})
final.save(SAIDA, garbage=4, deflate=True)
print(final.page_count, "páginas", paginas, "índice:", indice.page_count, "novas:", novas.page_count)

# Timbrado Viela Tech em todas as páginas, menos a capa (arte própria em página cheia).
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "docs" / "identidade-visual"))
from aplicar_timbrado import aplicar  # noqa: E402

aplicar(SAIDA, SAIDA, documento="Software & TX Design · Backlog do Produto",
        topo=40, base=800, x0=38, x1=558, pular={1})
