# Visão do Projeto: Lexis Academy - Motor de Aquisição e Treino

## 1. Linha Lógica Completa
A Lexis Academy não é apenas uma escola de idiomas, mas um sistema integrado que une pedagogia de alto impacto, marketing de performance narrativa e tecnologia autônoma.

*   **Core Pedagógico (O "Porquê"):** Inglês como habilidade motora (procedural), não acadêmica (declarativa). O foco é a fluência funcional através de imersões intensivas (120h em 2 semanas) e o Método 3F (Phrase, Fluidity, Function).
*   **Mecanismo de Marketing (O "Como Vende"):** Narrativa de "Inocência do Aluno". O fracasso anterior não é culpa dele, mas do método tradicional lento. O SEO Programático atrai leads através de "alocação de páginas" onde a concorrência é fraca.
*   **Motor Técnico (O "Como Escala"):** Uma arquitetura de microsserviços baseada em Cloudflare Workers (Roger e Leo) que automatiza a criação, auditoria, otimização e publicação de conteúdo de elite, garantindo qualidade constante (IPL) e autoridade topical sem intervenção humana.

## 2. Etapas do Raciocínio
1.  **Identificação da Lacuna:** Existe um abismo entre saber gramática e conseguir falar sob pressão. O mercado tradicional vende o "saber", a Lexis treina o "fazer".
2.  **Solução do Único Mecanismo:** A imersão de 120h é o único caminho para quebrar a barreira da tradução mental e atingir a automaticidade.
3.  **Escala via Programmatic SEO:** Em vez de blogs genéricos, o sistema gera centenas de páginas otimizadas (Workshops de Elite) baseadas em clusters estratégicos (Speaking, Business, Executive).
4.  **Governança Autônoma:** O Agente **Roger** (Auditor) garante que todo conteúdo siga o padrão de elite, enquanto o Agente **Leo** (SEO) otimiza para conversão e ranking.

## 3. Mapa de Riscos
*   **Alucinação Cultural da IA:** Risco de gerar contextos irreais (ex: festas brasileiras em inglês). *Mitigação: Roger Auditor com System Prompt focado em realismo brasileiro.*
*   **Dependência de APIs Externas:** Risco de quebra de imagens ou custos excessivos. *Mitigação: Sistema V9 com self-hosting de imagens via GitHub/wsrv.nl.*
*   **Volatilidade de Algoritmo:** Mudanças no Google podem afetar o SEO. *Mitigação: Foco em autoridade topical e conteúdo de alta densidade (C1+), menos suscetível a updates de spam.*
*   **Complexidade Técnica:** Dificuldade de manutenção do ecossistema de scripts. *Mitigação: Unificação de comandos no package.json e logs centralizados no KV.*

## 4. Estratégias de Fortalecimento
*   **IPL (Indicador de Performance Linguística):** Uso de uma métrica única para alinhar todos os agentes. Se o IPL é baixo, o post é reciclado ou deletado.
*   **Ancoragem Lexical:** Garantir que o vocabulário ensinado no início do post seja obrigatoriamente usado nos cenários de prática (negritado), reforçando a pedagogia.
*   **Ciclo de EMA (Exponential Moving Average):** O sistema sobe a régua de qualidade automaticamente. À medida que o blog melhora, o threshold de aceitação do Roger também sobe.
*   **Bilinguismo Estratégico:** Uso de títulos e resumos bilíngues para capturar buscas em ambos os idiomas e facilitar o consumo para alunos de nível básico/intermediário.

## 5. Desenvolvimento Detalhado dos Tópicos

### A. O Motor Técnico (Roger & Leo)
O ecossistema utiliza Cloudflare Workers para orquestrar o fluxo: Scraper -> Triage -> Rewrite -> Audit -> Publish. O `worker/src/index.js` é o cérebro que gerencia locks de execução e agendamentos.

### B. O Sistema de Imagens V9
Automação que busca imagens no Pixabay, otimiza para WebP via `wsrv.nl` e as hospeda no próprio repositório para garantir 100% de disponibilidade e performance de carregamento.

### C. Protocolo Leo (SEO)
Fórmula de prioridade que identifica "frutas baixas" (posições 5-15 no Google) e comanda o Roger para fazer upgrades cirúrgicos (snippets, FAQs, interlinks) para empurrar a página para o topo.

### D. Padrão de Blog Roger-Leo
Estrutura obrigatória de 9 seções, incluindo Tabela Comparativa, 3 Níveis de Progressão (Aquecimento -> Contexto -> Missão) e Plano de Treino de 7 dias.

---
*Documento consolidado como Fonte da Verdade para o desenvolvimento da Lexis Academy.*
