# LEXIS ACADEMY: PROJECT VISION & SOURCE OF TRUTH (V9.1)

## 1. LINHA LÓGICA COMPLETA (PEDAGOGIA -> MARKETING -> TÉCNICO)

A Lexis Academy não é uma escola de inglês, é uma **fábrica de ativos de aquisição e treinamento de habilidades motoras**. A lógica de funcionamento segue esta ordem de precedência:

1.  **PEDAGOGIA (O PRODUTO):** O inglês é tratado como **habilidade motora (procedural)**, não como conhecimento acadêmico (declarativo). O objetivo é a fluência funcional através de 120h de imersão em 14 dias (Método 3F: Phrase, Fluidity, Function).
2.  **MARKETING (O MECANISMO):** A narrativa foca na **inocência do aluno** (a culpa é do método tradicional) e no **SEO Programático**. Não buscamos cliques, mas sim a "alocação de páginas" onde o Google é fraco, educando o lead com autoridade topical.
3.  **TÉCNICO (O MOTOR):** Uma arquitetura de **baixo custo e alta escala**. GitHub Pages para hospedagem, Cloudflare Workers para inteligência, e agentes de IA (Leo e Roger) para governança autônoma de conteúdo e SEO.

---

## 2. ETAPAS DO RACIOCÍNIO ESTRATÉGICO

Este projeto foi construído sobre quatro pilares de raciocínio encadeados:

*   **ETAPA 1 (O GAP):** Identificação de que o mercado tradicional ensina "sobre o idioma" (gramática), o que cria um bloqueio na fala. A solução exige uma mudança de paradigma: aprender inglês como se aprende a dirigir.
*   **ETAPA 2 (O MECANISMO ÚNICO):** A imersão de 120h como única forma de quebrar a barreira do som e da tradução mental. Essa intensidade é o diferencial competitivo inegociável.
*   **ETAPA 3 (A ESCALA):** O crescimento não pode depender de anúncios caros. A estratégia é dominar os clusters de busca do Google através de uma IA que escreve, revisa e publica conteúdo de elite 24/7 (SEO Programático).
*   **ETAPA 4 (A GOVERNANÇA):** O uso de Agentes Autônomos (**Leo** para SEO e **Roger** para Auditoria) para garantir que a máquina de conteúdo não degrade a qualidade ao longo do tempo, mantendo um IPL (Indicador de Performance Lingüística) alto.

---

## 3. MAPA DE RISCOS E ESTRATÉGIAS DE FORTALECIMENTO

### Risco A: Alucinação Cultural da IA
*   **Descrição:** IAs podem gerar contextos que não fazem sentido para o brasileiro (ex: feriados americanos como se fossem locais).
*   **Fortalecimento:** O Agente **Roger (Guardian)** atua como auditor, filtrando e bloqueando conteúdos que não sigam o realismo cultural e a metodologia Lexis.

### Risco B: Dependência de APIs Externas (Imagens)
*   **Descrição:** Links de imagens do Pixabay/Pexels podem quebrar ou mudar de política.
*   **Fortalecimento:** Implementação do **Knowledge System V9**, que faz o download, otimiza para WebP via `wsrv.nl` e hospeda as imagens localmente no repositório (`public/img/posts/`).

### Risco C: Volatilidade do SEO (Core Updates)
*   **Descrição:** Mudanças no algoritmo do Google podem derrubar o tráfego orgânico.
*   **Fortalecimento:** O **Protocolo Leo** prioriza o "ROI de Posicionamento", focando em termos onde o Google é fraco e reciclando posts estagnados para manter a autoridade topical (SEO Defensivo).

---

## 4. DESENVOLVIMENTO DETALHADO DOS TÓPICOS

### 4.1 PEDAGOGIA: O MÉTODO 3F
*   **Phrase (Frase):** Treino de chunks e padrões, não palavras soltas.
*   **Fluidity (Fluidez):** Foco na velocidade de processamento cerebral.
*   **Function (Função):** Aplicação em cenários reais de alta pressão (negócios/executivo).

### 4.2 MARKETING: NARRATIVA ESTRATÉGICA
*   **Gancho:** "O problema não é você, é o método".
*   **Snippet de Autoridade:** Respostas diretas e tabelas comparativas logo no início dos posts para capturar "Zero-Click Searches".
*   **Funil de Conteúdo:** Intenção informacional -> Dor do aluno -> Decisão de imersão.

### 4.3 ARQUITETURA TÉCNICA (V9.1)
*   **Frontend:** React (Vite) + Tailwind CSS + React Markdown.
*   **Backend:** Cloudflare Workers operando como proxy (worker-spa) e motor de publicação (lexis-publisher).
*   **Build Artifacts:** RSS (`public/rss.xml`) e Sitemap gerados automaticamente para indexação acelerada.

### 4.4 AUTOMAÇÃO DE ELITE (ROGER & LEO)
*   **Roger:** Monitora o nível de consciência do blog via EMA (Exponential Moving Average). Posts < 60 são deletados, > 90 são Elite.
*   **Leo:** Executa o interlink contextual e otimização de snippets com base em dados reais do Google Search Console.
*   **IPL (Indicador de Performance Lingüística):** Métrica única que une qualidade pedagógica e eficácia de SEO.

---
**Documento assinado por: Jules (Software Engineer) e Roger (AI Guardian).**
