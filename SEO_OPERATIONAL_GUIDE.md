# GUIA OPERACIONAL — IA DE CONTEÚDO SEO AUTÔNOMA (LEXIS)

## OBJETIVO DO SISTEMA
Criar uma máquina de SEO programático que:
- publique conteúdo automaticamente
- aumente autoridade topical continuamente
- eduque o lead antes da venda
- elimine CMS, painel humano e decisões subjetivas

O sistema não escreve blogs. **Ele aloca páginas onde o Google é fraco.**

## VISÃO GERAL DA ARQUITETURA
- **GitHub Pages** → hospedagem e publicação
- **Cloudflare Workers** → cérebro lógico
- **Cloudflare KV / D1** → fila de pauta e histórico
- **IA** → redação, estrutura e interlink
- **Markdown** → fonte única da verdade

Tudo é: pré-gerado, versionado, auditável e reciclável.

---

## ETAPA 0 — PRINCÍPIO EDITORIAL INEGOCIÁVEL
Antes de qualquer automação, a IA deve operar sob este axioma:
> **Idioma não se aprende. Idioma se treina.**

Todo conteúdo deve:
- inocentar o aluno
- atacar o método tradicional
- reposicionar inglês como habilidade
- preparar o leitor para intensidade, treino e decisão

Se um artigo não reforça isso, ele não deve existir.

---

## ETAPA 1 — BACKLOG DE PAUTA (INPUT DO SISTEMA)
**1.1 Origem dos tópicos**
- Google Trends (export manual semanal)
- People Also Ask
- SERPs fracas (fórum, Reddit, Quora, Medium)
- Search Console (quando disponível)

**1.2 Estrutura mínima de cada tópico (KV/D1)**
- `query`
- `cluster`
- `intenção` (informacional | dor | decisão)
- `tipo` (evergreen | ascensão)
- `prioridade` (numérica)
- `status` (novo | em produção | publicado | reciclado)

*Nada entra no sistema sem cluster definido.*

---

## ETAPA 2 — SISTEMA DE DECISÃO DE TÓPICOS (SEO SCORE)
A IA não escolhe temas por volume. Ela calcula vantagem competitiva.

**2.1 SEO Opportunity Score (modelo)**
`SEO_SCORE = (Volume_Relativo × 0,25) + (Baixa_Concorrência × 0,25) + (Gap_Semântico × 0,20) + (Potencial_Interlink × 0,15) + (Alinhamento_Lexis × 0,15)`

**2.2 Regras de exclusão automática**
- tópicos canibalizáveis
- dois posts seguidos do mesmo cluster
- temas fora do funil estratégico atual

---

## ETAPA 3 — GANCHO OBRIGATÓRIO (BASE DE TODOS OS POSTS)
Todo artigo deve começar com o mesmo frame lógico:
1. Frustração do aluno (anos estudando, não fala)
2. Erro do método tradicional
3. Inversão: idioma = habilidade treinável

**Frase-base:**
> “O problema não é falta de estudo. É excesso de método errado.”

---

## ETAPA 4 — PROMPT ESTRUTURADO (CONTRATO COM A IA)
A IA só pode responder em JSON (ou formato estruturado equivalente).

**4.1 Entrada do prompt**
- query, cluster, intenção, tipo

**4.2 Saída obrigatória**
```json
{
  "title": "",
  "slug": "",
  "description": "",
  "content_markdown": "",
  "tags": [],
  "internal_links_suggestions": []
}
```
*Nada fora desse contrato é aceito.*

---

## ETAPA 5 — VALIDAÇÃO AUTOMÁTICA (ANTI-CONTEÚDO RUIM)
Antes de gerar o arquivo Markdown, o Worker valida:
- keyword no title + H1 + primeiro parágrafo
- mínimo de palavras: 600 (ascensão) / 1200 (evergreen)
- pelo menos 1 exemplo prático em inglês
- CTA contextual (não comercial direto)
- parágrafos curtos
- erro tratado como ferramenta

*Falhou → prompt corretivo → reescrita parcial.*

---

## ETAPA 6 — GERAÇÃO DO MARKDOWN
Formato padrão: `/posts/AAAA-MM-slug.md`

Frontmatter obrigatório:
```yaml
---
title:
description:
date:
categories:
tags:
cluster:
---
```
Conteúdo em Markdown puro. Sem HTML pesado. Sem JS.

---

## ETAPA 7 — INTERLINK PROGRAMÁTICO
Antes do commit:
1. Worker identifica cluster do post
2. Busca todos os slugs do mesmo cluster
3. Injeta links contextuais no texto novo
4. Atualiza posts antigos com backlinks

Resultado: malha semântica viva, autoridade topical crescente (SEO sem plugin).

---

## ETAPA 8 — COMMIT AUTOMÁTICO NO GITHUB
Fluxo técnico: criar blob → criar tree → criar commit → push na main.
GitHub Pages publica automaticamente.

---

## ETAPA 9 — INDEXAÇÃO E CACHE
Após publicação:
- sitemap.xml atualizado (automático pelo build)
- ping IndexNow
- cache warming Cloudflare
- TTL alto (conteúdo estático)

---

## ETAPA 10 — RECICLAGEM (SEO DEFENSIVO)
Rotina semanal do Worker:
1. cruza posts antigos × novas queries
2. identifica gaps semânticos
3. atualiza Markdown existente (novo commit, data atualizada)

*Você não cria mais conteúdo. Você domina os mesmos termos continuamente.*

---

## O QUE ESSE SISTEMA FAZ DE VERDADE
- cria autoridade acumulativa
- educa o lead antes da venda
- elimina dependência humana
- reduz custo marginal a quase zero
- transforma blog em ativo estratégico

**Isso não é marketing de conteúdo. É engenharia de aquisição orgânica.**
