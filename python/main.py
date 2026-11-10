"""Ferramenta CLI para análise de vulnerabilidade de microclima do CANYON.

Busca leituras públicas do ThingSpeak, mantém um backup local e um histórico
sem duplicatas, calcula o IVM e exporta os dados processados para CSV.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

import requests


# Todos os arquivos de dados ficam ao lado deste script, independentemente do
# diretório a partir do qual o programa for iniciado.
PASTA_DADOS: Path = Path(__file__).resolve().parent
URL_THINGSPEAK: str = "https://api.thingspeak.com/channels/3571901/feeds.json"
ARQUIVO_BACKUP: Path = PASTA_DADOS / "backup.json"
ARQUIVO_HISTORICO: Path = PASTA_DADOS / "historico.json"
ARQUIVO_CSV: Path = PASTA_DADOS / "relatorio.csv"

CONFIGURACAO: dict[str, float] = {
    "peso_umidade": 0.6,
    "peso_insolacao_inversa": 0.4,
}
CAMPOS_CSV: list[str] = [
    "entry_id", "created_at", "umidade", "insolacao", "ivm", "faixa_risco"
]


def carregar_json(caminho: Path) -> list[dict[str, Any]]:
    """Carrega uma lista de registros JSON, tratando arquivos ausentes ou inválidos.

    Args:
        caminho: Caminho do arquivo JSON.

    Returns:
        Lista de dicionários válidos; lista vazia se o arquivo não existir,
        estiver vazio/corrompido ou não contiver uma lista.

    Raises:
        OSError: Não é propagado; erros de leitura são reportados e retornam lista vazia.
    """
    try:
        if not caminho.exists() or caminho.stat().st_size == 0:
            return []
        with caminho.open("r", encoding="utf-8") as arquivo:
            conteudo: Any = json.load(arquivo)
        if not isinstance(conteudo, list):
            print(f"Aviso: {caminho.name} não contém uma lista JSON; será ignorado.")
            return []
        return [item for item in conteudo if isinstance(item, dict)]
    except (OSError, json.JSONDecodeError) as erro:
        print(f"Aviso: não foi possível ler {caminho.name}: {erro}")
        return []


def salvar_json(caminho: Path, registros: list[dict[str, Any]]) -> bool:
    """Grava registros em JSON com substituição segura do arquivo.

    Args:
        caminho: Arquivo de destino.
        registros: Registros serializáveis a gravar.

    Returns:
        True quando a gravação termina; False se ocorrer erro de arquivo/JSON.

    Raises:
        TypeError: Não é propagado; dados não serializáveis são informados e retornam False.
    """
    temporario: Path = caminho.with_suffix(caminho.suffix + ".tmp")
    try:
        with temporario.open("w", encoding="utf-8") as arquivo:
            json.dump(registros, arquivo, ensure_ascii=False, indent=2)
            arquivo.write("\n")
        temporario.replace(caminho)
        return True
    except (OSError, TypeError, ValueError) as erro:
        print(f"Erro ao salvar {caminho.name}: {erro}")
        try:
            temporario.unlink(missing_ok=True)
        except OSError:
            pass
        return False


def calcular_ivm(umidade: float, insolacao: float) -> float:
    """Calcula o Índice de Vulnerabilidade de Microclima.

    Args:
        umidade: Percentual de umidade, entre 0 e 100.
        insolacao: Percentual de insolação, entre 0 e 100.

    Returns:
        IVM arredondado a duas casas decimais.

    Raises:
        ValueError: Se os pesos não somarem 1.0 ou se as medições forem inválidas.
    """
    soma_pesos: float = CONFIGURACAO["peso_umidade"] + CONFIGURACAO["peso_insolacao_inversa"]
    if abs(soma_pesos - 1.0) > 1e-9:
        raise ValueError("A soma dos pesos deve ser igual a 1.0")
    if not (0.0 <= umidade <= 100.0 and 0.0 <= insolacao <= 100.0):
        raise ValueError("Umidade e insolação devem estar entre 0 e 100")
    return round(
        CONFIGURACAO["peso_umidade"] * umidade
        + CONFIGURACAO["peso_insolacao_inversa"] * (100.0 - insolacao),
        2,
    )


def classificar_risco(ivm: float) -> str:
    """Converte um IVM em faixa de risco.

    Args:
        ivm: Índice de Vulnerabilidade de Microclima.

    Returns:
        NORMAL, ATENÇÃO ou PERIGO conforme os limites definidos.

    Raises:
        ValueError: Se o índice for negativo ou não finito.
    """
    if ivm < 0 or ivm != ivm or ivm == float("inf"):
        raise ValueError("IVM inválido")
    if ivm < 40:
        return "NORMAL"
    if ivm < 70:
        return "ATENÇÃO"
    return "PERIGO"


def normalizar_leituras(leituras: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Valida e enriquece feeds do ThingSpeak com IVM e faixa de risco.

    Args:
        leituras: Dicionários contendo entry_id, created_at, field1 e field2.

    Returns:
        Registros válidos e ordenados pelo entry_id crescente.

    Raises:
        ValueError: Erros de medição por registro são capturados e descartados.
    """
    resultado: list[dict[str, Any]] = []
    for leitura in leituras:
        try:
            identificador: str = str(leitura["entry_id"]).strip()
            umidade: float = float(leitura["field1"])
            insolacao: float = float(leitura["field2"])
            if not identificador:
                raise ValueError("entry_id ausente")
            ivm: float = calcular_ivm(umidade, insolacao)
            resultado.append(
                {
                    "entry_id": identificador,
                    "created_at": str(leitura.get("created_at", "")),
                    "umidade": umidade,
                    "insolacao": insolacao,
                    "ivm": ivm,
                    "faixa_risco": classificar_risco(ivm),
                }
            )
        except (KeyError, TypeError, ValueError, OverflowError) as erro:
            print(f"Aviso: leitura inválida ignorada ({erro}).")
    # Ordena numericamente quando possível para preservar a ordem temporal da API.
    resultado.sort(key=lambda item: (0, int(item["entry_id"])) if item["entry_id"].isdigit() else (1, item["entry_id"]))
    return resultado


def buscar_leituras() -> tuple[list[dict[str, Any]], bool]:
    """Busca até 20 leituras e usa backup local quando a API falhar.

    Returns:
        Tupla (registros normalizados, origem_online). A origem_online indica
        que a resposta HTTP e o JSON da API foram aceitos.

    Raises:
        requests.exceptions.RequestException: Capturada internamente; aciona fallback.
    """
    try:
        resposta: requests.Response = requests.get(
            URL_THINGSPEAK, params={"results": 20}, timeout=5
        )
        resposta.raise_for_status()
        dados: Any = resposta.json()
        if not isinstance(dados, dict) or not isinstance(dados.get("feeds"), list):
            raise ValueError("Resposta da API sem lista 'feeds' válida")
        registros: list[dict[str, Any]] = normalizar_leituras(dados["feeds"])
        if not salvar_json(ARQUIVO_BACKUP, registros):
            print("Aviso: leituras recebidas, mas o backup não pôde ser atualizado.")
        return registros, True
    except (requests.exceptions.RequestException, ValueError, json.JSONDecodeError) as erro:
        print(f"API indisponível ou resposta inválida ({erro}). Usando backup local.")
        backup: list[dict[str, Any]] = carregar_json(ARQUIVO_BACKUP)
        return normalizar_registros_salvos(backup), False


def normalizar_registros_salvos(registros: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Valida registros normalizados carregados do backup ou histórico.

    Args:
        registros: Lista com campos umidade, insolacao e entry_id.

    Returns:
        Registros válidos normalizados e ordenados.

    Raises:
        ValueError: Registros com valores inválidos são descartados individualmente.
    """
    feeds: list[dict[str, Any]] = []
    for item in registros:
        try:
            feeds.append(
                {
                    "entry_id": item["entry_id"],
                    "created_at": item.get("created_at", ""),
                    "field1": item["umidade"],
                    "field2": item["insolacao"],
                }
            )
        except (KeyError, TypeError):
            print("Aviso: registro local sem campos obrigatórios ignorado.")
    return normalizar_leituras(feeds)


def atualizar_historico(novas_leituras: list[dict[str, Any]]) -> int:
    """Acrescenta ao histórico apenas IDs ainda não registrados.

    Args:
        novas_leituras: Leituras normalizadas para adicionar.

    Returns:
        Quantidade de novos registros gravados.

    Raises:
        OSError: Falhas de leitura/gravação são tratadas e retornam zero.
    """
    historico: list[dict[str, Any]] = normalizar_registros_salvos(
        carregar_json(ARQUIVO_HISTORICO)
    )
    ids_existentes: set[str] = {str(item["entry_id"]) for item in historico}
    adicionadas: int = 0
    for leitura in novas_leituras:
        entry_id: str = str(leitura["entry_id"])
        if entry_id not in ids_existentes:
            historico.append(leitura)
            ids_existentes.add(entry_id)
            adicionadas += 1
    historico.sort(key=lambda item: (0, int(item["entry_id"])) if item["entry_id"].isdigit() else (1, item["entry_id"]))
    if adicionadas and not salvar_json(ARQUIVO_HISTORICO, historico):
        return 0
    return adicionadas


def analisar_leituras(registros: list[dict[str, Any]]) -> dict[str, Any]:
    """Calcula contagens, tendência e maior sequência de leituras perigosas.

    Args:
        registros: Leituras processadas em ordem temporal.

    Returns:
        Dicionário com contagens por faixa, flag de piora e maior episódio PERIGO.

    Raises:
        ValueError: Se algum registro não tiver IVM numérico válido.
    """
    contagens: dict[str, int] = {"NORMAL": 0, "ATENÇÃO": 0, "PERIGO": 0}
    ivms: list[float] = []
    maior_perigo: int = 0
    perigo_atual: int = 0
    for registro in registros:
        ivm: float = float(registro["ivm"])
        faixa: str = classificar_risco(ivm)
        contagens[faixa] += 1
        ivms.append(ivm)
        if faixa == "PERIGO":
            perigo_atual += 1
            maior_perigo = max(maior_perigo, perigo_atual)
        else:
            perigo_atual = 0
    aumentos_consecutivos: int = 0
    piorando: bool = False
    for anterior, atual in zip(ivms, ivms[1:]):
        if atual > anterior:
            aumentos_consecutivos += 1
            if aumentos_consecutivos >= 3:
                piorando = True
        else:
            aumentos_consecutivos = 0
    return {
        "contagens": contagens,
        "tendencia": "PIORANDO" if piorando else "ESTÁVEL/SEM PIORA CONFIRMADA",
        "maior_episodio_perigo": maior_perigo,
        "total": len(registros),
        "ultimo_ivm": ivms[-1] if ivms else None,
    }


def exportar_csv(registros: list[dict[str, Any]]) -> bool:
    """Cria/sobrescreve o relatório CSV em UTF-8 com BOM para Excel.

    Args:
        registros: Leituras normalizadas a exportar.

    Returns:
        True em caso de sucesso, False se houver erro de escrita.

    Raises:
        OSError: Capturada internamente e representada por False.
    """
    try:
        with ARQUIVO_CSV.open("w", newline="", encoding="utf-8-sig") as arquivo:
            escritor: csv.DictWriter = csv.DictWriter(arquivo, fieldnames=CAMPOS_CSV)
            escritor.writeheader()
            escritor.writerows({campo: item.get(campo, "") for campo in CAMPOS_CSV} for item in registros)
        return True
    except (OSError, csv.Error) as erro:
        print(f"Erro ao exportar CSV: {erro}")
        return False


def exibir_analise(registros: list[dict[str, Any]]) -> None:
    """Exibe no terminal o resumo epidemiológico dos dados disponíveis.

    Args:
        registros: Leituras analisadas.

    Returns:
        None.

    Raises:
        ValueError: Erros em registros individuais são tratados e exibidos.
    """
    try:
        analise: dict[str, Any] = analisar_leituras(registros)
        print("\n--- Análise de risco e tendência ---")
        print(f"Leituras analisadas: {analise['total']}")
        for faixa, quantidade in analise["contagens"].items():
            print(f"{faixa}: {quantidade}")
        print(f"Tendência: {analise['tendencia']}")
        print(f"Maior episódio contínuo em PERIGO: {analise['maior_episodio_perigo']} leitura(s)")
        if analise["ultimo_ivm"] is not None:
            print(f"Último IVM: {analise['ultimo_ivm']:.2f} ({classificar_risco(analise['ultimo_ivm'])})")
        else:
            print("Sem leituras para analisar.")
    except (KeyError, TypeError, ValueError) as erro:
        print(f"Não foi possível analisar os dados: {erro}")


def menu() -> None:
    """Executa o menu interativo até que a opção de saída seja escolhida.

    Args:
        Nenhum.

    Returns:
        None.

    Raises:
        EOFError: Tratado como solicitação de encerramento do programa.
    """
    registros_atuais: list[dict[str, Any]] = normalizar_registros_salvos(
        carregar_json(ARQUIVO_HISTORICO)
    )
    while True:
        print("\n=== VielaTech | Monitoramento de Microclima ===")
        print("[1] Buscar e Processar Leituras do ThingSpeak / Backup")
        print("[2] Exibir Análise de Risco e Tendência Atual")
        print("[3] Exportar Relatório CSV")
        print("[4] Sair do Programa")
        try:
            opcao: str = input("Escolha uma opção: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nPrograma encerrado.")
            break

        if opcao == "1":
            lidas, online = buscar_leituras()
            adicionadas: int = atualizar_historico(lidas)
            registros_atuais = normalizar_registros_salvos(carregar_json(ARQUIVO_HISTORICO))
            origem: str = "ThingSpeak" if online else "backup offline"
            print(f"{len(lidas)} leitura(s) obtida(s) de {origem}; {adicionadas} nova(s) adicionada(s) ao histórico.")
        elif opcao == "2":
            if not registros_atuais:
                registros_atuais = normalizar_registros_salvos(carregar_json(ARQUIVO_HISTORICO))
            exibir_analise(registros_atuais)
        elif opcao == "3":
            if not registros_atuais:
                registros_atuais = normalizar_registros_salvos(carregar_json(ARQUIVO_HISTORICO))
            if exportar_csv(registros_atuais):
                print(f"Relatório exportado: {ARQUIVO_CSV}")
        elif opcao == "4":
            print("Até logo!")
            break
        else:
            print("Opção inválida. Digite 1, 2, 3 ou 4.")


if __name__ == "__main__":
    try:
        menu()
    except Exception as erro:  # Última barreira para manter a CLI utilizável.
        print(f"Erro inesperado: {erro}")
