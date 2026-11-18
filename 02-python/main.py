"""Viela Tech — "O Cérebro Conectado": análise do microclima das vielas da Rocinha.

Busca as leituras públicas do ESP32 no ThingSpeak, mantém um backup local e um
histórico sem duplicatas, calcula o Índice de Vulnerabilidade de Microclima
(IVM) com normalização mín–máx e exporta os dados processados para CSV.
"""

from __future__ import annotations

import csv
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import requests


# Todos os arquivos de dados ficam ao lado deste script, independentemente do
# diretório a partir do qual o programa for iniciado.
PASTA_DADOS: Path = Path(__file__).resolve().parent
ARQUIVO_BACKUP: Path = PASTA_DADOS / "backup.json"
ARQUIVO_HISTORICO: Path = PASTA_DADOS / "historico.json"
ARQUIVO_CSV: Path = PASTA_DADOS / "relatorio.csv"

FAIXAS: tuple[str, str, str] = ("NORMAL", "ATENÇÃO", "PERIGO")

# Configuração centralizada: toda regra de negócio ajustável mora aqui.
CONFIGURACAO: dict[str, Any] = {
    "api": {
        "url": "https://api.thingspeak.com/channels/3571901/feeds.json",
        "quantidade_leituras": 100,   # pede até 100; a atividade exige ao menos 20
        "minimo_leituras": 20,
        "timeout_segundos": 5,
    },
    # Faixa usada na normalização nivel = (valor - min) / (max - min) * 100.
    # 0–100 é a faixa física dos sensores: o DHT22 mede 0–100 %UR e o LDR é
    # convertido para 0–100 % no ESP32. Assim o IVM do Python é igual ao do
    # ESP32, da Matemática e da aplicação web.
    "limites": {
        "umidade": {"min": 0.0, "max": 100.0},
        "insolacao": {"min": 0.0, "max": 100.0},
    },
    # risco = peso1 * nivel_umidade + peso2 * nivel_falta_de_luz (soma = 1).
    "pesos": {
        "umidade": 0.6,
        "falta_de_luz": 0.4,
    },
    # NORMAL < 40 <= ATENÇÃO < 70 <= PERIGO
    "limiares": {
        "atencao": 40.0,
        "perigo": 70.0,
    },
    "leituras_para_tendencia": 3,   # altas consecutivas que indicam piora
    # Aviso exibido ao cidadão conforme a faixa da leitura mais recente.
    # Os mesmos textos orientam o boletim da aplicação web.
    "avisos": {
        "NORMAL": "Ventilação em dia. Mantenha portas e janelas abertas quando possível.",
        "ATENÇÃO": "Ar úmido e pouca luz: abra janelas em lados opostos e observe quem está com tosse.",
        "PERIGO": "Ar parado e úmido: ventile a casa e, se a tosse passar de 3 semanas, procure a Clínica da Família.",
    },
}

# O CSV é a versão "achatada" do modelo de leitura (ver criar_leitura).
CAMPOS_CSV: list[str] = ["id", "horario", "umidade", "insolacao", "temperatura", "ivm", "faixa"]


def validar_configuracao(config: dict[str, Any] = CONFIGURACAO) -> None:
    """Confere se a configuração do índice é coerente antes de qualquer cálculo.

    Args:
        config: Dicionário no formato de CONFIGURACAO.

    Returns:
        None quando a configuração é válida.

    Raises:
        ValueError: Se os pesos não somarem 1, algum peso for negativo, algum
            limite tiver min >= max, os limiares estiverem fora de ordem ou
            faltar o aviso de alguma faixa.
    """
    try:
        pesos: dict[str, float] = config["pesos"]
        limites: dict[str, dict[str, float]] = config["limites"]
        limiares: dict[str, float] = config["limiares"]
        avisos: dict[str, str] = config["avisos"]
    except (KeyError, TypeError) as erro:
        raise ValueError(f"Configuração incompleta: {erro}") from erro

    if any(peso < 0 for peso in pesos.values()):
        raise ValueError("Os pesos não podem ser negativos")
    if not math.isclose(sum(pesos.values()), 1.0, abs_tol=1e-9):
        raise ValueError(f"A soma dos pesos deve ser 1.0 (atual: {sum(pesos.values())})")
    for nome, faixa in limites.items():
        if faixa["min"] >= faixa["max"]:
            raise ValueError(f"Limite inválido para {nome}: min deve ser menor que max")
    if not 0 < limiares["atencao"] < limiares["perigo"] <= 100:
        raise ValueError("Limiares inválidos: use 0 < atenção < perigo <= 100")
    faixas_sem_aviso: list[str] = [faixa for faixa in FAIXAS if not str(avisos.get(faixa, "")).strip()]
    if faixas_sem_aviso:
        raise ValueError(f"Falta o aviso das faixas: {', '.join(faixas_sem_aviso)}")


def normalizar(valor: float, minimo: float, maximo: float) -> float:
    """Converte um valor para a escala 0–100 a partir da sua faixa mín–máx.

    Args:
        valor: Medição bruta.
        minimo: Menor valor esperado da faixa.
        maximo: Maior valor esperado da faixa.

    Returns:
        nivel = (valor - minimo) / (maximo - minimo) * 100, limitado a [0, 100].

    Raises:
        ValueError: Se minimo >= maximo ou o valor não for finito.
    """
    if minimo >= maximo:
        raise ValueError("O mínimo deve ser menor que o máximo")
    if not math.isfinite(valor):
        raise ValueError("Valor não finito")
    nivel: float = (valor - minimo) / (maximo - minimo) * 100.0
    return max(0.0, min(100.0, nivel))


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
    """Calcula o Índice de Vulnerabilidade de Microclima (IVM).

    nivel_umidade = normalizar(umidade); nivel_falta_de_luz = 100 - normalizar(insolacao);
    IVM = peso_umidade * nivel_umidade + peso_falta_de_luz * nivel_falta_de_luz.

    São duas verificações diferentes:
    - validade física: as duas medidas são percentuais, então um valor fora de 0–100
      indica erro do sensor e a leitura é rejeitada;
    - calibração: CONFIGURACAO["limites"] define a faixa usada na normalização. Um valor
      válido fora dessa faixa é limitado (clamp) a 0 ou 100 por normalizar().

    Args:
        umidade: Umidade relativa medida (%), entre 0 e 100.
        insolacao: Insolação medida (%), entre 0 e 100.

    Returns:
        IVM entre 0 e 100, arredondado a uma casa decimal (igual ao ESP32 e ao app).

    Raises:
        ValueError: Se uma medida estiver fora de 0–100 (erro de sensor) ou se a
            configuração de pesos e limites for inválida.
    """
    if not (0.0 <= umidade <= 100.0 and 0.0 <= insolacao <= 100.0):
        raise ValueError("Umidade e insolação são percentuais: devem estar entre 0 e 100")
    validar_configuracao()
    limites: dict[str, dict[str, float]] = CONFIGURACAO["limites"]
    pesos: dict[str, float] = CONFIGURACAO["pesos"]
    nivel_umidade: float = normalizar(umidade, limites["umidade"]["min"], limites["umidade"]["max"])
    nivel_falta_de_luz: float = 100.0 - normalizar(
        insolacao, limites["insolacao"]["min"], limites["insolacao"]["max"]
    )
    return round(pesos["umidade"] * nivel_umidade + pesos["falta_de_luz"] * nivel_falta_de_luz, 1)


def classificar_risco(ivm: float) -> str:
    """Converte um IVM em faixa de risco.

    Args:
        ivm: Índice de Vulnerabilidade de Microclima.

    Returns:
        NORMAL (< 40), ATENÇÃO (40 a < 70) ou PERIGO (>= 70), conforme CONFIGURACAO.

    Raises:
        ValueError: Se o índice for negativo ou não finito.
    """
    if not math.isfinite(ivm) or ivm < 0:
        raise ValueError("IVM inválido")
    limiares: dict[str, float] = CONFIGURACAO["limiares"]
    if ivm < limiares["atencao"]:
        return "NORMAL"
    if ivm < limiares["perigo"]:
        return "ATENÇÃO"
    return "PERIGO"


def converter_opcional(valor: Any) -> float | None:
    """Converte um campo opcional (como a temperatura) sem descartar a leitura.

    Args:
        valor: Texto ou número vindo da API ou do arquivo local.

    Returns:
        O número convertido, ou None se estiver vazio ou inválido.

    Raises:
        Nenhuma exceção é propagada.
    """
    if valor in (None, ""):
        return None
    try:
        numero: float = float(valor)
    except (TypeError, ValueError):
        return None
    return numero if math.isfinite(numero) else None


def chave_ordenacao(registro: dict[str, Any]) -> tuple[int, Any]:
    """Ordena numericamente pelo id (entry_id do ThingSpeak), que segue a ordem temporal."""
    identificador: str = str(registro["id"])
    return (0, int(identificador)) if identificador.isdigit() else (1, identificador)


def criar_leitura(
    identificador: str, horario: str, umidade: float, insolacao: float, temperatura: float | None
) -> dict[str, Any]:
    """Monta o modelo de uma leitura: {id, horario, medidas, ivm, faixa}.

    Args:
        identificador: entry_id do ThingSpeak.
        horario: created_at da leitura (ISO 8601, UTC).
        umidade: Umidade relativa (%).
        insolacao: Insolação (%).
        temperatura: Temperatura (°C) ou None quando o sensor não enviou.

    Returns:
        Dicionário com as medidas agrupadas, o IVM e a faixa de risco.

    Raises:
        ValueError: Se as medidas estiverem fora da faixa física (via calcular_ivm).
    """
    ivm: float = calcular_ivm(umidade, insolacao)
    return {
        "id": identificador,
        "horario": horario,
        "medidas": {"umidade": umidade, "insolacao": insolacao, "temperatura": temperatura},
        "ivm": ivm,
        "faixa": classificar_risco(ivm),
    }


def normalizar_leituras(leituras: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Valida os feeds do ThingSpeak e os converte no modelo de leitura.

    Args:
        leituras: Dicionários da API com entry_id, created_at, field1 (umidade),
            field2 (insolação) e, opcionalmente, field4 (temperatura).

    Returns:
        Leituras válidas no formato de criar_leitura, ordenadas pelo id.

    Raises:
        ValueError: Erros de medição por registro são capturados e descartados.
    """
    resultado: list[dict[str, Any]] = []
    for leitura in leituras:
        try:
            identificador: str = str(leitura["entry_id"]).strip()
            if not identificador:
                raise ValueError("entry_id ausente")
            resultado.append(
                criar_leitura(
                    identificador,
                    str(leitura.get("created_at", "")),
                    float(leitura["field1"]),
                    float(leitura["field2"]),
                    converter_opcional(leitura.get("field4")),
                )
            )
        except (KeyError, TypeError, ValueError, OverflowError) as erro:
            print(f"Aviso: leitura inválida ignorada ({erro}).")
    resultado.sort(key=chave_ordenacao)
    return resultado


def normalizar_registros_salvos(registros: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Valida leituras carregadas do backup ou do histórico.

    Aceita o modelo atual ({id, horario, medidas}) e o formato antigo, com os
    campos soltos (entry_id, created_at, umidade, insolacao, temperatura).

    Args:
        registros: Lista de leituras salvas em JSON.

    Returns:
        Leituras válidas, recalculadas com a configuração atual e ordenadas.

    Raises:
        ValueError: Registros com valores inválidos são descartados individualmente.
    """
    feeds: list[dict[str, Any]] = []
    for item in registros:
        try:
            medidas: dict[str, Any] = item.get("medidas", item)
            feeds.append(
                {
                    "entry_id": item.get("id", item.get("entry_id")),
                    "created_at": item.get("horario", item.get("created_at", "")),
                    "field1": medidas["umidade"],
                    "field2": medidas["insolacao"],
                    "field4": medidas.get("temperatura"),
                }
            )
        except (KeyError, TypeError, AttributeError):
            print("Aviso: registro local sem campos obrigatórios ignorado.")
    return normalizar_leituras(feeds)


def buscar_leituras() -> tuple[list[dict[str, Any]], bool]:
    """Busca as leituras na API e usa o backup local quando ela falhar.

    Returns:
        Tupla (registros normalizados, origem_online). origem_online é True
        quando a resposta HTTP e o JSON da API foram aceitos.

    Raises:
        requests.exceptions.RequestException: Capturada internamente; aciona o backup.
    """
    api: dict[str, Any] = CONFIGURACAO["api"]
    try:
        resposta: requests.Response = requests.get(
            api["url"],
            params={"results": api["quantidade_leituras"]},
            timeout=api["timeout_segundos"],
        )
        resposta.raise_for_status()
        dados: Any = resposta.json()
        if not isinstance(dados, dict) or not isinstance(dados.get("feeds"), list):
            raise ValueError("Resposta da API sem lista 'feeds' válida")
        registros: list[dict[str, Any]] = normalizar_leituras(dados["feeds"])
        if not registros:
            raise ValueError("A API não retornou leituras válidas")
        # O backup só é substituído quando há dados válidos novos.
        if not salvar_json(ARQUIVO_BACKUP, registros):
            print("Aviso: leituras recebidas, mas o backup não pôde ser atualizado.")
        return registros, True
    except (requests.exceptions.RequestException, ValueError) as erro:
        print(f"API indisponível ou resposta inválida ({erro}). Usando backup local.")
        backup: list[dict[str, Any]] = carregar_json(ARQUIVO_BACKUP)
        return normalizar_registros_salvos(backup), False


def atualizar_historico(novas_leituras: list[dict[str, Any]]) -> int:
    """Acrescenta ao histórico apenas IDs ainda não registrados.

    Args:
        novas_leituras: Leituras normalizadas para adicionar.

    Returns:
        Quantidade de novos registros gravados.

    Raises:
        OSError: Falhas de leitura/gravação são tratadas e retornam zero.
    """
    salvos: list[dict[str, Any]] = carregar_json(ARQUIVO_HISTORICO)
    # Um histórico gravado no formato antigo é regravado no modelo atual.
    formato_antigo: bool = any("medidas" not in item for item in salvos)
    historico: list[dict[str, Any]] = normalizar_registros_salvos(salvos)
    ids_existentes: set[str] = {str(item["id"]) for item in historico}
    adicionadas: int = 0
    for leitura in novas_leituras:
        identificador: str = str(leitura["id"])
        if identificador not in ids_existentes:
            historico.append(leitura)
            ids_existentes.add(identificador)
            adicionadas += 1
    historico.sort(key=chave_ordenacao)
    if (adicionadas or formato_antigo) and not salvar_json(ARQUIVO_HISTORICO, historico):
        return 0
    return adicionadas


def ler_horario(texto: Any) -> datetime | None:
    """Converte o horário ISO 8601 do ThingSpeak; devolve None se for inválido."""
    try:
        return datetime.fromisoformat(str(texto).replace("Z", "+00:00"))
    except ValueError:
        return None


def duracao_minutos(inicio: Any, fim: Any) -> float | None:
    """Minutos entre dois horários de leitura, ou None se algum for inválido."""
    comeco: datetime | None = ler_horario(inicio)
    termino: datetime | None = ler_horario(fim)
    if comeco is None or termino is None:
        return None
    return (termino - comeco).total_seconds() / 60


def analisar_leituras(registros: list[dict[str, Any]]) -> dict[str, Any]:
    """Resume o risco: contagem por faixa, média, pico, tendência e episódios de PERIGO.

    Um episódio é uma sequência contínua de leituras em PERIGO. A duração vai da
    primeira à última leitura do episódio.

    Args:
        registros: Leituras no modelo de criar_leitura, em ordem temporal.

    Returns:
        Dicionário com contagens, média, pico (valor e horário), tendência,
        número de episódios, maior episódio (leituras e minutos) e o aviso da
        faixa da leitura mais recente.

    Raises:
        ValueError: Se algum registro não tiver IVM numérico válido.
    """
    contagens: dict[str, int] = {faixa: 0 for faixa in FAIXAS}
    ivms: list[float] = []
    episodios: list[list[dict[str, Any]]] = []
    episodio_atual: list[dict[str, Any]] = []
    for registro in registros:
        ivm: float = float(registro["ivm"])
        faixa: str = classificar_risco(ivm)
        contagens[faixa] += 1
        ivms.append(ivm)
        if faixa == "PERIGO":
            episodio_atual.append(registro)
        elif episodio_atual:
            episodios.append(episodio_atual)
            episodio_atual = []
    if episodio_atual:
        episodios.append(episodio_atual)

    altas_necessarias: int = CONFIGURACAO["leituras_para_tendencia"]
    aumentos_consecutivos: int = 0
    piorando: bool = False
    for anterior, atual in zip(ivms, ivms[1:]):
        if atual > anterior:
            aumentos_consecutivos += 1
            if aumentos_consecutivos >= altas_necessarias:
                piorando = True
        else:
            aumentos_consecutivos = 0

    maior: list[dict[str, Any]] = max(episodios, key=len, default=[])
    pico: dict[str, Any] | None = max(registros, key=lambda r: float(r["ivm"]), default=None)
    ultimo: float | None = ivms[-1] if ivms else None
    return {
        "contagens": contagens,
        "total": len(registros),
        "media_ivm": round(sum(ivms) / len(ivms), 1) if ivms else None,
        "pico_ivm": float(pico["ivm"]) if pico else None,
        "pico_horario": pico.get("horario") if pico else None,
        "tendencia": "PIORANDO" if piorando else "ESTÁVEL/SEM PIORA CONFIRMADA",
        "episodios_perigo": len(episodios),
        "maior_episodio_perigo": len(maior),
        "maior_episodio_minutos": duracao_minutos(maior[0].get("horario"), maior[-1].get("horario")) if maior else None,
        "ultimo_ivm": ultimo,
        "aviso": CONFIGURACAO["avisos"][classificar_risco(ultimo)] if ultimo is not None else None,
    }


def exportar_csv(registros: list[dict[str, Any]]) -> bool:
    """Cria/sobrescreve o relatório CSV (UTF-8 com BOM, abre direto no Excel).

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
            for item in registros:
                medidas: dict[str, Any] = item["medidas"]
                escritor.writerow(
                    {
                        "id": item["id"],
                        "horario": item["horario"],
                        "umidade": medidas["umidade"],
                        "insolacao": medidas["insolacao"],
                        "temperatura": "" if medidas.get("temperatura") is None else medidas["temperatura"],
                        "ivm": item["ivm"],
                        "faixa": item["faixa"],
                    }
                )
        return True
    except (OSError, csv.Error, KeyError, TypeError) as erro:
        print(f"Erro ao exportar CSV: {erro}")
        return False


def formatar_horario(texto: Any) -> str:
    """Mostra o horário UTC do ThingSpeak como dd/mm hh:mm no fuso de Brasília (UTC−3)."""
    momento: datetime | None = ler_horario(texto)
    if momento is None:
        return "horário desconhecido"
    return momento.astimezone(timezone(timedelta(hours=-3))).strftime("%d/%m %H:%M")


def exibir_analise(registros: list[dict[str, Any]]) -> None:
    """Exibe no terminal o resumo de risco dos dados disponíveis.

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
        if analise["total"] < CONFIGURACAO["api"]["minimo_leituras"]:
            print(f"Aviso: menos de {CONFIGURACAO['api']['minimo_leituras']} leituras no histórico.")
        if analise["ultimo_ivm"] is None:
            print("Sem leituras para analisar.")
            return
        print(f"Risco médio: {analise['media_ivm']:.1f} · pico {analise['pico_ivm']:.1f} em {formatar_horario(analise['pico_horario'])}")
        for faixa, quantidade in analise["contagens"].items():
            print(f"{faixa}: {quantidade}")
        if analise["episodios_perigo"]:
            minutos: float | None = analise["maior_episodio_minutos"]
            duracao: str = f", {minutos:.0f} min" if minutos is not None else ""
            print(
                f"Episódios em PERIGO: {analise['episodios_perigo']}; o maior teve "
                f"{analise['maior_episodio_perigo']} leitura(s){duracao}"
            )
        else:
            print("Episódios em PERIGO: nenhum")
        print(f"Tendência: {analise['tendencia']}")
        print(f"Último IVM: {analise['ultimo_ivm']:.1f} ({classificar_risco(analise['ultimo_ivm'])})")
        print(f"AVISO: {analise['aviso']}")
    except (KeyError, TypeError, ValueError) as erro:
        print(f"Não foi possível analisar os dados: {erro}")


def menu() -> None:
    """Executa o menu interativo até que a opção de saída seja escolhida.

    Args:
        Nenhum.

    Returns:
        None.

    Raises:
        Nenhum: a configuração é validada antes, no bloco principal.
    """
    registros_atuais: list[dict[str, Any]] = normalizar_registros_salvos(
        carregar_json(ARQUIVO_HISTORICO)
    )
    while True:
        print("\n=== Viela Tech | Monitoramento de Microclima ===")
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
            print(f"Histórico acumulado: {len(registros_atuais)} leitura(s).")
        elif opcao == "2":
            exibir_analise(registros_atuais)
        elif opcao == "3":
            if exportar_csv(registros_atuais):
                print(f"Relatório exportado: {ARQUIVO_CSV} ({len(registros_atuais)} linha(s)).")
        elif opcao == "4":
            print("Até logo!")
            break
        else:
            print("Opção inválida. Digite 1, 2, 3 ou 4.")


if __name__ == "__main__":
    try:
        validar_configuracao()
    except ValueError as erro:
        print(f"Configuração inválida: {erro}")
        raise SystemExit(1)
    try:
        menu()
    except Exception as erro:  # Última barreira para manter a CLI utilizável.
        print(f"Erro inesperado: {erro}")
