/**
 * Lexis Publisher - Versão: 7.19 (10/10 Quality Foundation)
 *
 * Upgrades sobre v7.18:
 * - Lock com Owner Token: system:busy agora carrega { owner, expires }
 *   impedindo unlock indevido por execução paralela antiga
 * - Watchdog de TTL: acquireLock auto-reseta locks genuinamente expirados
 *   sem aguardar o TTL do KV, eliminando estado preso permanente
 * - Score Histórico: retroactive-audit.js salva { score, lastAudit } por post
 *   evitando reprocessar posts já auditados recentemente
 */

import { scrapeBlogArticles } from './blog-scraper.js';
import { triageArticles } from './content-triage.js';
import { rewriteArticles } from './content-rewriter.js';
import { publishPostsToGitHub } from './publish-to-github.js';
import { performGreatPurge } from './retroactive-audit.js';
import { getLeoTarget } from './leo-strategy.js';

// ================================================
// Helpers
// ================================================
const log = async (env, msg) =>
    env.LEXIS_PUBLISHED_POSTS.put('system:log', `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);

const acquireLock = async (env, ttl = 300) => {
    // 1. Ler lock existente
    const existingRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:busy', 'json');

    if (existingRaw) {
        // Watchdog: se o lock existe mas já está genuinamente expirado, auto-reseta
        const isStale = existingRaw.expires && Date.now() > existingRaw.expires;
        if (!isStale) return false; // Lock legítimo ativo — recusar
        console.warn(`[LOCK] Watchdog: lock expirado de '${existingRaw.owner}' auto-resetado.`);
    }

    // 2. Gravar lock com owner token único
    const token = {
        owner: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        expires: Date.now() + (ttl * 1000)
    };
    await env.LEXIS_PUBLISHED_POSTS.put('system:busy', JSON.stringify(token), { expirationTtl: ttl + 60 });
    return token.owner; // Retorna o token (truthy = sucesso)
};

const releaseLock = async (env, owner = null) => {
    if (owner) {
        // Validação: só apaga o lock se o owner bater
        const currentRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:busy', 'json');
        if (currentRaw && currentRaw.owner !== owner) {
            console.warn(`[LOCK] Release ignorado: owner '${owner}' != atual '${currentRaw?.owner}'.`);
            return; // Não libera lock de outra execução
        }
    }
    await env.LEXIS_PUBLISHED_POSTS.delete('system:busy');
};

// ================================================
// Pipeline de Publicação Diária
// ================================================
async function runPublishPipeline(env, limit = 1) {
    await log(env, "Pipeline de publicação iniciada.");

    const triaged = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 1 });
    if (triaged.keys.length === 0) {
        await log(env, "Fila vazia. Buscando novas fontes...");
        await scrapeBlogArticles(env);
        await triageArticles(env);
    }

    // Verificar novamente após scraping
    const triagedAfter = await env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 1 });
    if (triagedAfter.keys.length === 0) {
        // Fila AINDA vazia = sistema ocioso → micro-auditoria de 1 post
        await log(env, "Sem conteúdo novo. Rodando micro-auditoria de ociosidade (1 post)...");
        await performGreatPurge(env, 1);
        return;
    }

    await log(env, "Fabricando ativo de elite (8b)...");
    const res = await rewriteArticles(env, limit);

    if (res.postsRewritten > 0) {
        await log(env, `${res.postsRewritten} post(s) prontos. Publicando no GitHub...`);
        await publishPostsToGitHub(env, limit);
        await log(env, "✅ Publicação concluída.");
    } else {
        await log(env, "⚠️ Nenhum artigo qualificado após reescrita.");
    }
}

// ================================================
// Auditoria Semanal de Domingo
// ================================================
async function runSundayAudit(env) {
    await log(env, "🛡️ Auditoria Semanal de Domingo iniciada (lote de 2 posts).");
    const result = await performGreatPurge(env, 2);
    await log(env, `🛡️ Auditoria concluída: ${result.approved?.length || 0} aprovados, ${result.deleted?.length || 0} removidos. Próximo cursor: ${result.nextCursor || 'reset'}.`);
    return result;
}

// ================================================
// Status
// ================================================
const getStatus = async (env) => {
    const [
        triaged, rewritten, published,
        busyRaw, statusLog, cursor,
        lastAuditRaw, totalPostsRaw, aboveRaw, belowRaw, qualityIndexRaw
    ] = await Promise.all([
        env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 }),
        env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 20 }),
        env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'published:', limit: 10 }),
        env.LEXIS_PUBLISHED_POSTS.get('system:busy'),
        env.LEXIS_PUBLISHED_POSTS.get('system:log'),
        env.LEXIS_PUBLISHED_POSTS.get('system:auditCursor'),
        env.LEXIS_PUBLISHED_POSTS.get('system:lastAudit'),
        env.LEXIS_PUBLISHED_POSTS.get('system:totalPosts'),
        env.LEXIS_PUBLISHED_POSTS.get('system:postsAboveThreshold'),
        env.LEXIS_PUBLISHED_POSTS.get('system:postsBelowThreshold'),
        env.LEXIS_PUBLISHED_POSTS.get('system:qualityIndex'),
    ]);

    let busyInfo = null;
    try { busyInfo = busyRaw ? JSON.parse(busyRaw) : null; } catch (_) { busyInfo = busyRaw ? { owner: 'unknown' } : null; }

    let qualityIndex = null;
    try { qualityIndex = qualityIndexRaw ? JSON.parse(qualityIndexRaw) : null; } catch (_) { qualityIndex = null; }

    const lastAuditTs = lastAuditRaw ? parseInt(lastAuditRaw) : null;

    return {
        v: '7.20',
        engine: 'Upgrade Engine Alpha',
        lock: {
            is_busy: !!busyRaw,
            owner: busyInfo?.owner || null,
            expires: busyInfo?.expires ? new Date(busyInfo.expires).toLocaleTimeString('pt-BR') : null,
        },
        last_log: statusLog,
        queues: {
            triaged: triaged.keys.length,
            rewritten: rewritten.keys.length,
        },
        audit: {
            cursor: cursor || 'reset',
            last_run: lastAuditTs ? new Date(lastAuditTs).toLocaleString('pt-BR') : 'nunca',
            last_run_ts: lastAuditTs,
        },
        blog: {
            total_posts: parseInt(totalPostsRaw || '0'),
            quality_ema: qualityIndex?.index || null,
            target_threshold: qualityIndex?.threshold || 75,
            status: qualityIndex?.status === 'active' ? 'Elite Evolution' : 'Data Collection',
            samples: qualityIndex?.samples || 0,
            posts_below_threshold: parseInt(belowRaw || '0'),
        },
        recent_published: published.keys.map(k => k.name.replace('published:', '')),
        leo: {
            day: Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)),
            target: (() => {
                const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
                try { return getLeoTarget(day); } catch (e) { return null; }
            })(),
            plan_phase: new Date().getMonth() <= 1 ? "Fase 1: Fundação & Informação" :
                new Date().getMonth() === 2 ? "Fase 2: Comparativo" :
                    new Date().getMonth() === 3 ? "Fase 3: Autoridade/Neuro" : "Fase 4+: Conversão/Local",
            reasoning: "Protocolo v1.1: Priorizando Expansão Semântica e Consolidação de Clusters Informativos."
        }
    };
};

// ================================================
// Handler Principal
// ================================================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // --- Handle CORS Preflight ---
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        // --- /auto-publish ---
        if (url.pathname === '/auto-publish') {
            const limit = parseInt(url.searchParams.get('limit')) || 1;
            await log(env, "🚀 Trigger manual acionado.");

            // Fase 1: publicação imediata se houver posts prontos
            const checkRewritten = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 5 });
            if (checkRewritten.keys.length > 0) {
                await log(env, `📦 ${checkRewritten.keys.length} posts prontos. Publicando imediatamente...`);
                const pub = await publishPostsToGitHub(env, 5);
                return jsonResponse({ success: true, message: `${pub.published} post(s) publicados.`, status: await getStatus(env) });
            }

            // Fase 2: produção no background
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 300);
                if (!owner) return;
                try { await runPublishPipeline(env, limit); }
                catch (e) { await log(env, `❌ ERRO: ${e.message}`); }
                finally { await releaseLock(env, owner); }
            })());

            return jsonResponse({
                success: true,
                message: "Produção iniciada. Aguarde 30-60s e clique novamente para publicar.",
                status: await getStatus(env)
            });
        }

        // --- /audit-now ---
        if (url.pathname === '/audit-now') {
            const owner = await acquireLock(env, 600);
            if (!owner) {
                return jsonResponse({ success: false, message: "Sistema ocupado. Tente novamente em alguns instantes." }, 429);
            }

            ctx.waitUntil((async () => {
                try {
                    await log(env, "🔍 Auditoria manual iniciada (lote de 2 posts).");
                    const result = await performGreatPurge(env, 2);
                    await log(env, `🔍 Auditoria concluída: ${result.approved?.length || 0} aprovados, ${result.deleted?.length || 0} removidos. Cursor: ${result.nextCursor || 'reset'}.`);
                } catch (e) {
                    await log(env, `❌ Erro na auditoria: ${e.message}`);
                } finally {
                    await releaseLock(env, owner);
                }
            })());

            return jsonResponse({ success: true, message: "Auditoria iniciada no background. Monitore via /status.", status: await getStatus(env) });
        }

        // --- /status ---
        if (url.pathname === '/status') return jsonResponse({ v: '7.19', status: await getStatus(env) });

        // --- /reset-busy ---
        if (url.pathname === '/reset-busy') {
            await releaseLock(env); // Force-reset sem validação de owner (rota de emergência)
            return jsonResponse({ success: true, message: 'Lock forçado a resetar.' });
        }

        return jsonResponse({ v: '7.19 Quality Foundation', status: await getStatus(env) });
    },

    // ================================================
    // CRON Handlers
    // ================================================
    async scheduled(event, env, ctx) {
        const isSunday = new Date().getUTCDay() === 0;

        if (isSunday) {
            // Domingo: Auditoria semanal (lote maior)
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 900);
                if (!owner) return;
                try { await runSundayAudit(env); }
                catch (e) { await log(env, `❌ Erro na auditoria de domingo: ${e.message}`); }
                finally { await releaseLock(env, owner); }
            })());
        } else {
            // Dias normais: Pipeline de publicação
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 300);
                if (!owner) return;
                try { await runPublishPipeline(env, 1); }
                catch (e) { await log(env, `❌ Erro no pipeline: ${e.message}`); }
                finally { await releaseLock(env, owner); }
            })());
        }
    }
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
