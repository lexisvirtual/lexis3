/**
 * Módulo de Scraping de Blogs Premium
 * Coleta 10-15 artigos/dia de fontes RSS
 */

const RSS_FEEDS = [
  // BBC Learning English - feed alternativo
  { url: 'https://www.bbc.co.uk/learningenglish/english/topics/rss.xml', name: 'BBC Learning English' },
  // Duolingo Blog
  { url: 'https://blog.duolingo.com/feed/', name: 'Duolingo' },
  // FluentU English Blog
  { url: 'https://www.fluentu.com/blog/english/feed/', name: 'FluentU' },
  // TED Blog (aprendizado e linguagem)
  { url: 'https://www.ted.com/talks/rss', name: 'TED' },
  // Cambridge English Blog
  { url: 'https://www.cambridge.org/elt/blog/feed/', name: 'Cambridge' },
  // British Council Blog
  { url: 'https://www.britishcouncil.org/voices-magazine/feed', name: 'British Council' },
];

export async function scrapeBlogArticles(env) {
  const articles = [];
  const feedResults = [];
  const errors = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LexisBot/2.0; +https://lexis.academy)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        // timeout via signal
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        errors.push(`${feed.name} feed error: HTTP ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const items = parseRSSItems(xml);

      let count = 0;
      for (const item of items.slice(0, 5)) {
        const article = {
          id: generateId(item.link || item.title),
          title: cleanText(item.title),
          link: item.link,
          description: cleanText(item.description),
          pubDate: item.pubDate,
          source: feed.name,
          sourceDomain: extractDomain(feed.url),
          scrapedAt: new Date().toISOString()
        };

        if (!article.title) continue;

        await env.LEXIS_RAW_ARTICLES.put(
          `article:${article.id}`,
          JSON.stringify(article),
          { expirationTtl: 604800 } // 7 dias
        );

        articles.push(article);
        count++;
      }

      feedResults.push({ name: feed.name, count });

    } catch (error) {
      errors.push(`${feed.name} feed error: ${error.message}`);
      console.warn(`[SCRAPER] Erro em ${feed.name}: ${error.message}`);
    }
  }

  console.log(`[SCRAPER] Total coletado: ${articles.length} artigos de ${feedResults.length} fontes`);

  return {
    success: true,
    articlesCollected: articles.length,
    feedResults,
    errors
  };
}

// ================================================
// Parser RSS genérico (suporta RSS 2.0 e Atom)
// ================================================
function parseRSSItems(xml) {
  const items = [];

  // RSS 2.0: <item>
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link') || extractAttrFromTag(itemXml, 'link', 'href');
    const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary') || extractTag(itemXml, 'content:encoded');
    const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'updated');

    if (title || link) {
      items.push({ title, link, description, pubDate });
    }
  }

  // Atom: <entry> (se não achou items RSS)
  if (items.length === 0) {
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      const title = extractTag(entryXml, 'title');
      const link = extractAttrFromTag(entryXml, 'link', 'href') || extractTag(entryXml, 'id');
      const description = extractTag(entryXml, 'summary') || extractTag(entryXml, 'content');
      const pubDate = extractTag(entryXml, 'published') || extractTag(entryXml, 'updated');

      if (title || link) {
        items.push({ title, link, description, pubDate });
      }
    }
  }

  return items;
}

function extractTag(xml, tagName) {
  // CDATA
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Normal
  const normalRegex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const normalMatch = xml.match(normalRegex);
  if (normalMatch) return normalMatch[1].trim();

  return '';
}

function extractAttrFromTag(xml, tagName, attr) {
  const regex = new RegExp(`<${tagName}[^>]+${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function generateId(text) {
  let hash = 0;
  const str = String(text || Date.now());
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
