# VISÃO GERAL DO PROJETO - LEXIS ACADEMY

Este documento serve como a "Fonte Única da Verdade" para a estratégia, metodologia e infraestrutura técnica da Lexis Academy. Ele organiza a linha lógica completa que sustenta o projeto.

## 1. LINHA LÓGICA DO PROJETO

A Lexis Academy opera sob uma integração vertical de três camadas:

### A. O Núcleo Pedagógico (O "Quê")
*   **Axioma:** Idioma não se aprende, se treina.
*   **Natureza:** Inglês é uma habilidade motora/procedural, não um assunto acadêmico.
*   **Metodologia 3F:**
    *   **Phrase:** Blocos de construção contextuais.
    *   **Fluidity:** Velocidade de processamento e automaticidade.
    *   **Function:** Aplicação real e performance.

### B. O Mecanismo de Marketing (O "Como")
*   **Narrativa Estratégica:** Hook (Frustração) -> Resposta Direta (SEO) -> Conflito (Método Tradicional vs. Treino) -> Mecanismo (Método 3F) -> Prova (ROI) -> CTA.
*   **SEO Programático:** Uso de IA para alocar páginas onde o Google é fraco, atacando lacunas semânticas.

### C. O Motor Técnico (A "Engrenagem")
*   **Protocolo Leo:** Motor de SEO autônomo que prioriza conteúdo baseado em ROI (Impressões, Posição, Conversão).
*   **Knowledge System V9:** Automação total de conteúdo e imagens, hospedagem estática no GitHub Pages com lógica em Cloudflare Workers.

---

## 2. IDENTIFICAÇÃO DE RISCOS

Para garantir a sustentabilidade do projeto, identificamos os seguintes riscos críticos:

1.  **Dependência de SEO:** Mudanças drásticas nos algoritmos do Google podem afetar o tráfego orgânico.
2.  **Qualidade da IA (Alucinações):** O risco de gerar conteúdo culturalmente impreciso ou mecanizado demais.
3.  **Fragmentação de Scripts:** A existência de múltiplos scripts locais (.bat, .js) pode dificultar a manutenção.
4.  **Saturação de Conteúdo:** Produzir volume sem relevância pode diluir a autoridade topical.

---

## 3. FORTALECIMENTO DE PONTOS FRACOS

Estratégias para mitigar os riscos e fortalecer a peça:

*   **Axiom Guardrails:** Implementação de regras rígidas no prompt da IA para garantir que todo post reforce o axioma central (Inocentar o aluno, atacar o método).
*   **Consolidação de Interface:** Unificar todos os scripts de automação sob o comando `npm`, eliminando a dependência de arquivos batch dispersos.
*   **Distribuição Cross-Platform:** Expansão automática para LinkedIn e Medium (via `scripts/publish-all.js`) para reduzir a dependência exclusiva do Google.
*   **Self-Hosting de Mídia:** Uso do Knowledge System V9 para evitar links de imagens quebrados e dependência de APIs externas.

---

## 4. DESENVOLVIMENTO DOS TÓPICOS

### 4.1. Pedagogia Lexis: O Treino Cognitivo
Diferente das escolas que focam na **Gramática Declarativa** (saber *sobre* a regra), a Lexis foca na **Memória Procedural** (saber *fazer*). O treinamento simula a alta pressão de uma conversa real, onde não há tempo para tradução mental.
- **Start (Fonética):** Limpeza de canais auditivos e articulação.
- **Run (Estruturas):** Automação dos padrões mais frequentes.
- **Fly (Vocabulário):** Expansão estratégica baseada em collocations.
- **Liberty (Conversação):** Fluência funcional e confiança.

### 4.2. SEO Programático e o Protocolo Leo
O sistema não apenas gera textos; ele executa uma estratégia de **Dominação Topical**.
- **Fórmula de Prioridade:** O Leo Score (`Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)`) garante que a IA esteja sempre trabalhando no que traz mais resultado imediato.
- **Ciclo de Vida:** Um conteúdo nunca é "finalizado". Ele é reciclado e atualizado conforme novas queries surgem na SERP, mantendo a relevância perpétua.

### 4.3. Infraestrutura V9 e Automação de Imagens
O sistema de imagens resolve o problema de "blogs genéricos" através de:
- **Busca em Cascata:** Pixabay -> Fallback Curado.
- **Otimização:** Conversão automática para WebP e redimensionamento via Cloudflare/Wsrv.nl.
- **Persistência em Git:** As imagens são versionadas junto com o código, garantindo que o blog nunca tenha imagens quebradas (404).

### 4.4. A Máquina de Publicação
O fluxo de publicação é totalmente desacoplado:
1.  **Pauta:** Definida no `pautas.csv` ou gerada por IA.
2.  **Geração:** Cloudflare Workers processam o prompt contra o Axioma Lexis.
3.  **Deploy:** Commit automático no GitHub dispara o build do Vite e publicação no GitHub Pages.
4.  **Amplificação:** Scripts replicam o conteúdo para redes sociais profissionais.

---

## 5. VISÃO DE FUTURO
O objetivo final é transformar a Lexis Academy em uma autoridade inquestionável no ensino de inglês intensivo, onde a tecnologia serve para escalar a entrega de uma metodologia humana e poderosa.
