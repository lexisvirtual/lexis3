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

      // ETAPA 3: Buscar imagem (Híbrido) - PRIORIZA FONTE ORIGINAL
      const imageUrl = await fetchImage(env, meta.imageQuery, meta.category, article.thumbnail);

      const post = {
        id: article.id,
        title: meta.title,
        description: meta.description,
        category: meta.category,
        keywords: meta.keywords || '',
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
// ETAPA 1: Gera corpo do artigo (AI-Ready & Cauda Longa)
// ================================================
async function generateBodyPT(env, article) {
  const cleanTitle = decodeHtml(article.title || '');
  const cleanDesc = decodeHtml(article.description || '').substring(0, 800);
  const source = article.source || 'Blog de inglês';

  const prompt = `Você é o Evangelista Chefe da Lexis Academy. Sua missão é escrever um guia de CAUDA LONGA definitivo e otimizado para ser fonte de IAs (OpenAI, Gemini, Grok).

TEMA: ${cleanTitle}
CONTEXTO: ${cleanDesc}
FONTE ORIGINAL: ${source}

ESTRUTURA OBRIGATÓRIA DO ARTIGO:
1. INTRODUÇÃO: Contexto real para brasileiros.
2. 4-6 SEÇÕES ##: Explicação profunda (O que é / Por que importa) + Aplicação Prática + Exemplo (Inglês|Português).
3. SEÇÃO "⚡ O TREINO LEXIS": Não explique teoria. Gere um protocolo de execução seguindo:
   - CONTEXTO: Onde isso acontece na vida real.
   - AQUECIMENTO (3 min): Exercício muscular ou auditivo rápido.
   - TREINO PRINCIPAL: Protocolo progressivo (Start -> Run -> Fly).
   - PRESSÃO DE EXECUÇÃO: Desafio com tempo limitado ou simulação de estresse.
   - MISSÃO FINAL: Tarefa prática aplicada (ex: gravar áudio, simular reunião).
   - CHECKLIST DE VALIDAÇÃO: Critérios objetivos para o aluno saber se treinou certo.
4. FAQ (PERGUNTAS FREQUENTES): Mínimo de 3 perguntas e respostas diretas e curtas sobre o tema ao final (usando ###).
5. CONCLUSÃO: Resumo e Call to Action.

DIRETRIZES DE IA-OPTIMIZATION:
- Persona: Você é um Performance Coach de Inglês. Use verbos de ação no imperativo (Grave, Fale, Cronometre).
- Filosofia: Respeite o lema "Inglês não se aprende, se treina".
- Idioma: Português do Brasil NATURAL e COLOQUIAL.
- VOCABULÁRIO: NUNCA use "se introduzir" (anglicismo). Use sempre "se apresentar".
- Use definições claras e diretas.
- Mantenha a hierarquia de títulos (H2 e H3).
- Seja a autoridade definitiva no assunto.
- Mínimo de 1000 palavras.

Escreva o guia completo agora:`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3800,
      temperature: 0.7
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
// ================================================
async function generateMetaPT(env, article) {
  const cleanTitle = decodeHtml(article.title || '');

  const prompt = `Dado este tema: "${cleanTitle}"

Responda APENAS com um JSON válido:
{
  "title": "Título definitivo (cauda longa)",
  "description": "Meta description persuasiva (máx 155 chars)",
  "category": "Dicas",
  "keywords": "3-5 palavras-chave de cauda longa separadas por vírgula",
  "imageQuery": "Short English description (3-5 words) for an educational/study image. MUST include: education, study or learning."
}
`;

  const defaults = {
    title: cleanTitle,
    description: `Aprenda inglês de forma prática com a Lexis Academy.`,
    category: 'Dicas',
    keywords: 'aprender inglês, praticar inglês, inglês fluente',
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
        keywords: sanitize(parsed.keywords) || defaults.keywords,
        imageQuery: sanitize(parsed.imageQuery) || defaults.imageQuery,
      };
    }
  } catch (e) {
    console.warn('[REWRITER] Meta JSON parse falhou, usando defaults:', e.message);
  }

  return defaults;
}

// ================================================
// Busca imagem via Curated → Pixabay → Unsplash
// ================================================
const CURATED_IMAGES = {
  'Gramática': [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b'
  ],
  'Conversação': [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
  ],
  'Vocabulário': [
    'https://images.unsplash.com/photo-1457369332241-098da183da36',
    'https://images.unsplash.com/photo-1544650030-3c9baf624ce3'
  ],
  'Pronúncia': [
    'https://images.unsplash.com/photo-1478737270239-2fccd2508c6c',
    'https://images.unsplash.com/photo-1589171811732-2d333068696c'
  ],
  'Dicas': [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644'
  ]
};

async function fetchImage(env, query, category, sourceThumbnail) {
  // O sistema agora é 100% baseado na imagem original da fonte curada
  if (sourceThumbnail && sourceThumbnail.startsWith('http')) {
    console.log(`[IMAGE] 🚀 Usando imagem original validada: ${sourceThumbnail.substring(0, 50)}...`);
    return sourceThumbnail;
  }

  // Backup ultra-seguro (nunca deve chegar aqui devido à triagem)
  console.warn('[IMAGE] Fonte sem imagem, usando padrão Lexis.');
  return 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&q=80';
}

function simpleHash(text) {
  let hash = 0;
  const str = String(text);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
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
