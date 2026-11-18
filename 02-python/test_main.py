"""Testes automáticos do módulo Python do Viela Tech (sem acesso à rede).

Execute dentro desta pasta:  python -m unittest -v test_main
"""

from __future__ import annotations

import copy
import csv
import tempfile
import unittest
from pathlib import Path
from typing import Any
from unittest import mock

import requests

import main


def feed(entry_id: int, umidade: float, insolacao: float, temperatura: Any = None) -> dict:
    return {
        "entry_id": entry_id,
        "created_at": f"2026-11-09T13:{entry_id:02d}:00Z",
        "field1": str(umidade),
        "field2": str(insolacao),
        "field4": temperatura,
    }



class ArquivosTemporarios(unittest.TestCase):
    """Redireciona backup, histórico e CSV para uma pasta temporária."""

    def setUp(self) -> None:
        self.pasta = tempfile.TemporaryDirectory()
        base = Path(self.pasta.name)
        self.patches = [
            mock.patch.object(main, "ARQUIVO_BACKUP", base / "backup.json"),
            mock.patch.object(main, "ARQUIVO_HISTORICO", base / "historico.json"),
            mock.patch.object(main, "ARQUIVO_CSV", base / "relatorio.csv"),
        ]
        for patch in self.patches:
            patch.start()

    def tearDown(self) -> None:
        for patch in self.patches:
            patch.stop()
        self.pasta.cleanup()


class TestNormalizacaoEIndice(unittest.TestCase):
    def test_normalizar_escala_e_limita(self) -> None:
        self.assertEqual(main.normalizar(50, 0, 100), 50)
        self.assertEqual(main.normalizar(65, 30, 100), 50)
        self.assertEqual(main.normalizar(-10, 0, 100), 0)
        self.assertEqual(main.normalizar(130, 0, 100), 100)

    def test_normalizar_rejeita_faixa_invalida(self) -> None:
        with self.assertRaises(ValueError):
            main.normalizar(10, 50, 50)

    def test_ivm_igual_ao_do_esp32_e_do_app(self) -> None:
        # 0,6 * 79,5 + 0,4 * (100 - 95,1) = 49,66 -> 49,7 (entry_id 4 do canal)
        self.assertEqual(main.calcular_ivm(79.5, 95.091576), 49.7)
        self.assertEqual(main.calcular_ivm(100, 0), 100.0)
        self.assertEqual(main.calcular_ivm(0, 100), 0.0)

    def test_ivm_rejeita_medicao_fora_da_faixa_fisica(self) -> None:
        with self.assertRaises(ValueError):
            main.calcular_ivm(120, 50)

    def test_ivm_usa_os_limites_configurados_na_normalizacao(self) -> None:
        # Com a umidade calibrada entre 30% e 100%, 20% fica abaixo da faixa e vira nível 0.
        config = copy.deepcopy(main.CONFIGURACAO)
        config["limites"]["umidade"] = {"min": 30.0, "max": 100.0}
        with mock.patch.dict(main.CONFIGURACAO, config):
            self.assertEqual(main.calcular_ivm(20, 50), 20.0)  # 0,6·0 + 0,4·(100 − 50)
            self.assertEqual(main.calcular_ivm(65, 50), 50.0)  # 0,6·50 + 0,4·50


class TestConfiguracao(unittest.TestCase):
    def test_configuracao_padrao_valida(self) -> None:
        main.validar_configuracao()

    def test_pesos_que_nao_somam_um(self) -> None:
        config = copy.deepcopy(main.CONFIGURACAO)
        config["pesos"]["umidade"] = 0.7
        with self.assertRaises(ValueError):
            main.validar_configuracao(config)

    def test_limite_com_min_maior_que_max(self) -> None:
        config = copy.deepcopy(main.CONFIGURACAO)
        config["limites"]["umidade"] = {"min": 90.0, "max": 10.0}
        with self.assertRaises(ValueError):
            main.validar_configuracao(config)

    def test_limiares_fora_de_ordem(self) -> None:
        config = copy.deepcopy(main.CONFIGURACAO)
        config["limiares"] = {"atencao": 80.0, "perigo": 70.0}
        with self.assertRaises(ValueError):
            main.validar_configuracao(config)

    def test_falta_aviso_de_uma_faixa(self) -> None:
        config = copy.deepcopy(main.CONFIGURACAO)
        del config["avisos"]["PERIGO"]
        with self.assertRaises(ValueError):
            main.validar_configuracao(config)


class TestClassificacao(unittest.TestCase):
    def test_bordas_das_faixas(self) -> None:
        self.assertEqual(main.classificar_risco(39.99), "NORMAL")
        self.assertEqual(main.classificar_risco(40), "ATENÇÃO")
        self.assertEqual(main.classificar_risco(69.99), "ATENÇÃO")
        self.assertEqual(main.classificar_risco(70), "PERIGO")

    def test_ivm_invalido(self) -> None:
        for valor in (-1, float("nan"), float("inf")):
            with self.assertRaises(ValueError):
                main.classificar_risco(valor)


class TestAnalise(unittest.TestCase):
    @staticmethod
    def registros(ivms: list[float]) -> list[dict]:
        # Uma leitura a cada 15 minutos, a partir das 13:00 UTC.
        return [
            {"id": str(i), "horario": f"2026-11-09T{13 + (i - 1) * 15 // 60:02d}:{(i - 1) * 15 % 60:02d}:00Z", "ivm": v}
            for i, v in enumerate(ivms, start=1)
        ]

    def test_tendencia_de_piora_com_tres_altas(self) -> None:
        analise = main.analisar_leituras(self.registros([30, 35, 45, 50]))
        self.assertEqual(analise["tendencia"], "PIORANDO")

    def test_piora_antiga_nao_vale_depois_de_uma_queda(self) -> None:
        # Três altas no começo e uma queda no fim: a situação já não está piorando.
        analise = main.analisar_leituras(self.registros([30, 35, 45, 50, 40]))
        self.assertEqual(analise["tendencia"], "ESTÁVEL/SEM PIORA CONFIRMADA")

    def test_duas_altas_nao_confirmam_piora(self) -> None:
        analise = main.analisar_leituras(self.registros([30, 35, 45, 40, 41]))
        self.assertEqual(analise["tendencia"], "ESTÁVEL/SEM PIORA CONFIRMADA")

    def test_maior_episodio_e_contagens(self) -> None:
        analise = main.analisar_leituras(self.registros([75, 80, 30, 71, 72, 73, 50]))
        self.assertEqual(analise["episodios_perigo"], 2)
        self.assertEqual(analise["maior_episodio_perigo"], 3)
        self.assertEqual(analise["maior_episodio_minutos"], 30)  # 13:45 até 14:15
        self.assertEqual(analise["contagens"], {"NORMAL": 1, "ATENÇÃO": 1, "PERIGO": 5})

    def test_media_pico_e_aviso_da_ultima_faixa(self) -> None:
        analise = main.analisar_leituras(self.registros([30, 90, 60]))
        self.assertEqual(analise["media_ivm"], 60.0)
        self.assertEqual(analise["pico_ivm"], 90.0)
        self.assertEqual(analise["pico_horario"], "2026-11-09T13:15:00Z")
        self.assertEqual(analise["aviso"], main.CONFIGURACAO["avisos"]["ATENÇÃO"])
        self.assertEqual(main.formatar_horario(analise["pico_horario"]), "09/11 10:15")


class TestLeiturasEPersistencia(ArquivosTemporarios):
    def test_modelo_da_leitura(self) -> None:
        leitura = main.normalizar_leituras([feed(4, 79.5, 95.091576, "26")])[0]
        self.assertEqual(set(leitura), {"id", "horario", "medidas", "ivm", "faixa"})
        self.assertEqual(leitura["id"], "4")
        self.assertEqual(leitura["medidas"], {"umidade": 79.5, "insolacao": 95.091576, "temperatura": 26.0})
        self.assertEqual((leitura["ivm"], leitura["faixa"]), (49.7, "ATENÇÃO"))

    def test_carrega_historico_no_formato_antigo(self) -> None:
        antigo = [{"entry_id": "3", "created_at": "2026-11-09T14:00:00Z", "umidade": 80, "insolacao": 20, "temperatura": None}]
        leitura = main.normalizar_registros_salvos(antigo)[0]
        self.assertEqual((leitura["id"], leitura["horario"]), ("3", "2026-11-09T14:00:00Z"))
        self.assertEqual(leitura["faixa"], "PERIGO")

    def test_temperatura_invalida_nao_descarta_a_leitura(self) -> None:
        registros = main.normalizar_leituras([feed(1, 80, 20, "erro"), feed(2, 80, 20, "25.5")])
        self.assertEqual(len(registros), 2)
        self.assertIsNone(registros[0]["medidas"]["temperatura"])
        self.assertEqual(registros[1]["medidas"]["temperatura"], 25.5)

    def test_temperatura_sobrevive_ao_recarregar_do_arquivo(self) -> None:
        registros = main.normalizar_leituras([feed(1, 80, 20, "26.1")])
        recarregados = main.normalizar_registros_salvos(registros)
        self.assertEqual(recarregados[0]["medidas"]["temperatura"], 26.1)

    def test_historico_sem_duplicatas(self) -> None:
        lote = main.normalizar_leituras([feed(1, 60, 50), feed(2, 70, 40)])
        self.assertEqual(main.atualizar_historico(lote), 2)
        self.assertEqual(main.atualizar_historico(lote), 0)
        novo = main.normalizar_leituras([feed(2, 70, 40), feed(3, 90, 10)])
        self.assertEqual(main.atualizar_historico(novo), 1)
        historico = main.carregar_json(main.ARQUIVO_HISTORICO)
        self.assertEqual([item["id"] for item in historico], ["1", "2", "3"])

    def test_api_online_salva_backup(self) -> None:
        resposta = mock.Mock()
        resposta.raise_for_status.return_value = None
        resposta.json.return_value = {"feeds": [feed(i, 60, 50) for i in range(1, 21)]}
        with mock.patch.object(main.requests, "get", return_value=resposta) as get:
            registros, online = main.buscar_leituras()
        self.assertTrue(online)
        self.assertEqual(len(registros), 20)
        self.assertEqual(get.call_args.kwargs["timeout"], 5)
        self.assertGreaterEqual(get.call_args.kwargs["params"]["results"], 20)
        self.assertEqual(len(main.carregar_json(main.ARQUIVO_BACKUP)), 20)

    def test_api_fora_do_ar_usa_backup(self) -> None:
        main.salvar_json(main.ARQUIVO_BACKUP, main.normalizar_leituras([feed(7, 80, 10)]))
        erro = requests.exceptions.ConnectionError("sem rede")
        with mock.patch.object(main.requests, "get", side_effect=erro):
            registros, online = main.buscar_leituras()
        self.assertFalse(online)
        self.assertEqual(registros[0]["id"], "7")

    def test_erro_http_usa_backup(self) -> None:
        main.salvar_json(main.ARQUIVO_BACKUP, main.normalizar_leituras([feed(8, 50, 50)]))
        resposta = mock.Mock()
        resposta.raise_for_status.side_effect = requests.exceptions.HTTPError("500")
        with mock.patch.object(main.requests, "get", return_value=resposta):
            registros, online = main.buscar_leituras()
        self.assertFalse(online)
        self.assertEqual(len(registros), 1)

    def test_feed_vazio_nao_apaga_backup(self) -> None:
        main.salvar_json(main.ARQUIVO_BACKUP, main.normalizar_leituras([feed(9, 50, 50)]))
        resposta = mock.Mock()
        resposta.raise_for_status.return_value = None
        resposta.json.return_value = {"feeds": []}
        with mock.patch.object(main.requests, "get", return_value=resposta):
            registros, online = main.buscar_leituras()
        self.assertFalse(online)
        self.assertEqual(len(main.carregar_json(main.ARQUIVO_BACKUP)), 1)
        self.assertEqual(registros[0]["id"], "9")

    def test_csv_com_cabecalho(self) -> None:
        registros = main.normalizar_leituras([feed(1, 80, 20, "27")])
        self.assertTrue(main.exportar_csv(registros))
        with main.ARQUIVO_CSV.open(encoding="utf-8-sig", newline="") as arquivo:
            linhas = list(csv.DictReader(arquivo))
        self.assertEqual(list(linhas[0].keys()), main.CAMPOS_CSV)
        self.assertEqual(linhas[0]["faixa"], "PERIGO")
        self.assertEqual(linhas[0]["temperatura"], "27.0")


if __name__ == "__main__":
    unittest.main(verbosity=2)
