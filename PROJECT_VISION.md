# 👁️ VISÃO DE PROJETO: LEXIS ACADEMY 2026

Este documento serve como a **Fonte Única da Verdade (Single Source of Truth)** para a estratégia, execução e evolução da Lexis Academy. Ele organiza a linha lógica completa, o raciocínio estratégico e a arquitetura técnica que sustenta o ecossistema.

---

## 1. LINHA LÓGICA COMPLETA (THE LOGICAL LINE)

O projeto é estruturado em uma progressão de dependência clara:
**CORE PEDAGÓGICO → MECANISMO DE MARKETING → MOTOR TÉCNICO**

1.  **Core Pedagógico (O Produto):** Inglês não é conteúdo acadêmico, é uma **habilidade motora**. A fluência é resultado de treino intensivo (120h em 2 semanas) focado em resposta automática, não em gramática declarativa.
2.  **Mecanismo de Marketing (A Aquisição):** Narrativa de "Inocência do Aluno". O aluno não fracassou; o método tradicional é que falhou. O Marketing utiliza **SEO Programático** para alocar páginas onde o Google é fraco, educando o lead através do contraste (Amador vs. Elite).
3.  **Motor Técnico (A Escala):** Automação total via **Agentes IA (Leo e Roger)**, hospedagem estática (GitHub Pages) e lógica de borda (Cloudflare Workers). O sistema é autônomo, auto-auditável e resiliente.

---

## 2. ETAPAS DO RACIOCÍNIO ESTRATÉGICO

### I. Por que Habilidade Motora? (Pedagogia)
O aprendizado de línguas nas escolas falha porque foca na memória semântica (saber sobre a língua). A Lexis foca na **memória procedural** (saber fazer).
*   **Conclusão:** É preciso volume (intensidade) e contexto real para criar caminhos neurais de resposta rápida.

### II. Por que SEO Programático? (Marketing)
Em vez de lutar por "curso de inglês" (leilão caro), o sistema domina **Clusters Semânticos** de dor e dúvida.
*   **Conclusão:** Alocar milhares de páginas de alta qualidade (Elite Workshops) educa o mercado e cria autoridade topical imbatível a custo marginal zero.

### III. Por que Agentes Autônomos? (Técnica)
A produção humana de conteúdo de elite é lenta e cara.
*   **Conclusão:** Criamos o **Leo** (Diretor de SEO) para produzir e o **Roger** (Auditor de Elite) para garantir que a IA não "alucine" e mantenha o padrão de bilinguismo funcional (IPL).

---

## 3. MAPA DE RISCOS E VULNERABILIDADES

| Risco | Impacto | Descrição |
| :--- | :--- | :--- |
| **Alucinação Cultural** | Alto | IA descrever situações brasileiras como se fossem americanas ou vice-versa. |
| **Volatilidade de SEO** | Médio | Atualizações de algoritmo do Google que penalizam conteúdo gerado por IA. |
| **Dependência de APIs** | Médio | Quedas ou mudanças de preços na OpenAI, Pixabay ou Cloudflare. |
| **Dívida Técnica** | Baixo | Complexidade crescente nos Workers dificultando manutenção futura. |

---

## 4. ESTRATÉGIAS DE FORTALECIMENTO (MITIGAÇÃO)

1.  **Contra Alucinação (Roger 3.5):** O Auditor Roger possui um "Contrato de Qualidade" estrito. Ele rejeita conteúdos que não usem o DNA Lexis ou que falhem na ancoragem lexical.
2.  **Contra Volatilidade de SEO (Leo Protocol):** O foco não é apenas em keywords, mas em **User Intent e Valor Pedagógico**. O conteúdo é estruturado como Workshops úteis, o que é recompensado pelo Google (Helpful Content Update).
3.  **Contra Dependência de APIs (Knowledge System V9):** Implementação de **Fallbacks** (banco de imagens curado) e sistema de auto-hospedagem de assets no GitHub para evitar links quebrados.
4.  **Contra Dívida Técnica (Modularização):** O código é dividido em módulos claros (Scraper, Triage, Rewriter, Auditor, Publisher) com logs extensivos no KV.

---

## 5. DESENVOLVIMENTO DOS TÓPICOS

### 5.1 O Método 3F (Pedagogia de Elite)
*   **Phrase (Frase):** Blocos de construção contextuais (Chunks).
*   **Fluidity (Fluidez):** Velocidade de processamento e redução da tradução mental.
*   **Function (Função):** Performance real em cenários de alta pressão (Boardrooms, Crises).

### 5.2 O Protocolo Leo (O Cérebro SEO)
O Leo utiliza a fórmula `Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)` para decidir qual página atualizar. Ele não apenas cria; ele **recicla e fortalece** o que já existe.

### 5.3 O Guardião Roger (Auditoria de IPL)
O **IPL (Indicador de Performance Linguística)** mede:
*   Bilinguismo Funcional (40% PT / 60% EN).
*   Ancoragem Lexical (Termos do Nível 1 usados e negritados nos Níveis 2 e 3).
*   Tensão Corporativa Real.

### 5.4 Knowledge System V9 (Infraestrutura)
*   **Imagens Self-Hosted:** Otimização via `wsrv.nl` e commit automático no repo.
*   **SPA Proxy:** Cloudflare Worker que resolve o problema de 404 em rotas React no GitHub Pages.
*   **Stockpile Engine:** Mantém sempre uma fila de 5 posts de elite prontos para publicação, garantindo consistência.

---
*Este documento reflete o estado atual da Lexis Academy v2026. Revisado em 17/02/2026.*
