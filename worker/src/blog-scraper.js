/**
 * Módulo de Scraping de Blogs Premium
 * Coleta 10-15 artigos/dia de fontes RSS
 */

const RSS_FEEDS = [
  'https://www.bbc.co.uk/learningenglish/english/feed.rss',
  'https://blog.duolingo.com/feed/',
  'https://www.fluentu.com/blog/english/feed/',
  'https://www.ted.com/talks/rss'
];

export async function scrapeBlogArticles(env) {
  const articles = [];
  const errors = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const response = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LexisBot/1.0)' }
      });

      if (!response.ok) {
        errors.push({ feed: feedUrl, error: `HTTP ${response.status}` });
        continue;
      }

      const xml = await response.text();
      const items = parseRSSItems(xml);

      for (const item of items.slice(0, 5)) {
        const article = {
          id: generateId(item.link),
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
          source: extractDomain(feedUrl),
          scrapedAt: new Date().toISOString()
        };

        await env.LEXIS_RAW_ARTICLES.put(
          `article:${article.id}`,
          JSON.stringify(article),
          { expirationTtl: 604800 }
        );

        articles.push(article);
      }
    } catch (error) {
      errors.push({ feed: feedUrl, error: error.message });
    }
  }

  return { success: true, articlesCollected: articles.length, articles, errors };
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');

    if (title && link) items.push({ title, link, description, pubDate });
  }

  return items;
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
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
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
