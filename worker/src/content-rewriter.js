import { auditPost } from './content-auditor.js';
import { callGemini, extractTag, cleanFullContent, callOpenAI } from './multi-model.js';
import { getTemaDoAno } from './temas365.js';
import { getLeoTarget } from './leo-strategy.js';
import { runEliteRetrospective, loadElitePatterns, formatPatternsForPrompt } from './post-retrospective.js';

/**
 * Prompt Mestre do Diretor (Versão Elite 3.3 - Evolutionary)
 * Focado em Performance Executiva e Aprendizado Contínuo.
 */
/**
 * Repositório de Cenários de Elite (Amostra de Pressão Real)
 */
const ELITE_SCENARIOS = `
1. Boardroom Rejection: Defender um orçamento de expansão contra um CFO agressivo que busca cortes imediatos.
2. Crisis Management: Comunicar um atraso crítico de entrega a um cliente internacional VIP durante uma call de status.
3. Hostile Pitch: Responder a perguntas céticas e interrupções de um investidor durante a apresentação de um QBR.
4. Salary Negotiation: Negociar termos de bônus e benefícios em uma promoção direta com o RH Global.
5. Technical Failure: Explicar uma queda de sistema catastrófica em tempo real para stakeholders durante uma demonstração ao vivo.
`;

/**
 * Prompt Mestre do Diretor (Versão Elite 3.5 - Hybrid & Anchor Focus)
 * Focado em Performance Executiva, Acessibilidade Bilingue e Integração Lexical.
 */
const GET_DIRECTOR_PROMPT = (topic, directives = "", feedback = null, previousContent = null) => {
  let basePrompt = `Você é Leo (Versão 3.5), Diretor de Performance Linguística da Lexis Academy. 

SUA MISSÃO: Produzir um Workshop de Elite que maximize o IPL (Indicador de Performance Linguística) seguindo o **Apple Executive Design Standard** (Minimalismo, Impacto e Autoridade).

🚨 MÉTRICAS IPL OBRIGATÓRIAS (VERSÃO 3.7 - APPLE STYLE):
1. DNA DE TREINO (60/40): 60% Inglês Funcional / 40% Português Instrucional.
2. ESTILO APPLE (NOVO): 
   - Use frases curtas e de alto impacto. 
   - Evite parágrafos longos (máximo 3 linhas).
   - O excesso de informação é o inimigo da clareza. Respiro (whitespace) é luxo.
3. ANCORAGEM LEXICAL (CRÍTICO): Toda expressão apresentada no Nível 1 DEVE ser usada nos Níveis 2 e 3.
   - REGRA DE OURO: Você DEVE colocar em **negrito** (ex: **stalling for time**) cada termo da lista do Nível 1 quando usá-lo na prática.
4. BILINGUISMO FUNCIONAL:
   - Resposta Rápida e FAQ: Use o modelo "Resumo PT + Action Item EN" (Espelhamento).
   - Títulos (H2): Use o formato "Título em PT | Authority Hook in EN".
4. TENSÃO CORPORATIVA REAL: Inspire-se nestes cenários de pressão executiva:
${ELITE_SCENARIOS}
5. SEO & AUTORIDADE (NOVO): 
   - Logo no início: Inclua 1 Link Externo (markdown básico) para uma fonte de autoridade (ex: BBC Learning English, Cambridge Dictionary, HBR) validando o tema.
   - Logo no final: Inclua 1-2 Links Internos para outros workshops da Lexis Academy ou para a página de Imersão (/imersao).

🚨 ESTRUTURA CONTRATUAL OBRIGATÓRIA:
[TITLE] Coloque aqui o título real e estratégico do workshop (ex: OpenAI no Pentágono) [/TITLE]
## Resposta Rápida (Quick Answer) | Executive Summary
   - Resumo técnico em PT + 2 frases de poder em EN (Action Items).
## Anatomia da Fluência (ROI Cognitivo)
   - Por que este treinamento gera retorno imediato na carreira.
## Tabela de Performance: AMADOR vs ELITE
   - Contraste frases "Safe/Genéricas" vs "Strategic/High-Impact".
## ⚡ O Treino Lexis: (O coração do workshop)
   - Aquecimento (Mapping PT/EN)
   - Nível 1 (10+ Chunks & Vocabulary C1)
   - Nível 2 (Cenário de Alta Pressão | **Negrite os termos ancorados**)
   - Nível 3 (Missão Final / Roleplay | **Negrite os termos ancorados**)
## Erros Comuns | Avoiding Amateur Pitfalls
   - Explicação PT + Tabela "Don't say / Say instead".
## Plano de Treino 7 Dias (Drill)
## FAQ de Mentoria | Executive Q&A
   - Perguntas em PT / Respostas Curtas e Diretas em EN.

🚨 OBRIGATÓRIO (FIM DO POST):
Gere o bloco IPL_SELF_CHECK com o percentual real de inglês e contagem de termos ancorados. Inclua aqui os links internos de SEO.

Este conteúdo será auditado pelo Roger 3.5. Seja implacável na tensão, fiel na ancoragem e estratégico nos links.`;

  if (feedback && previousContent) {
    const isIntegrationIssue = feedback.toLowerCase().includes('integração') || feedback.toLowerCase().includes('ancoragem');

    if (isIntegrationIssue) {
      return `${basePrompt}

🚨 PROTOCOLO DE RESET DE CENÁRIO (FALHA DE ANCORAGEM):
O Roger detectou que as expressões do Nível 1 NÃO foram devidamente integradas ou negritadas na prática.

SUA MISSÃO DE REPARO:
1. MANTENHA o Nível 1 original.
2. DESCARTES os cenários atuais dos Níveis 2 e 3.
3. CRIE NOVOS CENÁRIOS de maior impacto, garantindo que você use e COLOQUE EM NEGRITO pelo menos 8 termos da lista.
4. FOQUE no bilinguismo funcional nos títulos e resumos.

CONTEÚDO PARA REFERÊNCIA:
${previousContent.substring(0, 3000)}`;
    }

    return `${basePrompt}

🚨 PROTOCOLO DE REPARO CIRÚRGICO IPL:
Feedback do Roger: "${feedback}".
Refine apenas as seções afetadas focando em elevar a tensão ou o bilinguismo funcional.`;
  }

  return basePrompt;
};

/**
 * Função de Evolução: Transforma falha em aprendizado no KV
 */
async function storeLearnedDirective(env, reason) {
  try {
    const existing = await env.LEXIS_PUBLISHED_POSTS.get('system:directives') || "";
    const lines = existing.split('\n').filter(l => l.trim());

    // Manter as últimas 10 lições para não sobrecarregar o prompt
    const newDirective = `- LIÇÃO APRENDIDA: ${reason}`;
    if (!existing.includes(reason)) {
      const updated = [newDirective, ...lines].slice(0, 10).join('\n');
      await env.LEXIS_PUBLISHED_POSTS.put('system:directives', updated);
      console.log(`[EVOLUTION] Nova diretriz memorizada: ${reason}`);
    }
  } catch (e) {
    console.error("[EVOLUTION] Falha ao memorizar lição:", e.message);
  }
}

export async function rewriteArticles(env, limit = 5) {
  const currentRewritten = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 50 });
  const stockSize = currentRewritten.keys.length;

  if (stockSize >= limit) {
    console.log(`[REWRITER] 📦 Estoque cheio (${stockSize}/5).`);
    return { success: true, postsRewritten: 0, stock: stockSize };
  }

  const needed = limit - stockSize;
  const rewrittenTitles = [];
  await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Iniciando produção de ${needed} posts de Elite...`);

  // 1. Prioridade Máxima: Plano Estratégico de 6 Meses (Leo Targets)
  let attempts = 0;
  while (rewrittenTitles.length < needed && attempts < needed) {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) + attempts;
    const target = getLeoTarget(dayOfYear);

    console.log(`[REWRITER] (PLANO) Produzindo tema estratégico: ${target.topic}`);
    const success = await processWithFeedback(env, target.topic, { id: `leo-${dayOfYear}`, topicKey: target.cluster }, null, rewrittenTitles, rewrittenTitles.length + 1, needed);
    attempts++;
  }

  // 2. Complemento: Artigos da Triagem (News) - se ainda houver vagas no estoque
  if (rewrittenTitles.length < needed) {
    const triagedList = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 10 });
    let i = 0;
    for (const key of triagedList.keys) {
      if (rewrittenTitles.length >= needed) break;
      i++;

      const data = await env.LEXIS_TRIAGED_ARTICLES.get(key.name);
      if (!data) continue;
      const article = JSON.parse(data);

      console.log(`[REWRITER] (NEWS) Processando notícia: ${article.title}`);
      const success = await processWithFeedback(env, article.title, article, key.name, rewrittenTitles, rewrittenTitles.length + 1, needed);
      if (success) {
        await env.LEXIS_TRIAGED_ARTICLES.delete(key.name);
      }
    }
  }

  await env.LEXIS_PUBLISHED_POSTS.put('system:log', `[REWRITER] Finalizado. Estoque: ${stockSize + rewrittenTitles.length}/5`);
  return { success: true, postsRewritten: rewrittenTitles.length, stock: stockSize + rewrittenTitles.length };
}

/**
 * Lógica de Feedback: Diretor -> Auditor -> Diretor (se necessário) -> Auditor
 */
async function processWithFeedback(env, topic, meta, kvKey, successList, currentIdx = 1, totalNeeded = 1) {
  try {
    // 0. DEFINIR THRESHOLD DUAL (Mínimo para publicar é 60, mas regua de elite continua 85/90)
    const pillarClusters = ["info-imersao", "info-intensivo", "comparativos", "neurociencia", "perfis-conversao"];
    const isPillar = meta?.topicKey && pillarClusters.includes(meta.topicKey);
    const eliteThreshold = isPillar ? 90 : 85;
    const publishingThreshold = 60; // GARANTIA DE POST: Abaixado para 60 para evitar fila vazia

    // 0.1 Carregar Memória Evolutiva
    const learnedDirectives = await env.LEXIS_PUBLISHED_POSTS.get('system:directives') || "";

    // 0.2 Carregar Padrões de Elite (memória de acertos)
    const elitePatterns = await loadElitePatterns(env);
    const elitePatternsBlock = formatPatternsForPrompt(elitePatterns, 10);

    // TENTATIVA 1
    console.log(`[REWRITER] (${currentIdx}/${totalNeeded}) Léo escrevendo versão 1: ${topic}...`);
    let prompt = GET_DIRECTOR_PROMPT(topic, learnedDirectives + elitePatternsBlock);
    let content = await callOpenAI(env, prompt, "Você é o Diretor de Elite da Lexis.");

    console.log(`[REWRITER] (${currentIdx}/${totalNeeded}) Roger auditando versão 1: ${topic}...`);
    let audit = await auditPost(env, { title: topic, content: cleanFullContent(content) });

    // CICLO DE FEEDBACK PERSISTENTE (Refinamento em até 5 rodadas) - FAIL-CLOSED CONTINGENCY
    let attempts = 0;
    while (audit.score < eliteThreshold && attempts < 5) {
      if (audit.score >= 95) break;

      attempts++;
      const logMsg = `[REWRITER] (${currentIdx}/${totalNeeded}) 🛠️ Refinamento Cirúrgico (${attempts}/5) p/ atingir ${eliteThreshold}pts: ${topic}...`;
      console.log(logMsg);

      const englishCommand = audit.roger_to_leo_english_command || audit.reason || "Improve content quality.";
      const isIntegrationIssue = audit.reason?.toLowerCase().includes('integração') || audit.reason?.toLowerCase().includes('ancoragem');

      if (isIntegrationIssue) {
        prompt = GET_DIRECTOR_PROMPT(topic, learnedDirectives + elitePatternsBlock, audit.reason, content);
        console.log(`[REWRITER] 🔄 RESET DE CENÁRIO ATIVADO: Roger exigiu melhor ancoragem.`);
      } else {
        prompt = `Você é o Diretor Editorial da Lexis Academy (Leo). O Auditor Roger REJEITOU seu conteúdo com nota ${audit.score}.
        
        SUA MISSÃO: UM REPARO CIRÚRGICO DE ALTA PRECISÃO.
        NÃO REESCREVA O ARTIGO INTEIRO. Mantenha os 90% que funcionam e foque APENAS nos comandos técnicos abaixo.

        🚨 FEEDBACK DO ROGER (EM PORTUGUÊS): "${audit.reason}"
        🚨 COMANDOS ESPECÍFICOS: 
        ${specificFixes}

        🚨 ENGLISH DIRECTIVE (FOLLOW THIS STRICTLY): 
        "${englishCommand}"

        CONTEÚDO PARA REPARO:
        ${content}

        Instrução Final: Siga a diretriz técnica para elevar o bilinguismo e a densidade executiva.`;
      }

      content = await callOpenAI(env, prompt, `REFINAMENTO IPL: ${englishCommand}`);

      console.log(`[REWRITER] (${currentIdx}/${totalNeeded}) Roger re-auditando (${attempts}/5): ${topic}...`);
      audit = await auditPost(env, { title: topic, content: cleanFullContent(content) });

      if (audit.score >= eliteThreshold) break;
    }

    // VEREDITO FINAL (Garantia de Postagem: Publica se score >= 60)
    if (audit.score >= publishingThreshold) {
      const smartTitle = extractTitle(content) || topic;
      const post = await preparePostObject(meta, smartTitle, content, audit);

      if (audit.score < eliteThreshold) {
        post.upgrade_mandatory = true;
        console.log(`[REWRITER] ⚠️ Post aprovado com Nota de Segurança (${audit.score}). Marcado para Upgrade Mandatório.`);
      }

      await env.LEXIS_REWRITTEN_POSTS.put(`post:${post.id}`, JSON.stringify(post));
      successList.push(smartTitle);
      console.log(`[REWRITER] ✅ APROVADO PARA PUBLICAÇÃO (Score: ${audit.score} em ${attempts + 1} tentativas)`);

      // 🧬 RETROSPECTIVA DE ELITE (assíncrona, não bloqueia)
      runEliteRetrospective(env, smartTitle, content, audit.score, audit.reason).catch(e =>
        console.error(`[PRE] Erro silencioso na retrospectiva: ${e.message}`)
      );

      return true;
    } else {
      console.log(`[REWRITER] ❌ REJEITADO (Abaixo do Piso de 60pts após 5 tentativas): ${topic} (Score: ${audit.score})`);

      // EVOLUÇÃO: Aprender com o erro fatal no KV
      await storeLearnedDirective(env, audit.reason);

      await env.LEXIS_PUBLISHED_POSTS.put(`rejection_log:${kvKey || meta.id}`, JSON.stringify({
        title: topic,
        reason: audit.reason,
        score: audit.score,
        threshold_required: eliteThreshold,
        at: new Date().toISOString()
      }));
      return true; // Remove do fluxo atual para não travar a esteira
    }
  } catch (e) {
    const errMsg = `[REWRITER] 🚨 CRITICAL ERROR: ${e.message} em ${topic}`;
    console.error(errMsg);
    return false;
  }
}

function extractTitle(content) {
  // 1. Prioridade para a nova tag administrativa
  const tagMatch = content.match(/\[TITLE\]\s*(.*?)\s*\[\/TITLE\]/i);
  if (tagMatch) return tagMatch[1].trim();

  // 2. Fallback para H1 (apenas se houver exatamente um #)
  const h1Match = content.match(/^#[^#]\s*(.*)/m);
  return h1Match ? h1Match[1].replace(/Título:\s*/i, '').trim() : null;
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
    lexis_version: "3.5-elite",
    audit_score: audit.score,
    audit_reason: audit.reason,
    topicKey: meta.topicKey,
    seo: {
      ai_snippet: aiSnippet,
      ai_context: aiContext,
      query_intent: extractTag('QUERY_INTENT', content)
    }
  };
}
