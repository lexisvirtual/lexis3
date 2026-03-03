/**
 * Post Recycler (Background Elite Upgrade)
 *
 * Objetivo: Reciclar todos os posts existentes com os novos padrões de elite
 *           durante os momentos de ociosidade do sistema (horas ímpares).
 *
 * Regras de segurança:
 * - Processa APENAS 1 post por ciclo (evita timeout do Worker)
 * - Marca cada post reciclado em KV (não reprocessa)
 * - Só roda quando o lock principal NÃO está ativo
 * - Não interfere com o pipeline de produção (Leo/Roger normal)
 * - Para automaticamente quando não há mais posts para reciclar
 *
 * KV Keys:
 *   recycler:done:<slug>     = '1'    → post já reciclado
 *   recycler:cursor          = índice → próximo post na fila
 *   recycler:status          = JSON   → relatório de progresso
 */

import { auditPost } from './content-auditor.js';
import { callOpenAI } from './multi-model.js';
import { updateFileOnGitHub } from './retroactive-audit.js';
import { loadElitePatterns, formatPatternsForPrompt } from './post-retrospective.js';

const RECYCLER_PREFIX = 'recycler:done:';
const RECYCLER_CURSOR = 'recycler:cursor';
const RECYCLER_STATUS = 'recycler:status';
const RECYCLER_COMPLETE = 'recycler:complete';
const MIN_SCORE_TO_PUBLISH = 75; // Padrão mínimo para substituir o original

// ───────────────────────────────────────────────────────────────
// PONTO DE ENTRADA (chamado do Worker durante ociosidade)
// ───────────────────────────────────────────────────────────────

export async function runRecyclerCycle(env) {
    // 1. Verificar se o processo já terminou
    const isComplete = await env.LEXIS_PUBLISHED_POSTS.get(RECYCLER_COMPLETE);
    if (isComplete) {
        console.log('[RECYCLER] ✅ Processo de reciclagem já concluído. Nada a fazer.');
        return { done: true, skipped: true };
    }

    // 2. Buscar lista de posts no GitHub
    const token = env.GITHUB_TOKEN;
    if (!token) return { done: false, error: 'GITHUB_TOKEN ausente' };

    let allFiles;
    try {
        const res = await fetch(
            `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts?ref=${env.GITHUB_BRANCH || 'main'}`,
            { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisRecycler/1.0' } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        allFiles = (await res.json()).filter(f => f.name.endsWith('.md'));
    } catch (e) {
        console.error(`[RECYCLER] Erro ao buscar posts: ${e.message}`);
        return { done: false, error: e.message };
    }

    // 3. Encontrar próximo post NÃO reciclado (a partir do cursor)
    const cursorRaw = await env.LEXIS_PUBLISHED_POSTS.get(RECYCLER_CURSOR);
    const cursorStart = cursorRaw ? parseInt(cursorRaw) : 0;

    let targetFile = null;
    let nextCursor = cursorStart;

    for (let i = cursorStart; i < allFiles.length; i++) {
        const slug = allFiles[i].name.replace('.md', '');
        const alreadyDone = await env.LEXIS_PUBLISHED_POSTS.get(`${RECYCLER_PREFIX}${slug}`);
        if (!alreadyDone) {
            targetFile = allFiles[i];
            nextCursor = i + 1;
            break;
        }
    }

    // 4. Sem mais posts → processo concluído
    if (!targetFile) {
        await env.LEXIS_PUBLISHED_POSTS.put(RECYCLER_COMPLETE, new Date().toISOString());
        const statusRaw = await env.LEXIS_PUBLISHED_POSTS.get(RECYCLER_STATUS);
        const status = statusRaw ? JSON.parse(statusRaw) : {};
        status.completed_at = new Date().toISOString();
        status.total_processed = allFiles.length;
        await env.LEXIS_PUBLISHED_POSTS.put(RECYCLER_STATUS, JSON.stringify(status));
        console.log(`[RECYCLER] 🏁 Reciclagem completa! ${allFiles.length} posts processados.`);
        return { done: true, completed: true, total: allFiles.length };
    }

    // 5. Salvar cursor para próximo ciclo
    await env.LEXIS_PUBLISHED_POSTS.put(RECYCLER_CURSOR, String(nextCursor));

    console.log(`[RECYCLER] 🔄 Reciclando: ${targetFile.name} (${nextCursor}/${allFiles.length})`);

    // 6. Executar reciclagem do post
    const result = await recyclePost(env, targetFile);

    // 7. Marcar como processado (independente do resultado)
    const slug = targetFile.name.replace('.md', '');
    await env.LEXIS_PUBLISHED_POSTS.put(
        `${RECYCLER_PREFIX}${slug}`,
        JSON.stringify({ processed_at: new Date().toISOString(), ...result }),
        { expirationTtl: 86400 * 365 } // 1 ano
    );

    // 8. Atualizar status geral
    await updateRecyclerStatus(env, targetFile.name, result, nextCursor, allFiles.length);

    return { done: false, file: targetFile.name, result, remaining: allFiles.length - nextCursor };
}

// ───────────────────────────────────────────────────────────────
// RECICLAGEM DE UM POST
// ───────────────────────────────────────────────────────────────

async function recyclePost(env, file) {
    try {
        // 1. Buscar conteúdo atual
        const res = await fetch(file.download_url);
        const originalContent = await res.text();

        // 2. Carregar padrões de elite acumulados
        const elitePatterns = await loadElitePatterns(env);
        const patternsBlock = formatPatternsForPrompt(elitePatterns, 15);

        // 3. Auditar versão atual (para ter baseline)
        const originalAudit = await auditPost(env, { title: file.name, content: originalContent });
        const originalScore = originalAudit.score || 0;

        console.log(`[RECYCLER] Score original de "${file.name}": ${originalScore}`);

        // 4. Se já está em 95+, marcar como elite e pular reescrita
        if (originalScore >= 95) {
            console.log(`[RECYCLER] ⭐ "${file.name}" já é elite (${originalScore}). Marcando e pulando.`);
            return { status: 'skipped_elite', original_score: originalScore };
        }

        // 5. Leo reescreve com os padrões de elite
        const recyclePrompt = buildRecyclePrompt(file.name, originalContent, patternsBlock, originalAudit.reason);
        const recycledContent = await callOpenAI(env, recyclePrompt, 'Você é Leo 3.0, reciclando um post existente com padrões de elite.');

        if (!recycledContent || recycledContent.length < 500) {
            return { status: 'error', reason: 'Conteúdo reciclado muito curto ou vazio' };
        }

        // 6. Roger audita a versão reciclada
        const newAudit = await auditPost(env, { title: file.name, content: recycledContent });
        const newScore = newAudit.score || 0;

        console.log(`[RECYCLER] Score reciclado de "${file.name}": ${newScore} (era ${originalScore})`);

        // 7. Só publica se melhorou E atingiu o mínimo
        if (newScore >= MIN_SCORE_TO_PUBLISH && newScore > originalScore) {
            // Injetar marcador de reciclagem no frontmatter
            const finalContent = injectRecycledMarker(recycledContent);
            const pushed = await updateFileOnGitHub(
                env,
                `src/posts/${file.name}`,
                finalContent,
                `refactor(recycler): elite upgrade "${file.name}" ${originalScore}→${newScore}pts`
            );

            if (pushed) {
                console.log(`[RECYCLER] ✅ "${file.name}" publicado: ${originalScore} → ${newScore}pts`);
                return { status: 'upgraded', original_score: originalScore, new_score: newScore };
            } else {
                return { status: 'push_failed', original_score: originalScore, new_score: newScore };
            }
        } else {
            // Não melhorou suficientemente — marca como processado mas não publica
            console.log(`[RECYCLER] ⚠️ "${file.name}" não melhorou o suficiente (${originalScore} → ${newScore}). Mantendo original.`);
            return { status: 'no_improvement', original_score: originalScore, new_score: newScore };
        }

    } catch (e) {
        console.error(`[RECYCLER] ❌ Erro ao reciclar "${file.name}": ${e.message}`);
        return { status: 'error', reason: e.message };
    }
}

// ───────────────────────────────────────────────────────────────
// PROMPT DE RECICLAGEM (Leo 3.0 com padrões de elite)
// ───────────────────────────────────────────────────────────────

function buildRecyclePrompt(filename, originalContent, patternsBlock, rogerFeedback) {
    return `Você é Leo 3.0, Diretor de Performance Linguística da Lexis Academy.

MISSÃO: Reciclar um post existente aplicando os padrões de elite aprendidos e o protocolo IPL.

${patternsBlock}

🚨 REGRAS DE RECICLAGEM:
1. Preserve o tema e o título original (apenas melhore).
2. Aplique os padrões de elite acima em cada seção.
3. Mantenha a estrutura: Quick Answer → Anatomia → Tabela AMADOR/ELITE → Treino Lexis (N1/N2/N3) → Drill 7 Dias → FAQ.
4. Tabela AMADOR vs ELITE com frases reais (não descrições genéricas).
5. Cenário de pressão realista (boardroom, negociação, crise).
6. Mínimo 10 expressões C1 que reaparecem nos desafios.
7. Mantenha o frontmatter YAML existente (apenas adicione/atualize campos necessários).
8. Retorne o arquivo COMPLETO (frontmatter + markdown). Comece com ---.

${rogerFeedback ? `📌 FEEDBACK DO AUDITOR ANTERIOR: "${rogerFeedback}"` : ''}

CONTEÚDO ORIGINAL A RECICLAR:
${originalContent.substring(0, 3500)}`;
}

// ───────────────────────────────────────────────────────────────
// INJETAR MARCADOR NO FRONTMATTER
// ───────────────────────────────────────────────────────────────

function injectRecycledMarker(content) {
    const marker = `recycled_at: "${new Date().toISOString().split('T')[0]}"\nlexis_version: "4.0-recycled"\n`;
    const secondDash = content.indexOf('---', 3);
    if (secondDash === -1) return content;
    const fm = content.substring(0, secondDash);
    const body = content.substring(secondDash);
    // Remove marcadores antigos para evitar duplicação
    const cleanFm = fm
        .replace(/recycled_at:.*\n/g, '')
        .replace(/lexis_version:.*\n/g, '');
    return cleanFm + marker + body;
}

// ───────────────────────────────────────────────────────────────
// ATUALIZAR STATUS NO KV
// ───────────────────────────────────────────────────────────────

async function updateRecyclerStatus(env, filename, result, cursor, total) {
    try {
        const raw = await env.LEXIS_PUBLISHED_POSTS.get(RECYCLER_STATUS);
        const status = raw ? JSON.parse(raw) : {
            upgraded: 0, skipped_elite: 0, no_improvement: 0, error: 0,
            push_failed: 0, started_at: new Date().toISOString(), last_file: null
        };

        const key = result.status || 'error';
        status[key] = (status[key] || 0) + 1;
        status.last_file = filename;
        status.progress = `${cursor}/${total}`;
        status.updated_at = new Date().toISOString();

        await env.LEXIS_PUBLISHED_POSTS.put(RECYCLER_STATUS, JSON.stringify(status));
    } catch (e) {
        console.error(`[RECYCLER] Erro ao salvar status: ${e.message}`);
    }
}

// ───────────────────────────────────────────────────────────────
// RESET (para reiniciar reciclagem do zero se necessário)
// ───────────────────────────────────────────────────────────────

export async function resetRecycler(env) {
    await env.LEXIS_PUBLISHED_POSTS.delete(RECYCLER_COMPLETE);
    await env.LEXIS_PUBLISHED_POSTS.delete(RECYCLER_CURSOR);
    await env.LEXIS_PUBLISHED_POSTS.delete(RECYCLER_STATUS);
    console.log('[RECYCLER] 🔄 Recycler resetado. Na próxima ociosidade, reinicia do zero.');
    return { success: true, message: 'Recycler resetado.' };
}
