/**
 * Sistema de Auditoria Retroativa - Lexis Academy v7.20 Upgrade Engine Alpha
 *
 * Arquitetura de Célula Evolutiva:
 * - EMA (Média Móvel Exponencial): Sensibilidade a tendências de qualidade.
 * - Upgrade Engine: Posts 60-74 são REESCRITOS estruturalmente, não deletados.
 * - Ciclo de Vida: Raw -> Improving -> Optimized -> Authority -> Elite.
 */

import { auditPost } from './content-auditor.js';

const log = async (env, msg) =>
    env.LEXIS_PUBLISHED_POSTS.put('system:log', `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);


// ================================================
// Utilitários
// ================================================
function simpleHash(text) {
    return Math.abs(
        String(text).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)
    ).toString(36);
}

async function deleteFileFromGitHub(env, path, slug, link, message) {
    const token = env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;

    try {
        const getRes = await fetch(`${apiUrl}?ref=${env.GITHUB_BRANCH || 'main'}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisQA/1.0' }
        });
        if (!getRes.ok) return false;
        const fileData = await getRes.json();

        const delRes = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'LexisQA/1.0' },
            body: JSON.stringify({ message, sha: fileData.sha, branch: env.GITHUB_BRANCH || 'main' })
        });

        // Banir o link globalmente se deletado com sucesso
        if (delRes.ok && link) {
            await env.LEXIS_PUBLISHED_POSTS.put(`killed:${simpleHash(link)}`, 'true', { expirationTtl: 31536000 });
        }
        return delRes.ok;
    } catch (e) {
        console.error(`[AUDIT-DELETE] Erro: ${e.message}`);
        return false;
    }
}

async function updateFileOnGitHub(env, path, content, message) {
    const token = env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;

    try {
        const getRes = await fetch(`${apiUrl}?ref=${env.GITHUB_BRANCH || 'main'}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisQA/1.0' }
        });
        if (!getRes.ok) return false;
        const fileData = await getRes.json();

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'LexisQA/1.0' },
            body: JSON.stringify({
                message,
                content: btoa(unescape(encodeURIComponent(content))),
                sha: fileData.sha,
                branch: env.GITHUB_BRANCH || 'main'
            })
        });

        return putRes.ok;
    } catch (e) {
        console.error(`[AUDIT-UPDATE] Erro: ${e.message}`);
        return false;
    }
}

async function upgradePostContent(env, file, content, strategy) {
    const prompt = `Você é o Diretor da Lexis Academy realizando um UPGRADE ELITE (Protocolo Leo 2026).
    
    SUA MISSÃO: Transformar este post em um ATIVO DE AUTORIDADE MÁXIMA.
    
    REGRAS DE UPGRADE (OBRIGATÓRIAS):
    1. EXPANSÃO TÉCNICA: Adicione 300-600 palavras de profundidade real sobre o tema.
    2. TABELA COMPARATIVA: Crie uma tabela Markdown comparando o tema central (ex: Imersão Lexis vs Curso Regular ou Intercâmbio).
    3. FAQ BASEADO EM PERGUNTAS REAIS: Adicione uma seção "## Perguntas Frequentes (FAQ)" com no mínimo 5 dúvidas técnicas extraídas de ferramentas de busca.
    4. TÍTULO MAGNÉTICO: Atualize o título no frontmatter para incluir o ano "2026" e uma promessa de impacto.
    5. INTERLINKS: Garanta que o post aponte para as Pillar Pages (/ingles-por-imersao-brasil ou /curso-ingles-intensivo-brasil).
    6. GEO SYNC: Certifique-se de que a seção "[[AI_SNIPPET]]" no frontmatter seja factual e direta para busca por IA.
    7. METODOLOGIA: Reforce o treinamento 3F (Phrase, Fluidity, Function).

    CONTEÚDO ATUAL PARA TRANSFORMAR:
    ${content}`;

    try {
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.3
        });
        return response.response || response;
    } catch (e) {
        throw new Error(`AI Upgrade Fail: ${e.message}`);
    }
}

// ================================================
// Auditoria Principal (Great Purge)
// ================================================
export async function performGreatPurge(env, batchSize = 3) {
    const token = env.GITHUB_TOKEN;
    if (!token) return { success: false, error: 'GITHUB_TOKEN ausente' };

    try {
        // 1. Buscar lista de posts no GitHub
        const res = await fetch(
            `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts?ref=${env.GITHUB_BRANCH || 'main'}`,
            { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisQA/1.0' } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);

        const allFiles = (await res.json()).filter(f => f.name.endsWith('.md'));

        // 2. Controle de cursor para rotação incremental
        const cursorRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:auditCursor');
        const cursorIdx = cursorRaw ? parseInt(cursorRaw) : 0;
        const startIdx = cursorIdx >= allFiles.length ? 0 : cursorIdx;

        // 3. Pegar apenas o lote desta execução
        const batch = allFiles.slice(startIdx, startIdx + batchSize);
        const nextIdx = startIdx + batchSize;

        // Salvar próximo cursor (ou resetar se chegou ao fim)
        if (nextIdx >= allFiles.length) {
            await env.LEXIS_PUBLISHED_POSTS.delete('system:auditCursor');
        } else {
            await env.LEXIS_PUBLISHED_POSTS.put('system:auditCursor', String(nextIdx));
        }

        const results = { approved: [], upgraded: [], deleted: [], skipped: [], errors: [] };
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

        // 4. Auditar cada post do lote
        for (const file of batch) {
            try {
                const fileRes = await fetch(file.download_url);
                const content = await fileRes.text();

                // Posts v2.0 já são elite — pular
                if (content.includes('lexis_version: "2.0"')) {
                    results.skipped.push(file.name);
                    continue;
                }

                // Gerar slug do arquivo para usar como chave do histórico (NOVA SCHEMA post_state)
                const slug = file.name.replace('.md', '');

                // Verificar histórico de auditoria: pular se recente e aprovado
                const stateRaw = await env.LEXIS_PUBLISHED_POSTS.get(`post_state:${slug}`, 'json');
                if (stateRaw) {
                    const ageMs = Date.now() - (stateRaw.lastAudit || 0);
                    if (ageMs < SEVEN_DAYS_MS && stateRaw.score >= 85) {
                        results.skipped.push(`${file.name} (cache: ${stateRaw.score}pts — ${Math.round(ageMs / 86400000)}d atrás)`);
                        continue;
                    }
                }

                // Extrair link original para banimento caso deletado
                const linkMatch = content.match(/\*Fonte Original: \[.*?\]\((.*?)\)\*/);
                const originalLink = linkMatch ? linkMatch[1] : null;

                // Rodar auditoria de qualidade via AI
                await log(env, `Auditando: ${file.name}...`);
                const audit = await auditPost(env, { title: file.name, content });
                const score = audit.score || 0;

                await log(env, `AI Score: ${score} para ${file.name}`);

                // --- MOTOR DE DECISÃO V8.0 ---
                let stage = 'raw';
                if (score < 60) {
                    await log(env, `❌ Score ${score} crítico. Deletando...`);
                    const deleted = await deleteFileFromGitHub(env, `src/posts/${file.name}`, file.name, originalLink, `chore(qa): purge low-quality (${score})`);
                    if (deleted) {
                        await env.LEXIS_PUBLISHED_POSTS.delete(`post_state:${slug}`);
                        results.deleted.push(`${file.name} (${score}pts)`);
                        await log(env, `🗑️ Deletado: ${file.name}`);
                    }
                    continue;
                }

                if (score >= 60 && score < 75) {
                    await log(env, `🛠️ Score ${score} (Improving). Iniciando Upgrade...`);
                    try {
                        const upgradedContent = await upgradePostContent(env, file, content, 'structural');
                        const success = await updateFileOnGitHub(env, `src/posts/${file.name}`, upgradedContent, `feat(qa): upgrade post to elite (score prior: ${score})`);
                        if (success) {
                            stage = 'improving';
                            results.upgraded.push(`${file.name} (${score}pts -> upgrade)`);
                            await log(env, `✅ Upgrade Concluído: ${file.name}`);
                        }
                    } catch (e) {
                        await log(env, `⚠️ Falha no upgrade de ${file.name}: ${e.message}`);
                    }
                } else if (score >= 75 && score < 85) {
                    stage = 'optimized';
                    results.approved.push(`${file.name} (${score}pts)`);
                } else if (score >= 85) {
                    stage = 'authority';
                    results.approved.push(`${file.name} (${score}pts)`);
                }

                // Salvar Estado Evolutivo (substitui audit:slug)
                const newState = {
                    score,
                    verdict: audit.verdict,
                    stage,
                    lastAudit: Date.now(),
                    improvementCount: stateRaw ? (score <= stateRaw.score ? (stateRaw.improvementCount || 0) + 1 : 0) : 0
                };

                await env.LEXIS_PUBLISHED_POSTS.put(`post_state:${slug}`, JSON.stringify(newState), { expirationTtl: 60 * 60 * 24 * 365 });
            } catch (e) {
                console.error(`[AUDIT] Erro em ${file.name}: ${e.message}`);
                results.errors.push(file.name);
            }
        }

        // --- Atualizar contadores de observabilidade ---
        // 1. Salvar timestamp da última auditoria
        await env.LEXIS_PUBLISHED_POSTS.put('system:lastAudit', Date.now().toString());

        // 2. Atualizar contadores above/below threshold com base nos resultados do lote
        const prevAbove = parseInt(await env.LEXIS_PUBLISHED_POSTS.get('system:postsAboveThreshold') || '0');
        const prevBelow = parseInt(await env.LEXIS_PUBLISHED_POSTS.get('system:postsBelowThreshold') || '0');
        const newApproved = results.approved.length + results.upgraded.length;
        const newDeleted = results.deleted.length;

        await env.LEXIS_PUBLISHED_POSTS.put('system:postsAboveThreshold', String(Math.max(0, prevAbove + newApproved - newDeleted)));
        await env.LEXIS_PUBLISHED_POSTS.put('system:postsBelowThreshold', String(Math.max(0, prevBelow - newDeleted)));

        // 3. Decrementar total_posts pelos deletados
        if (newDeleted > 0) {
            const currentTotal = parseInt(await env.LEXIS_PUBLISHED_POSTS.get('system:totalPosts') || '0');
            await env.LEXIS_PUBLISHED_POSTS.put('system:totalPosts', String(Math.max(0, currentTotal - newDeleted)));
        }

        // 4. Recalcular Quality Index (ativa apenas com MIN_SAMPLES)
        await recalculateQualityIndex(env);

        return {
            success: true,
            batchProcessed: batch.length,
            nextCursor: nextIdx >= allFiles.length ? 'reset' : nextIdx,
            totalFiles: allFiles.length,
            ...results
        };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ================================================
// Quality Index — EMA (Exponential Moving Average)
// ================================================
async function recalculateQualityIndex(env) {
    const MIN_SAMPLES = 5; // EMA pode começar mais cedo
    const ALPHA = 0.2;     // Coeficiente de suavização

    try {
        // 1. Listar estados evolutivos
        const stateKeys = await env.LEXIS_PUBLISHED_POSTS.list({ prefix: 'post_state:', limit: 100 });
        const totalSamples = stateKeys.keys.length;

        if (totalSamples < MIN_SAMPLES) {
            await env.LEXIS_PUBLISHED_POSTS.put('system:qualityIndex', JSON.stringify({ index: null, status: 'collecting', samples: totalSamples }));
            return;
        }

        // 2. Buscar scores
        const statePromises = stateKeys.keys.map(k => env.LEXIS_PUBLISHED_POSTS.get(k.name, 'json'));
        const states = await Promise.all(statePromises);
        const scores = states.filter(s => s?.score != null).map(s => s.score);

        // 3. Cálculo EMA
        // Para o primeiro cálculo, usamos a média simples como base
        const simpleAvg = scores.reduce((a, b) => a + b, 0) / scores.length;

        const existingRaw = await env.LEXIS_PUBLISHED_POSTS.get('system:qualityIndex', 'json');
        let currentEMA = existingRaw?.index || simpleAvg;

        // Atualizar EMA com a média do lote atual (ou dos scores totais)
        // Simplificação: recalculamos sobre o conjunto total para estabilidade inicial
        const newEMA = (simpleAvg * ALPHA) + (currentEMA * (1 - ALPHA));

        // 4. Salvar
        await env.LEXIS_PUBLISHED_POSTS.put(
            'system:qualityIndex',
            JSON.stringify({
                index: Math.round(newEMA),
                prev_index: Math.round(currentEMA),
                status: 'active',
                samples: scores.length,
                threshold: Math.max(75, Math.round(newEMA - 5)),
                calculated_at: Date.now()
            })
        );

        console.log(`[EMA] Quality Index: ${Math.round(newEMA)} | Threshold Dinâmico: ${Math.max(75, Math.round(newEMA - 5))}`);
    } catch (e) {
        console.error(`[EMA] Erro: ${e.message}`);
    }
}
