# PROJETO LEXIS ACADEMY: VISÃO ESTRATÉGICA E LINHA LÓGICA (SOURCE OF TRUTH)

Este documento consolida a arquitetura completa do projeto Lexis Academy, organizando a lógica de negócio, as etapas de raciocínio, riscos e estratégias de fortalecimento. Ele serve como a "Fonte da Verdade" para o desenvolvimento e automação do sistema.

---

## 1. LINHA LÓGICA COMPLETA (THE CORE PIPELINE)

A Lexis opera em um fluxo unidirecional onde cada etapa sustenta a próxima:

**PEDAGOGIA (O Produto)**
*   **Axioma:** Idioma não se aprende, se treina.
*   **Conceito:** Inglês é uma habilidade motora (como dirigir ou tocar piano), não um assunto acadêmico.
*   **Entrega:** Imersão de 120h em 14 dias para criar memória procedural e resposta automática.

**MARKETING (A Atração)**
*   **Narrativa:** "A Inocência do Aluno". O fracasso anterior não foi culpa do aluno, mas de métodos desenhados para serem lentos.
*   **Mecanismo:** SEO Programático. Em vez de "blogs" tradicionais, o sistema aloca páginas onde o Google é fraco, atacando dores específicas e preparando o lead para o treinamento Lexis.

**TÉCNICO (A Execução)**
*   **Arquitetura:** GitHub Pages (Hospedagem) + Cloudflare Workers (Cérebro) + IA (Produção).
*   **Agentes:** **Roger** (Auditagem de Qualidade/IPL) e **Leo** (Otimização de SEO baseada em ROI).

---

## 2. ETAPAS DO RACIOCÍNIO (THE WHY)

1.  **Inversão de Paradigma:** Se o inglês é uma habilidade, o tempo de exposição e a intensidade superam a explicação teórica. O raciocínio evolui da gramática declarativa para a performance procedimental.
2.  **Educação Prévia:** O conteúdo gerado por IA não serve apenas para "tráfego", mas para desconstruir o vício do método tradicional no lead antes mesmo dele falar com um vendedor.
3.  **Eficiência Marginal Zero:** O custo de produzir uma página ou mil páginas deve ser tendente a zero. Por isso, a automação substitui o CMS humano e a decisão subjetiva por algoritmos de ROI (Leo Protocol).

---

## 3. MAPA DE RISCOS (THE VULNERABILITIES)

*   **Risco 1: Alucinação Cultural da IA.** A IA pode sugerir contextos que não existem no Brasil ou forçar o uso de inglês em situações onde o português é a âncora de segurança do aluno (violando a metodologia Lexis).
*   **Risco 2: Volatilidade de SEO.** Mudanças de algoritmo do Google podem penalizar conteúdo em massa se não houver um "toque humano" ou auditoria de alta qualidade (Roger).
*   **Risco 3: Quebra de Dependências Externas.** Links de imagens (Unsplash/Pixabay) podem quebrar, invalidando o acervo histórico do blog.
*   **Risco 4: Saturação de Marca.** A automação excessiva pode criar uma percepção de "conteúdo genérico" se não houver interlinkagem inteligente e ganchos de marca fortes.

---

## 4. ESTRATÉGIAS DE FORTALECIMENTO (THE DEFENSE)

*   **Roger AI Guardian:** Sistema de auditoria que atribui um Score de IPL (Indicador de Performance Linguística). Se o post não atinge o threshold (EMA - Média Móvel Exponencial), ele é deletado ou reescrito (Upgrade Engine).
*   **Leo Protocol:** Priorização dinâmica. O sistema não foca em volume, mas em ROI. Páginas com alta impressão e baixo CTR recebem upgrades automáticos de meta-description e títulos.
*   **V9 Self-Hosting (Knowledge System):** Imagens são baixadas, otimizadas para WebP e commitadas no repositório. O blog é 100% independente de APIs externas após a publicação.
*   **Programmatic Interlinking:** O Roger insere links contextuais entre posts do mesmo cluster, criando uma "malha semântica" que aumenta a autoridade topical sem intervenção manual.

---

## 5. DESENVOLVIMENTO DOS TÓPICOS

### 5.1 Pedagogia: O Método 3F (Phrase, Fluidity, Function)
O treino foca em blocos de frases (contexto), velocidade de processamento (fluidez) e aplicação real (função). A meta é eliminar a tradução mental.

### 5.2 Marketing: Funil de Conteúdo
*   **Topo (Informacional):** Queries genéricas sobre inglês. Gancho: "Por que você estuda há anos e não fala?".
*   **Meio (Comparativo):** "Lexis vs Tradicional". Inversão do mecanismo de culpa.
*   **Fundo (Decisão):** Detalhes da imersão, provas sociais e ROI de tempo.

### 5.3 Técnico: Stack de Automação
*   **Triggers:** Cron jobs semanais (pautas) e diários (auditoria/SEO).
*   **Persistência:** Markdown como "Source of Truth". Versionamento total via Git.
*   **Otimização:** Uso de `wsrv.nl` para tratamento de imagens e `react-markdown` para renderização leve no frontend.

---
*Assinado: Jules, Eng. de Sistemas Lexis.*
