"""Relatório técnico reproduzível do módulo de Cálculo do CANYON.

O gerador recebe os dados já tratados e os resultados já calculados. Ele não
importa o módulo principal, não recalcula integrais e não exige bibliotecas
de PDF além do Matplotlib. Campos extensos de origem/observação são abreviados
na página para manter três páginas A4; o texto integral fica nos metadados.
"""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path
from typing import Any, Protocol

import numpy as np
from matplotlib import image as mpimg
from matplotlib import rc_context
from matplotlib.backends.backend_agg import RendererAgg
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.figure import Figure
from matplotlib.font_manager import FontProperties
from matplotlib.lines import Line2D
from matplotlib.patches import Rectangle


class _DadosRelatorio(Protocol):
    horas: np.ndarray
    ivm: np.ndarray
    umidade: np.ndarray | None
    insolacao: np.ndarray | None
    origem: str
    inicio: Any
    observacao: str


class _ResultadoRelatorio(Protocol):
    derivada_ivm: np.ndarray
    derivada_umidade: np.ndarray | None
    area_total: float
    area_perigo: float
    duracao_perigo: float
    metodo_integracao: str


_LARGURA = 210 / 25.4
_ALTURA = 297 / 25.4
_MARGEM = 0.92
_UTIL = _LARGURA - 2 * _MARGEM
_AZUL = "#16354A"
_VERDE = "#087E75"
_TEXTO = "#243947"
_CINZA = "#5E6F7A"

_INTEGRANTES = (
    "Miguel Menezes Montalvão dos Santos  |  RM573825",
    "Pedro Lucas Souza Provadelli  |  RM572547",
    "Vitor Louzano Gomes Mendes  |  RM573885",
)

_REFERENCIAS = (
    (
        "[1] NumPy. numpy.gradient: diferenças finitas e coordenadas temporais.",
        "https://numpy.org/doc/stable/reference/generated/numpy.gradient.html",
    ),
    (
        "[2] SciPy. scipy.integrate.simpson: integração de dados amostrados.",
        "https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.simpson.html",
    ),
    (
        "[3] CDC. Tuberculosis: Causes and How It Spreads.",
        "https://www.cdc.gov/tb/causes/index.html",
    ),
)


def _numero(valor: float, casas: int = 2) -> str:
    """Formata números com vírgula decimal, sem depender do locale instalado."""
    if abs(valor) < 0.5 * 10 ** (-casas):
        valor = 0.0
    return (
        f"{valor:,.{casas}f}".replace(",", "_").replace(".", ",").replace("_", ".")
    )


def _normalizar(texto: object) -> str:
    return " ".join(str(texto or "").split())


class _Pagina:
    """Layout em polegadas, com quebra de texto pelas métricas da fonte."""

    def __init__(self, numero: int, titulo: str, subtitulo: str) -> None:
        self.fig = Figure(figsize=(_LARGURA, _ALTURA), facecolor="white")
        self._renderer = RendererAgg(round(_LARGURA * 72), round(_ALTURA * 72), 72)
        self.texto(
            10.83,
            "CANYON / VIELA TECH   •   FIAP   •   1ESSRA   •   GS2026.2",
            tamanho=8.1,
            cor=_VERDE,
        )
        self.fig.add_artist(
            Line2D(
                [_MARGEM / _LARGURA, 1 - _MARGEM / _LARGURA],
                [10.57 / _ALTURA, 10.57 / _ALTURA],
                transform=self.fig.transFigure,
                color=_VERDE,
                linewidth=1.3,
            )
        )
        self.texto(10.31, titulo, tamanho=20, negrito=True, cor=_AZUL)
        self.texto(9.88, subtitulo, tamanho=9, cor=_CINZA)
        self.fig.add_artist(
            Line2D(
                [_MARGEM / _LARGURA, 1 - _MARGEM / _LARGURA],
                [0.79 / _ALTURA, 0.79 / _ALTURA],
                transform=self.fig.transFigure,
                color="#CCD8DE",
                linewidth=0.6,
            )
        )
        self.texto(
            0.61,
            "Cálculo aplicado ao microclima  |  Indicador ambiental didático",
            tamanho=7.2,
            cor=_CINZA,
        )
        self.fig.text(
            1 - _MARGEM / _LARGURA,
            0.61 / _ALTURA,
            f"{numero} / 3",
            ha="right",
            va="top",
            fontsize=7.2,
            color=_CINZA,
        )

    def _largura_texto(self, texto: str, tamanho: float, negrito: bool) -> float:
        fonte = FontProperties(
            family="DejaVu Sans", size=tamanho, weight="bold" if negrito else "normal"
        )
        return self._renderer.get_text_width_height_descent(texto, fonte, False)[0] / 72

    def _linhas(
        self, texto: str, largura: float, tamanho: float, negrito: bool
    ) -> list[str]:
        linhas: list[str] = []
        for paragrafo in texto.split("\n"):
            atual = ""
            for palavra in paragrafo.split():
                candidato = f"{atual} {palavra}" if atual else palavra
                if self._largura_texto(candidato, tamanho, negrito) <= largura:
                    atual = candidato
                    continue
                if atual:
                    linhas.append(atual)
                    atual = ""
                # Caminhos e URLs também precisam caber na largura disponível.
                while self._largura_texto(palavra, tamanho, negrito) > largura:
                    corte = len(palavra) - 1
                    while corte > 1 and self._largura_texto(
                        palavra[:corte], tamanho, negrito
                    ) > largura:
                        corte -= 1
                    linhas.append(palavra[:corte])
                    palavra = palavra[corte:]
                atual = palavra
            linhas.append(atual)
        return linhas

    def texto(
        self,
        y: float,
        texto: str,
        *,
        tamanho: float = 9.4,
        cor: str = _TEXTO,
        negrito: bool = False,
        x: float = _MARGEM,
        largura: float = _UTIL,
        max_linhas: int | None = None,
        url: str | None = None,
    ) -> float:
        linhas = self._linhas(texto, largura, tamanho, negrito)
        if max_linhas is not None and len(linhas) > max_linhas:
            linhas = linhas[:max_linhas]
            ultimo = linhas[-1].rstrip()
            while ultimo and self._largura_texto(ultimo + "…", tamanho, negrito) > largura:
                ultimo = ultimo[:-1]
            linhas[-1] = ultimo + "…"
        passo = tamanho * 1.36 / 72
        for i, linha in enumerate(linhas):
            self.fig.text(
                x / _LARGURA,
                (y - i * passo) / _ALTURA,
                linha,
                fontsize=tamanho,
                fontfamily="DejaVu Sans",
                fontweight="bold" if negrito else "normal",
                color=cor,
                ha="left",
                va="top",
                parse_math=False,
                url=url,
            )
        return y - len(linhas) * passo

    def secao(self, y: float, texto: str) -> float:
        return self.texto(y, texto, tamanho=11.2, negrito=True, cor=_VERDE) - 0.09

    def formula(self, y: float, texto: str, tamanho: float = 13) -> float:
        self.fig.text(
            (_MARGEM + 0.12) / _LARGURA,
            y / _ALTURA,
            texto,
            fontsize=tamanho,
            color=_AZUL,
            ha="left",
            va="top",
        )
        return y - 0.46

    def tabela(
        self,
        y: float,
        cabecalho: tuple[str, ...],
        linhas: list[tuple[str, ...]],
        larguras: tuple[float, ...],
        *,
        altura_linha: float = 0.36,
        tamanho: float = 8.5,
    ) -> float:
        for indice, linha in enumerate([cabecalho, *linhas]):
            topo = y - indice * altura_linha
            fundo = _AZUL if indice == 0 else ("#EDF5F4" if indice % 2 else "#F7F9FA")
            self.fig.add_artist(
                Rectangle(
                    (_MARGEM / _LARGURA, (topo - altura_linha) / _ALTURA),
                    _UTIL / _LARGURA,
                    altura_linha / _ALTURA,
                    transform=self.fig.transFigure,
                    facecolor=fundo,
                    edgecolor="white",
                    linewidth=0.6,
                )
            )
            deslocamento = _MARGEM + 0.10
            for valor, fracao in zip(linha, larguras):
                self.texto(
                    topo - 0.10,
                    valor,
                    x=deslocamento,
                    largura=_UTIL * fracao - 0.15,
                    tamanho=tamanho,
                    cor="white" if indice == 0 else _TEXTO,
                    negrito=indice == 0,
                )
                deslocamento += _UTIL * fracao
        return y - (len(linhas) + 1) * altura_linha - 0.16


def _pagina_contexto(dados: _DadosRelatorio) -> Figure:
    pagina = _Pagina(
        1,
        "Relatório técnico de Cálculo",
        "Derivadas e integrais na análise temporal do Índice de Vulnerabilidade de Microclima",
    )
    y = pagina.secao(9.38, "Equipe")
    for integrante in _INTEGRANTES:
        y = pagina.texto(y, integrante, tamanho=9.2)
    y = pagina.secao(y - 0.18, "1. Problema e contexto do projeto")
    y = pagina.texto(
        y,
        "O CANYON organiza séries de umidade e luminosidade para estudar a evolução "
        "do microclima em vielas. A hipótese urbana do projeto é que a geometria "
        "desses espaços pode dificultar a entrada de luz solar e a renovação do "
        "ar. Essa hipótese contextualiza o modelo; não constitui uma observação "
        "de campo demonstrada por esta série.",
    )
    y = pagina.secao(y - 0.18, "2. Modelo matemático e classificação")
    y = pagina.formula(
        y, r"$\mathrm{IVM}(t)=0{,}6\,U(t)+0{,}4\,[100-I(t)]$", tamanho=15
    )
    y = pagina.texto(
        y,
        "U(t) é a umidade relativa (%) e I(t), a luminosidade normalizada (%), "
        "usada como aproximação da insolação, sem medi-la fisicamente. As "
        "entradas e o IVM usam a escala de 0 a 100; t é dado em horas decorridas. "
        "Os pesos 0,6 e 0,4 são escolhas do projeto, sem calibração clínica.",
    )
    y = pagina.texto(
        y - 0.08,
        "Regras do projeto: NORMAL se IVM < 40; ATENÇÃO se 40 ≤ IVM < 70; "
        "PERIGO se IVM ≥ 70. Os nomes indicam faixas operacionais do protótipo "
        "e não limiares de saúde validados.",
        tamanho=9.1,
    )
    y = pagina.secao(y - 0.18, "3. Origem e intervalo analisado")
    simulacao = "simula" in f"{dados.origem} {dados.observacao}".lower()
    descricao = (
        "DADOS SIMULADOS: cenário didático, sem coleta ambiental de campo."
        if simulacao
        else "Série fornecida por arquivo; a importação não certifica coleta de campo."
    )
    y = pagina.texto(y, descricao, negrito=True, tamanho=9.1, cor=_AZUL)
    y = pagina.texto(
        y - 0.04,
        f"Origem: {_normalizar(dados.origem)}",
        tamanho=8.5,
        max_linhas=2,
    )
    duracao = float(dados.horas[-1] - dados.horas[0])
    y = pagina.texto(
        y - 0.04,
        f"Amostras: {len(dados.horas)}  |  Intervalo: t = {_numero(float(dados.horas[0]))} "
        f"a {_numero(float(dados.horas[-1]))} h  |  Duração: {_numero(duracao)} h.",
        tamanho=8.9,
    )
    if dados.inicio is not None:
        fim = dados.inicio + timedelta(hours=duracao)
        y = pagina.texto(
            y - 0.03,
            f"Referência temporal (UTC): {dados.inicio.strftime('%d/%m/%Y %H:%M:%S')} "
            f"a {fim.strftime('%d/%m/%Y %H:%M:%S')} UTC. "
            "Os extremos são apresentados em horas relativas ao início.",
            tamanho=8.5,
        )
    if dados.observacao:
        y = pagina.texto(
            y - 0.04,
            f"Observação: {_normalizar(dados.observacao)}",
            tamanho=8.5,
            max_linhas=3,
        )
    y = pagina.secao(y - 0.18, "4. Hipóteses e alcance")
    pagina.texto(
        y,
        "A análise usa as amostras na ordem temporal e aproxima o comportamento "
        "entre elas. Umidade e luminosidade não medem diretamente a ventilação. "
        "O IVM é um indicador ambiental didático sem validação clínica: não mede "
        "bactérias, exposição microbiológica, probabilidade de infecção ou "
        "diagnóstico. A transmissão da tuberculose ocorre pelo ar entre pessoas "
        "[3]; não pode ser deduzida deste índice.",
        tamanho=9.1,
    )
    return pagina.fig


def _extremos(serie: np.ndarray, horas: np.ndarray) -> tuple[str, str]:
    menor, maior = int(np.argmin(serie)), int(np.argmax(serie))
    return (
        f"{_numero(float(serie[menor]))}  (t={_numero(float(horas[menor]))} h)",
        f"{_numero(float(serie[maior]))}  (t={_numero(float(horas[maior]))} h)",
    )


def _pagina_derivadas(
    dados: _DadosRelatorio, resultado: _ResultadoRelatorio, grafico: Path
) -> Figure:
    pagina = _Pagina(
        2,
        "Variação do índice no tempo",
        "O gráfico e os extremos abaixo correspondem à mesma série analisada.",
    )
    imagem = mpimg.imread(grafico)
    eixo = pagina.fig.add_axes(
        [_MARGEM / _LARGURA, 5.90 / _ALTURA, _UTIL / _LARGURA, 3.65 / _ALTURA]
    )
    eixo.imshow(imagem)
    eixo.set_axis_off()
    y = pagina.texto(
        5.78,
        "Figura 1. Série temporal, classificação do projeto e taxas de variação. "
        "Fonte: processamento dos dados identificados na página 1.",
        tamanho=8.1,
        cor=_CINZA,
    )
    y = pagina.secao(y - 0.14, "5. Derivada: rapidez e direção da mudança")
    y = pagina.formula(
        y,
        r"$\frac{d\,\mathrm{IVM}}{dt}=0{,}6\,\frac{dU}{dt}-0{,}4\,\frac{dI}{dt}$",
        tamanho=13,
    )
    y = pagina.texto(
        y,
        "A derivada é estimada por np.gradient(IVM, horas), usando os tempos "
        "reais das amostras [1]. O método usa diferenças centrais no interior "
        "e unilaterais de primeira ordem nas bordas (edge_order=1), considerando "
        "também intervalos irregulares. "
        "A unidade é pontos percentuais por hora (p.p./h): sinal positivo "
        "indica aumento do índice e sinal negativo indica redução.",
        tamanho=9.1,
    )
    linhas = [
        ("IVM (%)", *_extremos(dados.ivm, dados.horas)),
        ("dIVM/dt (p.p./h)", *_extremos(resultado.derivada_ivm, dados.horas)),
    ]
    if resultado.derivada_umidade is not None:
        linhas.append(
            (
                "dU/dt (p.p./h)",
                *_extremos(resultado.derivada_umidade, dados.horas),
            )
        )
    y = pagina.tabela(
        y - 0.12,
        ("Grandeza", "Menor valor e instante", "Maior valor e instante"),
        linhas,
        (0.27, 0.365, 0.365),
        altura_linha=0.36,
        tamanho=8.0,
    )
    indice_subida = int(np.argmax(resultado.derivada_ivm))
    indice_descida = int(np.argmin(resultado.derivada_ivm))
    taxa_max = float(resultado.derivada_ivm[indice_subida])
    taxa_min = float(resultado.derivada_ivm[indice_descida])
    if taxa_max > 0 and taxa_min < 0:
        interpretacao = (
            f"A subida mais rápida amostrada é de {_numero(taxa_max)} p.p./h, "
            f"em t = {_numero(float(dados.horas[indice_subida]))} h; a queda mais "
            f"rápida é de {_numero(taxa_min)} p.p./h, em t = "
            f"{_numero(float(dados.horas[indice_descida]))} h."
        )
    elif taxa_min >= 0:
        interpretacao = (
            "As taxas amostradas são não negativas: o índice não apresenta "
            "redução segundo a aproximação numérica neste intervalo. "
            f"A maior taxa é {_numero(taxa_max)} p.p./h."
        )
    else:
        interpretacao = (
            "As taxas amostradas são não positivas: o índice não apresenta "
            "aumento segundo a aproximação numérica neste intervalo. "
            f"A menor taxa é {_numero(taxa_min)} p.p./h."
        )
    y = pagina.texto(y, interpretacao, tamanho=9.0)
    pagina.texto(
        y - 0.05,
        "Os instantes são relativos ao início e representam extremos entre "
        "amostras; empates mostram a primeira ocorrência. Uma taxa de 2 p.p./h, "
        "por exemplo, corresponde a passar de 60% a 62% em uma hora se mantida. "
        "A derivada permite identificar mudanças antes de interpretar o acúmulo.",
        tamanho=8.5,
        cor=_CINZA,
    )
    return pagina.fig


def _pagina_integrais(
    dados: _DadosRelatorio, resultado: _ResultadoRelatorio
) -> Figure:
    pagina = _Pagina(
        3,
        "Acúmulo ambiental no período",
        "A integral combina intensidade do índice e duração, com unidade %·h.",
    )
    y = pagina.secao(9.37, "6. Integrais e método numérico")
    y = pagina.formula(
        y, r"$A_{\mathrm{total}}=\int_{t_0}^{t_f}\mathrm{IVM}(t)\,dt$", tamanho=14
    )
    y = pagina.formula(
        y - 0.02,
        r"$D=\{t:\mathrm{IVM}(t)\geq70\},\quad "
        r"A_{\mathrm{PERIGO}}=\int_D\mathrm{IVM}(t)\,dt,\quad T_{\mathrm{PERIGO}}=\int_D1\,dt$",
        tamanho=12,
    )
    y = pagina.texto(
        y,
        "O projeto usa Simpson [2] em grade regular com três ou mais amostras; "
        "usa trapézios em grade irregular, com duas amostras ou se a área linear "
        "em PERIGO superar a estimativa de Simpson, preservando parte ≤ total. "
        f"Método aplicado: {resultado.metodo_integracao}. Na faixa PERIGO, os "
        "cruzamentos de IVM = 70 são interpolados linearmente. Integram-se as "
        "parcelas por trapézios e somam-se suas durações, incluindo intervalos parciais.",
        tamanho=9.1,
    )
    y = pagina.texto(
        y - 0.05,
        "A área em PERIGO é a integral do IVM completo apenas onde IVM ≥ 70, "
        "e não a integral do excedente IVM − 70. Instantes isolados no limiar "
        "não acrescentam duração nem área.",
        tamanho=8.8,
    )
    duracao = float(dados.horas[-1] - dados.horas[0])
    fracao = 100 * float(resultado.duracao_perigo) / duracao
    media = float(resultado.area_total) / duracao
    y = pagina.tabela(
        y - 0.13,
        ("Métrica", "Resultado", "Unidade"),
        [
            ("Área total sob o IVM", _numero(float(resultado.area_total)), "%·h"),
            ("Área do IVM em PERIGO", _numero(float(resultado.area_perigo)), "%·h"),
            ("Duração em PERIGO", _numero(float(resultado.duracao_perigo)), "h"),
            ("Fração do período em PERIGO", _numero(fracao), "% do tempo"),
            ("IVM médio pela integral", _numero(media), "%"),
        ],
        (0.56, 0.23, 0.21),
        altura_linha=0.33,
        tamanho=8.5,
    )
    y = pagina.texto(
        y,
        f"No período de {_numero(duracao)} h, o índice acumula "
        f"{_numero(float(resultado.area_total))} %·h, equivalentes a uma média "
        f"temporal de {_numero(media)}%. A faixa PERIGO ocupa {_numero(fracao)}% "
        "do tempo analisado. Um índice constante de 60% durante duas horas, "
        "por exemplo, acumula 120 %·h; a área não é uma porcentagem isolada.",
        tamanho=9.0,
    )
    y = pagina.secao(y - 0.16, "7. Interpretação e limitações")
    y = pagina.texto(
        y,
        "As taxas localizam mudanças rápidas; as integrais resumem intensidade "
        "e persistência do cenário ambiental. Comparações exigem considerar a "
        "duração das séries e a mesma escala do índice. Frequência de coleta, "
        "ruído, dados ausentes e aproximação entre amostras afetam os resultados; "
        "as bordas merecem cautela na derivação. Pesos e limiares são didáticos. "
        "O modelo não mede ventilação, agentes infecciosos ou risco clínico. "
        "Dados simulados não demonstram condições reais de uma comunidade.",
        tamanho=8.8,
    )
    y = pagina.secao(y - 0.13, "Referências oficiais")
    for titulo, url in _REFERENCIAS:
        y = pagina.texto(y, titulo, tamanho=7.6)
        y = pagina.texto(y - 0.015, url, tamanho=7.0, cor=_VERDE, url=url) - 0.06
    return pagina.fig


def gerar_relatorio(
    dados: _DadosRelatorio,
    resultado: _ResultadoRelatorio,
    grafico: Path,
    destino: Path,
) -> None:
    """Grava um PDF A4 de três páginas com dados e métricas da execução.

    ``horas`` deve conter ao menos dois tempos finitos estritamente crescentes,
    e as séries devem estar alinhadas e validadas pelo módulo de Cálculo. As
    métricas são usadas tal como fornecidas; nenhuma simulação é feita aqui.
    O PNG precisa existir antes desta chamada. A ausência de datas de criação
    nos metadados permite reproduzir o arquivo com as mesmas entradas e versões.
    """
    grafico, destino = Path(grafico), Path(destino)
    if not grafico.is_file():
        raise FileNotFoundError(f"Gráfico não encontrado para o relatório: {grafico}")
    horas = np.asarray(dados.horas, dtype=float)
    if (
        horas.ndim != 1
        or len(horas) < 2
        or not np.all(np.isfinite(horas))
        or not np.all(np.diff(horas) > 0)
    ):
        raise ValueError("O relatório exige ao menos dois tempos finitos crescentes.")
    series = [dados.ivm, resultado.derivada_ivm]
    if resultado.derivada_umidade is not None:
        series.append(resultado.derivada_umidade)
    for serie in series:
        valores = np.asarray(serie, dtype=float)
        if valores.shape != horas.shape or not np.all(np.isfinite(valores)):
            raise ValueError("As séries do relatório devem ser finitas e alinhadas ao tempo.")
    metricas = [resultado.area_total, resultado.area_perigo, resultado.duracao_perigo]
    if not np.all(np.isfinite(metricas)):
        raise ValueError("As métricas do relatório devem ser finitas.")
    destino.parent.mkdir(parents=True, exist_ok=True)
    metadata = {
        "Title": "CANYON | Viela Tech - Relatório técnico de Cálculo",
        "Author": "; ".join(_INTEGRANTES),
        "Subject": (
            "FIAP / 1ESSRA / GS2026.2. Indicador ambiental didático sem validação clínica. "
            f"Origem: {dados.origem}. Observação: {dados.observacao}"
        ),
        "Keywords": "CANYON, Viela Tech, IVM, Cálculo, derivadas, integrais, microclima",
        "Creator": "Viela Tech / Matplotlib PdfPages",
        "CreationDate": None,
        "ModDate": None,
    }
    figuras: list[Figure] = []
    with rc_context(
        {
            "font.family": "DejaVu Sans",
            "mathtext.fontset": "dejavusans",
            "pdf.fonttype": 42,
            "text.usetex": False,
        }
    ):
        try:
            figuras.append(_pagina_contexto(dados))
            figuras.append(_pagina_derivadas(dados, resultado, grafico))
            figuras.append(_pagina_integrais(dados, resultado))
            with PdfPages(destino, metadata=metadata) as pdf:
                for figura in figuras:
                    pdf.savefig(figura)
        finally:
            for figura in figuras:
                figura.clear()
