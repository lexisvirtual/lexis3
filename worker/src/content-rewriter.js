import { auditPost } from './content-auditor.js';
import { callGemini, extractTag, cleanFullContent, callOpenAI } from './multi-model.js';
import { getTemaDoAno } from './temas365.js';
import { getLeoTarget } from './leo-strategy.js';

/**
 * Prompt Mestre do Diretor (Versão Elite 3.3 - Evolutionary)
 * Focado em Performance Executiva e Aprendizado Contínuo.
 */
const GET_DIRECTOR_PROMPT = (topic, directives = "", feedback = null, previousContent = null) => {
  let basePrompt = `Você é Leo (Versão 3.0), Diretor de Performance Linguística da Lexis Academy. 

SUA MISSÃO: Produzir um Workshop que maximize o IPL (Indicador de Performance Linguística). 
O foco é aumentar a capacidade do aluno de formular respostas executivas de ALTO IMPACTO sob pressão.

🚨 MÉTRICAS IPL OBRIGATÓRIAS:
1. DENSIDADE C1: Mínimo de 10 expressões C1 reais aplicadas em contexto.
2. INTEGRAÇÃO: Toda expressão apresentada no Nível 1 DEVE reaparecer aplicada no Nível 2 (Cenário) ou Nível 3 (Roleplay).
3. TENSÃO CORPORATIVA: Pelo menos 1 cenário de tensão realista (boardroom, negociação, crise).
4. PROGRESSÃO: O treino deve ser progressivo (do chunk isolado à missão final).
5. PROPORÇÃO: 70% de inglês funcional.

🚨 ESTRUTURA CONTRATUAL OBRIGATÓRIA:
# [Headline de Autoridade em PT]
## Resposta Rápida (Quick Answer): 40-60 palavras em PT. Direta e técnica.
## Anatomia da Fluência (ROI Cognitivo): Explique por que treinar isso eleva o patamar executivo.
## Tabela de Performance: AMADOR vs ELITE (Choque Cognitivo).
   - Use uma Tabela Markdown real e limpa.
   - Contraste "Amador (Reativo)" vs "Elite (Estratégico)".
   - Não use apenas descrições; use FRASES REAIS. Ex: Amador: "I think this is bad" | Elite: "This move is likely to trigger unintended regional repercussions."
## ⚡ O Treino Lexis: (O coração do workshop)
   - Aquecimento (Mapping PT/EN)
   - Nível 1 (10+ Chunks & Vocabulary C1)
   - Nível 2 (Cenário de Alta Pressão: Reaplicar Chunks)
   - Nível 3 (Missão Final / Roleplay: Reaplicar Chunks)
## Erros Comuns: Evite soar como um amador.
## Plano de Treino 7 Dias (Drill): Roteiro de repetição estruturada.
## FAQ de Mentoria: Respostas estratégicas para executivos.

🚨 OBRIGATÓRIO (FIM DO POST):
Gere o bloco abaixo para sua autoavaliação:
IPL_SELF_CHECK:
- Percentual estimado de inglês: XX%
- Número de expressões C1: XX
- Expressões reaplicadas nos desafios: [sim/não]
- Cenário com tensão realista: [sim/não]
- Drill 7 dias estruturado: [sim/não]

Este conteúdo será auditado pelo Roger 3.0 sob critérios estritos de IPL e Integração Lexical.`;

  if (feedback && previousContent) {
    return `${basePrompt}

🚨 PROTOCOLO DE REPARO CIRÚRGICO IPL:
O Roger detectou falha no IPL: "${feedback}".

REGRAS DO REPARO:
1. NÃO REESCREVA O POST INTEIRO.
2. Identifique onde a integração ou a tensão falhou.
3. Se o Roger pedir densidade, não apenas liste palavras; integre-as na narrativa do cenário.
4. Se houver dúvida técnica, adicione [[ROGER_HELP]] no fim com sua pergunta ao auditor.

CONTEÚDO ANTERIOR:
${previousContent.substring(0, 3000)}`;
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

    // TENTATIVA 1
    console.log(`[REWRITER] (${currentIdx}/${totalNeeded}) Léo escrevendo versão 1: ${topic}...`);
    let prompt = GET_DIRECTOR_PROMPT(topic, learnedDirectives);
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

      // Preparar os comandos específicos do Roger para o Leo
      const specificFixes = audit.specific_fixes ? JSON.stringify(audit.specific_fixes, null, 2) : "Nenhum comando específico.";
      const englishCommand = audit.roger_to_leo_english_command || audit.reason || "Improve content quality.";

      prompt = `Você é o Diretor Editorial da Lexis Academy (Leo). O Auditor Roger REJEITOU seu conteúdo com nota ${audit.score}.
      
      SUA MISSÃO: UM REPARO CIRÚRGICO DE ALTA PRECISÃO.
      NÃO REESCREVA O ARTIGO INTEIRO. Mantenha os 90% que funcionam e foque APENAS nos comandos técnicos abaixo.

      🚨 FEEDBACK DO ROGER (EM PORTUGUÊS): "${audit.reason}"
      🚨 COMANDOS ESPECÍFICOS: 
      ${specificFixes}

      🚨 ENGLISH DIRECTIVE (FOLLOW THIS STRICTLY): 
      "${englishCommand}"

      🚨 PROTOCOLO DE AJUDA: Se o comando for genérico ou você não souber o que fazer, adicione no fim do artigo:
      "[[ROGER_HELP]]: [Sua pergunta específica em Inglês para o Roger sobre o que está te travando]"

      CONTEÚDO PARA REPARO:
      ${content}

      Instrução Final: Reescreva as partes problemáticas em PORTUGUÊS (ou Inglês onde solicitado) seguindo a diretriz em inglês do Roger. Se o comando for genérico, use sua expertise para elevar a densidade de Phrasal Verbs e Chunks C1.`;

      content = await callOpenAI(env, prompt, `CORREÇÃO CIRÚRGICA: O Roger quer que você foque em: ${englishCommand}. Seja técnico e direto.`);

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
