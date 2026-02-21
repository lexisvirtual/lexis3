/**
 * Módulo de Triagem Inteligente
 * Scoring calibrado para fontes premium de ensino de idiomas
 * Aprovação esperada: 30-60% dos artigos coletados
 * Threshold: score >= 50 (reduzido de 70, pois fontes já são premium)
 */

const PREMIUM_SOURCES = [
  'BBC Learning English', 'Duolingo', 'FluentU', 'TED',
  'Cambridge', 'British Council', 'Merriam-Webster',
  'bbc.co.uk', 'duolingo.com', 'fluentu.com', 'ted.com',
  'cambridge.org', 'britishcouncil.org'
];

// Keywords relacionadas a inglês, aprendizado e idiomas
const RELEVANT_KEYWORDS = [
  'english', 'language', 'learn', 'learning', 'grammar',
  'vocabulary', 'pronunciation', 'speaking', 'writing',
  'listening', 'reading', 'fluent', 'fluency', 'practice',
  'study', 'skill', 'word', 'phrase', 'sentence', 'tip',
  'mistake', 'improve', 'native', 'accent', 'culture',
  'communication', 'conversation', 'teach', 'teacher',
  'student', 'course', 'lesson', 'quiz', 'test', 'exam',
  'bilingual', 'multilingual', 'travel', 'abroad',
  'brain', 'memory', 'habit', 'routine', 'daily', 'app',
  'duolingo', 'cambridge', 'ielts', 'toefl', 'toeic',
  'ted', 'talk', 'lecture', 'podcast', 'video'
];

// Threshold reduzido: fontes já são premium, não precisa de 70+
const APPROVAL_THRESHOLD = 50;

export async function triageArticles(env, limit = 30) {
  const rawArticles = await env.LEXIS_RAW_ARTICLES.list({ prefix: 'article:', limit });
  const approved = [];
  const rejected = [];

  for (const key of rawArticles.keys) {
    const articleData = await env.LEXIS_RAW_ARTICLES.get(key.name);
    if (!articleData) continue;

    let article;
    try {
      article = JSON.parse(articleData);
    } catch (e) {
      continue;
    }

    // Verificar duplicata contra posts já publicados
    if (article.title) {
      const isDuplicate = await checkDuplicate(env, article.title);
      if (isDuplicate) {
        rejected.push({ title: article.title, reason: 'duplicate' });
        continue;
      }
    }

    // Calcular score
    const score = calculateScore(article);

    if (score >= APPROVAL_THRESHOLD) {
      const triagedArticle = {
        ...article,
        score,
        triagedAt: new Date().toISOString(),
        status: 'approved'
      };

      await env.LEXIS_TRIAGED_ARTICLES.put(
        `triaged:${article.id}`,
        JSON.stringify(triagedArticle),
        { expirationTtl: 604800 } // 7 dias
      );

      approved.push({ title: article.title, score, source: article.source });
    } else {
      rejected.push({ title: article.title, score, reason: 'low_score' });
    }
  }

  console.log(`[TRIAGE] ${approved.length} aprovados / ${rejected.length} rejeitados (threshold: ${APPROVAL_THRESHOLD})`);

  return {
    success: true,
    approved: approved.length,
    rejected: rejected.length,
    threshold: APPROVAL_THRESHOLD,
    details: { approved, rejected }
  };
}

// ================================================
// Algoritmo de Scoring
// ================================================
function calculateScore(article) {
  let score = 0;

  // 1. FONTE PREMIUM (40 pontos base)
  // Artigos de fontes curadas já têm alta qualidade garantida
  const source = (article.source || article.sourceDomain || '').toLowerCase();
  const isPremiumSource = PREMIUM_SOURCES.some(s =>
    source.includes(s.toLowerCase())
  );
  if (isPremiumSource) score += 40;
  else score += 10; // Fonte desconhecida: pontuação mínima

  // 2. RELEVÂNCIA (0-30 pontos)
  // Palavras-chave de inglês/aprendizado no título ou descrição
  const titleLower = (article.title || '').toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const combinedText = titleLower + ' ' + descLower;

  let relevanceScore = 0;
  let keywordsFound = 0;
  for (const keyword of RELEVANT_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      keywordsFound++;
      relevanceScore += 5;
      if (relevanceScore >= 30) break;
    }
  }
  score += Math.min(relevanceScore, 30);

  // 3. QUALIDADE DO TÍTULO (0-15 pontos)
  if (article.title) {
    const titleLen = article.title.length;
    if (titleLen >= 15 && titleLen <= 100) score += 8; // Tamanho ideal
    if (article.title.includes('?')) score += 3;       // Pergunta = engajamento
    if (article.title.includes(':')) score += 2;       // Dois pontos = estrutura
    if (/\d/.test(article.title)) score += 2;          // Número = lista/ranking
  }

  // 4. RECÊNCIA (0-10 pontos)
  if (article.pubDate) {
    try {
      const daysDiff = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 7) score += 10;  // Última semana
      else if (daysDiff <= 30) score += 7;  // Último mês
      else if (daysDiff <= 90) score += 4;  // Último trimestre
    } catch (_) {
      score += 5; // Data inválida: pontuação média
    }
  } else {
    score += 5; // Sem data: pontuação média
  }

  // 5. TEM DESCRIÇÃO (0-5 pontos)
  if (article.description && article.description.length > 30) score += 5;

  return Math.min(score, 100);
}

// ================================================
// Verificação de duplicata por hash do título
// ================================================
async function checkDuplicate(env, title) {
  const hash = simpleHash(title);
  const existing = await env.LEXIS_PUBLISHED_POSTS.get(`title:${hash}`);
  return existing !== null;
}

function simpleHash(text) {
  let hash = 0;
  const normalized = String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
