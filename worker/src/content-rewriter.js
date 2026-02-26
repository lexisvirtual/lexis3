import { auditPost } from './content-auditor.js';
import { callGemini, extractTag, cleanFullContent, callOpenAI } from './multi-model.js';
import { getTemaDoAno } from './temas365.js';
import { getLeoTarget } from './leo-strategy.js';

export async function rewriteArticles(env, limit = 5) {
  const currentRewritten = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 50 });
  const stockSize = currentRewritten.keys.length;

  if (stockSize >= limit) {
    console.log(`[REWRITER] 📦 Estoque cheio (${stockSize}/5). Nenhuma produção necessária.`);
    return { success: true, postsRewritten: 0, stock: stockSize };
  }

  const needed = limit - stockSize;
  console.log(`[REWRITER] 🚀 Iniciando produção para atingir meta de 5 posts (Faltam ${needed}).`);
  await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Refilled Mode: Faltam ${needed} posts.`);

  const rewrittenTitles = [];

  const triagedList = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 10 });
  for (const key of triagedList.keys) {
    if (rewrittenTitles.length >= needed) break;

    const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!data) continue;
    const article = JSON.parse(data);

    try {
      const elitePrompt = `Você é o Diretor da Lexis Academy. Transforme o conteúdo sobre "${article.title}" em um Workshop de Alta Performance.

DNA LEXIS: "Inglês não se aprende, se treina."
AUDIÊNCIA: Adultos e Executivos.

🚨 REGRAS ANTI-REJEIÇÃO DO ROGER:
1. ZERO REPETIÇÃO: É proibido usar a mesma frase ou exemplo em seções diferentes. Se colocar no Vocabulário, não use o mesmo exemplo no Treino 3F. Cada seção deve ser inédita.
2. DENSIDADE C1: Use Phrasal Verbs, Collocations e Idioms reais.
3. FOCO EM UTILIDADE: Se o tema for curioso, dê um giro editorial para torná-lo útil para business/viagens.

ESTRUTURA OBRIGATÓRIA:
# [Título Magnético em Português]
## Quick Answer (Resposta técnica e direta de até 40 palavras)
## Mentoria Estratégica (Use Português para dar o diagnóstico da dor e por que dominar este assunto importa)
## Vocabulary & Key Structures (Advanced) (100% Inglês com notas em PT)
## 3F Training Engine (Frases inéditas para Nível 1, 2 e 3)
## AI Summary & Insights

TAGS SEO (OBRIGATÓRIO NO FIM):
[[DESCRIPTION]]: <Texto magnético>
[[AI_SNIPPET]]: <A mesma Quick Answer>
[[AI_CONTEXT]]: <3 frases conectando à Lexis Academy>`;

      const content = await callOpenAI(env, elitePrompt, "Você é o Diretor de Conteúdo da Lexis. Siga as regras anti-repetição rigorosamente.");

      let smartTitle = article.title;
      const titleMatch = content.match(/^#\s*(.*)/m);
      if (titleMatch) {
        smartTitle = titleMatch[1].replace(/Título:\s*/i, '').trim();
      }

      const audit = await auditPost(env, { title: smartTitle, content: cleanFullContent(content) });

      if (audit.score >= 80) {
        const post = await preparePostObject(article, smartTitle, content, audit);
        await env.LEXIS_REWRITTEN_POSTS.put(`post:${article.id}`, JSON.stringify(post));
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
        rewrittenTitles.push(smartTitle);
        console.log(`[REWRITER] ✅ ELITE APROVADO: ${smartTitle}`);
      } else {
        await env.LEXIS_PUBLISHED_POSTS.put(`rejection_log:${article.id}`, JSON.stringify({ title: article.title, reason: audit.reason, score: audit.score, at: new Date().toISOString() }));
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
      }
    } catch (e) {
      console.error(`[REWRITER] Falha Elite: ${e.message}`);
    }
  }

  let attempts = 0;
  while (rewrittenTitles.length < needed && attempts < 5) {
    attempts++;
    console.log(`[REWRITER] 🤖 Tentativa Fallback ${attempts}/${needed}...`);

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) + attempts;
    const target = getLeoTarget(dayOfYear);

    const leoPrompt = `Você é o Diretor e o Leo (Analista SEO). Crie um GUIA DE AUTORIDADE sobre "${target.topic}".
    
    🚨 ALERTAS DE QUALIDADE:
    - O Auditor Roger rejeita se houver frases repetidas. Crie exemplos novos para cada seção.
    - Foque em adultos e business.
    
    ESTRUTURA:
    # [Título em Português]
    ## Quick Answer
    ## Por que dominar este tema
    ## Vocabulary High-Level
    ## 3F Training Engine
    ## AI Summary
    
    TAGS SEO FINAIS: [[DESCRIPTION]], [[AI_SNIPPET]], [[AI_CONTEXT]].`;

    try {
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{ role: 'user', content: leoPrompt }],
        max_tokens: 2500,
        temperature: 0.3
      });
      const content = response.response || response;
      const audit = await auditPost(env, { title: target.topic, content: cleanFullContent(content) });

      if (audit.score >= 80) {
        const post = await preparePostObject({ id: `leo-${dayOfYear}`, topicKey: target.cluster }, target.topic, content, audit);
        await env.LEXIS_REWRITTEN_POSTS.put(`post:${post.id}`, JSON.stringify(post));
        rewrittenTitles.push(target.topic);
        console.log(`[REWRITER] 🌟 FALLBACK APROVADO: ${target.topic}`);
      }
    } catch (e) {
      console.error(`[REWRITER] Falha Fallback: ${e.message}`);
    }
  }

  await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Produção finalizada. Estoque atual: ${stockSize + rewrittenTitles.length}/5`);
  return { success: rewrittenTitles.length > 0, postsRewritten: rewrittenTitles.length };
}

async function preparePostObject(article, smartTitle, content, audit) {
  const aiSnippet = extractTag('AI_SNIPPET', content);
  const aiContext = extractTag('AI_CONTEXT', content);
  const cleanContent = cleanFullContent(content);

  return {
    id: article.id,
    title: smartTitle,
    date: new Date().toISOString().split('T')[0],
    content: cleanContent,
    description: extractTag('DESCRIPTION', content) || smartTitle,
    slug: smartTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').substring(0, 60),
    lexis_version: "3.0-stockpile",
    audit_score: audit.score,
    audit_reason: audit.reason,
    topicKey: article.topicKey,
    seo: { ai_snippet: aiSnippet, ai_context: aiContext }
  };
}
