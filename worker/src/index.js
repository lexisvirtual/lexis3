/**
 * Lexis Publisher - Versão: 8.0 (IPL Execution Engine)
 *
 * Mudanças:
 * - Sincronização Leo 3.0 & Roger 3.0 (KPI Único: IPL)
 * - Protocolo de Integração Lexical Obrigatória
 * - Auto-Check de Performance (IPL_SELF_CHECK)
 */

import { scrapeBlogArticles } from './blog-scraper.js';
import { triageArticles } from './content-triage.js';
import { rewriteArticles } from './content-rewriter.js';
import { publishPostsToGitHub } from './publish-to-github.js';
import { performGreatPurge, executeLeoCommand, updateFileOnGitHub } from './retroactive-audit.js';
import { getLeoTarget } from './leo-strategy.js';
import { fetchCommands, processTopCommand } from './leo-sync.js';
import { getActiveThemeName } from './ana-scheduler.js';
import { runRecyclerCycle, resetRecycler } from './post-recycler.js';

// ================================================
// Helpers
// ================================================
const log = async (env, msg, priority = 'info') => {
    const formattedMsg = `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`;
    console.log(formattedMsg);
    // Só grava no KV se for importante (erro ou sucesso crítico) para economizar Writes
    if (priority === 'error' || priority === 'success' || msg.includes('🚀')) {
        try {
            await env.LEXIS_PUBLISHED_POSTS.put('system:log', formattedMsg);
        } catch (e) {
            console.error("KV Log Falhou:", e.message);
        }
    }
};

const acquireLock = async (env, ttl = 300) => {
    try {
        const existing = await env.LEXIS_PUBLISHED_POSTS.get('system:busy', 'json');
        if (existing && existing.expires) {
            const now = Date.now();
            if (now < existing.expires) {
                return false; // Lock is valid and not yet expired
            }
        }
    } catch (e) {
        // Se falhar o parse do JSON ou o lock estiver mal-formatado, ignoramos e forçamos o novo lock
        console.warn("[LOCK] Erro ao ler lock anterior, limpando...", e.message);
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
            target_threshold: 60, // Calibrado para fluidez de pauta
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

async function runThemeSync(env) {
    const themeName = getActiveThemeName(new Date());
    const themeUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${env.GITHUB_BRANCH}/public/theme/${themeName}.json`;
    const themeRes = await fetch(themeUrl);
    if (!themeRes.ok) throw new Error(`Theme file not found: ${themeName}.json`);
    const themeData = await themeRes.json();

    // 1. Atualiza public para acesso via URL (Legado/API)
    await updateFileOnGitHub(
        env,
        'public/theme/active-theme.json',
        JSON.stringify(themeData, null, 2),
        `chore(ana): update public theme to ${themeName}`
    );

    // 2. Atualiza src/data/cee para o build do Vite (Frontend Real)
    const ceeData = {
        concept: themeData.concept || "Premium Minimal",
        movement_axis: themeData.movement_axis || "static",
        geometry_language: themeData.geometry_language || "linear",
        rhythm_profile: themeData.rhythm_profile || "progressive",
        atmosphere_type: themeData.atmosphere_type || "light_based",
        intensity: themeData.intensity || 0.02,
        mode: themeData.mode || "base",
        event: themeName
    };

    const pushed = await updateFileOnGitHub(
        env,
        'src/data/cee/active-theme.json',
        JSON.stringify(ceeData, null, 2),
        `chore(ana): sync vite theme to ${themeName}`
    );

    return { success: pushed, theme: themeName, intensity: themeData.visual_intensity };
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
            const [rewritten, triagedList, rejections] = await Promise.all([
                env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 20 }),
                env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 20 }),
                env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'rejection_log:', limit: 10 })
            ]);

            const stockpile = await Promise.all(rewritten.keys.map(async k => {
                const data = await env.LEXIS_REWRITTEN_POSTS.get(k.name);
                return JSON.parse(data);
            }));

            const triaged = await Promise.all(triagedList.keys.map(async k => {
                const data = await env.LEXIS_TRIAGED_ARTICLES.get(k.name);
                return JSON.parse(data);
            }));

            const rejected = await Promise.all(rejections.keys.map(async k => {
                const data = await env.LEXIS_PUBLISHED_POSTS.get(k.name);
                return JSON.parse(data);
            }));

            return jsonResponse({
                stockpile: stockpile.map(p => ({ title: p.title, score: p.audit_score, reason: p.audit_reason, date: p.date, version: p.lexis_version })),
                triaged: triaged.map(p => ({ title: p.title, score: p.score, source: p.source })),
                rejected: rejected,
                triaged_count: triagedList.keys.length,
                status: await getStatus(env)
            });
        }

        // --- /force-rewrite ---
        if (url.pathname === '/force-rewrite') {
            await log(env, "⚡ Produção Forçada (Leo Plan) acionada.");
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 1200);
                if (!owner) return;
                try {
                    await rewriteArticles(env, 5);
                    await log(env, "✅ Produção Forçosa finalizada.");
                } finally {
                    await releaseLock(env, owner);
                }
            })());
            return jsonResponse({ success: true, message: "Produção forçada agendada." });
        }

        // --- /auto-publish ---
        if (url.pathname === '/auto-publish') {
            await log(env, "🚀 Trigger manual acionado.");
            const stock = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 1 });

            if (stock.keys.length > 0) {
                await log(env, `📦 Post em estoque detectado. Publicando (trigger manual)...`);
                const result = await publishPostsToGitHub(env, 1);

                if (result.published > 0) {
                    ctx.waitUntil(rewriteArticles(env, 5));
                    return jsonResponse({ success: true, message: "Publicado via Stockpile.", result, status: await getStatus(env) });
                } else {
                    return jsonResponse({ success: false, message: "Falha na publicação.", errors: result.errors, status: await getStatus(env) });
                }
            }

            // Estoque vazio: Produção completa agora
            ctx.waitUntil((async () => {
                const owner = await acquireLock(env, 1200);
                if (!owner) return;
                try {
                    await log(env, "🔄 [MANUAL] Rodando Scraper e Triagem...");
                    await scrapeBlogArticles(env);
                    await triageArticles(env);
                    await rewriteArticles(env, 5);
                    await log(env, "🚀 [MANUAL] Publicando 1 post após refill...");
                    await publishPostsToGitHub(env, 1);
                } finally {
                    await releaseLock(env, owner);
                }
            })());
            return jsonResponse({ success: true, message: "Estoque vazio. Produção completa iniciada.", status: await getStatus(env) });
        }

        // --- /theme-sync (Ana CEE Scheduler Manua) ---
        if (url.pathname === '/theme-sync') {
            try {
                const result = await runThemeSync(env);
                return jsonResponse(result);
            } catch (e) {
                return jsonResponse({ success: false, error: e.message }, 500);
            }
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

        // --- /recycle-status ---
        if (url.pathname === '/recycle-status') {
            const [statusRaw, cursorRaw, complete] = await Promise.all([
                env.LEXIS_PUBLISHED_POSTS.get('recycler:status'),
                env.LEXIS_PUBLISHED_POSTS.get('recycler:cursor'),
                env.LEXIS_PUBLISHED_POSTS.get('recycler:complete')
            ]);
            return jsonResponse({
                complete: !!complete,
                completed_at: complete || null,
                cursor: cursorRaw ? parseInt(cursorRaw) : 0,
                stats: statusRaw ? JSON.parse(statusRaw) : null
            });
        }

        // --- /recycle-reset ---
        if (url.pathname === '/recycle-reset') {
            const result = await resetRecycler(env);
            return jsonResponse(result);
        }

        return jsonResponse({ v: '8.0 IPL Execution Engine', status: await getStatus(env) });
    },

    async scheduled(event, env, ctx) {
        ctx.waitUntil((async () => {
            const owner = await acquireLock(env, 1200); // 20 min lock
            if (!owner) {
                console.log("[SCHEDULED] Sistema ocupado ou lock duplicado. Ignorando.");
                return;
            }

            try {
                const now = new Date();
                const hourBRT = (now.getUTCHours() - 3 + 24) % 24;

                // 0. TEMA (Ana CEE - Proatividade diária às 00:00)
                if (hourBRT === 0) {
                    const themeName = getActiveThemeName(now);
                    const lastTheme = await env.LEXIS_PUBLISHED_POSTS.get('system:lastTheme');
                    if (lastTheme !== themeName) {
                        try {
                            await log(env, `🎨 [ANA] Mudança de estação: ${lastTheme || 'base'} -> ${themeName}`);
                            await runThemeSync(env);
                            await env.LEXIS_PUBLISHED_POSTS.put('system:lastTheme', themeName);
                            await log(env, `✅ [ANA] Tema ${themeName} sincronizado.`);
                        } catch (e) {
                            await log(env, `⚠️ [ANA] Falha no sync automático da Ana: ${e.message}`, 'error');
                        }
                    }
                }

                // 1. PUBLICAÇÃO (Apenas às 06:00 BRT, prioridade máxima)
                if (hourBRT === 6) {
                    const todayKey = `published_date:${new Date().toISOString().split('T')[0]}`;
                    const alreadyPublishedToday = await env.LEXIS_PUBLISHED_POSTS.get(todayKey);
                    if (!alreadyPublishedToday) {
                        await log(env, "🚀 [AUTO] Hora de publicar! Enviando post do dia...", 'success');
                        const result = await publishPostsToGitHub(env, 1);
                        if (result.published > 0) {
                            await env.LEXIS_PUBLISHED_POSTS.put(todayKey, new Date().toISOString(), { expirationTtl: 86400 });
                            await log(env, `✅ [AUTO] Post do dia publicado com sucesso.`, 'success');
                        } else {
                            await log(env, `⚠️ [AUTO] Tentativa de publicação falhou ou sem estoque.`, 'error');
                        }
                    }
                }

                // 2. MANTENIMENTO INTELIGENTE (Para não estourar o limite de KV)
                // Scrape e Triagem apenas a cada 4 horas
                if (hourBRT % 4 === 0) {
                    await log(env, "🔄 [AUTO] Ciclo de Coleta (4h): Scraper e Triagem...");
                    await scrapeBlogArticles(env);
                    await triageArticles(env);
                }

                // Refill Stockpile a cada 2 horas (ou se estiver vazio)
                const currentStock = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 1 });
                if (hourBRT % 2 === 0 || currentStock.keys.length === 0) {
                    await log(env, "⚙️ [AUTO] Ciclo de Refill (2h): Refinando Stockpile...");
                    await rewriteArticles(env, 5);
                }

                // 🌙 RECICLAGEM EM OCIOSIDADE
                // Horas ímpares não usadas pelo pipeline principal: 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
                // Roda após refill apenas se o estoque já estiver cheio (sistema ocioso real)
                const isIdleHour = hourBRT % 2 !== 0;
                if (isIdleHour) {
                    const stockFull = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 5 });
                    if (stockFull.keys.length >= 3) { // Ocioso se tiver 3+ posts em estoque
                        console.log('[RECYCLER] 🌙 Hora ímpar + estoque cheio. Ativando reciclagem em background...');
                        ctx.waitUntil(
                            runRecyclerCycle(env).then(r =>
                                console.log(`[RECYCLER] Ciclo: ${JSON.stringify(r)}`)
                            ).catch(e =>
                                console.error(`[RECYCLER] Erro no ciclo: ${e.message}`)
                            )
                        );
                    }
                }

                await log(env, `✨ [AUTO] Ciclo de manuntenção das ${hourBRT}:00 finalizado.`);

            } catch (e) {
                await log(env, `🚨 [ERRO AUTO] ${e.message}`, 'error');
            } finally {
                await releaseLock(env, owner);
            }
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
