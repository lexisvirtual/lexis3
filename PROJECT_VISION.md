# 🌐 LEXIS ACADEMY — PROJECT VISION (Source of Truth)

Este documento é a âncora estratégica definitiva do projeto Lexis Academy. Ele organiza a lógica completa, desde a pedagogia até a execução técnica autônoma.

---

## 1. 🏗️ LINHA LÓGICA COMPLETA (Logical Line)

A Lexis opera na interseção de três pilares interdependentes:

1.  **Core Pedagógico (O Produto):** Inglês tratado como **Habilidade Motora** e não conteúdo acadêmico. O foco é a memória procedural (automatismo) através de alta intensidade (120h/14 dias).
2.  **Mecanismo de Marketing (A Aquisição):** Narrativa de **Inocência do Aluno**. O fracasso não é culpa do aluno, mas do método tradicional. SEO Programático aloca páginas onde o Google carece de respostas diretas e práticas.
3.  **Motor Técnico (A Escala):** Sistema autônomo de publicação e auditoria (**Roger & Leo**) que garante volume, qualidade (IPL) e autoridade topical sem intervenção humana constante.

---

## 2. 🧠 ETAPAS DO RACIOCÍNIO (Strategic Reasoning)

*   **Identificação do Gap:** O mercado está saturado de cursos que ensinam "sobre" o inglês (gramática declarativa), mas não treinam a "fala" (habilidade procedural).
*   **A Unique Mechanism:** Propomos a imersão como o único caminho para quebrar a barreira da tradução mental. 120 horas é o "threshold" necessário para a plasticidade neural específica da fluência.
*   **Inversão de Categoria:** Posicionamos a Lexis fora da categoria "escola de idiomas" e dentro da categoria "treinamento de performance" (como um bootcamp de elite ou treino de atletas).
*   **Domínio Algorítmico:** Em vez de competir por keywords genéricas, o sistema mapeia dores específicas (chunks, business scenarios, erros comuns) e cria ativos digitais (posts de elite) que educam o lead antes do contato comercial.

---

## 3. ⚠️ MAPA DE RISCOS (Risk Assessment)

| Risco | Impacto | Descrição |
| :--- | :--- | :--- |
| **Alucinação Cultural** | Alto | IA sugerindo contextos irreais para a realidade brasileira (ex: feriados americanos como locais). |
| **Dependência de APIs** | Médio | Mudanças em Pixabay/Pexels ou Unsplash quebrando links de imagens no blog. |
| **Volatilidade SEO** | Alto | Mudanças no algoritmo do Google (Core Updates) afetando o tráfego orgânico. |
| **Degradação de Tom** | Médio | O conteúdo se tornar "genérico" ou puramente "SEO-fluff" com o aumento do volume. |
| **Concorrência de Lock** | Baixo | Múltiplas instâncias do Worker tentando atualizar o GitHub simultaneamente. |

---

## 4. 🛡️ ESTRATÉGIAS DE FORTALECIMENTO (Strengthening)

*   **Roger Guardian (Auditoria):** O agente Roger atua como o "Content Guardian", auditando o **IPL (Indicador de Performance Linguística)**. Posts com score < 60 são descartados; 60-74 são reciclados estruturalmente.
*   **V9 Self-Hosting (Imagens):** O sistema agora baixa, otimiza (WebP via `wsrv.nl`) e hospeda imagens localmente no repositório GitHub para eliminar dependências externas.
*   **Leo Protocol (Priorização):** O motor SEO não apenas posta, mas prioriza atualizações em páginas com "Leo Score" alto (impressões altas + posição 5-15) para maximizar o ROI orgânico.
*   **Padronização Elite:** Uso obrigatório do `PADRAO_BLOG_ROGER_LEO.md` (9 seções, bilinguismo, tabelas comparativas e IPL Self-Check).
*   **Token-Based Locking:** Implementação de `system:busy` no KV para evitar conflitos de escrita e garantir que apenas uma tarefa de manutenção rode por vez.

---

## 5. 📚 DESENVOLVIMENTO DOS TÓPICOS (Deep Dive)

### I. O Core Pedagógico (Método 3F)
O método Lexis foca em:
1.  **Phrase:** Blocos de linguagem (chunks) em vez de palavras isoladas.
2.  **Fluidity:** Velocidade de processamento e redução da latência de resposta.
3.  **Function:** Aplicação real em cenários de alta pressão (reuniões, negociações).
A progressão é dividida em **Start (Fonética)**, **Run (Estruturas)**, **Fly (Vocabulário)** e **Liberty (Conversação)**.

### II. O Ecossistema de IA (Roger & Leo)
*   **Roger:** Focado em qualidade e conformidade metodológica. Ele garante que o post "inocente o aluno" e mantenha o bilinguismo estratégico.
*   **Leo:** Focado em visibilidade e crescimento. Ele analisa dados do Search Console e decide quais posts precisam de um "Upgrade Elite" (adição de FAQs, snippets e interlinks).

### III. Infraestrutura Técnica V9
O projeto utiliza um pipeline **Vite + React** para o frontend e **Cloudflare Workers** para o backend de automação. O "Source of Truth" de todo o conteúdo são arquivos Markdown em `src/posts/`. O deploys são automáticos via **GitHub Actions/Pages**.

### IV. Estratégia de Programmatic SEO
Não criamos um "blog comum". Criamos uma **malha semântica**. Cada post é um nó em um cluster (ex: Business English, Speaking Tips). O interlink é feito automaticamente pelo Worker para transferir autoridade (PageRank) entre os artigos do mesmo tema.

---
*Assinado: O Sistema Lexis (Roger & Leo).*
