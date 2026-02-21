/**
 * Módulo de Triagem Inteligente
 * Scoring: Relevância(30) + Qualidade(25) + Originalidade(25) + Recência(20)
 * Threshold: ≥70 = aprovado
 */

export async function triageArticles(env, limit = 20) {
  const rawArticles = await env.LEXIS_RAW_ARTICLES.list({ prefix: 'article:', limit });
  const triagedArticles = [];
  const rejected = [];

  for (const key of rawArticles.keys) {
    const articleData = await env.LEXIS_RAW_ARTICLES.get(key.name);
    if (!articleData) continue;

    const article = JSON.parse(articleData);
    
    const isDuplicate = await checkDuplicate(env, article.title);
    if (isDuplicate) {
      rejected.push({ ...article, reason: 'duplicate' });
      continue;
    }

    const score = calculateScore(article);

    if (score >= 70) {
      const triagedArticle = {
        ...article,
        score,
        triagedAt: new Date().toISOString(),
        status: 'approved'
      };

      await env.LEXIS_TRIAGED_ARTICLES.put(
        `triaged:${article.id}`,
        JSON.stringify(triagedArticle),
        { expirationTtl: 604800 }
      );

      triagedArticles.push(triagedArticle);
    } else {
      rejected.push({ ...article, score, reason: 'low_score' });
    }
  }

  return { success: true, approved: triagedArticles.length, rejected: rejected.length, articles: triagedArticles };
}

function calculateScore(article) {
  let score = 30; // Base score para artigos de fontes confiáveis

  const englishKeywords = ['english', 'learn', 'grammar', 'vocabulary', 'pronunciation', 'speaking', 'writing', 'language', 'duolingo', 'practice'];
  const titleLower = (article.title || '').toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  
  // Relevância (30 pontos)
  let relevanceScore = 0;
  for (const keyword of englishKeywords) {
    if (titleLower.includes(keyword) || descLower.includes(keyword)) {
      relevanceScore += 3;
      if (relevanceScore >= 30) break;
    }
  }
  score += relevanceScore;

  // Qualidade do título (20 pontos)
  if (article.title) {
    const titleLength = article.title.length;
    if (titleLength >= 20) score += 10;
    if (article.title.includes('?') || article.title.includes(':')) score += 5;
    if (/\d/.test(article.title)) score += 5;
  }

  // Originalidade (10 pontos)
  if (article.description && article.description.length > 50) score += 10;

  // Recência (10 pontos)
  if (article.pubDate) {
    const daysDiff = (new Date() - new Date(article.pubDate)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) score += 10;
    else if (daysDiff <= 90) score += 5;
  }

  return Math.min(score, 100);
}

async function checkDuplicate(env, title) {
  const titleHash = generateHash(title);
  const existing = await env.LEXIS_PUBLISHED_POSTS.get(`title:${titleHash}`);
  return existing !== null;
}

function generateHash(text) {
  let hash = 0;
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
