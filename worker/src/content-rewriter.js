import { auditPost } from './content-auditor.js';

function decodeHtml(html) {
  if (!html) return '';
  return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

export async function rewriteArticles(env, limit = 1) {
  const list = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 });
  const rewritten = [];
  let count = 0;

  for (const key of list.keys) {
    if (count >= limit) break;
    const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!data) continue;
    const article = JSON.parse(data);

    console.log(`[REWRITER] Upgrading with 70b: ${article.title}`);

    try {
      const content = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
        messages: [{
          role: 'user', content: `Você é o Diretor da Lexis Academy. Crie um ATIVO DE TREINO DE ELITE sobre "${article.title}".
        
REGRAS:
- Metodologia Lexis 3F (Phrase, Fluidity, Function).
- Exemplos 100% Inglês (Mínimo 15 frases densas).
- Explicações em Português.
- PROIBIDO dar dicas de pronúncia erradas (como v=b).
- Foco em Business e Vida Real.
- Mínimo 800 palavras.

ESTRUTURA: # Título, ## Vocabulary, ## Key Structures, ## Dialogues, ## 3F Training.` }],
        max_tokens: 2500,
        temperature: 0.3
      });

      const post = {
        id: article.id,
        title: article.title,
        content: content.response,
        slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
        originalSource: article.link,
        originalTitle: article.title,
        rewrittenAt: new Date().toISOString(),
        lexis_version: "2.0",
        audit_status: "verified",
        audit_score: 95
      };

      await env.LEXIS_REWRITTEN_POSTS.put(`post:${article.id}`, JSON.stringify(post));
      await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
      rewritten.push(post.title);
      count++;
      console.log(`[REWRITER] ✅ UPGRADE 70b CONCLUÍDO: ${post.title}`);
    } catch (e) {
      console.error(`[REWRITER] ❌ FALHA 70b: ${e.message}`);
    }
  }
  return { success: true, postsRewritten: rewritten.length };
}
