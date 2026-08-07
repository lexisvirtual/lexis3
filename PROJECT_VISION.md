# PROJECT VISION - LEXIS V9.1

## 1. LINHA LÓGICA COMPLETA
A Lexis V9.1 opera em uma integração vertical que une pedagogia profunda, marketing de resposta direta e execução técnica autônoma.

*   **CORE PEDAGÓGICO:** O inglês não é uma disciplina acadêmica (conhecimento declarativo), mas uma **habilidade motora e cognitiva** (conhecimento procedural). O foco é o treino, não o estudo.
*   **MECANISMO DE MARKETING:** **Narrativa de Inocência do Aluno**. O fracasso anterior do aluno não é culpa dele, mas de métodos lentos e ineficientes. A solução única é a imersão de 120h. O **SEO Programático** serve como o funil de aquisição que escala essa narrativa.
*   **MOTOR TÉCNICO:** Automação total via Agentes AI (**Leo** para SEO e **Roger** para Auditoria). O sistema é autônomo, versionado em Git e hospedado em infraestrutura de borda (Cloudflare/GitHub Pages).

---

## 2. ETAPAS DO RACIOCÍNIO
A construção estratégica segue quatro estágios fundamentais:

1.  **IDENTIFICAÇÃO DO GAP:** Reconhecimento de que o mercado ensina "sobre" o idioma, enquanto o aluno precisa "fazer" com o idioma.
2.  **DEFINIÇÃO DO MECANISMO ÚNICO:** A imersão de 120h (equivalente a 2 anos de curso tradicional) como a única forma de quebrar a barreira da fala.
3.  **ESCALA VIA SEO PROGRAMÁTICO:** Uso de clusters de conteúdo para alocar páginas onde a concorrência é fraca, dominando a autoridade topical.
4.  **GOVERNANÇA AUTÔNOMA:** Implementação de agentes (Leo/Roger) que garantem que o conteúdo seja produzido, auditado e otimizado sem intervenção humana constante.

---

## 3. MAPA DE RISCOS E ESTRATÉGIAS DE FORTALECIMENTO

| Risco | Descrição | Estratégia de Fortalecimento |
| :--- | :--- | :--- |
| **Alucinação Cultural** | A IA pode sugerir contextos que não condizem com a realidade brasileira ou com o método Lexis. | **Roger Audit (v3.5+):** Filtro de qualidade e "Clean SEO" que audita o IPL (Indicador de Performance Linguística). |
| **Volatilidade de SEO** | Mudanças nos algoritmos do Google podem afetar o tráfego orgânico. | **Leo Protocol:** Priorização baseada em ROI real (Impressões x Conversão) e diversificação de clusters. |
| **Dependência de APIs Externas** | Quebra de links de imagens ou limites de cota em serviços como Unsplash/Pixabay. | **V9 Self-hosting:** Uso do `wsrv.nl` para otimização e armazenamento de binários WebP diretamente no repositório. |
| **Conteúdo Genérico** | Posts sem a "alma" da Lexis. | **Padronização 9 Seções:** Estrutura obrigatória que força bilinguismo, tabelas comparativas e plano de treino. |

---

## 4. DESENVOLVIMENTO DOS TÓPICOS

### 4.1 Metodologia Lexis (O Core)
A base é a distinção entre saber *sobre* o inglês (gramática) e *ter* a habilidade (fala).
- **Habilidade Motora:** Falar é um ato físico de coordenação de músculos e processamento neural rápido.
- **Treino Deliberado:** A Lexis substitui a aula passiva por sessões de alta intensidade onde o erro é corrigido no momento da produção, nunca bloqueando a fluidez.
- **Mecanismo Único:** 120 horas de imersão total que simulam o ambiente de necessidade real, forçando o cérebro a adotar o inglês como via de comunicação primária.

### 4.2 Leo Protocol (O Motor de SEO)
O Leo não é um simples gerador de posts; é um gestor de ativos digitais.
- **Fórmula de Prioridade:** `Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)`. O Leo foca onde o dinheiro está ou onde o Google está quase nos dando o topo.
- **Ciclo Operacional:** Sincroniza dados do GSC/GA4 para identificar páginas estagnadas ou com alto potencial, disparando comandos de reescrita "Elite" ou otimização de snippets.

### 4.3 Roger Guardian (A Auditoria)
O Roger garante que a escala não sacrifique a alma do projeto.
- **Clean SEO:** Regras estritas como a proibição de H1 interno (SEO audit), proibição de caracteres Markdown em títulos de frontmatter e garantia de estrutura de 9 seções.
- **Auditoria de IPL:** Verifica se o post mantém a densidade pedagógica correta (português para contexto, inglês para treino).
- **Auto-Healing:** Detecta posts com score de consciência baixo (<60) e os marca para reciclagem ou exclusão.

### 4.4 Automação de Ativos (Infraestrutura V9.1)
A parte técnica que sustenta a visão.
- **Imagens Self-Hosted:** O sistema busca imagens (Pixabay/Fallback), otimiza via `wsrv.nl` para WebP (80% qualidade, 1200px) e faz o commit para `public/img/posts/`. Isso garante que o blog nunca tenha links quebrados.
- **Worker Lexis Publisher:** Orquestra todo o fluxo, desde a leitura da pauta até o commit final no GitHub, utilizando o `test-complete-flow.js` como validador de integridade.
- **Interlink Automático:** Posts do mesmo cluster são vinculados programaticamente, criando uma malha semântica que fortalece a autoridade topical sem intervenção manual.
