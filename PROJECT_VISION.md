# Visão Estratégica do Projeto: Lexis Academy (v9.1)

Este documento serve como a **Fonte Única da Verdade (Source of Truth)** para a estratégia, lógica e execução técnica do projeto Lexis Academy. Ele consolida a visão pedagógica, o mecanismo de marketing e o motor de automação técnica.

---

## 1. Linha Lógica Completa
A arquitetura do projeto segue uma progressão linear de dependência:

1.  **Pedagógico (O "O Quê"):** O inglês não é uma matéria acadêmica, é uma **habilidade motora**. A fluência exige treino procedimental e alta intensidade (Imersão 120h).
2.  **Marketing (O "Como Vender"):** Narrativa de **Inocência do Aluno** (o erro é do método tradicional) combinada com **SEO Programático** para capturar leads em momentos de dúvida semântica.
3.  **Técnico (O "Como Escalar"):** Um ecossistema autônomo de **Agentes de IA (Roger e Leo)**, Cloudflare Workers e GitHub para gerar, auditar e otimizar ativos de conteúdo com custo marginal zero.

---

## 2. Etapas do Raciocínio
O desenvolvimento deste projeto baseia-se em quatro estágios críticos de decisão:

1.  **Diagnóstico do Gap:** Identificação de que o ensino tradicional foca em conhecimento declarativo (gramática), enquanto a vida real exige habilidade procedimental (fala rápida).
2.  **Mecanismo Único:** Proposta da Imersão de 120h em 14 dias como a única solução capaz de quebrar a barreira da tradução mental através da saturação cognitiva controlada.
3.  **Escalabilidade de Ativos:** Uso de SEO Programático para alocar páginas onde o Google é fraco, educando o mercado antes da oferta direta, criando autoridade topical automática.
4.  **Governança Autônoma:** Implementação do **Protocolo Leo** (SEO) e do **Agente Roger** (Auditoria) para garantir que o sistema se auto-otimize sem intervenção humana constante.

---

## 3. Identificação de Riscos
Para garantir a longevidade do projeto, os seguintes riscos foram mapeados:

*   **Alucinação Cultural (IA):** IA gerando contextos que não refletem a realidade brasileira ou a metodologia Lexis.
*   **Volatilidade de SEO:** Mudanças repentinas nos algoritmos do Google que podem afetar o tráfego orgânico.
*   **Dependência de APIs:** Vulnerabilidade a mudanças de termos ou custos em APIs externas (Pixabay, Pexels, OpenAI).
*   **Integridade de Layout:** Quebras visuais em dispositivos móveis ou regressões em atualizações de estilo.
*   **Decadência de Conteúdo:** Informações que se tornam obsoletas ou perdem relevância temporal.

---

## 4. Estratégias de Fortalecimento
Medidas aplicadas para mitigar os riscos identificados:

*   **Roger AI Auditor:** Agente dedicado a auditar cada post, garantindo alinhamento metodológico e precisão cultural.
*   **Leo Protocol:** Motor de SEO que prioriza atualizações baseadas em ROI real (Score = Impressões + Posição + Conversão).
*   **V9 Self-Hosting:** Sistema de armazenamento local de imagens otimizadas (WebP) para eliminar links quebrados e dependência de APIs de imagem em tempo de execução.
*   **V9.1 System Prompt:** Instruções de "Realismo Brasileiro" e "Inocência do Aluno" injetadas na base de geração da IA.
*   **Automated Regression Testing:** Uso de Playwright e verificações de build (RSS/Vite) para manter a integridade do código.

---

## 5. Desenvolvimento dos Tópicos (Em Construção)
*(Os tópicos abaixo serão detalhados nas próximas etapas de desenvolvimento)*

### 5.1 Pilar Pedagógico: Inglês como Habilidade Motora
A Lexis trata o inglês como uma habilidade cognitiva e comportamental, não como conteúdo acadêmico. Fluência é resultado de:
*   **Processamento rápido:** Capacidade de converter pensamento em fala sem tradução mental intermediária.
*   **Tomada de decisão em tempo real:** A fala é um processo motor dinâmico que exige automatismo.
*   **Memória procedural:** Domínio de padrões estruturais (Phrases) em vez de regras gramaticais isoladas.
*   **Repetição deliberada em contexto:** Prática intensiva com feedback imediato do treinador.

**O Mecanismo Único: Imersão 120h**
Para quebrar a inércia do aprendizado tradicional, a Lexis propõe uma imersão de 14 dias (120h reais de treino). Essa densidade equivale a anos de cursos tradicionais e força o cérebro a adotar o inglês como ferramenta funcional primária.

### 5.2 Pilar de Marketing: SEO Programático e Narrativa de Inocência
O marketing da Lexis é construído sobre a desconstrução da culpa do aluno:
*   **Narrativa de Inocência:** O aluno não fracassou por falta de esforço, mas porque o método tradicional (focado em gramática) é biologicamente ineficiente para a fala.
*   **Método 3F (Phrase, Fluidity, Function):** O marketing comunica que o treino deve ser baseado em frases contextuais, velocidade de processamento e aplicação real.
*   **SEO Programático (Leo Protocol):** Em vez de blogs genéricos, o sistema aloca páginas para capturar buscas específicas ("Como falar inglês rápido", "Inglês para negócios imersão").
*   **Funil de Autoridade Topical:** Cada post gera interlinks automáticos, criando uma rede de conhecimento que sinaliza para o Google que o domínio é autoridade no nicho de "Treino de Inglês".

### 5.3 Pilar Técnico: Automação V9 e Agentes Autônomos
A infraestrutura técnica foi desenhada para ser resiliente e autossuficiente:
*   **Knowledge System V9 (Self-Hosting):** Imagens são baixadas, otimizadas para WebP (80% qualidade, 1200px) e hospedadas localmente no repositório. Isso elimina a dependência de APIs externas no carregamento da página e previne links quebrados.
*   **Roger (O Auditor):** Agente de IA que revisa a produção do Leo. Ele garante que o conteúdo não contenha "alucinações culturais" e que o tom de voz "Inocência do Aluno" seja mantido.
*   **Leo (O Motor de SEO):** Cloudflare Worker que gerencia a fila de pautas (KV Storage), gera o conteúdo Markdown e realiza commits automáticos via GitHub API.
*   **Leo Protocol (Priorização):** Sistema de decisão baseado em dados que identifica quais posts precisam de "Upgrade Elite" (expansão de conteúdo) ou "Snippet Optimization" baseando-se em métricas do Search Console.
*   **Infraestrutura Serverless:** O uso de Cloudflare Workers e GitHub Pages garante escalabilidade infinita com custo operacional praticamente zero.
