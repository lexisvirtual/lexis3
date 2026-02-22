/**
 * Módulo de Reescrita com Workers AI
 * Estratégia: 2 chamadas de IA separadas (evita falha de JSON)
 *   1ª chamada: gera texto em português (mais confiável)
 *   2ª chamada: gera apenas título/descrição/categoria (JSON pequeno)
 *   3ª chamada: Auditoria de qualidade técnica
 */

import { auditPost } from './content-auditor.js';

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

      // ETAPA 4: Auditoria de Qualidade
      const auditResult = await auditPost(env, { ...post, content });

      if (auditResult.verdict === 'REJEITADO') {
        console.warn(`[REWRITER] 🔴 Post REJEITADO pela auditoria: "${post.title}" | Motivo: ${auditResult.reason}`);
        // Remove da fila triaged para não ficar tentando infinitamente o mesmo erro, ou deixa lá? 
        // Vamos remover para manter o fluxo limpo.
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
        continue;
      }

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

  const prompt = `Você é o Performance Coach da Lexis Academy. Sua missão é ensinar exclusivamente INGLÊS usando Português do Brasil como idioma de instrução.

REGRAS EDITORIAIS INVIOLÁVEIS:
1. FOCO TOTAL: O blog ensina EXCLUSIVAMENTE inglês. NUNCA mencione, ensine ou compare com qualquer outro idioma (alemão, espanhol, etc).
2. ESTRUTURA LINGUÍSTICA: Explicações em Português BR | Exemplos e Exercícios 100% em Inglês.
3. DNA LEXIS: O foco é treino ativo e musculatura linguística, não teoria passiva.

TEMA: ${cleanTitle}
CONTEXTO: ${cleanDesc}

ESTRUTURA OBRIGATÓRIA DO ARTIGO:
1. INTRODUÇÃO: Contexto real para brasileiros (Português).
2. 4-6 SEÇÕES ##: Explicação curta (Português) + Aplicação Prática + Exemplo (Inglês).
3. SEÇÃO "⚡ O TREINO LEXIS": Treinamento REAL DE INGLÊS.
   - **Contexto Real**: Onde o aluno usará este Inglês.
   - **Aquecimento Linguístico (3 min)**: Shadowing de frases curtas em INGLÊS.
   - **Treino Nível 1 (Estrutura Controlada)**: Exercícios de precisão em INGLÊS.
   - **Treino Nível 2 (Produção Guiada)**: Criação de frases em INGLÊS.
   - **Treino Nível 3 (Produção Livre sob Pressão)**: Desafio de fala em INGLÊS.
   - **Missão Final Aplicada**: Tarefa real (ex: "Grave um vídeo em INGLÊS fingindo X").
   - **Checklist de Validação**: Produção obrigatória de 20 frases e 2 min de fala.
   - **Meta de Repetição**: Defina uma meta CONCRETA de 5 a 7 dias seguidos de treino para este tema, explicando que a repetição é o que automatiza a musculatura da fala.

DIRETRIZES DE IA-OPTIMIZATION:
- Persona: Performance Coach. Use imperativos agressivos focados em EXECUÇÃO em INGLÊS.
- NUNCA use "se introduzir" (anglicismo). Use sempre "se apresentar".
- Mínimo de 1200 palavras.

Escreva o guia de treinamento de inglês agora:`;

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

Siga a estratégia de títulos da Lexis Academy:
- Evite "Entendendo X".
- Prefira: "Como usar X em inglês", "Treino prático de X em inglês" ou "Como falar sobre X em inglês".

Responda APENAS com um JSON válido:
{
  "title": "Título de ação em inglês (cauda longa)",
  "description": "Meta description persuasiva (máx 155 chars) ensinando inglês",
  "category": "Dicas",
  "keywords": "3-5 palavras-chave de inglês separadas por vírgula",
  "imageQuery": "English learning education study scene"
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
