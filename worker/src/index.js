/**
 * Lexis Publisher - Sistema de Automação de Blog Curado
 * Versão: 6.0 (Novo Sistema Completo)
 * 
 * Fluxo: Scraping → Triagem → Reescrita com IA → Imagens → Publicação no GitHub
 * Calibrado para: 1-3 posts de qualidade por dia
 */

import { scrapeBlogArticles } from './blog-scraper.js';
import { triageArticles } from './content-triage.js';
import { rewriteArticles } from './content-rewriter.js';
import { extractAndOptimizeImage } from './image-source-extractor.js';
import { publishPostsToGitHub } from './publish-to-github.js';

export default {
    // =========================================================
    // ROTAS HTTP (API Manual + Diagnóstico)
    // =========================================================
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // --- Raiz: Status do sistema ---
        if (url.pathname === '/' || url.pathname === '') {
            return new Response(JSON.stringify({
                system: 'Lexis Publisher v6.0',
                status: 'online',
                description: 'Sistema de automação de blog curado',
                routes: {
                    '/scrape-blogs': 'Fase 1 - Coleta artigos dos RSS feeds',
                    '/triage-articles': 'Fase 2 - Triagem e scoring dos artigos',
                    '/rewrite-articles': 'Fase 3 - Reescrita com IA (param: ?limit=3)',
                    '/publish-posts': 'Fase 4 - Publicação no GitHub (param: ?limit=3)',
                    '/auto-publish': 'Fluxo completo (Fases 1-4)',
                    '/status': 'Status das filas KV',
                }
            }, null, 2), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- Fase 1: Scraping ---
        if (url.pathname === '/scrape-blogs') {
            try {
                const result = await scrapeBlogArticles(env);
                return jsonResponse(result);
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Fase 2: Triagem ---
        if (url.pathname === '/triage-articles') {
            try {
                const result = await triageArticles(env);
                return jsonResponse(result);
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Fase 3: Reescrita com IA ---
        if (url.pathname === '/rewrite-articles') {
            try {
                const limit = Math.min(parseInt(url.searchParams.get('limit')) || 3, 3);
                const result = await rewriteArticles(env, limit);
                return jsonResponse(result);
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Fase 4: Publicação no GitHub ---
        if (url.pathname === '/publish-posts') {
            try {
                const limit = Math.min(parseInt(url.searchParams.get('limit')) || 3, 3);
                const result = await publishPostsToGitHub(env, limit);
                return jsonResponse(result);
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Fluxo Completo ---
        if (url.pathname === '/auto-publish') {
            try {
                const result = await runFullPipeline(env);
                return jsonResponse(result);
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Status das Filas KV ---
        if (url.pathname === '/status') {
            try {
                const [raw, triaged, rewritten, published] = await Promise.all([
                    env.LEXIS_RAW_ARTICLES.list({ prefix: 'article:', limit: 100 }),
                    env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 100 }),
                    env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 100 }),
                    env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'published:', limit: 100 })
                ]);

                return jsonResponse({
                    success: true,
                    queues: {
                        raw_articles: raw.keys.length,
                        triaged_articles: triaged.keys.length,
                        rewritten_posts: rewritten.keys.length,
                        published_posts: published.keys.length
                    },
                    pipeline_health: {
                        ready_to_rewrite: triaged.keys.length,
                        ready_to_publish: rewritten.keys.length
                    }
                });
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        // --- Limpar TODAS as filas (Reseta tudo para o Zero) ---
        if (url.pathname === '/cleanup-queues') {
            try {
                const namespaces = [
                    env.LEXIS_RAW_ARTICLES,
                    env.LEXIS_TRIAGED_ARTICLES,
                    env.LEXIS_REWRITTEN_POSTS,
                    env.LEXIS_PUBLISHED_POSTS
                ];

                for (const ns of namespaces) {
                    const list = await ns.list({ limit: 1000 });
                    for (const key of list.keys) {
                        await ns.delete(key.name);
                    }
                }
                return jsonResponse({ success: true, message: 'Sistema resetado com sucesso! KVs limpos.' });
            } catch (error) {
                return jsonResponse({ success: false, error: error.message }, 500);
            }
        }

        return new Response('Lexis Publisher v6.0 - Online. Use /status para verificar as filas.', { status: 200 });
    },

    // =========================================================
    // CRON: Executa o pipeline completo todo dia às 09:00 UTC
    // =========================================================
    async scheduled(event, env, ctx) {
        console.log('[CRON] Iniciando pipeline de blog curado às 09:00 UTC (06:00 BRT)...');
        ctx.waitUntil(runFullPipeline(env));
    }
};

// =========================================================
// PIPELINE COMPLETO: Scraping → Triagem → Reescrita → Publicação
// =========================================================
async function runFullPipeline(env) {
    const log = [];
    const startTime = Date.now();

    try {
        // FASE 1: Scraping
        log.push('[FASE 1] Iniciando scraping de blogs premium...');
        const scrapeResult = await scrapeBlogArticles(env);
        log.push(`[FASE 1] ✅ ${scrapeResult.articlesCollected} artigos coletados`);
        if (scrapeResult.errors?.length > 0) {
            log.push(`[FASE 1] ⚠️ Erros: ${scrapeResult.errors.map(e => e.feed + ': ' + e.error).join(' | ')}`);
        }

        // FASE 2: Triagem
        log.push('[FASE 2] Iniciando triagem inteligente...');
        const triageResult = await triageArticles(env);
        log.push(`[FASE 2] ✅ ${triageResult.approved} aprovados, ${triageResult.rejected} rejeitados`);

        if (triageResult.approved === 0) {
            log.push('[FASE 2] ℹ️ Nenhum artigo aprovado. Pipeline encerrado.');
            return buildResult(log, startTime, scrapeResult, triageResult, null, null);
        }

        // FASE 3: Reescrita com IA (máx 3 posts por dia)
        const postsToRewrite = Math.min(triageResult.approved, 3);
        log.push(`[FASE 3] Reescrevendo ${postsToRewrite} post(s) com IA...`);
        const rewriteResult = await rewriteArticles(env, postsToRewrite);
        log.push(`[FASE 3] ✅ ${rewriteResult.postsRewritten} post(s) reescritos`);

        if (rewriteResult.postsRewritten === 0) {
            log.push('[FASE 3] ℹ️ Nenhum post reescrito. Pipeline encerrado.');
            return buildResult(log, startTime, scrapeResult, triageResult, rewriteResult, null);
        }

        // FASE 4: Publicação no GitHub
        log.push(`[FASE 4] Publicando ${rewriteResult.postsRewritten} post(s) no GitHub...`);
        const publishResult = await publishPostsToGitHub(env, rewriteResult.postsRewritten);
        log.push(`[FASE 4] ✅ ${publishResult.published} post(s) publicados`);
        if (publishResult.errors?.length > 0) {
            log.push(`[FASE 4] ⚠️ Erros de publicação: ${publishResult.errors.map(e => e.post + ': ' + e.error).join(' | ')}`);
        }

        return buildResult(log, startTime, scrapeResult, triageResult, rewriteResult, publishResult);

    } catch (error) {
        log.push(`[PIPELINE] ❌ Erro crítico: ${error.message}`);
        console.error('[PIPELINE] Erro crítico:', error);
        return {
            success: false,
            error: error.message,
            log,
            durationMs: Date.now() - startTime
        };
    }
}

function buildResult(log, startTime, scrape, triage, rewrite, publish) {
    return {
        success: true,
        summary: {
            articles_scraped: scrape?.articlesCollected || 0,
            articles_approved: triage?.approved || 0,
            articles_rejected: triage?.rejected || 0,
            posts_rewritten: rewrite?.postsRewritten || 0,
            posts_published: publish?.published || 0,
            publish_errors: publish?.errors?.length || 0
        },
        log,
        durationMs: Date.now() - startTime
    };
}

// Utilitário: Resposta JSON
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
