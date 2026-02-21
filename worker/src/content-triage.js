/**
 * Content Triage Module - Fase 2: Triagem Inteligente
 * Avalia e filtra artigos com scoring automático
 * 
 * Critérios de Triagem:
 * - Relevância para aprendizado de inglês
 * - Originalidade vs histórico
 * - Qualidade do conteúdo
 * - Threshold: score ≥70 = aprovado
 */

/**
 * Função principal de triagem
 * Processa artigos brutos e aprova 30-40% deles
 */
async function triageArticles(env, articles) {
  console.log('🔍 Iniciando triagem de artigos...');
  
  const triaged = [];
  const rejected = [];
  
  try {
    // Obtém histórico de posts publicados para deduplicação
    const publishedHistory = await getPublishedHistory(env);
    
    for (const article of articles) {
      const score = await scoreArticle(article, publishedHistory, env);
      
      if (score >= 70) {
        triaged.push({
          ...article,
          score,
          status: 'approved',
          triageDate: new Date().toISOString()
        });
      } else {
        rejected.push({
          ...article,
          score,
          status: 'rejected',
          reason: getRejectReason(score)
        });
      }
    }
    
    // Armazena artigos triados em KV
    if (triaged.length > 0) {
      const timestamp = new Date().toISOString();
      await env.LEXIS_TRIAGED_ARTICLES.put(
        `batch_${timestamp}`,
        JSON.stringify({
          timestamp,
          approved: triaged.length,
          rejected: rejected.length,
          articles: triaged
        }),
        { expirationTtl: 30 * 24 * 60 * 60 }
      );
    }
    
    console.log(`✅ Triagem concluída: ${triaged.length} aprovados, ${rejected.length} rejeitados`);
    
    return {
      success: true,
      approved: triaged,
      rejected: rejected,
      approvalRate: triaged.length / articles.length
    };
  } catch (error) {
    console.error('❌ Erro na triagem:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcula score de relevância do artigo
 * Máximo: 100 pontos
 */
async function scoreArticle(article, publishedHistory, env) {
  let score = 0;
  
  // 1. Relevância para inglês (30 pontos)
  const englishKeywords = [
    'english', 'pronunciation', 'vocabulary', 'grammar', 'conversation',
    'speaking', 'listening', 'writing', 'reading', 'idiom', 'phrasal verb',
    'accent', 'fluency', 'toefl', 'ielts', 'cambridge', 'oxford'
  ];
  
  const titleLower = article.title.toLowerCase();
  const descLower = article.description.toLowerCase();
  const content = `${titleLower} ${descLower}`;
  
  const relevantKeywords = englishKeywords.filter(kw => content.includes(kw));
  score += Math.min(30, relevantKeywords.length * 5);
  
  // 2. Qualidade do conteúdo (25 pontos)
  // Comprimento mínimo de descrição
  if (article.description && article.description.length > 200) {
    score += 15;
  } else if (article.description && article.description.length > 100) {
    score += 8;
  }
  
  // Fonte confiável
  const trustedSources = ['BBC', 'Cambridge', 'Oxford', 'Duolingo', 'FluentU', 'TED'];
  if (trustedSources.some(source => article.source.includes(source))) {
    score += 10;
  }
  
  // 3. Originalidade (25 pontos)
  const isDuplicate = await checkDuplicate(article, publishedHistory, env);
  if (!isDuplicate) {
    score += 25;
  }
  
  // 4. Recência (20 pontos)
  const pubDate = new Date(article.pubDate);
  const daysSincePub = (new Date() - pubDate) / (1000 * 60 * 60 * 24);
  
  if (daysSincePub < 7) {
    score += 20;
  } else if (daysSincePub < 30) {
    score += 12;
  } else if (daysSincePub < 90) {
    score += 5;
  }
  
  return Math.min(100, score);
}

/**
 * Verifica se artigo é duplicado
 */
async function checkDuplicate(article, publishedHistory, env) {
  const articleTitle = article.title.toLowerCase().trim();
  const articleUrl = article.link.toLowerCase().trim();
  
  // Verifica contra histórico publicado
  for (const published of publishedHistory) {
    const pubTitle = published.title.toLowerCase().trim();
    const pubUrl = published.link.toLowerCase().trim();
    
    // Comparação exata
    if (articleTitle === pubTitle || articleUrl === pubUrl) {
      return true;
    }
    
    // Comparação de similaridade (80%+)
    if (calculateSimilarity(articleTitle, pubTitle) > 0.8) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calcula similaridade entre strings (Levenshtein)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calcula distância de edição (Levenshtein)
 */
function getEditDistance(s1, s2) {
  const costs = [];
  
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  return costs[s2.length];
}

/**
 * Obtém histórico de posts publicados
 */
async function getPublishedHistory(env) {
  try {
    const history = await env.LEXIS_PUBLISHED_POSTS.get('history', 'json');
    return history || [];
  } catch (error) {
    console.warn('Histórico não encontrado, iniciando novo');
    return [];
  }
}

/**
 * Retorna motivo da rejeição baseado no score
 */
function getRejectReason(score) {
  if (score < 30) return 'Baixa relevância para inglês';
  if (score < 50) return 'Conteúdo de qualidade insuficiente';
  if (score < 70) return 'Não atende critérios mínimos';
  return 'Motivo desconhecido';
}

export { triageArticles, scoreArticle, checkDuplicate };
