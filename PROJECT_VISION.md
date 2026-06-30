# PROJECT_VISION.md — Âncora Estratégica Lexis V9.1

Este documento é a "Fonte da Verdade" definitiva para o projeto Lexis. Ele sintetiza a visão pedagógica, de marketing e técnica em um único fio condutor, orientando todas as decisões de desenvolvimento e automação.

---

## 1. O Fio de Ouro (The Golden Thread)

A Lexis opera sob uma lógica linear onde cada componente sustenta o próximo:

**PEDAGOGIA** (O que somos) ➔ **MARKETING** (Como atraímos) ➔ **TÉCNICO** (Como escalamos)

1.  **Pedagogia (Inglês como Habilidade Motora):** O idioma não se aprende, se treina. Focamos na transição da memória declarativa (saber a regra) para a memória procedural (falar sem pensar).
2.  **Marketing (Narrativa de Inocência & SEO):** Inocentamos o aluno pelo seu fracasso anterior, culpando os métodos tradicionais (O Vilão). Atraímos via SEO Programático, ocupando lacunas semânticas onde o Google é fraco.
3.  **Técnico (Agentes Autônomos):** Utilizamos agentes de IA (Leo para SEO, Roger para Auditoria) para governar a qualidade e a publicação de conteúdo em escala, eliminando a necessidade de editores humanos.

---

## 2. Etapas do Raciocínio (Reasoning Stages)

### I. O Gap (A Lacuna)
Identificamos que o mercado de ensino de inglês está saturado de "conhecimento" (gramática), mas faminto por "performance" (fala). O gap é a distância entre entender o inglês e conseguir usá-lo sob pressão.

### II. O Mecanismo Único (Unique Mechanism)
Nossa solução é a **Imersão de 120 horas**. Um ambiente de alta densidade projetado para forçar o cérebro a automatizar estruturas linguísticas, criando o "caminho motor" necessário para a fluência real.

### III. Escala (Scale)
Para escalar sem custos exponenciais, utilizamos o **SEO Programático**. Mapeamos milhares de intenções de busca executivas e geramos workshops de elite (posts) que educam o lead e o preparam para a imersão.

### IV. Governança (Governance)
A qualidade é mantida pelos agentes:
- **Leo (SEO):** Garante que o conteúdo seja encontrável e prioriza temas com maior ROI.
- **Roger (Auditor):** Garante a precisão cultural, o rigor pedagógico (IPL) e a "Narrativa de Inocência".

---

## 3. Identificação de Riscos & Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Alucinações da IA** | Conteúdo culturalmente incorreto ou pedagogicamente falho. | Auditoria obrigatória pelo Agente Roger (v3.5+) com threshold de 60-90 pts. |
| **Volatilidade de SEO** | Mudanças nos algoritmos do Google podem derrubar o tráfego. | Leo Protocol v9.1: Diversificação de clusters e reciclagem contínua de conteúdo (Post Recycler). |
| **Dependência de APIs** | Falhas na OpenAI, Gemini ou Pixabay travam o pipeline. | Fallback Manager: Alternância entre modelos (GPT-4o/Gemini) e banco de imagens local. |
| **Canibalização de SEO** | Posts competindo pelas mesmas palavras-chave. | Leo Strategy: Mapeamento de clusters no KV e interlink programático para organizar autoridade. |

---

## 4. Fortalecimento de Pontos Fracos

### Ponto Fraco: Escalabilidade de Imagens
Anteriormente, o sistema dependia de URLs externas que expiravam ou quebravam.
**Solução V9.1:** Implementação do sistema de **Self-Hosting**. O Worker agora baixa a imagem do Pixabay, otimiza via `wsrv.nl` e faz o commit do binário WebP diretamente em `public/img/posts/`.

### Ponto Fraco: Conteúdo Genérico
Textos de IA podem soar repetitivos e sem "alma" executiva.
**Solução V9.1:** Uso de **Cenários de Alta Pressão** (Elite Scenarios) e **Ancoragem Lexical** obrigatória. O Roger rejeita qualquer post que não tenha tensão corporativa real ou que falhe na integração bilingue.

---

## 5. Desenvolvimento de Tópicos (Deep Dive)

### 5.1 Pedagogia: O Motor Skill Framework
- **Fonética (Start):** Ajuste de hardware vocal.
- **Estruturas (Run):** Automação de verbos de alta frequência.
- **Vocabulário (Fly):** Chunks C1+ para ambiente executivo.
- **Conversação (Liberty):** Simulação de cenários de estresse.

### 5.2 Marketing: A Máquina de SEO Programático
- **SEO Score:** Priorização baseada em (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3).
- **Clusterização:** Organização por intenção (Informacional, Dor, Decisão).
- **Interlink:** Malha semântica automática para herança de autoridade.

### 5.3 Técnico: Lexis Publisher Worker v8.0
- **Stockpile Engine:** Mantém uma fila de posts prontos para publicação diária automática.
- **IPL Execution Engine:** Garante que todo post atinja 60-70% de densidade de inglês (Indicador de Performance Linguística).
- **GitHub Pipeline:** Deploy contínuo via GitHub Actions integrando Markdown e Imagens.

---
*Documento Atualizado em: Junho de 2026*
*Responsável: Leo & Roger (Agentes de Governança)*
