# Lexis Academy: Visão Estratégica do Projeto (V9.1)

Este documento é a "Fonte Única de Verdade" (Source of Truth) que consolida a lógica pedagógica, a estratégia de marketing e a execução técnica do ecossistema Lexis.

---

## 1. A Linha Lógica (The Golden Thread)

A Lexis opera sob uma progressão lógica inquebrável:

**Pedagogia (O QUE)**: O inglês não é uma matéria acadêmica, é uma habilidade motora (como dirigir).
⬇️
**Marketing (COMO VENDER)**: A "Narrativa de Inocência" remove a culpa do aluno pelo fracasso anterior e posiciona a Imersão de 120h como o único mecanismo de correção.
⬇️
**Técnico (COMO ESCALAR)**: Agentes de IA (Leo e Roger) geram e auditam conteúdos de alta performance (SEO Programático) para atrair e converter alunos de forma autônoma.

---

## 2. Etapas do Raciocínio (Core Reasoning)

### Etapa 1: A Falha do Conhecimento Declarativo
O ensino tradicional foca em regras gramaticais (conhecimento declarativo). No entanto, a fala acontece em milissegundos, exigindo conhecimento procedural (automação motora). A lacuna entre saber a regra e conseguir falar é onde 95% dos alunos desistem.

### Etapa 2: O Mecanismo Único (Imersão 120h)
Para transformar conhecimento declarativo em procedural, é necessária densidade cognitiva. A Imersão Lexis de 120h (10h/dia por 2 semanas) força o cérebro a abandonar a tradução mental e adotar a resposta automática.

### Etapa 3: Escala via SEO Programático
A aquisição de alunos é escalada através do Leo Protocol. Em vez de posts genéricos, criamos clusters de "Workshops de Elite" que resolvem dores corporativas reais em inglês, capturando a demanda de quem precisa de resultados imediatos.

### Etapa 4: Governança Autônoma (Roger & Leo)
A qualidade é mantida sem intervenção humana constante. O Agente **Roger (Auditor)** garante que cada peça de conteúdo siga a metodologia e o bilinguismo funcional, enquanto o Agente **Leo (SEO)** otimiza a performance de busca.

---

## 3. Mapa de Riscos e Fortalecimento

| Risco Identificado | Estratégia de Fortalecimento (V9.1) |
| :--- | :--- |
| **Alucinação Cultural da IA**: IA inventando contextos brasileiros que não existem. | **Roger Audit v3.7**: Filtro implacável de "Innocence & Reality" que rejeita conteúdos sem precisão cultural. |
| **Volatilidade de SEO**: Mudanças nos algoritmos do Google podem derrubar o tráfego. | **Leo Protocol ROI Formula**: Priorização baseada em conversão e impressões reais, não apenas volume. |
| **Dependência de APIs**: Quedas no Pixabay ou Unsplash quebram o site. | **V9.1 Self-Hosting**: Imagens são baixadas, otimizadas e commitadas no repositório (public/img/posts/). |
| **Conteúdo Genérico**: Posts que parecem "escritos por IA" e não ensinam nada. | **Mandatory 9-Section Structure**: Estrutura rígida de workshops com 3 níveis de treino e ancoragem lexical. |

---

## 4. Desenvolvimento dos Tópicos

### 4.1 Metodologia Lexis (A Base Pedagógica)
*Ref: LEXIS_METHODOLOGY.md*
- Foco em **IPL (Indicador de Performance Linguística)**.
- Bilinguismo Funcional: O português é a ponte, o inglês é o músculo.
- Treino 60/40 (60% prática ativa em EN / 40% instrução em PT).

### 4.2 Leo Protocol (O Motor de SEO)
*Ref: LEO_PROTOCOL.md*
- Automação via Cloudflare Workers e Google Sheets.
- Otimização de "Quase Ranqueando" (Posição 5-15).
- Ciclo de atualização de 90 dias para conteúdos estagnados.

### 4.3 Roger Agent (O Guardião da Qualidade)
*Ref: worker/src/content-auditor.js*
- Auditoria em 5 eixos: Relevância, Integração, Tensão, Densidade C1 e Otimização Bilingue.
- Verificação de Ancoragem Lexical: Termos do Nível 1 devem ser usados e negritados nos Níveis 2 e 3.

### 4.4 Infraestrutura V9.1 (A Realidade Técnica)
*Ref: KNOWLEDGE_SYSTEM_V9.md*
- Publicação automática via GitHub Actions/Workers.
- Sistema de imagens resiliente com fallback curado.
- Rebase automático de Git para evitar conflitos de deploy.

---
*Assinado: Direção de Estratégia Lexis Academy*
