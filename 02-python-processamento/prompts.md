# Prompts_Python.md — Registro de Prompts de Inteligência Artificial

> **Projeto:** VielaTech — Plataforma Cívica de Inteligência Urbana e Vigilância em Saúde  
> **Disciplina:** Computational Thinking with Python  
> **Turma:** 1ESSRA — FIAP GS 2026.2  

Este documento registra os prompts utilizados com ferramentas de IA Generativa (Codex / Gemini) para o desenvolvimento da engine de lógica em Python (`python/main.py`).

---

## 1. Ferramentas Utilizadas

- **Codex (VS Code Assistant):** Construção automatizada da estrutura principal do script Python, incluindo tipagem de funções, tratamento de exceções HTTP e persistência JSON/CSV.
- **Gemini 3 Flash (Google):** Modelagem lógica do Índice de Vulnerabilidade de Microclima ($IVM$) e algoritmo de detecção de tendência epidemiológica.

---

## 2. Principais Prompts e Finalidades

### A. Engine Principal e Consumo de API (`main.py`)
- **Prompt:** *"Escreva o código completo de python/main.py para consumir a API REST pública do ThingSpeak (Channel 3571901), processar os campos de umidade e insolação, aplicar a fórmula do IVM, tratar fallback via backup.json e manter histórico sem duplicatas em historico.json."*
- **Resultado Obtido:** Estrutura completa do programa com tratamento de `requests.exceptions.RequestException`, plano B offline e persistência tratada via `set(entry_id)`.

### B. Algoritmo de Tendência e Validação de Regras
- **Prompt:** *"Crie uma função em Python para identificar se a tendência de risco está PIORANDO (3 altas consecutivas de IVM) e disparar ValueError caso os pesos de configuração não somem 1.0."*
- **Resultado Obtido:** Implementação dos métodos de análise temporal do histórico e tratamento defensivo com `raise ValueError`.

---

## 3. Validação Humana e Aprendizado

Todo o código gerado pelo Codex foi revisado, testado no terminal do VS Code, validado contra a falha de rede (simulando offline) e auditado pela equipe para garantir total domínio das funções e tipos utilizados.