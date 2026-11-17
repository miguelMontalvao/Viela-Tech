"""Verificações com soluções conhecidas e CSV no formato do módulo Python."""

import importlib
from pathlib import Path
import tempfile
import unittest

import numpy as np


class TestModeloCalculo(unittest.TestCase):
    def setUp(self):
        self.assertTrue(
            Path(__file__).with_name("modelo_calculo.py").is_file(),
            "O módulo de cálculo ainda não foi implementado.",
        )
        self.modelo = importlib.import_module("modelo_calculo")

    def serie(self, horas, ivm, umidade=None):
        return self.modelo.DadosMicroclima(
            horas=np.array(horas, dtype=float),
            ivm=np.array(ivm, dtype=float),
            umidade=None if umidade is None else np.array(umidade, dtype=float),
            origem="Teste analítico",
        )

    def csv(self, texto):
        pasta = tempfile.TemporaryDirectory()
        self.addCleanup(pasta.cleanup)
        caminho = Path(pasta.name) / "relatorio.csv"
        caminho.write_text(texto, encoding="utf-8-sig")
        return caminho

    def test_reta_em_tempos_irregulares_tem_derivada_e_integral_exatas(self):
        resultado = self.modelo.analisar_dados(
            self.serie([0, 0.5, 2], [40, 45, 60], [50, 51, 54])
        )
        np.testing.assert_allclose(resultado.derivada_ivm, 10)
        np.testing.assert_allclose(resultado.derivada_umidade, 2)
        self.assertAlmostEqual(resultado.area_total, 100)
        self.assertEqual(resultado.metodo_integracao, "Trapézios")

    def test_parabola_regular_e_integrada_por_simpson(self):
        resultado = self.modelo.analisar_dados(self.serie([0, 1, 2], [0, 1, 4]))
        self.assertAlmostEqual(resultado.area_total, 8 / 3)
        self.assertEqual(resultado.metodo_integracao, "Simpson")

    def test_area_em_perigo_nao_supera_area_total(self):
        resultado = self.modelo.analisar_dados(self.serie([0, 1, 2], [100, 70, 100]))
        self.assertLessEqual(resultado.area_perigo, resultado.area_total)
        self.assertEqual(resultado.metodo_integracao, "Trapézios")
        self.assertAlmostEqual(resultado.area_total, 170)

    def test_derivada_na_borda_nao_extrapola_atraves_de_lacuna(self):
        horas = np.array([0, 26, 46, 4508], dtype=float) / 3600
        resultado = self.modelo.analisar_dados(
            self.serie(horas, [62.02, 62.02, 49.49, 49.66])
        )
        self.assertAlmostEqual(resultado.derivada_ivm[-1], 0.17 / (4462 / 3600))

    def test_perigo_interpola_cruzamento_sem_inventar_exposicao(self):
        for valores in ([60, 80], [80, 60]):
            with self.subTest(ivm=valores):
                resultado = self.modelo.analisar_dados(self.serie([0, 2], valores))
                self.assertAlmostEqual(resultado.area_total, 140)
                self.assertAlmostEqual(resultado.duracao_perigo, 1)
                self.assertAlmostEqual(resultado.area_perigo, 75)

    def test_limiar_constante_conta_todo_periodo_em_perigo(self):
        resultado = self.modelo.analisar_dados(self.serie([0, 1, 2], [70, 70, 70]))
        np.testing.assert_allclose(resultado.derivada_ivm, 0)
        self.assertAlmostEqual(resultado.area_total, 140)
        self.assertAlmostEqual(resultado.duracao_perigo, 2)
        self.assertAlmostEqual(resultado.area_perigo, 140)

    def test_pontos_baixos_separados_nao_sao_ligados_como_perigo(self):
        resultado = self.modelo.analisar_dados(self.serie([0, 1, 2], [80, 60, 80]))
        self.assertAlmostEqual(resultado.duracao_perigo, 1)
        self.assertAlmostEqual(resultado.area_perigo, 75)
        abaixo = self.modelo.analisar_dados(self.serie([0, 2], [60, 60]))
        self.assertEqual(abaixo.duracao_perigo, 0)
        self.assertEqual(abaixo.area_perigo, 0)

    def test_csv_ordena_datas_e_preserva_horas_reais(self):
        caminho = self.csv(
            "entry_id,created_at,umidade,insolacao,ivm,faixa_risco\n"
            "2,2026-11-09T14:30:00Z,60,20,68,ATENÇÃO\n"
            "1,2026-11-09T13:00:00Z,50,25,60,ATENÇÃO\n"
            "3,2026-11-09T15:00:00Z,70,10,78,PERIGO\n"
        )
        dados = self.modelo.carregar_dados(caminho)
        np.testing.assert_allclose(dados.horas, [0, 1.5, 2])
        np.testing.assert_allclose(dados.ivm, [60, 68, 78])
        np.testing.assert_allclose(dados.umidade, [50, 60, 70])
        self.assertEqual(str(dados.inicio), "2026-11-09 13:00:00+00:00")

    def test_csv_invalido_e_rejeitado_sem_simulacao_silenciosa(self):
        textos = [
            "ivm\n50\n60\n",
            "created_at,ivm\n2026-11-09T13:00:00Z,50\n",
            "created_at,ivm\ninvalido,50\n2026-11-09T14:00:00Z,60\n",
            "created_at,ivm\n2026-11-09T13:00:00Z,50\n2026-11-09T13:00:00Z,60\n",
        ]
        for texto in textos:
            with self.subTest(texto=texto), self.assertRaises(ValueError):
                self.modelo.carregar_dados(self.csv(texto))

    def test_tempos_e_percentuais_invalidos_sao_rejeitados(self):
        for horas, ivm in [
            ([0], [50]), ([0, 0], [50, 60]), ([1, 0], [50, 60]),
            ([0, np.inf], [50, 60]), ([0, 1], [50, np.nan]),
            ([0, 1], [-1, 60]), ([0, 1], [50, 101]),
        ]:
            with self.subTest(horas=horas, ivm=ivm), self.assertRaises(ValueError):
                self.modelo.analisar_dados(self.serie(horas, ivm))

    def test_simulacao_obedece_formula_e_tem_24_horas(self):
        dados = self.modelo.simular_dados()
        self.assertEqual(dados.horas[0], 0)
        self.assertEqual(dados.horas[-1], 24)
        np.testing.assert_allclose(
            dados.ivm, 0.6 * dados.umidade + 0.4 * (100 - dados.insolacao)
        )
        self.assertGreater(dados.ivm[0], dados.ivm[len(dados.ivm) // 2])
        self.assertIn("simulad", dados.origem.lower())

    def test_caminho_explicito_ausente_e_erro(self):
        with tempfile.TemporaryDirectory() as pasta:
            with self.assertRaises(FileNotFoundError):
                self.modelo.carregar_dados(Path(pasta) / "ausente.csv")


if __name__ == "__main__":
    unittest.main()
