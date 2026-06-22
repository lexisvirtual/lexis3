# PROJECT_VISION.md — Lexis Academy V9.1 (Strategic Anchor)

Este documento é a âncora estratégica mestre do projeto Lexis Academy. Ele organiza a linha lógica completa, as etapas de raciocínio e a governança técnica.

## 1. A LINHA LÓGICA (The Golden Thread)

A Lexis opera sob uma integração indivisível entre pedagogia, marketing e tecnologia:

1.  **Pedagogia (O Fundamento):** O inglês não é uma disciplina acadêmica (memória declarativa), mas uma habilidade motora (memória procedural). "Idioma não se aprende. Idioma se treina."
2.  **Marketing (A Ponte):** A **Narrativa de Inocência**. O aluno não é culpado por não falar; o culpado é o método tradicional que usou o mecanismo errado. A Lexis apresenta o "Mecanismo Único": a imersão de 120 horas.
3.  **Técnico (O Motor):** Automação total via Agentes (Leo e Roger). Escala via SEO Programático para dominar gaps semânticos onde as escolas tradicionais são fracas.

---

## 2. ETAPAS DO RACIOCÍNIO ESTRATÉGICO

### I. Identificação do Gap
Existe um abismo entre o "saber sobre o idioma" (gramática) e o "falar o idioma" (performance). Métodos tradicionais focam no primeiro; a Lexis foca exclusivamente no segundo.

### II. O Mecanismo Único (Solução)
Para cruzar esse abismo, é necessária alta densidade de treino. A imersão de 120h (10h/dia por 2 semanas) é desenhada para forçar o cérebro a transitar da memória declarativa para a procedural.

### III. Escala de Aquisição (Leo Protocol)
O crescimento não depende de anúncios caros, mas de dominar a intenção de busca do aluno frustrado. O Leo Protocol usa o `Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)` para priorizar conteúdos de alta conversão.

### IV. Governança e Qualidade (Roger Agent)
A qualidade é mantida pelo Agente Roger (Auditor v3.7), que garante que cada peça de conteúdo siga a estrutura de 9 seções, mantenha o DNA Lexis (60/40 treino) e reforce a Narrativa de Inocência.

---

## 3. MAPA DE RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação (Fortalecimento) |
| :--- | :--- | :--- |
| **Dependência de APIs de Imagem** | Links quebrados / 404 | Implementação de persistência binária local (`public/img/posts/`) em WebP. |
| **Alucinação Cultural da IA** | Conteúdo genérico / irrelevante | Prompts de "Apple Style" e auditoria Roger obrigatória antes do commit. |
| **Volatilidade de SEO** | Perda de tráfego orgânico | Leo Protocol de reciclagem semanal para manter autoridade em clusters críticos. |
| **Canibalização de Termos** | Disputa interna de rankings | Mapeamento semântico por clusters no `SEO_OPERATIONAL_GUIDE.md`. |
| **Truncamento de Slugs** | URLs quebradas / Feeds inválidos | Limite estrito de 60 caracteres e limpeza de caracteres especiais no Worker. |

---

## 4. DESENVOLVIMENTO DOS TÓPICOS (Sprints Atuais)

### A. Pedagógica: Idioma como Habilidade Motora (Deep Dive)
A pedagogia Lexis rompe com o modelo de "escola" e assume o modelo de "centro de treinamento".
- **O Vilão:** A gramática descritiva que gera o "bloqueio da tradução mental".
- **O Herói:** A memória procedural. O foco é o *output* automático através de repetição deliberada em cenários de alta pressão.
- **Métrica IPL (Indicador de Performance Linguística):** Avalia a densidade de termos técnicos e chunks funcionais em relação ao texto total. Posts devem ter > 60% de densidade de treino.
- **Estrutura de Drill:** O plano de 7 dias em cada post não é sugestivo, é operacional. Dia 1-2 (Input/Escuta), Dia 3-4 (Drilling/Repetição), Dia 5-7 (Simulação/Roleplay).

### B. Marketing: Narrativa de Inocência e SEO de Intenção
O marketing da Lexis não vende "aulas", vende a "libertação da culpa".
- **A Narrativa:** "Você não é burro, você apenas foi treinado para ser um dicionário ambulante, não um falante." Isso remove a barreira psicológica do aluno.
- **SEO Programático (Leo Protocol):** Focamos em clusters de dor (Frustração, Carreira Estagnada, Medo de Reuniões).
- **O Fluxo de Conversão:** O post educa sobre a falha do método tradicional -> apresenta o Mecanismo Único (Imersão 120h) -> CTA para Aplicação.
- **Autoridade Topical:** O sistema gera 3-5 posts por cluster para garantir que a Lexis seja vista pelo Google como a maior autoridade em "Inglês para Executivos sob Pressão".

### C. Técnica: Governança Autônoma (Roger & Leo)
A tecnologia serve para eliminar a subjetividade humana e o custo de produção.
- **Agente Leo (SEO Engine):** Decide o que publicar baseado em dados do GSC/Search Console. Se um post está na posição 11, o Leo ordena um "Upgrade Elite" automático.
- **Agente Roger (Audit Engine):** Funciona como um guardião de marca. Ele rejeita conteúdos que soem como "ChatGPT padrão". Ele exige o "Apple Style" (direto, elegante, focado em benefícios, parágrafos curtos).
- **Persistência de Ativos:** O Worker não apenas gera texto, ele gerencia o repositório. O sistema baixa, otimiza e commita imagens WebP locais para garantir 100% de disponibilidade e velocidade (Core Web Vitals).
- **Ciclo de Reciclagem:** Posts antigos não morrem. O Agente Leo os identifica e o Agente Roger os atualiza com novos cenários e dados, mantendo o frescor do conteúdo (Freshness Factor).

---

**Nota:** Este documento é subordinado apenas ao `PRODUCTION_CONTRACT.md` e deve ser consultado antes de qualquer alteração arquitetural.
