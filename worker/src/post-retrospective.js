/**
 * Post Retrospective Engine (PRE)
 * Após cada aprovação, Leo e Roger discutem o que tornou o post memorável.
 * O consenso é armazenado como "padrões de elite" na memória do sistema.
 *
 * Chave KV: system:elite_patterns (lista JSON, máx 30 padrões únicos)
 */

import { callOpenAI } from './multi-model.js';

const KV_ELITE_PATTERNS = 'system:elite_patterns';
const MAX_PATTERNS = 30;
const SIMILARITY_THRESHOLD = 0.72; // Similaridade acima disso = padrão repetido

// ───────────────────────────────────────────────────────────────
// ENTRADA PRINCIPAL
// ───────────────────────────────────────────────────────────────

/**
 * Executa discussão pós-aprovação entre Leo e Roger.
 * Chamado após audit.score >= publishingThreshold.
 */
export async function runEliteRetrospective(env, title, content, auditScore, auditReason) {
    try {
        console.log(`[PRE] 🔍 Iniciando Retrospectiva de Elite: "${title}" (Score: ${auditScore})`);

        // 1. Leo identifica o que funcionou
        const leoPerspective = await getLeoAnalysis(env, title, content, auditScore);
        console.log(`[PRE] Leo: ${leoPerspective.substring(0, 120)}...`);

        // 2. Roger valida e complementa
        const rogerPerspective = await getRogerValidation(env, title, content, auditScore, auditReason, leoPerspective);
        console.log(`[PRE] Roger: ${rogerPerspective.substring(0, 120)}...`);

        // 3. Extrair padrões em consenso (JSON estruturado)
        const newPatterns = await extractConsensusPatterns(env, leoPerspective, rogerPerspective, title);
        if (!newPatterns || newPatterns.length === 0) {
            console.log(`[PRE] Nenhum padrão novo extrato. Nada a salvar.`);
            return;
        }

        // 4. Carregar padrões existentes
        const existing = await loadElitePatterns(env);

        // 5. Deduplicar e salvar apenas padrões novos
        const merged = await mergeWithDedup(env, existing, newPatterns);
        await saveElitePatterns(env, merged);

        const added = merged.length - existing.length;
        console.log(`[PRE] ✅ Retrospectiva concluída. ${added} novo(s) padrão(ões) adicionado(s). Total: ${merged.length}/${MAX_PATTERNS}`);

    } catch (e) {
        // Não bloquear o fluxo principal em caso de erro
        console.error(`[PRE] ⚠️ Erro na retrospectiva (não crítico): ${e.message}`);
    }
}

// ───────────────────────────────────────────────────────────────
// PERSPECTIVA DO LEO
// ───────────────────────────────────────────────────────────────

async function getLeoAnalysis(env, title, content, score) {
    const prompt = `Você é Leo 3.0, Diretor de Performance Linguística da Lexis Academy.

Este post foi APROVADO pelo Roger com nota ${score}:

TÍTULO: "${title}"

CONTEÚDO (primeiros 2000 chars):
${content.substring(0, 2000)}

Pergunta para retrospectiva:
Analise o que você fez CERTO neste post. Identifique de 3 a 5 elementos técnicos específicos que contribuíram para a aprovação. Seja preciso e técnico.

Responda em formato de lista numerada, cada item com no máximo 2 frases. Foco em: estrutura, densidade C1, tipo de cenário de pressão, progressão dos drills, hedging estratégico usado.`;

    return await callOpenAI(env, prompt, 'Você é Leo, analisando seu próprio trabalho aprovado.');
}

// ───────────────────────────────────────────────────────────────
// PERSPECTIVA DO ROGER
// ───────────────────────────────────────────────────────────────

async function getRogerValidation(env, title, content, score, auditReason, leoPerspective) {
    const prompt = `Você é Roger 3.0, Auditor de Performance Linguística (IPL Validador) da Lexis Academy.

Este post foi aprovado com nota ${score}. Motivo da aprovação: "${auditReason}"

Leo (o escritor) identificou os seguintes elementos como responsáveis pelo sucesso:
${leoPerspective}

TÍTULO DO POST: "${title}"
CONTEÚDO (primeiros 2000 chars):
${content.substring(0, 2000)}

Sua missão:
1. Valide os pontos do Leo: diga quais estão corretos e quais você discorda.
2. Acrescente de 1 a 3 elementos que o Leo NÃO mencionou mas que foram decisivos para a aprovação.
3. Identifique o padrão mais reproduzível deste post: o que faria outro post passar com menos ciclos de revisão?

Responda de forma técnica e direta, em lista numerada.`;

    return await callOpenAI(env, prompt, 'Você é Roger, validando o que tornou este post aprovável.');
}

// ───────────────────────────────────────────────────────────────
// EXTRAÇÃO DE PADRÕES EM CONSENSO
// ───────────────────────────────────────────────────────────────

async function extractConsensusPatterns(env, leoPerspective, rogerPerspective, title) {
    const prompt = `Você é um sintetizador técnico. Leo (escritor) e Roger (auditor) discutiram o que tornou um post de inglês executivo memorável e aprovável.

ANÁLISE DO LEO:
${leoPerspective}

VALIDAÇÃO DO ROGER:
${rogerPerspective}

Extraia de 2 a 4 PADRÕES DE ELITE em consenso. Cada padrão deve ser:
- Uma instrução concreta e reutilizável (não uma observação genérica)
- Aplicável na próxima geração de posts
- Máximo 1 frase por padrão
- Foco em: estrutura, vocabulário C1, tipo de cenário, progressão de drill, hedging

Responda SOMENTE com JSON válido, sem markdown, no formato:
[
  { "pattern": "instrução concreta aqui", "category": "structure|c1|scenario|drill|hedging" },
  ...
]`;

    try {
        const raw = await callOpenAI(env, prompt, 'Extraia padrões de elite em formato JSON.');
        // Extrair JSON do retorno
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error(`[PRE] Erro ao extrair padrões JSON: ${e.message}`);
        return [];
    }
}

// ───────────────────────────────────────────────────────────────
// DEDUPLICAÇÃO SEMÂNTICA
// ───────────────────────────────────────────────────────────────

/**
 * Verifica similaridade entre dois textos usando coeficiente de Jaccard sobre tokens.
 * Simples, sem custo de API, suficiente para detectar padrões repetidos.
 */
function jaccardSimilarity(a, b) {
    const tokenize = (s) => new Set(s.toLowerCase().replace(/[^a-záéíóúãõâêôçü\s]/g, '').split(/\s+/).filter(Boolean));
    const setA = tokenize(a);
    const setB = tokenize(b);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

async function mergeWithDedup(env, existing, newPatterns) {
    const result = [...existing];

    for (const candidate of newPatterns) {
        if (!candidate.pattern || candidate.pattern.trim().length < 15) continue;

        const isDuplicate = result.some(existing => {
            const sim = jaccardSimilarity(existing.pattern, candidate.pattern);
            return sim >= SIMILARITY_THRESHOLD;
        });

        if (isDuplicate) {
            console.log(`[PRE] ⏭️ Padrão duplicado ignorado: "${candidate.pattern.substring(0, 60)}..."`);
            continue;
        }

        result.push({
            ...candidate,
            added_at: new Date().toISOString().split('T')[0]
        });

        // Limitar ao máximo
        if (result.length >= MAX_PATTERNS) break;
    }

    // Se ultrapassar o limite, descartar os mais antigos (FIFO)
    return result.slice(-MAX_PATTERNS);
}

// ───────────────────────────────────────────────────────────────
// PERSISTÊNCIA KV
// ───────────────────────────────────────────────────────────────

export async function loadElitePatterns(env) {
    try {
        const raw = await env.LEXIS_PUBLISHED_POSTS.get(KV_ELITE_PATTERNS);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error(`[PRE] Erro ao carregar padrões: ${e.message}`);
        return [];
    }
}

async function saveElitePatterns(env, patterns) {
    await env.LEXIS_PUBLISHED_POSTS.put(KV_ELITE_PATTERNS, JSON.stringify(patterns));
}

// ───────────────────────────────────────────────────────────────
// FORMATAR PADRÕES PARA PROMPT DO LEO
// ───────────────────────────────────────────────────────────────

/**
 * Retorna os últimos N padrões em formato de texto para injetar no prompt do Leo.
 * Chamado em content-rewriter.js no início de cada geração.
 */
export function formatPatternsForPrompt(patterns, limit = 10) {
    if (!patterns || patterns.length === 0) return '';
    const recent = patterns.slice(-limit);
    const formatted = recent.map((p, i) =>
        `${i + 1}. [${(p.category || 'geral').toUpperCase()}] ${p.pattern}`
    ).join('\n');
    return `\n🧬 PADRÕES DE ELITE APROVADOS (aplique nos seus próximos posts):\n${formatted}\n`;
}
