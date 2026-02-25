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
import { performGreatPurge, executeLeoCommand, updateFileOnGitHub } from './retroactive-audit.js';
import { getLeoTarget } from './leo-strategy.js';
import { fetchCommands, processTopCommand } from './leo-sync.js';

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

    // 1. Verificar comandos do Hub (LEO-SYNC)
    try {
        const commands = await fetchCommands(env);
        const top = await processTopCommand(env, commands);

        if (top) {
            const slug = top.url.replace(/^\/|\/$/g, '').split('/').pop();
            const isDone = await env.LEXIS_PUBLISHED_POSTS.get(`leo_done:${slug}`);

            if (!isDone) {
                await log(env, `🧠 Hub de Comando: Priorizando ${top.action} para ${top.url}`);
                await executeLeoCommand(env, top);
                return; // Encerra o ciclo de hoje focado no upgrade
            }
        }
    } catch (e) {
        console.error("[PIPELINE-SYNC] Erro ao sincronizar comandos:", e.message);
    }

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

    let busy = null;
    try { busy = busyRaw ? JSON.parse(busyRaw) : null; } catch (_) { busy = { owner: 'unknown' }; }

    let qIndex = null;
    try { qIndex = qualityIndexRaw ? JSON.parse(qualityIndexRaw) : null; } catch (_) { qIndex = null; }

    const lastAuditTs = lastAuditRaw ? parseInt(lastAuditRaw) : null;
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    return {
        v: '7.21',
        engine: 'Upgrade Engine Alpha',
        lock: {
            is_busy: !!busyRaw,
            owner: busy?.owner || null,
            expires: busy?.expires ? new Date(busy.expires).toLocaleTimeString('pt-BR') : null,
        },
        lastLog: statusLog || "Nenhum log disponível",
        queues: {
            triaged: triaged.keys.length,
            rewritten: rewritten.keys.length,
        },
        audit: {
            cursor: cursor || 'reset',
            last_run: lastAuditTs ? new Date(lastAuditTs).toLocaleString('pt-BR') : 'nunca',
        },
        blog: {
            total_posts: parseInt(totalPostsRaw || '0'),
            quality_ema: qIndex?.index || 0,
            target_threshold: qIndex?.threshold || 75,
            status: qIndex?.status === 'active' ? 'Elite Evolution' : 'Data Collection',
        },
        leo: {
            day: dayOfYear,
            target: getLeoTarget(dayOfYear),
            plan_phase: new Date().getMonth() <= 1 ? "Fase 1: Fundação & Informação" :
                new Date().getMonth() === 2 ? "Fase 2: Comparativo" :
                    new Date().getMonth() === 3 ? "Fase 3: Autoridade/Neuro" : "Fase 4+: Conversão/Local",
            reasoning: "Protocolo v1.1: Foco em Expansão Semântica e Consolidação de Clusters."
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

        // --- /leo-sync-brain ---
        if (url.pathname === '/leo-sync-brain') {
            const sheetUrl = env.GOOGLE_SHEETS_COMMAND_URL || "https://script.google.com/macros/s/AKfycbz-96tMxLYXAP2TrMpZFcAur8Ge8qauTSlxflpqa258CJUOGwWeuK_esiI3rnGR4yo/exec";

            await log(env, `📡 Iniciando sync com: ${sheetUrl.substring(0, 40)}...`);

            const commands = await fetchCommands(env);
            await log(env, `📊 Comandos recebidos: ${commands.length}`);

            const top = await processTopCommand(env, commands);

            if (top) {
                const slug = top.url.replace(/^\/|\/$/g, '').split('/').pop();
                const isDone = await env.LEXIS_PUBLISHED_POSTS.get(`leo_done:${slug}`);

                if (isDone) {
                    return jsonResponse({ success: true, message: `O comando para ${slug} já foi executado recentemente.`, command: top });
                }

                await log(env, `🧠 Sync Planilha: Comando prioritário recebido para ${top.url} (${top.action})`);

                ctx.waitUntil((async () => {
                    const owner = await acquireLock(env, 600);
                    if (!owner) return;
                    try {
                        await executeLeoCommand(env, top);
                    } catch (e) {
                        await log(env, `❌ Erro na execução Leo: ${e.message}`);
                    } finally {
                        await releaseLock(env, owner);
                    }
                })());

                return jsonResponse({
                    success: true,
                    message: `Execução de ${top.action} iniciada para ${top.url}. Acompanhe pelo Log.`,
                    command: top
                });
            }

            return jsonResponse({ success: true, message: "Sync concluído. Nenhum comando pendente.", count: commands.length });
        }

        // --- /clear-done ---
        if (url.pathname === '/clear-done') {
            const slug = url.searchParams.get('slug');
            if (slug) {
                await env.LEXIS_PUBLISHED_POSTS.delete(`leo_done:${slug}`);
                return jsonResponse({ success: true, message: `Status de ${slug} resetado.` });
            }
            return jsonResponse({ success: false, message: 'Falta o parâmetro slug.' });
        }

        // --- /force-upgrade ---
        if (url.pathname === '/force-upgrade') {
            const slug = url.searchParams.get('slug');
            if (!slug) return jsonResponse({ success: false, message: 'Falta o parâmetro slug.' }, 400);

            const owner = await acquireLock(env, 300);
            if (!owner) return jsonResponse({ success: false, message: "Sistema ocupado." }, 429);

            try {
                await log(env, `♻️ Reciclagem Forçada: Iniciando upgrade de ${slug}...`);
                const result = await executeLeoCommand(env, {
                    url: `/blog/${slug}`,
                    action: 'ELITE_UPGRADE',
                    priority: 99
                });
                return jsonResponse({ success: true, result });
            } catch (e) {
                return jsonResponse({ success: false, error: e.message });
            } finally {
                await releaseLock(env, owner);
            }
        }

        // --- /debug-write ---
        if (url.pathname === '/debug-write') {
            const path = url.searchParams.get('path');
            const content = await request.text();
            if (!path || !content) return jsonResponse({ success: false, message: 'Falta path ou content.' }, 400);

            const owner = await acquireLock(env, 300);
            if (!owner) return jsonResponse({ success: false, message: "Sistema ocupado." }, 429);

            try {
                const success = await updateFileOnGitHub(env, path, content, `fix: manual debug write to ${path}`);
                return jsonResponse({ success });
            } finally {
                await releaseLock(env, owner);
            }
        }

        // --- /reset-busy ---
        if (url.pathname === '/reset-busy') {
            await env.LEXIS_PUBLISHED_POSTS.delete('system:busy');
            return jsonResponse({ success: true, message: 'Lock forçado a resetar.' });
        }

        // --- /repair-intensivo ---
        if (url.pathname === '/repair-intensivo') {
            const backup = `import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadModal from '../components/LeadModal';
import { useRevealOnScroll, SectionHeader } from '../components/shared';
import WebGLBackground from '../components/WebGLBackground';

const PilarIntensivo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const openModal = () => setIsModalOpen(true);

    useRevealOnScroll();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            setScrollProgress((scrollTop / docHeight) * 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const jsonLdData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": "https://lexis.academy/curso-ingles-intensivo-brasil/#webpage",
                "url": "https://lexis.academy/curso-ingles-intensivo-brasil",
                "name": "Curso de Inglês Intensivo no Brasil: Resultados em Tempo Recorde",
                "description": "O guia completo sobre o curso de inglês intensivo da Lexis Academy. 120 horas de treinamento focado em adultos e executivos.",
                "speakable": {
                    "@type": "SpeakableSpecification",
                    "xpath": ["/html/head/title", "/html/head/meta[@name='description']/@content"]
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Quanto tempo dura um curso de inglês intensivo?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Na Lexis Academy, nosso curso intensivo de elite dura 14 dias, com 10 horas diárias de prática deliberada, totalizando 120 horas de treinamento."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative overflow-x-hidden ana-design-system bg-[#0f172a]">
            <Helmet>
                <title>Curso de Inglês Intensivo no Brasil | Resultados em 14 Dias | Lexis Academy</title>
                <meta name="description" content="Domine o inglês com nosso curso intensivo de elite. 120 horas de imersão total focada em resultados práticos para sua carreira." />
                <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
            </Helmet>

            <style>{\`
                .ana-design-system { --premium-easing: cubic-bezier(0.22, 1, 0.36, 1); --accent-gold: #fbd24c; }
                .scroll-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent-gold); z-index: 9999; }
                .pillar-content h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: #fff; }
                .pillar-content h3 { font-size: 1.5rem; font-weight: 800; color: var(--accent-gold); margin-top: 3rem; }
                .pillar-content p { font-size: 1.125rem; line-height: 1.8; color: #94a3b8; margin-bottom: 1.5rem; }
                .direct-answer { background: rgba(251, 210, 76, 0.05); border-left: 4px solid var(--accent-gold); padding: 2rem; margin: 2rem 0; }
            \`}</style>

            <div className="scroll-progress-bar" style={{ width: \`\${scrollProgress}%\` }} />
            <WebGLBackground opacity={0.3} />
            <Navbar onOpenModal={openModal} />
            <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultCourse="Intensivo Inquiry" />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-4xl mx-auto pillar-content">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Curso de Inglês <span className="text-[#fbd24c]">Intensivo</span> no Brasil</h1>

                    <section>
                        <h2>O que esperar de um curso intensivo de elite?</h2>
                        <div className="direct-answer">
                            <h3>Resposta Direta</h3>
                            <p>Um curso de inglês intensivo de elite deve oferecer uma carga horária condensada (mínimo 120h) in a short period, focando em habilidades motoras e processamento em tempo real, eliminando a dependência do pensamento gramatical lento.</p>
                        </div>
                        <p>Diferente de cursos tradicionais, o intensivo Lexis é desenhado para profissionais que não têm tempo a perder. Usamos o método 3F para garantir que cada hora de estudo seja convertida em fluência ativa.</p>
                    </section>

                    <section className="mt-20">
                        <h2>Por que escolher o Inglês Intensivo?</h2>
                        <p>Tempo é dinheiro. Estudar por 3 anos para chegar a um nível intermediário é um desperdício de potencial. Na Lexis, aplicamos o princípio da intensidade cognitiva:</p>
                        <ul className="list-disc pl-6 text-slate-400 space-y-4">
                            <li><strong>Foco Total:</strong> Sem interrupções semanais.</li>
                            <li><strong>Ambiente Controlado:</strong> Simulações de mundo real.</li>
                            <li><strong>Feedback Instantâneo:</strong> Correção em tempo real de vícios linguísticos.</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PilarIntensivo;
`;
            const success = await updateFileOnGitHub(env, 'src/pages/PilarIntensivo.jsx', backup, 'fix: emergency restoration of PilarIntensivo.jsx');
            return jsonResponse({ success, message: success ? "Página restaurada!" : "Falha na restauração." });
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
