function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export async function rewriteArticles(env, limit = 3) {
  const triagedArticles = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit });
  const rewritten = [];

  for (const key of triagedArticles.keys) {
    const articleData = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!articleData) continue;

    let article;
    try {
      article = JSON.parse(articleData);
    } catch (e) {
      continue;
    }

    console.log(`[REWRITER] Processando: ${article.title}`);

    try {
      // ETAPA 1: Gerar o corpo do treino ultra-denso
      const content = await generateBodyPT(env, article);
      if (!content || content.trim().length < 800) {
        console.warn(`[REWRITER] Conteúdo insuficiente para "${article.title}", pulando.`);
        continue;
      }

      // ETAPA 2: Metadados (Título, Descrição, Categoria)
      const meta = await generateMetaPT(env, article);

      const post = {
        id: article.id,
        title: meta.title,
        description: meta.description,
        category: meta.category,
        keywords: meta.keywords || '',
        content,
        slug: generateSlug(meta.title),
        originalSource: article.link,
        originalTitle: article.title,
        rewrittenAt: new Date().toISOString(),
        status: 'ready_to_publish'
      };

      // ETAPA 3: Auditoria de Qualidade
      const auditResult = await auditPost(env, post);

      if (auditResult.verdict === 'APROVADO') {
        await env.LEXIS_REWRITTEN_POSTS.put(
          `post:${article.id}`,
          JSON.stringify({ ...post, auditScore: auditResult.score }),
          { expirationTtl: 604800 }
        );

        // Remover da triagem após processar com sucesso
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
        rewritten.push(post.title);
      } else {
        console.warn(`[REWRITER] Post REJEITADO pelo auditor: ${auditResult.reason}`);
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name); // Descartar para não travar a fila
      }
    } catch (error) {
      console.error(`[REWRITER] Erro ao processar "${article.title}":`, error.message);
    }
  }

  return {
    success: true,
    postsRewritten: rewritten.length,
    details: rewritten
  };
}

// ================================================
// Core: Geração de Conteúdo Metodologia LEXIS 3F
// ================================================
async function generateBodyPT(env, article) {
  const cleanTitle = article.title.replace(/[^\w\s]/gi, '');
  const cleanDesc = decodeHtml(article.description || '').substring(0, 800);

  const prompt = `Você é o Diretor de Conteúdo da Lexis Academy. Sua missão é criar um ATIVO DE TREINO DE INGLÊS. 

REGRAS INVIOLÁVEIS DE IDIOMA:
- INSTRUÇÃO: Português (apenas no "porquê" e explicações rápidas).
- EXECUÇÃO: TUDO o que for exemplo, diálogo, vocabulário ou exercício DEVE estar em 100% INGLÊS. 
- PROIBIDO: NUNCA traduza os exemplos para o português. O aluno deve ler e praticar em inglês.
- ERRO FATAL: Se eu ver uma frase de exemplo em português, você fracassou.

TEMA: ${cleanTitle}
CONTEXTO: ${cleanDesc}

ESTRUTURA:

# ${cleanTitle} (H1)
[Intro motivacional curta em PT-BR]

## 1. STRATEGIC VOCABULARY & CHUNKS (H2)
[Tabela com: Termo em Inglês | Exemplo Real em Inglês (NUNCA em PT) | Uso Prático]

## 2. KEY STRUCTURES & GRAMMAR IN ACTION (H2)
### How to use it like a native (H3)
[Explicação técnica curta em PT-BR]
### Real-world Examples (H3)
[Mínimo de 30 frases de exemplo em 100% INGLÊS. Sem tradução.]

## 3. BRAZILIAN PITFALLS: DON'T MAKE THESE MISTAKES (H2)
[Explique em PT-BR por que brasileiros erram este tema e dê o exemplo CERTO e ERRADO em INGLÊS.]

## 4. REAL-LIFE DIALOGUES (H2)
[Crie 3 diálogos densos em 100% INGLÊS: Business, Travel, Social.]

## 5. ⚡ THE LEXIS TRAINING (3F METHOD) (H2)
### PHASE 1: PHRASE (Structure) (H3)
[Exercícios de substituição e Shadowing com frases em INGLÊS.]
### PHASE 2: FLUIDITY (Muscle Memory) (H3)
[Desafios de repetição de estruturas complexas em INGLÊS.]
### PHASE 3: FUNCTION (Real World) (H3)
[Desafio de fala em INGLÊS sob pressão.]

## 6. STRATEGIC FAQ (SEO) (H2)
[Perguntas em PT-BR, mas RESPOSTAS COM EXEMPLOS EM INGLÊS.]

DIRETRIZES:
- Mínimo de 1500 palavras.
- Use Inglês Intermediário/Avançado (B2+).
- Se o post tiver mais português do que inglês nos exemplos, ele será deletado.

Escreva o ativo de treinamento agora:`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3500,
      temperature: 0.4 // Baixando a temperatura para mais precisão
    });

    return response.response;
  } catch (e) {
    console.error('[AI] Erro ao gerar conteúdo:', e.message);
    return null;
  }
}

// ================================================
// Geração de Metadados Otimizados para SEO
// ================================================
async function generateMetaPT(env, article) {
  const prompt = `Crie metadados SEO para este artigo de inglês.
Título Original: ${article.title}
Descrição: ${article.description}

Responda APENAS JSON:
{
  "title": "Título focado em 'Como fazer X em inglês'",
  "description": "Meta description de 150 caracteres para Google",
  "category": "Vocabulário, Dicas, Business ou Gramática",
  "keywords": "3-5 palavras-chave",
  "imageQuery": "Termo de busca para imagem vetorial (em inglês)"
}`;

  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    });

    const text = response.response;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
  } catch (e) {
    return {
      title: article.title,
      description: article.description?.substring(0, 150),
      category: 'Dicas',
      imageQuery: article.title
    };
  }
}

// ================================================
// Auditoria de Qualidade (Delegada para o Fiscal)
// ================================================
import { auditPost } from './content-auditor.js';

function generateSlug(title) {
  return String(title || 'post')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}
