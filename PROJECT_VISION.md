# PROJECT VISION: LEXIS V9.1 — O Ecossistema de Fluência Cognitiva

Este documento serve como a **Fonte Única da Verdade (Source of Truth)** para a estratégia, operação e visão de longo prazo do projeto Lexis. Ele consolida a lógica pedagógica, o mecanismo de marketing e a infraestrutura técnica.

---

## 1. LINHA LÓGICA (THE GOLDEN THREAD)

A Lexis não é uma escola de idiomas; é uma empresa de engenharia de habilidades e aquisição orgânica de ativos. Nossa existência se baseia no encadeamento:

1.  **PILAR PEDAGÓGICO (O Quê)**: O inglês é uma **habilidade motora**, não um conteúdo acadêmico. O foco é a memória procedural (fazer) em vez da memória declarativa (saber regras).
2.  **PILAR DE MARKETING (Como Vende)**: Narrativa de **Inocência do Aluno**. A culpa da falha é do método tradicional (lento/teórico). O SEO Programático aloca páginas para capturar a dor do aluno no Google e oferecer a Imersão como o "Mecanismo Único".
3.  **PILAR TÉCNICO (Como Escala)**: Automação total via **Protocolo Leo** (SEO) e **Auditor Roger** (Qualidade). O sistema gera e mantém ativos de conteúdo sem intervenção humana, garantindo autoridade topical e ROI crescente.

---

## 2. ETAPAS DO RACIOCÍNIO (CORE STRATEGY)

1.  **Diagnóstico do Hiato**: Alunos brasileiros estudam anos, mas não falam. O problema é a velocidade de processamento e a tradução mental.
2.  **O Mecanismo Único (120h/14 Dias)**: Apenas a alta intensidade (Imersão) consegue "hackear" o cérebro para parar de traduzir e começar a processar o inglês instintivamente.
3.  **Alocação de Páginas (SEO Programático)**: Em vez de competir por "curso de inglês", dominamos clusters de dúvidas específicas onde o Google entrega resultados fracos (fóruns/Reddit), estabelecendo autoridade.
4.  **Governança Autônoma**: O ecossistema V9.1 utiliza agentes de IA para garantir que cada peça de conteúdo siga a "brasileiridade", a metodologia e as melhores práticas de conversão.

---

## 3. MAPA DE RISCOS E ESTRATÉGIAS DE FORTALECIMENTO

| Risco Identificado | Gravidade | Estratégia de Fortalecimento (Mitigação) |
| :--- | :--- | :--- |
| **Alucinação Cultural** (IA sugerindo contextos não-brasileiros) | Alta | **Roger AI Auditor**: Filtro obrigatório que valida o IPL (Indicador de Performance Lingüística) e a aderência cultural antes do deploy. |
| **Dependência de APIs de Imagem** (Links quebrados/APIs pagas) | Média | **Sistema V9 Self-Hosted**: Imagens são baixadas, otimizadas para WebP via `wsrv.nl` e commitadas no repositório. Independência total de CDNs externas. |
| **Volatilidade de Algoritmo SEO** | Média | **Protocolo Leo (Leo Score)**: Rebalanceamento automático. O sistema prioriza a atualização de conteúdos que estão entre as posições 5-15 do Google para maximizar o ROI imediato. |
| **Indexação de SPA (Single Page App)** | Baixa | **Worker-SPA Proxy**: Cloudflare Worker atua como proxy para garantir que o Googlebot receba status 200 em todas as rotas da aplicação, mesmo no GitHub Pages. |

---

## 4. DESENVOLVIMENTO DOS TÓPICOS

### 4.1. O Motor Pedagógico: Método 3F
O sistema Lexis de treino foca em três pilares:
*   **Phrase (Frase)**: Treinamos blocos de significado (chunks). Palavras soltas não constroem fluência.
*   **Fluidity (Fluidez)**: Exercícios de repetição deliberada para aumentar a velocidade de resposta motora.
*   **Function (Função)**: O aprendizado é orientado a tarefas reais (viagem, reuniões, negociações).

### 4.2. SEO Programático: O Protocolo Leo
O Leo não é um redator; é um alocador de ativos.
*   **Fórmula Leo Score**: `(Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)`.
*   **Ação**: Conteúdos com score alto recebem "Upgrades Elite" (FAQs, tabelas comparativas, snippets de resposta direta).

### 4.3. Automação de Ativos V9.1
Toda a infraestrutura técnica reside na pasta `worker/`.
*   **Markdown como Verdade**: O conteúdo é versionado no Git. Se o servidor cair, o conteúdo está salvo e portável.
*   **Image Pipeline**: `Busca -> Otimização (WebP 1200px) -> Commit Local`.

### 4.4. O Auditor Roger (Guardião da Marca)
O Roger é a camada de inteligência que impede que o SEO comprometa a qualidade.
*   **Comandos**: Ele pode ordenar que o Leo reescreva um post se o tom de voz "Inocência do Aluno" estiver diluído.
*   **IPL**: Monitoramento constante do Indicador de Performance Lingüística nos textos gerados.

---
**Versão**: 9.1
**Data**: Fevereiro de 2026
**Status**: Operacional e Sincronizado.
