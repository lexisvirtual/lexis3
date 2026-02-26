import { auditPost } from './content-auditor.js';
import { callGemini, extractTag, cleanFullContent, callOpenAI } from './multi-model.js';
import { getTemaDoAno } from './temas365.js';
import { getLeoTarget } from './leo-strategy.js';

/**
 * Prompt Mestre do Diretor (Versão Elite 3.1)
 * Focado em Performance Executiva e Regras Anti-Rejeição.
 */
const GET_DIRECTOR_PROMPT = (topic, feedback = null, previousContent = null) => {
  let basePrompt = `Você é o Diretor de Conteúdo da Lexis Academy. Sua missão é transformar o tema "${topic}" em um WORKSHOP DE ALTA PERFORMANCE para executivos e adultos que não têm tempo a perder.

DNA LEXIS: "Inglês não se aprende, se treina." Nosso conteúdo é um ATIVO DE TREINO, não um artigo passivo.

🚨 REGRAS DE OURO (Siga ou será demitido pelo Auditor):
1. ZERO REPETIÇÃO: Nunca use o mesmo exemplo ou frase em duas seções diferentes. Se usou no Vocabulário, crie algo novo para o Treino 3F.
2. MÚSCULO LINGUÍSTICO (C1): Use Phrasal Verbs, Collocations e Idioms reais. Fuja do inglês básico.
3. ESTRUTURA METODOLÓGICA (Obrigatória):
   # [Headline Magnética em PT]
   ## Quick Answer (Resposta direta de até 40 palavras)
   ## Mentoria (Diagnóstico da dor e importância estratégica em PT)
   ## Vocabulary & Key Structures (Advanced) (Inglês de alto nível com notas curtas em PT)
   ## 3F Training Engine (Três níveis de exercícios com frases INÉDITAS)
   ## AI Summary & Insights (Conclusão técnica)

TAGS SEO (NO FIM): [[DESCRIPTION]], [[AI_SNIPPET]], [[AI_CONTEXT]].`;

  if (feedback && previousContent) {
    return `${basePrompt}

⚠️ SEU POST ANTERIOR FOI REJEITADO PELO AUDITOR ROGER!
Motivo do Veto: "${feedback}"

CONTEÚDO ANTERIOR PARA REFERÊCIA:
${previousContent.substring(0, 2000)}

SUA TAREFA AGORA: Reescreva o post corrigindo EXATAMENTE os pontos criticados. Melhore a densidade, elimine repetições e suba o nível do inglês. Não jogue tudo fora, aproveite o que estava bom, mas garanta que a parte criticada seja agora impecável.`;
  }

  return basePrompt;
};

export async function rewriteArticles(env, limit = 5) {
  const currentRewritten = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 50 });
  const stockSize = currentRewritten.keys.length;

  if (stockSize >= limit) {
    console.log(`[REWRITER] 📦 Estoque cheio (${stockSize}/5).`);
    return { success: true, postsRewritten: 0, stock: stockSize };
  }

  const needed = limit - stockSize;
  const rewrittenTitles = [];
  const triagedList = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 10 });

  // 1. Processar artigos da triagem
  for (const key of triagedList.keys) {
    if (rewrittenTitles.length >= needed) break;

    const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!data) continue;
    const article = JSON.parse(data);

    const success = await processWithFeedback(env, article.title, article, key.name, rewrittenTitles);
    if (success) {
      await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
    }
  }

  // 2. Fallback com temas do Leo se ainda faltar
  let attempts = 0;
  while (rewrittenTitles.length < needed && attempts < 5) {
    attempts++;
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) + attempts;
    const target = getLeoTarget(dayOfYear);

    await processWithFeedback(env, target.topic, { id: `leo-${dayOfYear}`, topicKey: target.cluster }, null, rewrittenTitles);
  }

  await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Finalizado. Estoque: ${stockSize + rewrittenTitles.length}/5`);
  return { success: rewrittenTitles.length > 0, postsRewritten: rewrittenTitles.length };
}

/**
 * Lógica de Feedback: Diretor -> Auditor -> Diretor (se necessário) -> Auditor
 */
async function processWithFeedback(env, topic, meta, kvKey, successList) {
  try {
    // TENTATIVA 1
    let prompt = GET_DIRECTOR_PROMPT(topic);
    let content = await callOpenAI(env, prompt, "Você é o Diretor de Elite da Lexis.");
    let audit = await auditPost(env, { title: topic, content: cleanFullContent(content) });

    // CICLO DE FEEDBACK (Se nota entre 60 e 79, permite 1 ajuste)
    if (audit.score >= 60 && audit.score < 80) {
      console.log(`[REWRITER] 🔄 Feedback Loop: Roger deu nota ${audit.score}. Solicitando correção...`);
      prompt = GET_DIRECTOR_PROMPT(topic, audit.reason, content);
      content = await callOpenAI(env, prompt, "Corrija o post seguindo o feedback do Auditor.");
      audit = await auditPost(env, { title: topic, content: cleanFullContent(content) });
    }

    if (audit.score >= 80) {
      const smartTitle = extractTitle(content) || topic;
      const post = await preparePostObject(meta, smartTitle, content, audit);
      await env.LEXIS_REWRITTEN_POSTS.put(`post:${post.id}`, JSON.stringify(post));
      successList.push(smartTitle);
      console.log(`[REWRITER] ✅ APROVADO APÓS FEEDBACK: ${smartTitle} (Score: ${audit.score})`);
      return true;
    } else {
      console.log(`[REWRITER] ❌ REJEITADO DEFINITIVAMENTE: ${topic} (Score: ${audit.score})`);
      await env.LEXIS_PUBLISHED_POSTS.put(`rejection_log:${meta.id}`, JSON.stringify({
        title: topic,
        reason: audit.reason,
        score: audit.score,
        at: new Date().toISOString()
      }));
      return true; // Remove da triagem mesmo se falhar após retry para não ficar preso
    }
  } catch (e) {
    console.error(`[REWRITER] Erro no processamento: ${e.message}`);
    return false;
  }
}

function extractTitle(content) {
  const match = content.match(/^#\s*(.*)/m);
  return match ? match[1].replace(/Título:\s*/i, '').trim() : null;
}

async function preparePostObject(meta, title, content, audit) {
  const aiSnippet = extractTag('AI_SNIPPET', content);
  const aiContext = extractTag('AI_CONTEXT', content);
  const cleanContent = cleanFullContent(content);

  return {
    id: meta.id,
    title: title,
    date: new Date().toISOString().split('T')[0],
    content: cleanContent,
    description: extractTag('DESCRIPTION', content) || title,
    slug: title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').substring(0, 60),
    lexis_version: "3.1-feedback-loop",
    audit_score: audit.score,
    audit_reason: audit.reason,
    topicKey: meta.topicKey,
    seo: { ai_snippet: aiSnippet, ai_context: aiContext }
  };
}
