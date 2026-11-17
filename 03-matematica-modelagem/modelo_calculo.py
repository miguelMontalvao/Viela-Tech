"""Limites, derivadas, integrais, gráficos e relatório do microclima do Viela Tech.

Execute da raiz: python 03-matematica-modelagem/modelo_calculo.py
Sem 02-python-processamento/relatorio.csv, utiliza uma simulação explicitamente identificada.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import matplotlib
import numpy as np
import pandas as pd
from scipy.integrate import simpson, trapezoid


PASTA_MATH = Path(__file__).resolve().parent
CSV_PADRAO = PASTA_MATH.parent / "02-python-processamento" / "relatorio.csv"
LIMIAR_ATENCAO = 40.0
LIMIAR_PERIGO = 70.0
# Mesmo mínimo exigido do módulo Python: com menos leituras reais, o relatório
# padrão usa a simulação identificada (um CSV explícito continua aceito).
MINIMO_AMOSTRAS_REAIS = 20


@dataclass
class DadosMicroclima:
    """Série temporal com percentuais e tempo em horas decorridas."""

    horas: np.ndarray
    ivm: np.ndarray
    origem: str
    umidade: np.ndarray | None = None
    insolacao: np.ndarray | None = None
    inicio: pd.Timestamp | None = None
    observacao: str = ""


@dataclass
class ResultadoCalculo:
    """Derivadas em pontos percentuais/hora, áreas em %·h e duração em h."""

    derivada_ivm: np.ndarray
    derivada_umidade: np.ndarray | None
    area_total: float
    area_perigo: float
    duracao_perigo: float
    metodo_integracao: str


@dataclass
class ResultadoLimites:
    """Aproximações de limites calculadas sobre o modelo analítico U(t), I(t)."""

    t_referencia: float
    derivada_exata: float
    quocientes: list[tuple[float, float, float]]  # (h, progressivo, regressivo)
    t_canto: float
    ivm_no_canto: float
    limite_esquerda_ivm: float
    limite_direita_ivm: float
    derivada_esquerda: float
    derivada_direita: float


def umidade_modelo(t: np.ndarray | float) -> np.ndarray | float:
    """U(t) = 70 + 18 cos(pi t / 12), em %."""
    return 70 + 18 * np.cos(np.pi * np.asarray(t, dtype=float) / 12)


def insolacao_modelo(t: np.ndarray | float) -> np.ndarray | float:
    """I(t) = 80 max(0, sen(pi (t - 6) / 12)), em %: sol entre 6 h e 18 h."""
    return 80 * np.maximum(0, np.sin(np.pi * (np.asarray(t, dtype=float) - 6) / 12))


def ivm_modelo(t: np.ndarray | float) -> np.ndarray | float:
    """IVM(t) = 0,6 U(t) + 0,4 (100 - I(t))."""
    return 0.6 * umidade_modelo(t) + 0.4 * (100 - insolacao_modelo(t))


def derivada_ivm_exata(t: float) -> float:
    """Derivada analítica do IVM do modelo, válida fora de 6 h e 18 h (pontos de canto)."""
    du = -18 * np.pi / 12 * np.sin(np.pi * t / 12)
    seno = np.sin(np.pi * (t - 6) / 12)
    di = 80 * np.pi / 12 * np.cos(np.pi * (t - 6) / 12) if seno > 0 else 0.0
    return float(0.6 * du - 0.4 * di)


def calcular_limites(
    t_referencia: float = 9.0,
    t_canto: float = 6.0,
    passos: tuple[float, ...] = (1.0, 0.5, 0.1, 0.01, 0.001),
) -> ResultadoLimites:
    """Mostra a derivada como limite do quociente de diferenças.

    Em t_referencia, os quocientes [IVM(t+h) - IVM(t)] / h e [IVM(t) - IVM(t-h)] / h
    convergem para a derivada exata quando h -> 0. No nascer do sol (t_canto),
    os limites laterais do IVM coincidem (função contínua), mas os limites
    laterais do quociente diferem: o IVM não é derivável nesse instante.
    """
    quocientes = [
        (
            h,
            float((ivm_modelo(t_referencia + h) - ivm_modelo(t_referencia)) / h),
            float((ivm_modelo(t_referencia) - ivm_modelo(t_referencia - h)) / h),
        )
        for h in passos
    ]
    h = 1e-6
    return ResultadoLimites(
        t_referencia=t_referencia,
        derivada_exata=derivada_ivm_exata(t_referencia),
        quocientes=quocientes,
        t_canto=t_canto,
        ivm_no_canto=float(ivm_modelo(t_canto)),
        limite_esquerda_ivm=float(ivm_modelo(t_canto - h)),
        limite_direita_ivm=float(ivm_modelo(t_canto + h)),
        derivada_esquerda=float((ivm_modelo(t_canto) - ivm_modelo(t_canto - h)) / h),
        derivada_direita=float((ivm_modelo(t_canto + h) - ivm_modelo(t_canto)) / h),
    )


def validar_dados(dados: DadosMicroclima) -> None:
    """Impede divisões por zero e cálculos com tempos ou percentuais inválidos."""
    horas = np.asarray(dados.horas, dtype=float)
    if horas.ndim != 1 or horas.size < 2 or not np.isfinite(horas).all():
        raise ValueError("São necessárias ao menos duas amostras com tempos finitos.")
    if not np.all(np.diff(horas) > 0):
        raise ValueError("Os horários devem ser distintos e estar em ordem crescente.")
    for nome in ("ivm", "umidade", "insolacao"):
        valores = getattr(dados, nome)
        if valores is None:
            continue
        valores = np.asarray(valores, dtype=float)
        if (
            valores.shape != horas.shape
            or not np.isfinite(valores).all()
            or np.any((valores < 0) | (valores > 100))
        ):
            raise ValueError(f"A coluna '{nome}' deve ter percentuais finitos entre 0 e 100.")


def simular_dados() -> DadosMicroclima:
    """Modela um dia sintético com maior umidade à noite e luz entre 6 h e 18 h.

    U(t) = 70 + 18 cos(pi t / 12)
    I(t) = 80 max(0, sen(pi (t - 6) / 12))
    IVM(t) = 0,6 U(t) + 0,4 (100 - I(t))
    As curvas são hipóteses didáticas, sem ajuste a medições da Rocinha.
    """
    horas = np.linspace(0, 24, 145)  # Uma amostra a cada 10 minutos.
    umidade = umidade_modelo(horas)
    insolacao = insolacao_modelo(horas)
    return DadosMicroclima(
        horas=horas,
        ivm=0.6 * umidade + 0.4 * (100 - insolacao),
        umidade=umidade,
        insolacao=insolacao,
        origem="Dados simulados de 24 horas (não são medições de campo)",
        observacao="Cenário determinístico; t = 0 representa 00h de um dia hipotético.",
    )


def carregar_dados(caminho: Path | None = None) -> DadosMicroclima:
    """Lê o CSV do módulo Python, preservando os intervalos de created_at.

    Sem caminho explícito, a simulação identificada é usada em dois casos:
    o arquivo padrão ainda não existe, ou tem menos de MINIMO_AMOSTRAS_REAIS
    leituras (poucas para derivar e integrar). A observação do resultado diz qual.
    Um CSV inválido (por exemplo, com horários repetidos) sempre produz erro:
    o problema nos dados é mostrado em vez de ser escondido pela simulação.
    Arquivo explícito ausente também produz erro.
    Os timestamps são normalizados em UTC; não há extrapolação para 24 horas.
    """
    if caminho is None:
        if not CSV_PADRAO.exists():
            dados = simular_dados()
            dados.observacao += " O arquivo 02-python-processamento/relatorio.csv ainda não existe."
            return dados
        dados = ler_csv(CSV_PADRAO)
        if len(dados.horas) < MINIMO_AMOSTRAS_REAIS:
            quantidade = len(dados.horas)
            dados = simular_dados()
            dados.observacao += (
                f" O relatorio.csv do módulo Python tem só {quantidade} leituras reais"
                f" (mínimo {MINIMO_AMOSTRAS_REAIS}); use --csv para analisá-las mesmo assim."
            )
        return dados
    return ler_csv(Path(caminho))


def ler_csv(arquivo: Path) -> DadosMicroclima:
    """Converte o CSV exportado pelo Python em série temporal validada."""
    try:
        tabela = pd.read_csv(arquivo, encoding="utf-8-sig")
    except (pd.errors.EmptyDataError, pd.errors.ParserError) as erro:
        raise ValueError(f"CSV vazio ou malformado: {arquivo}") from erro
    faltantes = {"created_at", "ivm"} - set(tabela.columns)
    if faltantes:
        raise ValueError("CSV sem colunas obrigatórias: " + ", ".join(sorted(faltantes)))
    try:
        tabela["created_at"] = pd.to_datetime(
            tabela["created_at"], utc=True, errors="raise", format="ISO8601"
        )
        if tabela["created_at"].isna().any():
            raise ValueError("Há horários vazios em created_at.")
        tabela = tabela.sort_values("created_at").reset_index(drop=True)
        if len(tabela) < 2:
            raise ValueError("O CSV precisa de ao menos duas amostras.")
        inicio = tabela["created_at"].iloc[0]
        horas = (tabela["created_at"] - inicio).dt.total_seconds().to_numpy() / 3600
        colunas = {
            nome: pd.to_numeric(tabela[nome], errors="raise").to_numpy(dtype=float)
            if nome in tabela else None
            for nome in ("ivm", "umidade", "insolacao")
        }
    except (TypeError, ValueError) as erro:
        raise ValueError(f"Dados inválidos no CSV: {erro}") from erro
    dados = DadosMicroclima(
        horas=horas,
        ivm=colunas["ivm"],
        umidade=colunas["umidade"],
        insolacao=colunas["insolacao"],
        origem=f"CSV: {arquivo.name}",
        inicio=inicio,
        observacao=(
            "Horários reais de created_at, normalizados em UTC. "
            "Os cálculos abrangem somente o período observado; lacunas não são novas medições."
        ),
    )
    validar_dados(dados)
    return dados


def trechos_em_perigo(horas: np.ndarray, ivm: np.ndarray):
    """Fornece extremos de cada trecho linear em IVM >= 70."""
    for t0, t1, y0, y1 in zip(horas[:-1], horas[1:], ivm[:-1], ivm[1:]):
        if y0 < LIMIAR_PERIGO and y1 < LIMIAR_PERIGO:
            continue
        if (y0 < LIMIAR_PERIGO) != (y1 < LIMIAR_PERIGO):
            cruzamento = t0 + (LIMIAR_PERIGO - y0) * (t1 - t0) / (y1 - y0)
            if y0 >= LIMIAR_PERIGO:
                t1, y1 = cruzamento, LIMIAR_PERIGO
            else:
                t0, y0 = cruzamento, LIMIAR_PERIGO
        if t1 > t0:
            yield t0, t1, y0, y1


def exposicao_em_perigo(horas: np.ndarray, ivm: np.ndarray) -> tuple[float, float]:
    """Retorna área e duração em IVM >= 70, interpolando cada cruzamento.

    Aproximação linear entre amostras: cada trecho em PERIGO é um trapézio.
    A área inclui todo o IVM no trecho, não apenas o excesso acima de 70.
    """
    area = 0.0
    duracao = 0.0
    for t0, t1, y0, y1 in trechos_em_perigo(horas, ivm):
        intervalo = t1 - t0
        area += (y0 + y1) * intervalo / 2
        duracao += intervalo
    return float(area), float(duracao)


def analisar_dados(dados: DadosMicroclima) -> ResultadoCalculo:
    """Calcula derivadas numéricas, integral total e permanência em PERIGO.

    Simpson é usado em grades regulares com pelo menos três pontos. Em
    grades irregulares, trapézios evitam oscilações de interpolação quadrática
    sobre lacunas longas. Também são usados se a estimativa linear da área
    em PERIGO exceder a estimativa de Simpson para a área total.
    Nenhum método recupera informação não coletada.
    """
    validar_dados(dados)
    horas, ivm = dados.horas, dados.ivm
    intervalos = np.diff(horas)
    regular = len(horas) >= 3 and np.allclose(
        intervalos, intervalos[0], rtol=1e-6, atol=1e-12
    )
    area_total = simpson(y=ivm, x=horas) if regular else trapezoid(y=ivm, x=horas)
    area_perigo, duracao = exposicao_em_perigo(horas, ivm)
    if area_perigo > area_total:
        # Aproximações diferentes não devem apresentar uma parte maior que o todo.
        area_total = trapezoid(y=ivm, x=horas)
        regular = False
    return ResultadoCalculo(
        # Nas bordas, ordem 1 evita extrapolar uma parábola sobre lacunas longas.
        derivada_ivm=np.gradient(ivm, horas, edge_order=1),
        derivada_umidade=(
            np.gradient(dados.umidade, horas, edge_order=1)
            if dados.umidade is not None else None
        ),
        area_total=float(area_total),
        area_perigo=area_perigo,
        duracao_perigo=duracao,
        metodo_integracao="Simpson" if regular else "Trapézios",
    )


def gerar_grafico(dados: DadosMicroclima, resultado: ResultadoCalculo, destino: Path):
    """Cria dois painéis com índice acumulado e taxas de variação."""
    import matplotlib.pyplot as plt

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)
    horas, ivm = dados.horas, dados.ivm
    ax1.plot(horas, ivm, color="#0284C7", linewidth=2.3, label="IVM (%)")
    ax1.fill_between(
        horas, ivm, color="#0284C7", alpha=0.16,
        label=f"Integral total ({resultado.metodo_integracao}): {resultado.area_total:.1f} %·h",
    )
    for indice, (t0, t1, y0, y1) in enumerate(trechos_em_perigo(horas, ivm)):
        ax1.fill_between(
            [t0, t1], [y0, y1], color="#DC2626", alpha=0.22,
            linewidth=0,
            label="Área nos períodos em PERIGO" if indice == 0 else None,
        )
    ax1.axhline(70, color="#DC2626", linestyle="--", label="PERIGO: IVM ≥ 70%")
    ax1.axhline(40, color="#D97706", linestyle=":", label="ATENÇÃO: IVM ≥ 40%")
    ax1.set(title="Viela Tech | Índice de Vulnerabilidade de Microclima", ylabel="IVM (%)", ylim=(0, 105))
    ax1.legend(loc="upper center", fontsize=8, ncol=2)

    ax2.plot(horas, resultado.derivada_ivm, color="#059669", linewidth=2, label="dIVM/dt")
    if resultado.derivada_umidade is not None:
        ax2.plot(
            horas, resultado.derivada_umidade, color="#7C3AED",
            linewidth=1.5, linestyle="--", label="dU/dt (umidade)",
        )
    ax2.axhline(0, color="#334155", linewidth=0.8)
    ax2.set(
        title="Taxa de variação instantânea (aproximação numérica)",
        xlabel="Tempo decorrido desde a primeira amostra (h)",
        ylabel="Variação (pontos percentuais/h)",
        xlim=(horas[0], horas[-1]),
    )
    ax2.legend(loc="upper right", fontsize=9)
    for eixo in (ax1, ax2):
        eixo.grid(True, linestyle="--", alpha=0.3)
        eixo.spines[["top", "right"]].set_visible(False)
    rodape = dados.origem
    if dados.inicio is not None:
        rodape += " | t = 0: " + dados.inicio.strftime("%d/%m/%Y %H:%M:%S UTC")
    fig.text(0.5, 0.015, rodape, ha="center", fontsize=8, color="#475569")
    fig.tight_layout(rect=(0, 0.04, 1, 1))
    fig.savefig(destino, dpi=300)
    return fig


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    entrada = parser.add_mutually_exclusive_group()
    entrada.add_argument("--csv", type=Path, help="CSV com created_at e ivm; umidade/insolacao opcionais.")
    entrada.add_argument("--simular", action="store_true", help="Usar sempre o cenário sintético de 24 h.")
    parser.add_argument("--saida", type=Path, default=PASTA_MATH, help="Pasta dos arquivos gerados (padrão: 03-matematica-modelagem/).")
    parser.add_argument("--mostrar", action="store_true", help="Abrir o gráfico após salvar os arquivos.")
    args = parser.parse_args()
    # O modo padrão também funciona em terminais e computadores sem interface gráfica.
    if not args.mostrar:
        matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from relatorio_matematica import gerar_relatorio

    try:
        dados = simular_dados() if args.simular else carregar_dados(args.csv)
        resultado = analisar_dados(dados)
        args.saida.mkdir(parents=True, exist_ok=True)
        grafico = args.saida / "grafico_microclima.png"
        pdf = args.saida / "Relatorio_Matematica.pdf"
        figura = gerar_grafico(dados, resultado, grafico)
        limites = calcular_limites()
        gerar_relatorio(dados, resultado, grafico, pdf, limites)
    except (OSError, ValueError) as erro:
        parser.exit(1, f"Erro: {erro}\n")

    maior = int(np.argmax(resultado.derivada_ivm))
    print(f"Origem: {dados.origem}")
    print(f"Amostras: {len(dados.horas)} | Período: {dados.horas[-1] - dados.horas[0]:.2f} h")
    print(f"Integral total ({resultado.metodo_integracao}): {resultado.area_total:.2f} %·h")
    print(f"Área em PERIGO (interpolação linear): {resultado.area_perigo:.2f} %·h")
    print(f"Tempo em PERIGO: {resultado.duracao_perigo:.2f} h")
    print(
        f"Limite do quociente em t={limites.t_referencia:g} h: "
        f"{limites.quocientes[-1][1]:.4f} -> derivada exata {limites.derivada_exata:.4f} p.p./h"
    )
    print(
        f"Nascer do sol (t={limites.t_canto:g} h): derivada lateral esquerda "
        f"{limites.derivada_esquerda:.2f} | direita {limites.derivada_direita:.2f} p.p./h"
    )
    print(f"Derivada máxima do IVM: {resultado.derivada_ivm[maior]:.2f} p.p./h em t={dados.horas[maior]:.2f} h")
    print(f"Gráfico: {grafico.resolve()}")
    print(f"Relatório: {pdf.resolve()}")
    if args.mostrar:
        plt.show()
    plt.close(figura)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
