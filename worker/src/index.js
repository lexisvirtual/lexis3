/**
 * Lexis Publisher - Versão: 7.5 (Full Diagnostic & Async)
 */

import { scrapeBlogArticles } from './blog-scraper.js';
import { triageArticles } from './content-triage.js';
import { rewriteArticles } from './content-rewriter.js';
import { publishPostsToGitHub } from './publish-to-github.js';
import { sanitizeOldPosts, performGreatPurge } from './retroactive-audit.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/status') {
            const [triaged, rewritten, published] = await Promise.all([
                env.LEXIS_TRIAGED_ARTICLES.list({ prefix: 'triaged:', limit: 50 }),
                env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: 50 }),
                env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'published:', limit: 10 })
            ]);
            return jsonResponse({
                counts: { triaged: triaged.keys.length, rewritten: rewritten.keys.length },
                triaged: triaged.keys.map(k => k.name),
                rewritten: rewritten.keys.map(k => k.name),
                recently_published: published.keys.map(k => k.name)
            });
        }

        if (url.pathname === '/upgrade-next') {
            ctx.waitUntil((async () => {
                console.log('[ASYNC] Começando...');
                const rew = await rewriteArticles(env, 1);
                if (rew.postsRewritten > 0) {
                    await publishPostsToGitHub(env, 1);
                    console.log(`[ASYNC] OK.`);
                }
            })());
            return jsonResponse({ success: true, message: 'Upgrade async disparado.' });
        }

        if (url.pathname === '/publish') return jsonResponse(await publishPostsToGitHub(env, 1));
        if (url.pathname === '/rewrite') return jsonResponse(await rewriteArticles(env, 1));
        if (url.pathname === '/purge') return jsonResponse(await performGreatPurge(env, 5));

        if (url.pathname === '/cleanup') {
            const namespaces = [env.LEXIS_RAW_ARTICLES, env.LEXIS_TRIAGED_ARTICLES, env.LEXIS_REWRITTEN_POSTS, env.LEXIS_PUBLISHED_POSTS];
            for (const ns of namespaces) {
                const list = await ns.list();
                for (const key of list.keys) await ns.delete(key.name);
            }
            return jsonResponse({ success: true });
        }

        return jsonResponse({ v: '7.5 (Definitive)', routes: ['/status', '/upgrade-next', '/publish', '/rewrite', '/purge', '/cleanup'] });
    },

    async scheduled(event, env, ctx) {
        ctx.waitUntil(runFullPipeline(env));
    }
};

async function runFullPipeline(env) {
    await sanitizeOldPosts(env, 2);
    await scrapeBlogArticles(env)
    await triageArticles(env);
    const rew = await rewriteArticles(env, 1);
    if (rew.postsRewritten > 0) await publishPostsToGitHub(env, 1);
}

function jsonResponse(data) {
    return new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json' } });
}
