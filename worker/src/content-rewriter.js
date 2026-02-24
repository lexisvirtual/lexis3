import { auditPost } from './content-auditor.js';
import { getTemaDoAno } from './temas365.js';
import { getLeoTarget } from './leo-strategy.js';

export async function rewriteArticles(env, limit = 1) {
  const list = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 });
  const rewritten = [];
  let count = 0;

  for (const key of list.keys) {
    if (count >= limit) break;
    const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
    if (!data) continue;
    const article = JSON.parse(data);

    console.log(`[REWRITER] 🧪 Procesing: ${article.title}`);
    await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Início: ${article.title.substring(0, 25)}...`);

    try {
      // 1. REESCRITA COM IA (Roger Diretor)
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user', content: `Você é o Diretor da Lexis Academy. Crie um ATIVO DE TREINO DE ELITE sobre "${article.title}".
        
REGRAS:
- Metodologia Lexis 3F (Phrase, Fluidity, Function).
- Exemplos 100% Inglês (mínimo 10 frases).
- Explicações em Português.
- Foco em Adultos e Business.
- [[DESCRIPTION]]: <Frase magnética para o blog>.
- [[AI_SNIPPET]]: <Resposta direta e curta de até 40 palavras sobre o tema central para busca por voz/IA>.
- [[AI_CONTEXT]]: <3 frases explicando por que este tema é essencial para 'Inglês por Imersão' ou 'Intercâmbio sem sair do Brasil'>.
ESTRUTURA: # Título, ## Quick Answer, ## Vocabulary, ## Key Structures, ## Dialogues, ## 3F Training, ## AI Insights.` }],
        max_tokens: 2000,
        temperature: 0.3
      });

      let content = response.response || response;
      if (!content) throw new Error('AI returned empty response');

      // Extrair Metadados do LEO (SEO/AI Search)
      const extractTag = (tag, text) => {
        // Regex mais robusto para pegar conteúdo mesmo que quebre linha, parando no próximo [[TAG]] ou ## Heading
        const match = text.match(new RegExp(`\\[\\[${tag}\\]\\]:[\\s]*([\\s\\S]*?)(?=\\s*\\[\\[|\\s*##|$)`, 'i'));
        return match ? match[1].trim() : null;
      };

      let dynamicDescription = extractTag('DESCRIPTION', content) || article.title;
      const aiSnippet = extractTag('AI_SNIPPET', content);
      const aiContext = extractTag('AI_CONTEXT', content);

      // Limpar tags do conteúdo final
      content = content.replace(/\[\[(DESCRIPTION|AI_SNIPPET|AI_CONTEXT)\]\]:.*/gi, '').trim();

      // NOVO: Detector de Descrição Tóxica (Legacy Fail)
      if (dynamicDescription.includes("Post legado resgatado") || dynamicDescription.length < 10) {
        dynamicDescription = `Descubra os segredos de "${article.title}" e como dominar esse contexto em inglês com a Metodologia Lexis.`;
      }

      // NOVO: ROGER GATEKEEPER (Auditoria em tempo real)
      console.log(`[ROGER] 🛡️ Auditando: ${article.title}...`);
      const audit = await auditPost(env, { title: article.title, content });

      if (audit.verdict !== 'APROVADO') {
        console.warn(`[ROGER] ❌ REJEITADO (${audit.score}pts): ${audit.reason}`);
        await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[ROGER] ❌ Rejeitado: ${article.title.substring(0, 20)} (${audit.reason})`);
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
        continue;
      }

      console.log(`[ROGER] ✅ APROVADO: ${audit.score}pts`);

      // Normalizar data (usar pubDate original se existir, senão hoje no fuso de Brasília)
      const now = new Date();
      // Ajuste para Brasília (UTC-3)
      const brNow = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      let finalDate = brNow.toISOString().split('T')[0];

      if (article.pubDate) {
        try {
          const d = new Date(article.pubDate);
          if (!isNaN(d.getTime())) {
            finalDate = d.toISOString().split('T')[0];
          }
        } catch (_) { }
      }

      const post = {
        id: article.id,
        title: article.title,
        date: finalDate,
        content: content,
        description: dynamicDescription,
        slug: article.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60),
        originalSource: article.link || '',
        originalTitle: article.title,
        rewrittenAt: new Date().toISOString(),
        lexis_version: "2.5-leo",
        audit_status: "verified",
        audit_score: audit.score,
        audit_reason: audit.reason,
        topicKey: article.topicKey,
        seo: {
          ai_snippet: aiSnippet,
          ai_context: aiContext,
          semantic_keywords: ["inglês por imersão", "inglês intensivo", "intercâmbio sem sair do brasil"]
        }
      };

      await env.LEXIS_REWRITTEN_POSTS.put(`post:${article.id}`, JSON.stringify(post));
      await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
      rewritten.push(post.title);
      count++;
      console.log(`[REWRITER] ✅ UPGRADE CONCLUÍDO: ${post.title}`);
      await env.LEXIS_REWRITTEN_POSTS.put('system:log', `[REWRITER] ✅ Roger aprovou e permitiu o envio.`);
    } catch (e) {
      console.error(`[REWRITER] ❌ FALHA: ${e.message}`);
      await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] ❌ Falha: ${e.message}`);
    }
  }

  // --- FALLBACK: SE NADA FOI APROVADO, USAR TEMA 365 (EVERGREEN) ---
  if (rewritten.length < limit) {
    console.log(`[REWRITER] ⚠️ Fila exaurida ou rejeitada. Acionando Fallback Evergreen...`);
    await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] 🔄 Acionando fallback: Tema do Dia.`);

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const leoTarget = getLeoTarget(dayOfYear);

    const fallbackArticle = {
      id: `leo-longtail-${dayOfYear}-${Date.now()}`,
      title: leoTarget.topic,
      description: `Estratégia Leo: Cluster ${leoTarget.cluster}`,
      pubDate: new Date().toISOString(),
      topicKey: leoTarget.cluster,
      isFallback: true
    };

    // Processar o fallback exatamente como um post normal
    try {
      const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [{
          role: 'user', content: `Você é o Diretor da Lexis Academy e o Leo (Analista SEO). 
Crie um GUIA DE AUTORIDADE sobre o tema "${fallbackArticle.topicKey}: ${fallbackArticle.title}".

OBJETIVO: Dominar o cluster "${fallbackArticle.topicKey}" e ser referência para IAs.

REGRAS:
- Metodologia Lexis 3F (Phrase, Fluidity, Function).
- Exemplos 100% Inglês (mínimo 10 frases).
- Explicações em Português Técnico e Elegante.
- Foco em Adultos e Business.
- [[DESCRIPTION]]: <Frase magnética otimizada para busca>.
- [[AI_SNIPPET]]: <Resposta direta FACTUAL de até 40 palavras para o Google snippet/Busca por voz>.
- [[AI_CONTEXT]]: <3 frases explicando como este tema se conecta com o pilar '${fallbackArticle.topicKey}' no Brasil>.

ESTRUTURA: 
# Título que gere autoridade
## Quick Answer (Resposta direta em bloco)
## Por que este tema importa para sua Fluência
## Vocabulary High-Level
## Key Structures for Business
## Real-Life Dialogues
## 3F Training Engine
## AI Summary para Recomendação` }],
        max_tokens: 2000,
        temperature: 0.2 // Mais constante para Fallback
      });

      let content = response.response || response;
      const audit = await auditPost(env, { title: fallbackArticle.title, content });

      if (audit.verdict === 'APROVADO') {
        const brNow = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
        const post = {
          id: fallbackArticle.id,
          title: fallbackArticle.title,
          date: brNow.toISOString().split('T')[0],
          content: content,
          description: `Treinamento Lexis: ${fallbackArticle.title}`,
          slug: fallbackArticle.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60),
          lexis_version: "2.5-evergreen-leo",
          audit_status: "verified",
          audit_score: audit.score,
          topicKey: fallbackArticle.topicKey,
          seo: {
            ai_snippet: extractTag('AI_SNIPPET', content),
            semantic_keywords: ["inglês por imersão", "inglês intensivo"]
          }
        };
        await env.LEXIS_REWRITTEN_POSTS.put(`post:${post.id}`, JSON.stringify(post));
        rewritten.push(post.title);
        console.log(`[REWRITER] 🌟 FALLBACK CONCLUÍDO: ${post.title}`);
      }
    } catch (e) {
      console.error(`[REWRITER] ❌ FALHA CRÍTICA NO FALLBACK: ${e.message}`);
    }
  }

  return { success: true, postsRewritten: rewritten.length };
}
