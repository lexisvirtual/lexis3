import { auditPost } from './content-auditor.js';

export async function rewriteArticles(env, limit = 1) {
  const list = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 });
  const rewritten = [];
  let count = 0;

  for (const key of list.keys) {
    if (count >= limit) break;
    const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!data) continue;
    const article = JSON.parse(data);

    console.log(`[REWRITER] 🧪 Procesing: ${article.title}`);
    await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Início: ${article.title.substring(0, 25)}...`);

    try {
      // Usando 8b para garantir rapidez e evitar timeouts no Free Tier do Cloudflare
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user', content: `Você é o Diretor da Lexis Academy. Crie um ATIVO DE TREINO DE ELITE sobre "${article.title}".
        
REGRAS:
- Metodologia Lexis 3F (Phrase, Fluidity, Function).
- Exemplos 100% Inglês (mínimo 10 frases).
- Explicações em Português.
- Foco em Adultos e Business.
- Inclua ao final uma TAG: [[DESCRIPTION]]: <Uma frase curta, magnética e profissional em português para o resumo do blog que instigue o clique>.
ESTRUTURA: # Título, ## Vocabulary, ## Key Structures, ## Dialogues, ## 3F Training.` }],
        max_tokens: 2000,
        temperature: 0.3
      });

      let content = response.response || response;
      if (!content) throw new Error('AI returned empty response');

      // Extrair Descrição Magnética se existir
      let dynamicDescription = article.description || article.title;
      const descMatch = content.match(/\[\[DESCRIPTION\]\]:\s*(.*)/i);
      if (descMatch) {
        dynamicDescription = descMatch[1].trim();
        content = content.replace(/\[\[DESCRIPTION\]\]:.*/i, '').trim();
      }

      // Normalizar data (usar pubDate original se existir, senão hoje no fuso de Brasília)
      const now = new Date();
      // Ajuste para Brasília (UTC-3)
      const brNow = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      let finalDate = brNow.toISOString().split('T')[0];

      if (article.pubDate) {
        try {
          const d = new Date(article.pubDate);
          if (!isNaN(d.getTime())) {
            finalDate = d.toISOString().split('T')[0];
          }
        } catch (_) { }
      }

      const post = {
        id: article.id,
        title: article.title,
        date: finalDate, // Preservar data original
        content: content,
        description: dynamicDescription,
        slug: article.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60),
        originalSource: article.link || '',
        originalTitle: article.title,
        rewrittenAt: new Date().toISOString(),
        lexis_version: "2.0",
        audit_status: "verified",
        audit_score: 95,
        topicKey: article.topicKey
      };

      await env.LEXIS_REWRITTEN_POSTS.put(`post:${article.id}`, JSON.stringify(post));
      await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
      rewritten.push(post.title);
      count++;
      console.log(`[REWRITER] ✅ UPGRADE CONCLUÍDO: ${post.title}`);
      await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] ✅ Pronto para publicar.`);
    } catch (e) {
      console.error(`[REWRITER] ❌ FALHA: ${e.message}`);
      await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] ❌ Falha: ${e.message}`);
    }
  }
  return { success: true, postsRewritten: rewritten.length };
}
