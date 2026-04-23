# PROJECT_VISION: Lexis Academy V9.1 (Source of Truth)

Este documento representa a visão consolidada e a arquitetura estratégica da Lexis Academy, servindo como a única fonte de verdade para a lógica pedagógica, de marketing e técnica do projeto.

---

## 1. LINHA LÓGICA COMPLETA

A Lexis opera sob uma integração vertical de três pilares:

1.  **Pilar Pedagógico (O "O Quê"):** Inglês como Habilidade Motora. O idioma não é aprendido (teoria), é treinado (prática). O foco é a memória procedural e a fluidez funcional.
2.  **Pilar de Marketing (O "Como Vende"):** Narrativa de Inocência do Aluno. O fracasso anterior do aluno é culpa de métodos falhos. A Lexis é o "Mecanismo Único" (Imersão de 120h) que resolve esse gap.
3.  **Pilar Técnico (O "Como Escala"):** SEO Programático e Governança de IA. Uso de agentes autônomos (Leo e Roger) para gerar ativos de conteúdo que dominam as buscas orgânicas e educam o lead.

---

## 2. ETAPAS DO RACIOCÍNIO ESTRATÉGICO

O projeto foi construído seguindo estas etapas de decisão:

*   **Estágio 1 (Identificação do Gap):** Reconhecimento de que o ensino tradicional foca em gramática declarativa, enquanto a fala exige processamento em tempo real.
*   **Estágio 2 (Mecanismo Único):** Proposta de uma imersão de 120 horas em 14 dias como a única forma de quebrar a barreira da tradução mental e instalar a habilidade.
*   **Estágio 3 (Escala de Aquisição):** Em vez de anúncios caros, o crescimento é baseado em SEO Programático, alocando páginas onde a concorrência é fraca (Leo Protocol).
*   **Estágio 4 (Automação de Ativos):** Transformação do blog em uma malha semântica viva, onde o conteúdo é gerado, auditado e reciclado por IA (Roger Agent).

---

## 3. MAPA DE RISCOS

Identificamos os seguintes riscos críticos para a operação:

1.  **Alucinação Cultural:** IA gerando exemplos que não ressoam com a realidade brasileira ou com a metodologia Lexis.
2.  **Volatilidade de SEO:** Mudanças em algoritmos do Google que podem afetar o tráfego orgânico.
3.  **Dependência Técnica:** Quebra de APIs externas (Pixabay, Unsplash, OpenAI) interrompendo a linha de produção.
4.  **Conteúdo Genérico:** Produção de massa sem a profundidade pedagógica necessária (IPL baixo).
5.  **Conflitos de Deploy:** Erros de sincronização no GitHub causados por múltiplos commits automatizados.

---

## 4. ESTRATÉGIAS DE FORTALECIMENTO

Para mitigar os riscos acima, implementamos:

*   **Auditoria Roger (Anti-Alucinação):** Um motor de auditoria que valida cada post contra o padrão de 9 seções e o tom de voz "Mentor Lexis".
*   **Protocolo Leo (SEO Defensivo):** Foco em ROI e reciclagem de conteúdo. O sistema não apenas cria, mas reescreve posts estagnados para manter autoridade.
*   **V9 Self-Hosting (Autonomia Técnica):** Imagens são agora otimizadas e commitadas diretamente no repositório (`public/img/posts/`), eliminando links quebrados.
*   **Mandatory Structure:** Todos os posts seguem o padrão de 9 seções (tabelas comparativas, 3 níveis de progressão, IPL self-check).
*   **Git Rebase Automation:** Scripts que realizam rebase automático para garantir a integridade do pipeline de deploy.

---

## 5. DESENVOLVIMENTO DOS TÓPICOS

### 5.1 Pedagógico: A Metodologia Lexis (V9.1)
*   **Princípio:** "Idioma não se aprende. Idioma se treina."
*   **Fases:** Start (Fonética) -> Run (Estruturas) -> Fly (Vocabulário) -> Liberty (Conversação).
*   **IPL (Indicador de Performance Linguística):** Métrica central que mede o quanto do conteúdo é efetivamente treinável.

### 5.2 Marketing: Narrativa e SEO
*   **Inocência:** O aluno é a vítima de um sistema de 5 anos; a imersão de 2 semanas é a libertação.
*   **SEO Programático:** Alocação estratégica de páginas baseada no *Leo Score* (Impressões vs. Posição).

### 5.3 Técnico: Automação e Governança
*   **Lexis Publisher (Worker):** Orquestrador que realiza o triage, reescrita e publicação.
*   **Sistema de Imagens:** Fluxo Pixabay -> wsrv.nl -> WebP -> Commit local.
*   **Roger Agent:** Guardião da qualidade que garante que o "Idioma se treina" esteja presente em cada parágrafo.

---
**Status:** Consolidado em 17/03/2026
**Responsável:** Jules (IA Engineer)
