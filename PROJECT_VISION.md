# 📑 Visão de Projeto: Lexis V9.1 (Source of Truth)

## 1. 🏗️ Linha Lógica (The Chain)
A estratégia Lexis é um sistema integrado onde cada pilar sustenta o próximo:
**Pedagogia (O Produto)** ➔ **Marketing (A Atração)** ➔ **Técnico (A Escala/Motor)**

*   **Pedagogia:** O inglês é tratado como **habilidade motora** (como dirigir ou nadar), não como conteúdo acadêmico. O foco é o treino procedural.
*   **Marketing:** Baseia-se na **Narrativa de Inocência do Aluno**, transferindo a culpa do fracasso anterior para os métodos tradicionais e apresentando a imersão como o "mecanismo único".
*   **Técnico:** Um ecossistema de **SEO Programático** e **Agentes de IA (Leo e Roger)** que geram, auditam e otimizam ativos de conteúdo de forma autônoma.

---

## 2. 🧠 Etapas do Raciocínio (Core Logic)
1.  **Diagnóstico do Erro:** O ensino tradicional foca em conhecimento declarativo (saber *sobre* o idioma). O aluno entende, mas não fala.
2.  **Solução Proposta:** A imersão de **120 horas em 14 dias** quebra a barreira da inibição e treina a fluidez através do **Método 3F** (Phrase, Fluidity, Function).
3.  **Mecanismo de Escala:** Em vez de blogs genéricos, o projeto utiliza **Alocação de Página**, ocupando espaços de baixa concorrência no Google com conteúdo estruturado e de alto valor técnico.
4.  **Governança Autônoma:** O **Protocolo Leo** prioriza o que traz ROI, enquanto o **Agente Roger** audita a precisão cultural para evitar "alucinações" de IA.

---

## 3. ⚠️ Mapa de Riscos (Risk Assessment)
| Risco | Impacto | Descrição |
| :--- | :--- | :--- |
| **Alucinação Cultural** | Alto | IA sugerir contextos que não existem no Brasil ou termos que não são C1/C2 reais. |
| **Volatilidade SEO** | Médio | Atualizações de algoritmo do Google podem penalizar conteúdos gerados por IA se forem rasos. |
| **Dependência de API** | Baixo | Falhas em serviços como Pixabay ou OpenAI interrompendo a produção automática. |
| **Conflitos de Deploy** | Baixo | Commits simultâneos do Worker e do usuário causando falhas no Git. |

---

## 4. 💪 Estratégias de Fortalecimento (Mitigation)
*   **Auditoria Roger (IPL):** Implementação do **Indicador de Performance Linguística**. Roger revisa cada post para garantir que o bilinguismo seja estratégico e o conteúdo, executivo.
*   **Auto-Hospedagem de Ativos:** Mudança para o modelo V9.1 onde imagens são processadas via `wsrv.nl` e armazenadas localmente em `public/img/posts/`, eliminando links quebrados.
*   **Estrutura de 9 Seções:** Obrigatoriedade do padrão definido em `PADRAO_BLOG_ROGER_LEO.md` para garantir que o conteúdo seja profundo e impossível de ser classificado como "thin content".
*   **Git Rebase Automation:** Scripts que realizam rebase automático antes do push, garantindo integridade no pipeline de CI/CD.

---

## 5. 📚 Desenvolvimento dos Tópicos

### I. O Motor Pedagógico (Metodologia Lexis)
A Lexis define que "Idioma não se aprende, se treina". O framework é dividido em:
*   **Start (Fonética):** Limpeza de vícios e sons críticos.
*   **Run (Estruturas):** Padrões verbais de alta frequência.
*   **Fly (Vocabulário):** Collocations e termos executivos (C1).
*   **Liberty (Conversação):** Aplicação funcional sob pressão.

### II. O Mecanismo Técnico (Leo Protocol & V9 Automation)
O **Leo Protocol** é o cérebro que decide *o que* publicar. Ele usa a fórmula:
`Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)`
O sistema automatiza a busca de imagens via Pixabay com fallback para banco curado, otimiza para WebP e gera o post com frontmatter pronto para o motor React.

### III. Governança e Auditoria (Roger Agent)
O **Agente Roger** atua como o "Guardião Cultural". Ele verifica se:
1. O título é bilíngue e magnético.
2. Existe uma tabela comparativa (Mecanismo de Contraste).
3. O cenário é realista para um executivo ou profissional de alta performance.
4. O **IPL** (Indicador de Performance Linguística) está entre 50% e 70% de densidade de inglês.

### IV. SEO Programático (Pilar de Atração)
O projeto não compete por termos genéricos como "curso de inglês". Ele foca em **clivagens específicas** (ex: "defesa estratégica em reuniões de diretoria"), onde a autoridade técnica da Lexis supera os portais de massa.
