/**
 * Módulo de Triagem Inteligente
 * Scoring calibrado para fontes premium de ensino de idiomas
 * Aprovação esperada: 30-60% dos artigos coletados
 * Threshold: score >= 50 (reduzido de 70, pois fontes já são premium)
 */

const PREMIUM_SOURCES = [
  'BBC 6-Minute English', 'VOA Learning English', 'News in Levels',
  'EnglishClass101', 'Real English Conversations', 'English in Brazil',
  'EngFluent', 'Deep English', 'TED-Ed Lessons', 'British Council LearnEnglish'
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

// Blacklist de temas chatos, irrelevantes ou "filler" (enchimento de linguiça)
const IRRELEVANT_TOPICS = [
  'diamond', 'insurance', 'billionaire', 'bunker', 'scuba', 'artistic swimming',
  'luxury', 'jewel', 'celeb', 'gossip', 'wedding ring', 'engagement', 'insurance policy'
];

// Keywords de Alta Utilidade (Brasileiro em busca de performance)
const HIGH_UTILITY_KEYWORDS = [
  'business', 'meeting', 'interview', 'work', 'corporate', 'travel', 'airport',
  'restaurant', 'shopping', 'negotiation', 'email', 'presentation', 'socializing',
  'phrasal verbs', 'idioms', 'common mistakes', 'fluency', 'pronunciation tips'
];

// Blacklist de idiomas proibidos (Lexis é EXCLUSIVA para Inglês)
const FORBIDDEN_LANGUAGES = [
  'alemão', 'german', 'deutsch', 'espanhol', 'spanish', 'español',
  'francês', 'french', 'français', 'italiano', 'italian', 'mandarim',
  'mandarin', 'japonês', 'japanese', 'russo', 'russian', 'árabe', 'arabic'
];

// Threshold reduzido: fontes já são premium, não precisa de 70+
const APPROVAL_THRESHOLD = 50;

export async function triageArticles(env, limit = 30) {
  const rawArticles = await env.LEXIS_RAW_ARTICLES.list({ prefix: 'article:', limit });
  const approved = [];
  const rejected = [];
  const processedLinks = new Set();
  const processedTitles = new Set();

  for (const key of rawArticles.keys) {
    const articleData = await env.LEXIS_RAW_ARTICLES.get(key.name);
    if (!articleData) continue;

    let article;
    try {
      article = JSON.parse(articleData);
    } catch (e) {
      continue;
    }

    // 1. REQUISITO OBRIGATÓRIO (Removido: agora temos IA Arte como fallback)
    if (!article.title) {
      rejected.push({ title: 'sem-titulo', reason: 'no_title' });
      continue;
    }

    // 2. Verificar duplicata contra posts já publicados (Link ou Título Normalizado)
    if (article.link || article.title) {
      const linkH = article.link ? simpleHash(article.link) : null;
      const titleH = article.title ? simpleHash(article.title) : null;

      // Check against current batch
      if ((linkH && processedLinks.has(linkH)) || (titleH && processedTitles.has(titleH))) {
        rejected.push({ title: article.title, reason: 'duplicate_in_batch' });
        continue;
      }

      // Check against history
      const isDuplicate = await checkDuplicate(env, article.title, article.link);
      if (isDuplicate) {
        rejected.push({ title: article.title, reason: 'duplicate' });
        continue;
      }

      // Add to current batch trackers
      if (linkH) processedLinks.add(linkH);
      if (titleH) processedTitles.add(titleH);
    }

    // 3. Calcular score
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
  const titleLower = (article.title || '').toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const combinedText = titleLower + ' ' + descLower;

  // 1. TRAVAS DE SEGURANÇA (Filtros Críticos)

  // Idiomas Proibidos
  for (const forbidden of FORBIDDEN_LANGUAGES) {
    if (combinedText.includes(forbidden)) return -500;
  }

  // Temas Irrelevantes/Filler (Seguros, Luxo, Fofoca)
  for (const topic of IRRELEVANT_TOPICS) {
    if (combinedText.includes(topic)) {
      console.log(`[TRIAGE] 🚫 Penalizando tema irrelevante: ${topic}`);
      score -= 50;
    }
  }

  // Conteúdo B2B/Gestão pura (para professores)
  const STRICT_TEACHER_KEYWORDS = ['classroom management', 'lesson plan', 'school leaders', 'coordinators', 'teacher training', 'teaching staff'];
  for (const tk of STRICT_TEACHER_KEYWORDS) {
    if (combinedText.includes(tk)) return -100;
  }

  // 2. PESOS POSITIVOS

  // FONTE PREMIUM (40 pontos base)
  const source = (article.source || article.sourceDomain || '').toLowerCase();
  const isPremiumSource = PREMIUM_SOURCES.some(s => source.includes(s.toLowerCase()));
  if (isPremiumSource) score += 40;

  // RELEVÂNCIA DE ALTA UTILIDADE (Ex: Business, Travel, Job Interview)
  for (const keyword of HIGH_UTILITY_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      score += 20; // Bônus pesado para temas importantes
      break;
    }
  }

  // Keywords Gerais de Inglês
  let keywordsFound = 0;
  for (const keyword of RELEVANT_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      keywordsFound++;
      score += 5;
      if (score >= 100) break;
    }
  }

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
// ================================================
// Verificação de duplicata por hash do título e link
// ================================================
async function checkDuplicate(env, title, link) {
  // 1. Checar Link (Deduplicação absoluta)
  if (link) {
    const linkHash = simpleHash(link);
    const existingLink = await env.LEXIS_PUBLISHED_POSTS.get(`link:${linkHash}`);
    if (existingLink) return true;
  }

  // 2. Checar Título Normalizado (Deduplicação semântica/preposições)
  const hash = simpleHash(title);
  const existingTitle = await env.LEXIS_PUBLISHED_POSTS.get(`title:${hash}`);
  return existingTitle !== null;
}

function simpleHash(text) {
  let hash = 0;
  // Normalização agressiva: lowercase, remove acentos, remove pontuação
  // E remove preposições/artigos comuns (de, da, do, em, na, no, a, o, as, os, para, com)
  const stopwords = /\b(de|da|do|em|na|no|a|o|as|os|para|com|um|uma|nas|nos|pelo|pela|dos|das)\b/gi;

  const normalized = String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(stopwords, '') // Remove conectores
    .replace(/[^a-z0-9]/g, ''); // Remove todo o resto (espaços, pontuação)

  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
