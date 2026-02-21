/**
 * Módulo de Reescrita com Workers AI
 * Estratégia: 2 chamadas de IA separadas (evita falha de JSON)
 *   1ª chamada: gera texto em português (mais confiável)
 *   2ª chamada: gera apenas título/descrição/categoria (JSON pequeno)
 */

export async function rewriteArticles(env, maxPosts = 3) {
  const triagedList = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: maxPosts });
  const rewrittenPosts = [];

  for (const key of triagedList.keys) {
    const rawData = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!rawData) continue;

    let article;
    try {
      article = JSON.parse(rawData);
    } catch (e) {
      continue;
    }

    try {
      console.log(`[REWRITER] Processando: "${article.title}"`);

      // ETAPA 1: Gerar o corpo do artigo em português
      const content = await generateBodyPT(env, article);
      if (!content || content.trim().length < 300) {
        console.warn(`[REWRITER] Conteúdo muito curto para "${article.title}", pulando.`);
        continue;
      }

      // ETAPA 2: Gerar metadados (título PT, descrição, categoria) — JSON pequeno = mais confiável
      const meta = await generateMetaPT(env, article);

      // ETAPA 3: Buscar imagem
      const imageUrl = await fetchImage(env, meta.imageQuery);

      const post = {
        id: article.id,
        title: meta.title,
        description: meta.description,
        category: meta.category,
        content,
        slug: generateSlug(meta.title),
        image: imageUrl,
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

      // Remove da fila triaged
      await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);

      rewrittenPosts.push(post);
      console.log(`[REWRITER] ✅ "${post.title}" (${post.category}) — ${content.length} chars`);

    } catch (error) {
      console.error(`[REWRITER] ❌ Erro em "${article.title}": ${error.message}`);
    }
  }

  return {
    success: true,
    postsRewritten: rewrittenPosts.length,
    posts: rewrittenPosts
  };
}

// ================================================
// ETAPA 1: Gera corpo do artigo em português
// Prompt simples de texto puro = Llama é muito mais confiável
// ================================================
async function generateBodyPT(env, article) {
  const cleanTitle = decodeHtml(article.title || '');
  const cleanDesc = decodeHtml(article.description || '').substring(0, 600);
  const source = article.source || 'Blog de inglês';

  const prompt = `Você é redator da Lexis Academy, escola de inglês brasileira com a filosofia: "Idioma não se aprende. Idioma se treina."

Artigo original (em inglês):
Título: ${cleanTitle}
Resumo: ${cleanDesc}
Fonte: ${source}

Escreva um artigo completo em PORTUGUÊS BRASILEIRO sobre este tema para o blog da Lexis Academy.

REGRAS OBRIGATÓRIAS:
- Escrita coloquial, direta, sem academicismo
- Mínimo de 600 palavras de conteúdo real
- Use ## para subtítulos (mínimo 3 subtítulos)
- Inclua exemplos práticos de frases em inglês com tradução
- Mencione os níveis: Start, Run, Fly, Liberty
- Termine com chamada para ação: "Treine inglês com a Lexis Academy"
- Inclua naturalmente: "aprender inglês", "praticar inglês", "inglês fluente"
- NÃO escreva em inglês. Todo o texto deve ser em português do Brasil.
- NÃO inclua JSON, frontmatter ou metadados. Apenas o texto do artigo em Markdown.

Escreva o artigo agora:`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000
    });

    let text = (response.response || '').trim();

    // Remove qualquer JSON que a IA inserir por engano
    text = text.replace(/```json[\s\S]*?```/gi, '');
    text = text.replace(/```[\s\S]*?```/g, match => {
      // mantém blocos de código que não são JSON
      return match.includes('{') ? '' : match;
    });
    text = text.replace(/"image_search_query"[^\n]*/gi, '');
    text = text.replace(/\{[\s\S]*?\}/g, ''); // Remove qualquer JSON inline
    text = decodeHtml(text).trim();

    return text;
  } catch (e) {
    console.error('[REWRITER] Erro IA corpo:', e.message);
    return null;
  }
}

// ================================================
// ETAPA 2: Gera metadados em JSON pequeno
// JSON menor = muito mais confiável de parsear
// ================================================
async function generateMetaPT(env, article) {
  const cleanTitle = decodeHtml(article.title || '');
  const cleanDesc = decodeHtml(article.description || '').substring(0, 200);

  const prompt = `Dado este artigo de inglês:
Título original: ${cleanTitle}
Resumo: ${cleanDesc}

Responda APENAS com um JSON válido (sem texto antes ou depois):
{
  "title": "Título em português chamativo para blog (máx 70 chars, pode ter números)",
  "description": "Frase persuasiva em português para Google (máx 150 chars)",
  "category": "Dicas",
  "imageQuery": "english language learning photo description in english (3-5 words)"
}

Categorias válidas: Gramática, Vocabulário, Pronúncia, Conversação, Dicas
O título DEVE ser em português do Brasil.`;

  const defaults = {
    title: cleanTitle, // fallback: título original
    description: `Aprenda inglês de forma prática com a Lexis Academy.`,
    category: 'Dicas',
    imageQuery: 'english learning books study education'
  };

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 256
    });

    const text = (response.response || '').trim();

    // Extrair JSON da resposta
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      return {
        title: sanitize(parsed.title) || defaults.title,
        description: sanitize(parsed.description) || defaults.description,
        category: validateCategory(parsed.category),
        imageQuery: sanitize(parsed.imageQuery) || defaults.imageQuery,
      };
    }
  } catch (e) {
    console.warn('[REWRITER] Meta JSON parse falhou, usando defaults:', e.message);
  }

  return defaults;
}

// ================================================
// Busca imagem via Pixabay → Unsplash → Fallback
// ================================================
async function fetchImage(env, query) {
  const q = String(query || 'english learning education study').substring(0, 100);

  // Pixabay
  if (env.PIXABAY_API_KEY) {
    try {
      const url = `https://pixabay.com/api/?key=${env.PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&per_page=20&safesearch=true&min_width=800`;
      const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (res.ok) {
        const data = await res.json();
        if (data.hits && data.hits.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(data.hits.length, 10));
          const imgUrl = data.hits[idx].largeImageURL;
          console.log(`[IMAGE] ✅ Pixabay: ${imgUrl.substring(0, 60)}...`);
          return imgUrl;
        }
      }
    } catch (e) {
      console.warn(`[IMAGE] Pixabay falhou: ${e.message}`);
    }
  }

  // Unsplash
  if (env.UNSPLASH_ACCESS_KEY) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&client_id=${env.UNSPLASH_ACCESS_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(data.results.length, 10));
          const imgUrl = data.results[idx].urls.regular;
          console.log(`[IMAGE] ✅ Unsplash: ${imgUrl.substring(0, 60)}...`);
          return imgUrl;
        }
      }
    } catch (e) {
      console.warn(`[IMAGE] Unsplash falhou: ${e.message}`);
    }
  }

  // Fallback permanente do Pixabay (sem chave, mas funciona)
  console.warn('[IMAGE] Usando imagem default genérica.');
  return 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&q=80';
}

// ================================================
// Utilitários
// ================================================
function validateCategory(cat) {
  const valid = ['Gramática', 'Vocabulário', 'Pronúncia', 'Conversação', 'Dicas'];
  const norm = String(cat || '').trim();
  return valid.find(v => v.toLowerCase() === norm.toLowerCase()) || 'Dicas';
}

function sanitize(text) {
  if (!text) return '';
  return decodeHtml(String(text))
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(text) {
  return String(text || '')
    .replace(/&#8230;/g, '...')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/â€™/g, "'").replace(/â€œ/g, '"')
    .replace(/â€/g, '"').replace(/â€"/g, '–')
    .replace(/Ã©/g, 'é').replace(/Ã¡/g, 'á')
    .replace(/Ã£/g, 'ã').replace(/Ãª/g, 'ê')
    .replace(/Ã§/g, 'ç').replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó').replace(/Ãµ/g, 'õ')
    .replace(/Ãº/g, 'ú').replace(/Ã‰/g, 'É')
    .replace(/Ã‡/g, 'Ç').replace(/Ã"/g, 'Ó');
}

function generateSlug(title) {
  return String(title || 'post')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}
