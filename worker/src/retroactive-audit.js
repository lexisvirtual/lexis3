/**
 * Sistema de Auditoria Retroativa - Lexis Academy v7.20 Upgrade Engine Alpha
 *
 * Arquitetura de Célula Evolutiva:
 * - EMA (Média Móvel Exponencial): Sensibilidade a tendências de qualidade.
 * - Upgrade Engine: Posts 60-74 são REESCRITOS estruturalmente, não deletados.
 * - Ciclo de Vida: Raw -> Improving -> Optimized -> Authority -> Elite.
 */

import { auditPost } from './content-auditor.js';
import { cleanJSX, cleanFullContent, extractTag, superviseJSX, callGemini, callOpenAI } from './multi-model.js';

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

export async function updateFileOnGitHub(env, path, content, message) {
    const token = env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;

    try {
        const getRes = await fetch(`${apiUrl}?ref=${env.GITHUB_BRANCH || 'main'}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisQA/1.0' }
        });

        if (!getRes.ok) {
            const err = await getRes.text();
            await log(env, `❌ GitHub GET Fail: ${getRes.status} for ${path}`);
            return false;
        }

        const fileData = await getRes.json();
        const base64Content = btoa(Array.from(new TextEncoder().encode(content), b => String.fromCharCode(b)).join(''));

        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'LexisQA/1.0' },
            body: JSON.stringify({
                message,
                content: base64Content,
                sha: fileData.sha,
                branch: env.GITHUB_BRANCH || 'main'
            })
        });

        if (!putRes.ok) {
            const err = await putRes.text();
            await log(env, `❌ GitHub PUT Fail: ${putRes.status} - ${err.substring(0, 100)}`);
            return false;
        }

        return true;
    } catch (e) {
        console.error(`[AUDIT-UPDATE] Erro: ${e.message}`);
        await log(env, `❌ updateFileOnGitHub Error: ${e.message}`);
        return false;
    }
}

export async function upgradePostContent(env, file, content, strategy, rogerNotes = null) {
    // Carregar lições acumuladas do sistema
    const learnedDirectives = await env.LEXIS_PUBLISHED_POSTS.get('system:directives') || "";

    const rogerFeedbackSection = rogerNotes
        ? `\n\n🚨 ANOTAÇÕES DO AUDITOR ROGER (O QUE PRECISA SER CORRIGIDO):\n"${rogerNotes}"\n\nMISSÃO: NÃO JOGUE O BEBÊ FORA. Mantenha o que está bom e corrija CIRURGICAMENTE os pontos acima.`
        : "";

    const directivesSection = learnedDirectives
        ? `\n\n🚨 DIRETRIZES ACUMULADAS (Lições que o Leo já aprendeu com erros anteriores):\n${learnedDirectives}`
        : "";

    const prompt = `Você é o Diretor Editorial da Lexis Academy. Realize um UPGRADE ELITE (Protocolo Leo 2026 - Versão 10/10).

    TEMA: "${file.name}".
    OBJETIVO: Transformar este post em um WORKSHOP DE TREINO (10/10) para alunos INTERMEDIÁRIOS (B1-B2).${directivesSection}${rogerFeedbackSection}
    
    ESTRATÉGIA LEXIS (30/70): 
    - 30% Português (Mentoria, Neurociência, Instruções Táticas).
    - 70% Inglês (Músculo, Exemplos, Diálogos de Alta Pressão, Exercícios).

    ESTRUTURA OBRIGATÓRIA (TÍTULOS EM PORTUGUÊS):
    1. # [Headline de Autoridade em PT]
    2. ## Resposta Rápida (Quick Answer): 40-60 palavras em PT.
    3. ## Anatomia da Fluência: ROI Cognitivo + Mentoria.
    4. ## Tabela de Performance: AMADOR vs ELITE em contextos reais.
    5. ## ⚡ O Treino Lexis: (Core tático do post)
      - Aquecimento (Brain-Mapping em PT/EN)
      - Nível 1 (Chunks & Vocabulary C1)
      - Nível 2 (Cenário Real / Diálogo de Alta Pressão)
      - Nível 3 (Missão Final / Roleplay)
    6. ## Erros Comuns: Erros fatais que impedem a senioridade.
    7. ## Plano de Treino 7 Dias (Drill): Roteiro prático para a semana.
    8. ## FAQ de Mentoria: Metodologia Lexis aplicada.
    10. SEO DATA: [[DESCRIPTION]], [[AI_SNIPPET]], [[AI_CONTEXT]], [[QUERY_INTENT]].

    REGRAS DE FORMATO:
    - Retorne O ARQUIVO COMPLETO (Frontmatter + Markdown).
    - Frontmatter: Adicione "2026" ao título.
    - Comece diretamente com ---. Sem explicações.

    CONTEÚDO ATUAL PARA TRANSFORMAR:
    ${content}`;

    try {
        // PRIORIDADE 1: OpenAI (Elite Excellence)
        if (env.OPENAI_API_KEY) {
            console.log(`[UPGRADE] 👑 Usando GPT - 4o para Upgrade de Elite: ${file.name} `);
            return await callOpenAI(env, prompt, "Você é o Diretor Editorial da Lexis Academy.");
        }

        // PRIORIDADE 2: Gemini (Technical Depth)
        if (env.GEMINI_API_KEY) {
            console.log(`[UPGRADE] 🚀 Usando Gemini para Upgrade: ${file.name} `);
            return await callGemini(env, prompt);
        }

        // PRIORIDADE 3: Llama-3 (CF Native Fallback)
        console.log(`[UPGRADE] 🛰️ Usando Llama - 3 - 8b para Upgrade: ${file.name} `);
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 3500,
            temperature: 0.2
        });
        return response.response || response;
    } catch (e) {
        console.error(`[UPGRADE] ❌ Erro Crítico: ${e.message} `);
        throw new Error(`AI Upgrade Fail: ${e.message} `);
    }
}

// ================================================
// Auditoria Principal (Great Purge)
// ================================================
export async function performGreatPurge(env, batchSize = 5) {
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

                // PULOS ESTRATÉGICOS: Só pular se já for a versão 3.5-elite ultra-recente
                if (content.includes('lexis_version: "3.5-elite"')) {
                    results.skipped.push(`${file.name} (já está na versão elite 10/10)`);
                    continue;
                }

                // Gerar slug do arquivo para usar como chave do histórico (NOVA SCHEMA post_state)
                const slug = file.name.replace('.md', '');

                // Verificar histórico: pular se já foi aprovado com nota altíssima definitivamente
                // A MENOS que tenha a flag upgrade_mandatory (Dual Mode)
                const stateRaw = await env.LEXIS_PUBLISHED_POSTS.get(`post_state:${slug}`, 'json');
                const needsMandatoryUpgrade = stateRaw?.upgrade_mandatory === true || content.includes('upgrade_mandatory: true');

                if (stateRaw && stateRaw.score >= 95 && !needsMandatoryUpgrade) {
                    results.skipped.push(`${file.name} (já aprovado com ${stateRaw.score}pts)`);
                    continue;
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

                // Se a nota for altíssima (>=95) e já for elite, não mexemos
                if (score >= 95) {
                    await log(env, `✨ Score ${score} impecável. Marcando como Elite Suprema.`);
                    const successState = { score, verdict: 'APROVADO', stage: 'elite', lastAudit: Date.now() };
                    await env.LEXIS_PUBLISHED_POSTS.put(`post_state:${slug}`, JSON.stringify(successState));
                    results.approved.push(`${file.name} (${score}pts)`);
                    continue;
                }

                // Qualquer nota abaixo de 95 agora é candidata a UPGRADE 10/10
                if (score >= 60 && score < 95) {
                    await log(env, `🛠️ Score ${score}. Iniciando Reciclagem para Padrão 10/10...`);
                    try {
                        let upgradedContent = await upgradePostContent(env, file, content, 'structural', audit.reason);

                        // Injetar versão 3.5-elite no frontmatter do conteúdo reciclado
                        if (upgradedContent.includes('---')) {
                            const secondDashes = upgradedContent.indexOf('---', 3);
                            if (secondDashes !== -1) {
                                let fm = upgradedContent.substring(0, secondDashes);
                                if (!fm.includes('lexis_version:')) {
                                    fm += `lexis_version: "3.5-elite"\n`;
                                } else {
                                    fm = fm.replace(/lexis_version: .*/, 'lexis_version: "3.5-elite"');
                                }
                                upgradedContent = fm + upgradedContent.substring(secondDashes);
                            }
                        }

                        const success = await updateFileOnGitHub(env, `src/posts/${file.name}`, upgradedContent, `feat(qa): recycle to elite 10/10 (prev score: ${score})`);
                        if (success) {
                            stage = 'elite';
                            results.upgraded.push(`${file.name} (${score}pts -> recycled)`);
                            await log(env, `✅ Reciclagem concluída: ${file.name}`);
                        }
                    } catch (e) {
                        await log(env, `⚠️ Falha na reciclagem de ${file.name}: ${e.message}`);
                    }
                } else if (score >= 75 && score < 95) {
                    // Fallback para garantir marcação
                    stage = 'optimized';
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

// ================================================
// Processador de Comandos do Leo
// ================================================
export async function executeLeoCommand(env, command) {
    if (!command || !command.url) return { success: false, error: "Comando inválido" };

    const slug = command.url.replace(/^\/|\/$/g, '').split('/').pop();

    // Mapeamento inteligente: Blog (.md) ou Pillar Page (.jsx)
    const pillarMapping = {
        'curso-ingles-intensivo-brasil': 'src/pages/PilarIntensivo.jsx',
        'ingles-por-imersao-brasil': 'src/pages/PilarImersao.jsx',
        'intercambio-sem-sair-do-brasil': 'src/pages/PilarIntercambio.jsx',
        'ingles-para-negocios-online': 'src/pages/PilarNegocios.jsx'
    };

    let filePath = pillarMapping[slug] || `src/posts/${slug}.md`;
    const isJSX = filePath.endsWith('.jsx');

    await log(env, `⚙️ Executando Comando Leo: ${command.action} para ${slug} (${isJSX ? 'Pillar' : 'Blog'})`);

    try {
        // 1. Buscar conteúdo atual
        const token = env.GITHUB_TOKEN;
        const res = await fetch(
            `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}?ref=${env.GITHUB_BRANCH || 'main'}`,
            { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LexisQA/1.0' } }
        );

        if (!res.ok) throw new Error(`Arquivo não encontrado no GitHub: ${filePath}`);
        const fileData = await res.json();
        const content = decodeURIComponent(escape(atob(fileData.content)));

        // 2. Aplicar Upgrade
        let upgradedContent;
        if (isJSX) {
            const jsxPrompt = `Você é um Engenheiro Sênior de React. Sua missão é atualizar este arquivo JSX mantendo TODA a estrutura funcional (imports, constantes, hooks, classes de Tailwind).
            ADICIONE seções de SEO (FAQ robusto em JSON-LD e Tabela Comparativa em Tailwind) dentro do componente, preferencialmente antes do Footer.
            EXPANDA o texto dos parágrafos existentes para aumentar a autoridade semântica.
            RETORNE o JSX completo.`;

            await log(env, `🧪 [LLAMA] Gerando upgrade semântico para ${slug}...`);
            const llamaRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
                messages: [{ role: 'user', content: jsxPrompt + "\n\nARQUIVO ATUAL:\n" + content }],
                max_tokens: 3000,
                temperature: 0.2
            });
            const rawUpgrade = llamaRes.response || llamaRes;

            await log(env, `🧠 [GPT-4o] Assumindo Supervisão de Elite para ${slug}...`);
            upgradedContent = await superviseJSX(env, content, rawUpgrade);

            // Validação final de segurança pós-supervisão
            if (!upgradedContent.includes('import') || !upgradedContent.includes('export default')) {
                throw new Error("Supervisão falhou em retornar um arquivo JSX válido.");
            }
        } else {
            upgradedContent = await upgradePostContent(env, { name: slug }, content, 'elite');

            // Extrair novos metadados gerados durante o upgrade
            const newSnippet = extractTag('AI_SNIPPET', upgradedContent);
            const newContext = extractTag('AI_CONTEXT', upgradedContent);
            const newDesc = extractTag('DESCRIPTION', upgradedContent);

            // RECOVERY & SEO INJECTION: Garantir frontmatter e injetar SEO
            if (upgradedContent.startsWith('---')) {
                const secondDashes = upgradedContent.indexOf('---', 3);
                if (secondDashes !== -1) {
                    let fm = upgradedContent.substring(0, secondDashes);
                    if (newSnippet && !fm.includes('ai_snippet:')) fm += `ai_snippet: "${newSnippet.replace(/"/g, "'")}"\n`;
                    if (newContext && !fm.includes('ai_context:')) fm += `ai_context: "${newContext.replace(/"/g, "'")}"\n`;
                    if (newDesc && !fm.includes('description:')) fm += `description: "${newDesc.replace(/"/g, "'")}"\n`;
                    upgradedContent = fm + upgradedContent.substring(secondDashes);
                }
            } else {
                const originalFrontmatterMatch = content.match(/^---[\s\S]*?---/);
                if (originalFrontmatterMatch) {
                    await log(env, `🚑 [RECOVERY] Restaurando frontmatter original para ${slug}`);
                    upgradedContent = originalFrontmatterMatch[0] + "\n\n" + upgradedContent;
                }
            }

            // Limpar o conteúdo (remover chatter e tags expostas)
            upgradedContent = cleanFullContent(upgradedContent);
        }

        // 3. Salvar de volta
        await log(env, `💾 [GITHUB] Salvando ativo de elite: ${filePath}`);
        const success = await updateFileOnGitHub(env, filePath, upgradedContent, `feat(leo): elite upgrade from SEO Hub [Priority: ${command.priority}]`);

        if (success) {
            await log(env, `💎 Upgrade Elite CONCLUÍDO para ${slug}`);
            await env.LEXIS_PUBLISHED_POSTS.put(`leo_done:${slug}`, 'true', { expirationTtl: 60 * 60 * 24 * 30 });

            // Notificar Planilha para marcar como DONE
            try {
                await log(env, `📡 [HUB] Enviando feedback de conclusão...`);
                const sheetUrl = env.GOOGLE_SHEETS_COMMAND_URL || "https://script.google.com/macros/s/AKfycbz-96tMxLYXAP2TrMpZFcAur8Ge8qauTSlxflpqa258CJUOGwWeuK_esiI3rnGR4yo/exec";
                await fetch(`${sheetUrl}?action=markDone&url=${encodeURIComponent(command.url)}`, { method: 'GET', redirect: 'follow' });
            } catch (sheetErr) {
                console.error("[SHEET-FEEDBACK] Erro ao marcar como done:", sheetErr.message);
            }

            return { success: true };
        } else {
            throw new Error("Falha ao salvar no GitHub");
        }
    } catch (e) {
        await log(env, `❌ Erro no comando Leo: ${e.message}`);
        return { success: false, error: e.message };
    }
}
