/**
 * Módulo de Reescrita com Workers AI
 * Usa Cloudflare Workers AI (sem dependências externas)
 */

export async function rewriteArticles(env, maxPosts = 3) {
  const triagedArticles = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: maxPosts });
  const rewrittenPosts = [];

  for (const key of triagedArticles.keys) {
    const articleData = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!articleData) continue;

    const article = JSON.parse(articleData);

    try {
      const rewrittenContent = await rewriteWithAI(env, article);
      
      const post = {
        id: article.id,
        title: rewrittenContent.title,
        content: rewrittenContent.content,
        category: rewrittenContent.category,
        description: rewrittenContent.description,
        slug: generateSlug(rewrittenContent.title),
        originalSource: article.link,
        originalTitle: article.title,
        rewrittenAt: new Date().toISOString(),
        status: 'ready_to_publish'
      };

      await env.LEXIS_REWRITTEN_POSTS.put(
        `post:${post.id}`,
        JSON.stringify(post),
        { expirationTtl: 604800 }
      );

      rewrittenPosts.push(post);
    } catch (error) {
      console.error('Erro ao reescrever:', error);
    }
  }

  return { success: true, postsRewritten: rewrittenPosts.length, posts: rewrittenPosts };
}

async function rewriteWithAI(env, article) {
  const prompt = `Você é um redator especializado em educação de inglês para brasileiros.

Artigo original:
Título: ${article.title}
Descrição: ${article.description}

Reescreva este artigo em português brasileiro seguindo estas diretrizes:

1. METODOLOGIA LEXIS:
- Use linguagem coloquial e direta
- Foque em prática, não teoria
- Mencione os níveis: Start (iniciante), Run (intermediário), Fly (avançado), Liberty (fluência)
- Enfatize: "Idioma não se aprende. Idioma se treina."

2. ESTRUTURA:
- Título chamativo (40-60 caracteres)
- Introdução engajadora (2-3 parágrafos)
- 3-5 seções com subtítulos
- Conclusão com call-to-action
- Exemplos práticos em inglês e português

3. SEO:
- Inclua naturalmente: "aprender inglês", "estudar inglês", "inglês fluente"
- Use variações: "falar inglês", "inglês online", "curso de inglês"

4. FORMATO:
Retorne APENAS um JSON válido:
{
  "title": "Título otimizado",
  "description": "Meta description (150-160 caracteres)",
  "category": "Gramática|Vocabulário|Pronúncia|Conversação|Dicas",
  "content": "Conteúdo completo em Markdown"
}`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048
    });

    const aiResponse = response.response || '';
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback se AI não retornar JSON
    return {
      title: article.title,
      description: article.description || 'Aprenda inglês de forma prática e eficiente',
      category: 'Dicas',
      content: `# ${article.title}\n\n${article.description}\n\n*Artigo original: [${article.source}](${article.link})*`
    };
  } catch (error) {
    console.error('Erro na IA:', error);
    return {
      title: article.title,
      description: article.description || 'Aprenda inglês',
      category: 'Dicas',
      content: `# ${article.title}\n\n${article.description}`
    };
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}
