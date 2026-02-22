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

  // 1. FONTE PREMIUM (50 pontos base)
  // Artigos de fontes curadas já atingem o threshold de aprovação automaticamente
  const source = (article.source || article.sourceDomain || '').toLowerCase();
  const isPremiumSource = PREMIUM_SOURCES.some(s =>
    source.includes(s.toLowerCase())
  );
  if (isPremiumSource) score += 50;
  else score += 10;

  // 2. RELEVÂNCIA (0-30 pontos)
  // Palavras-chave de inglês/aprendizado no título ou descrição
  const titleLower = (article.title || '').toLowerCase();
  const descLower = (article.description || '').toLowerCase();
  const combinedText = titleLower + ' ' + descLower;

  // TRAVA DE SEGURANÇA: Proibir outros idiomas
  for (const forbidden of FORBIDDEN_LANGUAGES) {
    if (combinedText.includes(forbidden)) {
      console.log(`[TRIAGE] 🚫 Rejeitando por idioma proibido: ${forbidden}`);
      return -500; // Garantia de rejeição imediata
    }
  }

  // TRAVA DE SEGURANÇA 2: Proibir conteúdo focado EXCLUSIVAMENTE em gestão de sala de aula/professores
  // Permitimos "teacher" se o foco for aprendizado, mas bloqueamos "classroom management", "coordinators", etc.
  const STRICT_TEACHER_KEYWORDS = ['classroom management', 'lesson plan', 'school leaders', 'coordinators', 'teacher training', 'teaching staff'];
  for (const tk of STRICT_TEACHER_KEYWORDS) {
    if (combinedText.includes(tk)) {
      console.log(`[TRIAGE] 🚫 Rejeitando por foco puramente institucional/gestão: ${tk}`);
      return -100;
    }
  }

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
