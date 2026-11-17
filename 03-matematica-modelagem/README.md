# 03 · Differentiated Problem Solving — Modelagem Matemática do Microclima

> **Disciplina:** Differentiated Problem Solving · **Atividade:** Modelagem Matemática Avançada
> **Projeto:** Viela Tech — CitizenTech FIAP Global Solution 2026.2

Este módulo aplica **limites, derivadas (taxas de variação) e integrais** ao Índice de Vulnerabilidade de Microclima (IVM), o mesmo indicador calculado no [ESP32](../01-edge-computing-esp32/README.md), no [Python](../02-python-processamento/README.md) e na [aplicação web](../04-aplicacao-web/README.md). Ele gera um gráfico e um **relatório técnico em PDF**.

| Entregável | Arquivo |
|---|---|
| Código do modelo (Python) | [`modelo_calculo.py`](modelo_calculo.py) |
| Gerador do relatório | [`relatorio_matematica.py`](relatorio_matematica.py) |
| Testes dos cálculos | [`test_modelo_calculo.py`](test_modelo_calculo.py) (15 testes) |
| Gráfico | [`grafico_microclima.png`](grafico_microclima.png) |
| **Relatório técnico em PDF** (6 páginas: capa e sumário, problema, modelo, limites, derivadas, integrais, conclusão) | [`Relatorio_Matematica.pdf`](Relatorio_Matematica.pdf) |

## Problema

Nas vielas da Rocinha, pouca luz e ar úmido persistem por horas. Olhar uma única leitura do sensor não basta para entender esse microclima. É preciso saber **com que rapidez** ele piora (derivada), **quando** muda de comportamento (limites) e **quanto** a viela acumulou de condição desfavorável ao longo do dia (integral).

## Modelo

```text
IVM(t) = 0,6 · U(t) + 0,4 · (100 − I(t))          U = umidade (%), I = insolação (%), t em horas
Faixas: NORMAL < 40 ≤ ATENÇÃO < 70 ≤ PERIGO
```

Cenário analítico de 24 horas (hipótese didática, sem ajuste a medições da Rocinha):

```text
U(t) = 70 + 18 cos(π t / 12)              umidade maior de madrugada
I(t) = 80 · max(0, sen(π (t − 6) / 12))   sol entre 6 h e 18 h
```

## Cálculos

| Conceito | Como é aplicado | Resultado (cenário simulado) |
|---|---|---|
| **Limite** | A derivada é `lim h→0 [IVM(t+h) − IVM(t)] / h`. A função `calcular_limites()` mostra o quociente convergindo para a derivada exata quando h vai de 1 h a 0,001 h. | Em t = 9 h: quociente −7,9221 → derivada exata −7,9231 p.p./h |
| **Limites laterais** | No nascer do sol (t = 6 h), `I(t)` passa a crescer. O IVM é contínuo (limites laterais iguais), mas o quociente tem limites laterais diferentes, então a derivada não existe nesse ponto (ponto anguloso). | Pela esquerda −2,83 p.p./h; pela direita −11,21 p.p./h |
| **Derivada / taxa de variação** | `numpy.gradient(IVM, horas)`: diferenças centrais no interior e unilaterais nas bordas, com os tempos reais (grade irregular aceita). | Maior subida: +11,19 p.p./h (t ≈ 17,8 h, pôr do sol) |
| **Integral** | `scipy.integrate.simpson` em grade regular (trapézios se irregular), dando a exposição acumulada `∫ IVM dt` em %·h. Também a área e a duração só onde IVM ≥ 70, com interpolação linear nos cruzamentos. | Área total 1.723,54 %·h; 14,17 h em PERIGO (59,05 % do dia); IVM médio 71,81 % |

### Interpretação

- **Limites:** mostram que uma taxa só é "instantânea" no limite. Por isso a frequência de envio do ESP32 (15 s) importa.
- **Nascer do sol:** é onde a tendência muda de regime. A viela acumula vulnerabilidade nas horas sem sol.
- **Derivada:** aponta o momento em que o risco sobe mais rápido. O módulo Python aplica a versão discreta dessa ideia: três altas seguidas do IVM disparam o aviso **PIORANDO**.
- **Integral:** separa duas vielas com o mesmo IVM instantâneo, mas exposições acumuladas diferentes. É o critério mais justo para priorizar ventilação, iluminação e visitas de ACS.

## Dados: real × simulado

Por padrão, o script lê [`../02-python-processamento/relatorio.csv`](../02-python-processamento/relatorio.csv), exportado pela opção 3 do módulo Python.

- **Quando o CSV tem 20 leituras reais ou mais** (o mesmo mínimo da atividade de Python), o relatório é gerado com os dados reais.
- **Hoje o CSV tem só 4 leituras reais.** Por isso, o gráfico e o PDF desta versão usam o **cenário simulado**, identificado na capa, nas páginas e no rodapé do gráfico.
- **Para analisar as 4 leituras mesmo assim:** use `--csv`.
- **Quando houver 20 leituras ou mais:** depois de rodar o Wokwi, basta executar o script de novo, sem mudar código.

## Executar

Python 3.10 ou superior, a partir da raiz do repositório:

```bash
python -m pip install -r 03-matematica-modelagem/requirements.txt
python 03-matematica-modelagem/modelo_calculo.py                 # padrão (CSV real se tiver ≥ 20 leituras)
python 03-matematica-modelagem/modelo_calculo.py --simular       # força o cenário de 24 h
python 03-matematica-modelagem/modelo_calculo.py --csv 02-python-processamento/relatorio.csv
python 03-matematica-modelagem/modelo_calculo.py --saida resultados --mostrar
```

Saída da última execução (17/11/2026):

```text
Origem: Dados simulados de 24 horas (não são medições de campo)
Amostras: 145 | Período: 24.00 h
Integral total (Simpson): 1723.54 %·h
Área em PERIGO (interpolação linear): 1231.44 %·h
Tempo em PERIGO: 14.17 h
Limite do quociente em t=9 h: -7.9221 -> derivada exata -7.9231 p.p./h
Nascer do sol (t=6 h): derivada lateral esquerda -2.83 | direita -11.21 p.p./h
Derivada máxima do IVM: 11.19 p.p./h em t=17.83 h
```

## Verificar os cálculos

```bash
cd 03-matematica-modelagem
python -m unittest -v test_modelo_calculo
```

Os 15 testes cobrem:

- funções com resultado conhecido (reta em grade irregular, parábola por Simpson);
- convergência do quociente de diferenças e os limites laterais no nascer do sol;
- cruzamentos do limiar 70;
- lacunas e validação do CSV;
- a regra de mínimo de 20 leituras.

## Limitações

- Os pesos e limiares são hipóteses de projeto, sem calibração epidemiológica.
- O IVM é um indicador **ambiental**: não mede bactérias, exposição pessoal nem probabilidade de adoecer.
- A tuberculose é transmitida pelo ar entre pessoas ([CDC](https://www.cdc.gov/tb/causes/index.html)), e o índice não permite inferir transmissão.
- Os dados simulados não demonstram as condições reais da Rocinha.

Referências dos métodos: [NumPy `gradient`](https://numpy.org/doc/stable/reference/generated/numpy.gradient.html) · [SciPy `simpson`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.simpson.html).

## Integrantes

Miguel Menezes Montalvão dos Santos (RM 573825) · Pedro Lucas Souza Provadelli (RM 572547) · Vitor Louzano Gomes Mendes (RM 573885)
