
export default {
    // --- ROTAS HTTP (API Manual) ---
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Adicionar Pauta (ETAPA 1: Input Rico)
        if (url.pathname === "/add-topic") {
            if (request.method !== "POST") return new Response("Use POST", { status: 405 });

            const body = await request.json().catch(() => ({}));

            // Validação de Schema (ETAPA 1.2)
            if (!body.topic || !body.cluster) {
                return new Response(JSON.stringify({
                    error: "Schema Inválido. Obrigatório: 'topic' e 'cluster'.",
                    required: { query: "string", cluster: "string", intent: "informacional|dor|decisao" }
                }), { status: 400, headers: { "Content-Type": "application/json" } });
            }

            const jobData = {
                topic: body.topic.trim(),
                cluster: body.cluster.trim().toLowerCase(),
                intent: body.intent || "informacional",
                type: body.type || "evergreen",
                priority: body.priority || 1,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Salva com prioridade invertida no ID para ordenação simples (na listagem futura)
            const id = Date.now().toString();
            await env.LEXIS_PAUTA.put(`job:${id}`, JSON.stringify(jobData));

            return new Response(JSON.stringify({ success: true, id, job: jobData }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Ver Fila
        if (url.pathname === "/queue") {
            const list = await env.LEXIS_PAUTA.list({ prefix: "job:" });
            const jobs = [];
            for (const key of list.keys) {
                const value = await env.LEXIS_PAUTA.get(key.name);
                jobs.push({ id: key.name, ...JSON.parse(value) });
            }
            return new Response(JSON.stringify(jobs, null, 2), { headers: { "Content-Type": "application/json" } });
        }

        // 3. Forçar Processamento
        if (url.pathname === "/process-queue") {
            return await processNextJob(env);
        }

        // 4. LIMPEZA TOTAL (NUCLEAR - TEMP)
        if (url.pathname === "/purge") {
            const list = await env.LEXIS_PAUTA.list({ prefix: "job:" });
            for (const key of list.keys) {
                await env.LEXIS_PAUTA.delete(key.name);
            }
            return new Response("Fila limpa! Zero items.", { status: 200 });
        }

        return new Response("Lexis Publisher V5.6 (Slug Shield) Ativo", { status: 200 });
    },

    // --- TRIGGERS AGENDADOS ---
    async scheduled(event, env, ctx) {
        ctx.waitUntil(processNextJob(env));
    }
};

// --- ORQUESTRADOR ---

async function processNextJob(env) {
    const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit: 1 });

    if (list.keys.length === 0) {
        return new Response("Fila vazia", { status: 200 });
    }

    const jobKey = list.keys[0].name;
    const rawValue = await env.LEXIS_PAUTA.get(jobKey);

    // SELF-HEALING: Se o valor for nulo (Zumbi), deleta e segue
    if (!rawValue) {
        console.warn(`[ZOMBIE] Limpando item vazio: ${jobKey}`);
        await env.LEXIS_PAUTA.delete(jobKey);
        return new Response("Item fantasma removido. Tente novamente.", { status: 200 });
    }

    const jobData = JSON.parse(rawValue);
    console.log(`[ORCHESTRATOR] Iniciando: ${jobData.topic} (Cluster: ${jobData.cluster})`);

    try {
        const result = await generateAndPublishPost(env, jobData);

        if (result.success) {
            await env.LEXIS_PAUTA.delete(jobKey);
            // Indexação (ETAPA 9 - Cache Warming / Metadata)
            // Salvamos o post no índice do cluster para interlink futuro
            await addToClusterIndex(env, jobData.cluster, {
                title: result.title,
                slug: result.slug,
                intent: jobData.intent
            });

            return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
        } else {
            console.error(`[FAIL] ${result.error}`);
            // Lógica de Retentativa Corrigida: Deleta se for qualquer erro de validação ou Parsing
            const isValidationError = ["Short Content", "No Structure (H2)", "Missing Fields", "Parsing Failed"].includes(result.error) || result.reason === "DUPLICATE_SLUG";

            if (isValidationError) {
                console.warn(`[DELETE] Removendo job inválido da fila: ${jobData.topic}`);
                await env.LEXIS_PAUTA.delete(jobKey);
            }
            return new Response(JSON.stringify(result), { status: 422, headers: { "Content-Type": "application/json" } });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

// --- NÚCLEO INTELIGENTE (IA + VALIDAÇÃO) ---

async function generateAndPublishPost(env, job) {
    // ETAPA 7: INTERLINK PROGRAMÁTICO (Busca contexto antes de escrever)
    const relatedPosts = await getRelatedPosts(env, job.cluster);
    const internalLinksPrompt = relatedPosts.length > 0
        ? `INCLUA LINKS INTERNOS PARA: ${relatedPosts.map(p => `[${p.title}](/blog/${p.slug})`).join(", ")}`
        : "";

    const systemPrompt = `
    Você é o Evangelista Chefe da Lexis Academy.
    
    PRINCÍPIOS EDITORIAIS:
    1. "Idioma não se aprende. Idioma se treina."
    2. Ataque o método tradicional.
    3. Use tom autoritário e motivador.

    FORMATO OBRIGATÓRIO (TEXTO PLANO):
    TITLE: [Título H1]
    SLUG: [slug]
    DESCRIPTION: [Meta description]
    TAGS: [tag1, tag2]
    CONTENT:
    [Escreva o artigo em Markdown. OBRIGATÓRIO USAR SUBTÍTULOS H2 (##) PARA DIVIDIR O TEXTO.]
  `;

    const userPrompt = `
    Tópico: "${job.topic}"
    Cluster: "${job.cluster}"
    
    Escreva um artigo seguindo ESTRITAMENTE esta estrutura (use Markdown):
    
    ## O Problema Real
    (Fale sobre a frustração de não falar inglês)

    ## A Neurociência Explica
    (Por que métodos tradicionais falham)

    ## Como Treinar de Verdade
    (Dê 3 exemplos práticos de treino Lexis)

    Use Português do Brasil. Mínimo 400 palavras.
  `;

    let aiResponse;
    try {
        aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            // AUMENTO DE LIMITE DE TOKENS (EVITA CORTE DE TEXTO)
            max_tokens: 4000
        });
    } catch (e) {
        return { success: false, error: `AI Failed: ${e.message}` };
    }

    // Parser "Escavadeira" V3 (Indestrutível)
    let raw = aiResponse.response;
    let postData = {
        cluster: job.cluster,
        intent: job.intent
    };

    try {
        const getField = (prefix) => {
            const regex = new RegExp(`(?:\\*+|#+)?\\s*${prefix}(?:\\*+)?\\s*:\\s*(.*)`);
            const match = raw.match(regex);
            return match ? match[1].trim() : null;
        };

        postData.title = getField("TITLE");

        // BLINDAGEM DE SLUG (Remove **, #, espaços extras)
        let rawSlug = getField("SLUG") || job.topic;
        postData.slug = rawSlug
            .toLowerCase()
            .replace(/[*#]/g, '') // Remove markdown residual
            .trim()
            .replace(/\s+/g, '-') // Espaços viram hifens
            .replace(/[^\w-]/g, ''); // Remove tudo que não for letra/numero/hifen

        postData.description = getField("DESCRIPTION");
        postData.tags = getField("TAGS") ? getField("TAGS").split(",").map(t => t.trim()) : [];

        const contentSplit = raw.split(/CONTENT\s*:/i);
        if (contentSplit.length > 1) {
            postData.content_markdown = contentSplit[1].trim();
        }

        // FALLBACK DE ÚLTIMA INSTÂNCIA (A IA ignorou o formato)
        if (!postData.title || !postData.content_markdown) {
            console.warn("[PARSER] IA ignorou formato. Usando Fallback de Linha 1.");
            const lines = raw.split('\n');
            // Tenta achar a primeira linha não vazia que parece um título
            const titleLine = lines.find(l => l.trim().length > 10 && l.length < 100) || job.topic;

            postData.title = titleLine.replace(/\*/g, '').replace(/#/g, '').trim();
            postData.content_markdown = raw.replace(titleLine, '').trim();

            if (!postData.slug) postData.slug = job.topic.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            if (!postData.description) postData.description = `Saiba tudo sobre ${postData.title} com a Metodologia Lexis.`;
            if (postData.tags.length === 0) postData.tags = ["ingles", "treino"];
        }

        if (!postData.content_markdown) throw new Error("Content Empty");

    } catch (e) {
        return { success: false, error: "Parsing Failed", raw: raw.substring(0, 100) };
    }

    // ETAPA 5: VALIDAÇÃO
    const validation = validatePost(postData);
    if (!validation.valid) return { success: false, error: validation.reason };

    // ETAPA 4.5: ANTI-DUPLICIDADE
    if (await checkFileExists(env, `${postData.slug}.md`)) {
        return { success: false, reason: "DUPLICATE_SLUG", error: "Exists" };
    }

    // ETAPA 6: MONTAGEM FINAL
    // Se a IA não inseriu links no texto, nós inserimos no final como um bloco "Leia Mais"
    const finalMarkdown = `---
title: "${postData.title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().split('T')[0]}"
description: "${postData.description.replace(/"/g, '\\"')}"
tags: [${postData.tags.map(t => `"${t}"`).join(', ')}]
category: "${job.cluster}"
author: "Lexis Intel AI"
cluster: "${job.cluster}"
intent: "${job.intent}"
---

${postData.content_markdown}

---
*Este artigo é parte da nossa série sobre **${job.cluster}**. Continue treinando:*
${relatedPosts.map(p => `- [${p.title}](/blog/${p.slug})`).join('\n')}
  `;

    // ETAPA 8: COMMIT
    const result = await uploadToGitHub(env, `${postData.slug}.md`, finalMarkdown, `feat(blog): [${job.cluster}] ${postData.title}`);
    return { success: true, url: result.url, slug: postData.slug, title: postData.title };
}

// --- KV HELPER (BRAIN) ---

// Adiciona post ao índice do cluster
async function addToClusterIndex(env, cluster, postMeta) {
    const key = `index:${cluster}`;
    let current = await env.LEXIS_PAUTA.get(key);
    let posts = current ? JSON.parse(current) : [];

    // Evita duplicatas no índice
    if (!posts.find(p => p.slug === postMeta.slug)) {
        posts.push(postMeta);
        await env.LEXIS_PAUTA.put(key, JSON.stringify(posts));
    }
}

// Recupera posts do mesmo cluster (para linkar)
async function getRelatedPosts(env, cluster) {
    const key = `index:${cluster}`;
    const data = await env.LEXIS_PAUTA.get(key);
    if (!data) return [];

    const posts = JSON.parse(data);
    // Retorna até 3 posts aleatórios do cluster para não ficar sempre os mesmos links
    return posts.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// --- UTILS ---

function validatePost(post) {
    if (post.content_markdown.length < 400) return { valid: false, reason: "Short Content" };
    if (!post.content_markdown.includes("##")) return { valid: false, reason: "No Structure (H2)" };
    return { valid: true };
}

async function checkFileExists(env, fileName) {
    const r = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${fileName}`, {
        headers: { "Authorization": `Bearer ${env.GITHUB_TOKEN}`, "User-Agent": "Lexis-Worker" }
    });
    return r.status === 200;
}

async function uploadToGitHub(env, fileName, content, message) {
    const r = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${fileName}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${env.GITHUB_TOKEN}`, "User-Agent": "Lexis-Worker" },
        body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: env.GITHUB_BRANCH
        })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message);
    return { url: d.content.html_url };
}
