/**
 * Blog Scraper Module - Fase 1: Infraestrutura de Scraping
 * Coleta artigos de blogs premium de educação em inglês
 * 
 * Fontes:
 * - BBC Learning English
 * - Duolingo Blog
 * - Cambridge English
 * - Oxford English
 * - FluentU Blog
 * - English Learning for Curious Minds
 * - TED-Ed Blog
 */

// Configuração de fontes RSS
const RSS_FEEDS = [
  {
    name: 'BBC Learning English',
    url: 'https://www.bbc.com/learning/english/feed.xml',
    category: 'Pronúncia e Vocabulário'
  },
  {
    name: 'Duolingo Blog',
    url: 'https://blog.duolingo.com/feed/',
    category: 'Dicas de Aprendizado'
  },
  {
    name: 'Cambridge English',
    url: 'https://www.cambridgeenglish.org/feed/',
    category: 'Exames e Certificações'
  },
  {
    name: 'FluentU Blog',
    url: 'https://www.fluentu.com/blog/english/feed/',
    category: 'Conversação'
  },
  {
    name: 'TED-Ed Blog',
    url: 'https://blog.ted.com/feed/',
    category: 'Educação'
  }
];

/**
 * Função principal de scraping
 * Coleta 10-15 artigos por dia de múltiplas fontes
 */
async function scrapeBlogArticles(env) {
  console.log('🔄 Iniciando scraping de artigos...');
  
  const articles = [];
  const timestamp = new Date().toISOString();
  
  try {
    // Coleta de cada fonte RSS
    for (const feed of RSS_FEEDS) {
      try {
        const feedArticles = await fetchRSSFeed(feed.url, feed.name, feed.category);
        articles.push(...feedArticles);
      } catch (error) {
        console.error(`❌ Erro ao coletar de ${feed.name}:`, error.message);
      }
    }
    
    // Limita a 10-15 artigos por dia
    const selectedArticles = articles.slice(0, 15);
    
    // Armazena em KV
    if (selectedArticles.length > 0) {
      await env.LEXIS_RAW_ARTICLES.put(
        `batch_${timestamp}`,
        JSON.stringify({
          timestamp,
          count: selectedArticles.length,
          articles: selectedArticles
        }),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 dias
      );
      
      console.log(`✅ ${selectedArticles.length} artigos coletados e armazenados`);
      return {
        success: true,
        count: selectedArticles.length,
        articles: selectedArticles
      };
    } else {
      console.warn('⚠️ Nenhum artigo coletado');
      return { success: false, count: 0 };
    }
  } catch (error) {
    console.error('❌ Erro geral no scraping:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Busca e processa feed RSS
 */
async function fetchRSSFeed(feedUrl, sourceName, category) {
  try {
    const response = await fetch(feedUrl);
    const text = await response.text();
    
    // Parse XML simples (pode ser melhorado com biblioteca XML)
    const articles = parseRSSXML(text, sourceName, category);
    return articles;
  } catch (error) {
    console.error(`Erro ao buscar ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Parse básico de XML RSS
 */
function parseRSSXML(xmlText, sourceName, category) {
  const articles = [];
  
  // Regex para extrair items do RSS
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    
    // Extrai campos principais
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemXml);
    const descriptionMatch = /<description>([\s\S]*?)<\/description>/.exec(itemXml);
    const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemXml);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemXml);
    
    if (titleMatch && linkMatch) {
      articles.push({
        title: cleanHTML(titleMatch[1]),
        description: cleanHTML(descriptionMatch ? descriptionMatch[1] : ''),
        link: linkMatch[1].trim(),
        source: sourceName,
        category: category,
        pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
        collectedAt: new Date().toISOString(),
        status: 'raw'
      });
    }
  }
  
  return articles;
}

/**
 * Remove tags HTML e CDATA
 */
function cleanHTML(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Exporta funções para uso no worker
 */
export { scrapeBlogArticles, fetchRSSFeed, parseRSSXML };
