# Matemática e Cálculo do microclima

O módulo aplica derivadas e integrais ao Índice de Vulnerabilidade de
Microclima (IVM) do projeto CANYON / Viela Tech. Gera o gráfico e um relatório
técnico A4 de três páginas com os integrantes, RMs e turma 1ESSRA.

## Executar

Requer Python 3.10 ou superior. A partir da raiz do repositório:

```bash
python -m pip install -r math/requirements.txt
python math/modelo_calculo.py
```

Também funciona dentro da pasta `math/`, com `python modelo_calculo.py`.
Os caminhos padrão são resolvidos pela localização do script.

Os arquivos `math/grafico_microclima.png` e `math/Relatorio_Matematica.pdf`
são gerados novamente a cada execução. O PDF é montado pelo módulo
`relatorio_matematica.py`, usando apenas as bibliotecas de `requirements.txt`.
O gráfico só abre em uma janela quando se usa `--mostrar`.

```bash
python math/modelo_calculo.py --simular
python math/modelo_calculo.py --csv python/relatorio.csv
python math/modelo_calculo.py --saida math/resultados --mostrar
```

## Entrada e simulação

Por padrão, lê `python/relatorio.csv`, exportado pela opção 3 de
`python/main.py`. As colunas obrigatórias são `created_at` (data/hora ISO 8601)
e `ivm` (0 a 100). `umidade` e `insolacao` são opcionais; quando há umidade,
o gráfico também apresenta sua derivada. Timestamps sem fuso são interpretados
como UTC. As leituras são ordenadas por data, sem mudar os intervalos reais.

São necessárias pelo menos duas leituras com horários distintos e valores
finitos de 0 a 100. CSV inválido e caminho explícito inexistente produzem erro;
não são substituídos silenciosamente por dados sintéticos.

Se o arquivo padrão não existir, usa um cenário determinístico de 24 horas,
com amostras a cada dez minutos. `--simular` força esse cenário mesmo quando
há CSV. O gráfico e o PDF identificam a origem dos dados. **Os artefatos
incluídos inicialmente foram gerados com a simulação**, pois ainda não havia
`python/relatorio.csv`.

As funções da simulação, com `t` em horas desde 00h, são hipóteses didáticas:

```text
U(t)   = 70 + 18 cos(pi t / 12)
I(t)   = 80 max(0, sen(pi (t - 6) / 12))
IVM(t) = 0,6 U(t) + 0,4 (100 - I(t))
```

`U` representa a umidade relativa (%) e `I` a luminosidade normalizada
do projeto (%), usada como aproximação da insolação. A simulação tem maior
umidade à noite e maior luminosidade ao meio-dia; não foi ajustada a medições
de campo da Rocinha.

## Cálculos e interpretação

- **Derivada:** `numpy.gradient(valores, horas)`, em pontos percentuais por
  hora. Usa diferenças centrais no interior e diferenças unilaterais nas
  bordas. Um IVM crescente pode decorrer de maior umidade ou menor luz.
- **Integral total:** `scipy.integrate.simpson` em grades regulares com ao
  menos três amostras; trapézios em grades irregulares ou com duas amostras.
  Se a área linear em PERIGO exceder a estimativa total de Simpson, o total
  também usa trapézios para manter a consistência. A unidade é `%·h`,
  diferente de horas de permanência.
- **Faixa PERIGO:** duração em horas e área sob o IVM somente nos trechos
  com IVM ≥ 70%. Os cruzamentos de 70 são interpolados linearmente em cada
  intervalo. A área inclui todo o índice nesses trechos, não somente o
  excesso acima de 70; usa trapézios e pode diferir da aproximação de Simpson.

As faixas NORMAL (< 40), ATENÇÃO (40 a < 70) e PERIGO (≥ 70) são regras do
projeto, sem validação clínica. A integral resume o indicador ambiental no
período observado, sem medir exposição pessoal, concentração de patógenos ou
probabilidade de adoecer. Lacunas longas e ruído dos sensores limitam as
estimativas; o script não transforma uma coleta curta em um dia completo.

A tuberculose tem transmissão aérea entre pessoas; o IVM não permite inferir
essa transmissão. Referência: [CDC, causas e transmissão da tuberculose](https://www.cdc.gov/tb/causes/index.html).

## Verificar os cálculos

```bash
python -m unittest discover -s math -p "test_*.py" -v
```

Os testes usam funções com resultados conhecidos, cruzamentos de limiar,
intervalos irregulares e o formato de CSV do módulo Python.

Referências dos métodos: [NumPy: gradient](https://numpy.org/doc/stable/reference/generated/numpy.gradient.html)
e [SciPy: simpson](https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.simpson.html).
