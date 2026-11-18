"""Aplica o timbrado Viela Tech a um PDF já gerado.

Cada página original é recortada (sem o cabeçalho e o rodapé antigos), reduzida
para caber na área útil e colocada sobre o fundo do timbrado, com cabeçalho e
rodapé novos (site, e-mail, documento e "página n / N"). O texto continua
selecionável e os links internos são preservados.

Uso:
    python aplicar_timbrado.py ENTRADA.pdf [SAIDA.pdf] --documento "Texto do rodapé"
        [--topo 84] [--base 780] [--x0 60] [--x1 535] [--pular 1 [2 ...]]

--topo/--base/--x0/--x1 são o recorte da página original, em pontos (1/72"):
tudo acima do topo e abaixo da base (cabeçalho e rodapé antigos) é descartado.
--pular lista páginas (a partir de 1) que ficam como estão, como uma capa
com arte própria. Sem SAIDA, o arquivo de entrada é substituído.
O PDF resultante recebe uma marca nos metadados, e uma segunda aplicação é recusada.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import pymupdf

RECURSOS = Path(__file__).resolve().parent / "recursos"
MARCA = "timbrado-vielatech"
MM = 72 / 25.4

SITE, EMAIL = "viela-tech-three.vercel.app", "vielatech@hotmail.com"
AZUL_ESC, VERDE, CINZA, CLARO = "0369A1", "059669", "475569", "94A3B8"

# Área útil do timbrado (mm): abaixo do cabeçalho e acima da linha do rodapé.
AREA = pymupdf.Rect(20 * MM, 41 * MM, 190 * MM, 272 * MM)


def cor(hex_: str) -> tuple[float, float, float]:
    return tuple(int(hex_[i:i + 2], 16) / 255 for i in (0, 2, 4))


def svg_para_pdf(texto: str) -> pymupdf.Document:
    return pymupdf.open("pdf", pymupdf.open("svg", texto.encode("utf-8")).convert_to_pdf())


def abrir_logo() -> pymupdf.Document:
    """O MuPDF não desenha gradientes de SVG: troca o degradê verde pelo tom médio."""
    texto = (RECURSOS / "logo-horizontal.svg").read_text(encoding="utf-8")
    return svg_para_pdf(texto.replace("url(#vt-verde)", "#0BA775"))


# Marca d'água (símbolo) com as cores já misturadas ao branco (~4,5%), em mm.
MARCA_DAGUA = """<svg xmlns="http://www.w3.org/2000/svg" width="210" height="297" viewBox="0 0 210 297">
<g transform="translate(112 168) scale(0.2)">
<path fill="#F5FAFD" d="M55 125H178Q205 125 218 148L378 430Q384 450 362 450H215Q188 450 176 428L40 147Q30 125 55 125Z"/>
<path fill="#F5FAF8" d="M520 28H705Q724 28 714 45L615 200Q606 212 590 212H445Q405 212 382 242L333 300L282 214Q276 204 286 196L488 42Q502 28 520 28Z"/>
<path fill="#F4F8FB" d="M432 250L566 246Q584 246 574 262L410 528Q398 546 397 524L400 290Q401 252 432 250Z"/>
</g></svg>"""

PARADAS = [(0.0, "0369A1"), (0.45, "0284C7"), (0.75, "059669"), (1.0, "10B981")]


def degrade(t: float, paradas=PARADAS) -> tuple[float, float, float]:
    for (a, ca), (b, cb) in zip(paradas, paradas[1:]):
        if t <= b:
            u = (t - a) / (b - a)
            return tuple(x + (y - x) * u for x, y in zip(cor(ca), cor(cb)))
    return cor(paradas[-1][1])


def faixa(page, x, y, larg, alt, paradas=PARADAS, passos=90):
    """Retângulo em degradê horizontal, feito de tiras (x, y, larg, alt em mm)."""
    w = larg / passos
    for i in range(passos):
        page.draw_rect(pymupdf.Rect(x + i * w, y, x + (i + 1) * w + 0.15, y + alt) * MM,
                       color=None, fill=degrade((i + 0.5) / passos, paradas))


def poligono(page, pontos, cor_):
    page.draw_polyline([pymupdf.Point(x * MM, y * MM) for x, y in pontos], color=None, fill=cor(cor_), closePath=True)


def desenhar_fundo(page, marca) -> None:
    page.show_pdf_page(page.rect, marca, 0)
    faixa(page, 0, 0, 210, 2.4)
    poligono(page, [(184, 0), (210, 0), (210, 13.5), (176.5, 13.5)], "0BA775")
    poligono(page, [(199.5, 16.5), (210, 16.5), (210, 23), (195, 23)], "0284C7")
    page.draw_rect(pymupdf.Rect(20, 275.6, 190, 275.85) * MM, color=None, fill=cor("E2E8F0"))
    faixa(page, 20, 275.25, 22, 0.95, passos=22)
    page.draw_rect(pymupdf.Rect(0, 294.6, 210, 297) * MM, color=None, fill=cor("0F172A"))
    faixa(page, 0, 294.6, 46, 2.4, paradas=[(0, "059669"), (1, "10B981")], passos=46)
    poligono(page, [(46, 294.6), (52, 294.6), (49.6, 297), (46, 297)], "10B981")


def mapear(rect: pymupdf.Rect, clip: pymupdf.Rect, dest: pymupdf.Rect) -> pymupdf.Rect:
    sx, sy = dest.width / clip.width, dest.height / clip.height
    return pymupdf.Rect(
        dest.x0 + (rect.x0 - clip.x0) * sx, dest.y0 + (rect.y0 - clip.y0) * sy,
        dest.x0 + (rect.x1 - clip.x0) * sx, dest.y0 + (rect.y1 - clip.y0) * sy,
    )


class Fontes:
    def __init__(self) -> None:
        self.regular = pymupdf.Font(fontfile=str(RECURSOS / "Inter-Regular.ttf"))
        self.negrito = pymupdf.Font(fontfile=str(RECURSOS / "Inter-SemiBold.ttf"))

    def registrar(self, page: pymupdf.Page) -> None:
        page.insert_font(fontname="InterR", fontfile=str(RECURSOS / "Inter-Regular.ttf"))
        page.insert_font(fontname="InterB", fontfile=str(RECURSOS / "Inter-SemiBold.ttf"))


def escrever(page, fontes, x, y, texto, *, tam, negrito=False, cor_="475569", espaco=0.0, alinhar="e"):
    """Texto em Inter com espaçamento entre letras; alinhar: e(squerda) ou d(ireita)."""
    fonte = fontes.negrito if negrito else fontes.regular
    nome = "InterB" if negrito else "InterR"
    larg = fonte.text_length(texto, tam) + espaco * max(len(texto) - 1, 0)
    if alinhar == "d":
        x -= larg
    if espaco == 0:
        page.insert_text((x, y), texto, fontname=nome, fontsize=tam, color=cor(cor_))
        return
    for letra in texto:
        page.insert_text((x, y), letra, fontname=nome, fontsize=tam, color=cor(cor_))
        x += fonte.text_length(letra, tam) + espaco


def moldura(page, fontes, logo, fundo, n, total, documento):
    desenhar_fundo(page, fundo)
    page.show_pdf_page(pymupdf.Rect(20 * MM, 18.5 * MM, 78 * MM, 33.5 * MM), logo, 0)
    d = 190 * MM
    escrever(page, fontes, d, 23 * MM, "Onde o sol não chega,", tam=8.5, negrito=True, cor_=AZUL_ESC, alinhar="d")
    escrever(page, fontes, d, 27 * MM, "a saúde chega.", tam=8.5, negrito=True, cor_=VERDE, alinhar="d")
    escrever(page, fontes, d, 30.8 * MM, "ROCINHA  ·  RIO DE JANEIRO, RJ", tam=6.2, cor_=CLARO, espaco=0.5, alinhar="d")

    colunas = [(20, "SITE", SITE), (60, "E-MAIL", EMAIL), (106, "DOCUMENTO", documento)]
    for x, rotulo, valor in colunas:
        escrever(page, fontes, x * MM, 285.3 * MM, rotulo, tam=5.6, negrito=True, cor_=VERDE, espaco=0.8)
        escrever(page, fontes, x * MM, 289.6 * MM, valor, tam=7.2, cor_=CINZA)
    escrever(page, fontes, d, 285.3 * MM, "PÁGINA", tam=5.6, negrito=True, cor_=VERDE, espaco=0.8, alinhar="d")
    resto = f" / {total}"
    escrever(page, fontes, d, 289.6 * MM, resto, tam=7.2, cor_=CINZA, alinhar="d")
    larg_resto = fontes.regular.text_length(resto, 7.2)
    escrever(page, fontes, d - larg_resto, 289.6 * MM, str(n), tam=7.2, negrito=True, cor_=AZUL_ESC, alinhar="d")


def aplicar(entrada: Path, saida: Path, *, documento: str, topo: float, base: float,
            x0: float | None, x1: float | None, pular: set[int]) -> None:
    src = pymupdf.open(entrada)
    if MARCA in (src.metadata.get("keywords") or ""):
        raise SystemExit(f"{entrada.name} já tem o timbrado aplicado; gere o PDF original de novo.")
    total = src.page_count
    fundo, logo, fontes = svg_para_pdf(MARCA_DAGUA), abrir_logo(), Fontes()
    ref = src[0].rect
    clip = pymupdf.Rect(x0 if x0 is not None else 0, topo, x1 if x1 is not None else ref.width, base)
    escala = min(AREA.width / clip.width, AREA.height / clip.height)
    larg, alt = clip.width * escala, clip.height * escala
    dest = pymupdf.Rect(AREA.x0 + (AREA.width - larg) / 2, AREA.y0,
                        AREA.x0 + (AREA.width + larg) / 2, AREA.y0 + alt)

    out = pymupdf.open()
    for i, pg in enumerate(src):
        if (i + 1) in pular:
            out.insert_pdf(src, from_page=i, to_page=i)
            continue
        nova = out.new_page(width=595.2756, height=841.8898)
        fontes.registrar(nova)
        moldura(nova, fontes, logo, fundo, i + 1, total, documento)
        nova.show_pdf_page(dest, src, i, clip=clip)
        for ln in pg.get_links():
            if not ln["from"].intersects(clip):
                continue
            ln = dict(ln)
            ln["from"] = mapear(ln["from"] & clip, clip, dest)
            try:
                nova.insert_link(ln)
            except Exception:
                pass
    if src.get_toc():
        out.set_toc(src.get_toc())
    meta = dict(src.metadata)
    meta["keywords"] = (meta.get("keywords") or "").strip() + f" {MARCA}"
    meta["producer"] = "Viela Tech · timbrado"
    out.set_metadata(meta)
    src.close()
    tmp = saida.with_suffix(".tmp.pdf")
    out.save(tmp, garbage=3, deflate=True)
    out.close()
    os.replace(tmp, saida)
    print(f"{saida.name}: timbrado aplicado em {total - len(pular)} de {total} páginas (escala {escala:.2f}).")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("entrada", type=Path)
    ap.add_argument("saida", type=Path, nargs="?")
    ap.add_argument("--documento", default="FIAP · Global Solution 2026.2 · CitizenTech")
    ap.add_argument("--topo", type=float, default=84)
    ap.add_argument("--base", type=float, default=780)
    ap.add_argument("--x0", type=float)
    ap.add_argument("--x1", type=float)
    ap.add_argument("--pular", type=int, nargs="*", default=[])
    a = ap.parse_args()
    aplicar(a.entrada, a.saida or a.entrada, documento=a.documento, topo=a.topo, base=a.base,
            x0=a.x0, x1=a.x1, pular=set(a.pular))


if __name__ == "__main__":
    sys.exit(main())
