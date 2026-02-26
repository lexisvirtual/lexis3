/**
 * Lexis Publisher - Versão: 7.21 (Stockpile Engine v3.0)
 *
 * Mudanças:
 * - Implementação de Golden Queue (Estoque de 5 posts)
 * - Separação total entre Produção (Refill) e Publicação (06:00 BRT)
 * - Novo Endpoint /pauta para dashboard
 * - Auditoria Roger escalada para 80 pontos
 */

import { scrapeBlogArticles } from './blog-scraper.js';
import { triageArticles } from './content-triage.js';
import { rewriteArticles } from './content-rewriter.js';
import { publishPostsToGitHub } from './publish-to-github.js';
import { performGreatPurge, executeLeoCommand, updateFileOnGitHub } from './retroactive-audit.js';
import { getLeoTarget } from './leo-strategy.js';
import { fetchCommands, processTopCommand } from './leo-sync.js';

// ================================================
// Helpers
// ================================================
const log = async (env, msg) =>
    env.LEXIS_PUBLISHED_POSTS.put('system:log', `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);

const acquireLock = async (env, ttl = 300) => {
    const existingRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:busy', 'json');
    if (existingRaw) {
        const isStale = existingRaw.expires && Date.now() > existingRaw.expires;
        if (!isStale) return false;
    }
    const token = {
        owner: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        expires: Date.now() + (ttl * 1000)
    };
    await env.LEXIS_PUBLISHED_POSTS.put('system:busy', JSON.stringify(token), { expirationTtl: ttl + 60 });
    return token.owner;
};

const releaseLock = async (env, owner = null) => {
    if (owner) {
        const currentRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:busy', 'json');
        if (currentRaw && currentRaw.owner !== owner) return;
    }
    await env.LEXIS_PUBLISHED_POSTS.delete('system:busy');
};

const getStatus = async (env) => {
    const [
        triaged, rewritten, published,
        busyRaw, statusLog, cursor,
        lastAuditRaw, totalPostsRaw, qIndexRaw
    ] = await Promise.all([
        env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 }),
        env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 20 }),
        env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'published:', limit: 10 }),
        env.LEXIS_PUBLISHED_POSTS.get('system:busy'),
        env.LEXIS_PUBLISHED_POSTS.get('system:log'),
        env.LEXIS_PUBLISHED_POSTS.get('system:auditCursor'),
        env.LEXIS_PUBLISHED_POSTS.get('system:lastAudit'),
        env.LEXIS_PUBLISHED_POSTS.get('system:totalPosts'),
        env.LEXIS_PUBLISHED_POSTS.get('system:qualityIndex'),
    ]);

    let busy = null;
    try { busy = busyRaw ? JSON.parse(busyRaw) : null; } catch (_) { busy = null; }

    let qIndex = null;
    try { qIndex = qIndexRaw ? JSON.parse(qIndexRaw) : null; } catch (_) { qIndex = null; }

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    return {
        v: '7.21',
        engine: 'Stockpile Engine v3.0',
        lock: {
            is_busy: !!busyRaw,
            owner: busy?.owner || null,
            expires: busy?.expires ? new Date(busy.expires).toLocaleTimeString('pt-BR') : null,
        },
        lastLog: statusLog || "Nenhum log",
        queues: {
            triaged: triaged.keys.length,
            rewritten: rewritten.keys.length,
        },
        audit: {
            cursor: cursor || 'reset',
            last_run: lastAuditRaw ? new Date(parseInt(lastAuditRaw)).toLocaleString('pt-BR') : 'nunca',
        },
        blog: {
            total_posts: parseInt(totalPostsRaw || '0'),
            quality_ema: qIndex?.index || 0,
            target_threshold: qIndex?.threshold || 80,
            status: 'Elite Evolution'
        },
        leo: {
            day: dayOfYear,
            target: getLeoTarget(dayOfYear),
            plan_phase: "Fase 1: Fundação & Informação",
            reasoning: "Protocolo v3.0: Stockpile Mode Ativado."
        }
    };
};

async function runPublishPipeline(env, limit = 1) {
    // Pipeline legado agora redirecionado para Stockpile Refill
    return await rewriteArticles(env, 5);
}

// ================================================
// Handler Principal
// ================================================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        // --- /pauta ---
        if (url.pathname === '/pauta') {
            const [rewritten, triaged, rejections] = await Promise.all([
                env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 20 }),
                env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 }),
                env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'rejection_log:', limit: 10 })
            ]);

            const stockpile = await Promise.all(rewritten.keys.map(async k => {
                const data = await env.LEXIS_REWRITTEN_POSTS.get(k.name);
                return JSON.parse(data);
            }));

            const rejected = await Promise.all(rejections.keys.map(async k => {
                const data = await env.LEXIS_PUBLISHED_POSTS.get(k.name);
                return JSON.parse(data);
            }));

            return jsonResponse({
                stockpile: stockpile.map(p => ({ title: p.title, score: p.audit_score, reason: p.audit_reason, date: p.date, version: p.lexis_version })),
                rejected: rejected,
                triaged_count: triaged.keys.length,
                status: await getStatus(env)
            });
        }

        // --- /auto-publish ---
        if (url.pathname === '/auto-publish') {
            await log(env, "🚀 Trigger manual acionado.");
            const stock = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 1 });

            if (stock.keys.length > 0) {
                await log(env, `📦 Post em estoque detectado. Publicando...`);
                await publishPostsToGitHub(env, 1);
                ctx.waitUntil(rewriteArticles(env, 5));
                return jsonResponse({ success: true, message: "Publicado via Stockpile.", status: await getStatus(env) });
            }

            // Fallback: se estiver vazio, produz um agora
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 600);
                if (!owner) return;
                try { await rewriteArticles(env, 5); } finally { await releaseLock(env, owner); }
            })());
            return jsonResponse({ success: true, message: "Estoque vazio. Produção iniciada.", status: await getStatus(env) });
        }

        // --- /reset-busy ---
        if (url.pathname === '/reset-busy') {
            await env.LEXIS_PUBLISHED_POSTS.delete('system:busy');
            return jsonResponse({ success: true, message: 'Lock forçado a resetar.' });
        }

        // --- /audit-now ---
        if (url.pathname === '/audit-now') {
            const owner = await acquireLock(env, 600);
            if (!owner) return jsonResponse({ success: false, message: "Sistema ocupado." }, 429);
            ctx.waitUntil((async () => {
                try { await performGreatPurge(env, 2); } finally { await releaseLock(env, owner); }
            })());
            return jsonResponse({ success: true, message: "Auditoria iniciada." });
        }

        return jsonResponse({ v: '7.21 Stockpile Engine', status: await getStatus(env) });
    },

    async scheduled(event, env, ctx) {
        const now = new Date();
        const hourBRT = (now.getUTCHours() - 3 + 24) % 24;

        if (hourBRT === 6) {
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 300);
                if (!owner) return;
                try { await publishPostsToGitHub(env, 1); } finally { await releaseLock(env, owner); }
            })());
        }

        ctx.waitUntil((async () => {
            const owner = await acquireLock(env, 600);
            if (!owner) return;
            try { await rewriteArticles(env, 5); } finally { await releaseLock(env, owner); }
        })());
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
