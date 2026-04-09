# PROJECT VISION — LEXIS ACADEMY (V-COMPLETE)

Este documento é a **Fonte Única da Verdade** (Source of Truth) para a visão estratégica, lógica e técnica da Lexis Academy. Ele consolida o raciocínio por trás de cada decisão e a arquitetura que sustenta o sistema.

---

## 1. LINHA LÓGICA E RACIOCÍNIO ESTRATÉGICO

A estrutura do projeto segue uma linha de dependência lógica onde cada camada fortalece a anterior:

### A. Core Pedagógico (O Porquê)
*   **Raciocínio:** O ensino de inglês tradicional falha porque trata um processo motor/procedural como conhecimento acadêmico.
*   **Lógica:** Se o inglês é uma habilidade (como esporte), o ambiente deve ser de **treino intensivo**, não de estudo passivo.
*   **Resultado:** O foco migra da "gramática decorada" para a "automaticidade de resposta".

### B. Mecanismo de Marketing (O Como Convencer)
*   **Raciocínio:** O mercado está saturado de promessas de "curso de inglês".
*   **Lógica:** Usamos a **Narrativa de Inocência do Aluno**. O problema não é ele, é o método. Reposicionamos a Lexis como a solução para quem "já tentou de tudo".
*   **Resultado:** SEO Programático focado em dores reais (frustração, tempo perdido) e não apenas em termos genéricos.

### C. Motor Técnico (O Como Escalar)
*   **Raciocínio:** Gestão de conteúdo humana é lenta, cara e inconsistente.
*   **Lógica:** Criar uma infraestrutura autônoma (Leo Protocol) que aloca páginas onde o Google é fraco, usando IA para gerar valor e automação para manter a integridade.
*   **Resultado:** Autoridade topical crescente com custo marginal zero.

---

## 2. MAPA DE RISCOS E ESTRATÉGIAS DE FORTALECIMENTO

Identificamos os pontos críticos que poderiam comprometer o projeto e implementamos camadas de blindagem:

| Risco Identificado | Impacto | Estratégia de Fortalecimento (Blindagem) |
| :--- | :--- | :--- |
| **Alucinação de IA** | Conteúdo culturalmente impreciso ou metodologicamente errado. | **Protocolo Roger:** Motor de auditoria que valida o Indicador de Performance Linguística (IPL) e precisão cultural. |
| **Dependência de APIs** | Links quebrados ou falhas de serviço (ex: Pixabay, Unsplash). | **Knowledge System V9 (Self-hosting):** Imagens são baixadas, otimizadas e hospedadas no próprio repositório. |
| **Fragmentação Técnica** | Scripts isolados e dificuldade de manutenção. | **Automação Unificada:** Centralização de comandos no `package.json` (queue, image fix, post clean). |
| **Mudanças de Algoritmo** | Perda de tráfego orgânico repentina. | **Leo Protocol:** Decisões baseadas em dados reais (GSC/GA4) e diversificação topical via clusters. |

---

## 3. DESENVOLVIMENTO DOS TÓPICOS

### 3.1. Metodologia Lexis (O Core Pedagógico)
A Metodologia Lexis é um sistema de treino baseado em neurociência e aquisição de linguagem como habilidade motora.

*   **Método 3F (Phrase, Fluidity, Function):**
    *   **Phrase:** Construção de blocos de contexto e padrões linguísticos, não palavras isoladas.
    *   **Fluidity:** Foco na velocidade de processamento e redução da tradução mental.
    *   **Function:** Aplicação real e performance em situações do mundo real.
*   **Fases Pedagógicas:**
    1.  **Start (Fonética):** Limpeza de sons e ritmo para garantir inteligibilidade.
    2.  **Run (Estruturas):** Domínio das estruturas de alta frequência.
    3.  **Fly (Vocabulário):** Expansão estratégica de repertório funcional.
    4.  **Liberty (Conversação):** Imersão total e aplicação prática sem filtros.

### 3.2. Protocolo Leo (O Mecanismo de Marketing)
O Protocolo Leo é o motor de SEO que não apenas publica, mas otimiza estrategicamente o conteúdo para dominar a SERP.

*   **Fórmula de Prioridade (Leo Score):** Prioriza atualizações em páginas com alta visibilidade mas baixa conversão ou posições "quase ranqueando" (5-15).
*   **SEO Programático:** Alocação de páginas baseada em clusters semânticos. O sistema identifica onde o Google tem gaps de conteúdo de qualidade e preenche com a visão Lexis.
*   **Narrativa de Inocência:** O conteúdo é estruturado para desconstruir o trauma do aprendizado tradicional, preparando o lead para a solução intensiva da Lexis.

### 3.3. Motor Técnico (Engenharia de Ativos)
A infraestrutura foi desenhada para ser resiliente, rápida e autônoma.

*   **Arquitetura:**
    *   **Frontend:** React 19 + Vite (SPA) hospedado no GitHub Pages.
    *   **Backend:** Cloudflare Workers para processamento de filas e lógica de SEO.
    *   **Database:** Cloudflare KV/D1 para histórico e persistência de pautas.
*   **Pipeline de Ativos:** O sistema não apenas gera texto; ele gera ativos (imagens WebP otimizadas, JSON-LD schemas, interlinking dinâmico) que aumentam o valor patrimonial digital do projeto.
*   **Roger (Audit Engine):** Garante que a IA não desvie da voz da marca e mantenha a precisão técnica necessária para um projeto de educação.

---
