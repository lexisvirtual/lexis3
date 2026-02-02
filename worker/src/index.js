
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

        // 5. RESET MEMÓRIA (Apaga índices de posts antigos)
        if (url.pathname === "/reset-memory") {
            const list = await env.LEXIS_PAUTA.list({ prefix: "index:" });
            for (const key of list.keys) {
                await env.LEXIS_PAUTA.delete(key.name);
            }
            return new Response("Memória limpa: Índices apagados.", { status: 200 });
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
    // ETAPA 7: INTERLINK PROGRAMÁTICO
    const relatedPosts = await getRelatedPosts(env, job.cluster);
    const internalLinksPrompt = relatedPosts.length > 0
        ? `INCLUA LINKS INTERNOS PARA: ${relatedPosts.map(p => `[${p.title}](/blog/${p.slug})`).join(", ")}`
        : "";

    // SISTEMA: FORÇA BRUTA JSON (V7.0)
    const systemPrompt = `
    Você é o Evangelista Chefe da Lexis Academy.
    
    SUA MISSÃO: Escrever um artigo de blog polêmico e profundo.
    
    PRINCÍPIOS EDITORIAIS:
    1. "Idioma não se aprende. Idioma se treina."
    2. Ataque métodos tradicionais (gramática, decoreba).
    3. Use H2 para subtítulos (##).
    
    FORMATO DE SAÍDA: JSON (ESTRITAMENTE)
    {
      "title": "Título H1 Impactante",
      "slug": "slug-otimizado-seo",
      "description": "Meta description persuasiva para Google (max 150 chars)",
      "tags": ["tag1", "tag2"],
      "content": "Texto completo do artigo em Markdown. Use ## para subtítulos. NÃO coloque o título H1 aqui dentro, apenas o corpo do texto."
    }
  `;

    const userPrompt = `
    Tópico: "${job.topic}"
    Cluster: "${job.cluster}"
    Intenção: "${job.intent}"
    
    ${internalLinksPrompt}
    
    Escreva um artigo de >1000 palavras.
    Comece atacando o problema imediatamente (sem introduções fofas).
    Use Português do Brasil.
    
    IMPORTANTE: Retorne APENAS o JSON válido. Sem markdown em volta (\`\`\`json).
  `;

    let aiResponse;
    try {
        aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 4000
        });
    } catch (e) {
        return { success: false, error: `AI Failed: ${e.message}` };
    }

    // PARSER JSON BLINDADO V7.1 (Híbrido)
    let raw = aiResponse.response.trim();

    // 1. Tenta limpar markdown block code
    raw = raw.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let postData = { cluster: job.cluster, intent: job.intent };
    let parseSuccess = false;

    // TENTATIVA 1: JSON.parse puro
    try {
        const parsed = JSON.parse(raw);
        Object.assign(postData, parsed); // Copia title, slug, content, tags
        parseSuccess = true;
    } catch (e) {
        console.warn("[PARSER] JSON.parse falhou. Tentando extração manual (Regex)...");
    }

    // TENTATIVA 2: Extração via Regex (Se o JSON quebrou ou veio sujo)
    if (!parseSuccess) {
        try {
            const extract = (key) => {
                // Regex busca "key": "valor"
                const match = raw.match(new RegExp(`"${key}"\\s*:\\s*"(.*?)"`, 's'));
                return match ? match[1] : null;
            };

            postData.title = extract("title");
            postData.slug = extract("slug");
            postData.description = extract("description");

            // Content é mais chato, pode ter aspas escapadas. Tenta pegar tudo depois de "content": "
            const contentMatch = raw.match(/"content"\s*:\s*"(.*)"\s*}/s) || raw.match(/"content"\s*:\s*"(.*)/s);
            if (contentMatch) {
                // Remove a aspa final e chave se tiver pego
                let content = contentMatch[1];
                if (content.endsWith('"}')) content = content.slice(0, -2);
                else if (content.endsWith('"')) content = content.slice(0, -1);

                // Desescapar quebras de linha (\n -> pulo de linha real)
                postData.content_markdown = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            }

            // Tags (tentativa simples)
            const tagsMatch = raw.match(/"tags"\s*:\s*\[(.*?)\]/s);
            if (tagsMatch) {
                postData.tags = tagsMatch[1].split(',').map(t => t.replace(/["\s]/g, ''));
            }

        } catch (e2) {
            console.error("Parser Regex falhou também.");
        }
    }

    // FALLBACKS DE SEGURANÇA (Se tudo falhar, não perde o post)
    if (!postData.title) postData.title = job.topic;
    if (!postData.slug) postData.slug = job.topic.toLowerCase().replace(/ /g, '-');
    if (!postData.content_markdown) {
        // Se não achou 'content' no JSON, é provável que a IA tenha mandado Markdown puro ignorando o prompt
        // Então assumimos que 'raw' é o texto.
        console.warn("IA ignorou JSON. Usando RAW como conteúdo.");
        postData.content_markdown = raw;
    }

    // Limpeza final de segurança no Slug
    postData.slug = postData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Limpeza no Title (remover aspas extras se houver)
    postData.title = postData.title.trim();

    // ETAPA 5: VALIDAÇÃO
    const validation = validatePost(postData);
    if (!validation.valid) return { success: false, error: validation.reason };

    // ETAPA 4.5: ANTI-DUPLICIDADE
    if (await checkFileExists(env, `${postData.slug}.md`)) {
        return { success: false, reason: "DUPLICATE_SLUG", error: "Exists" };
    }

    // ETAPA 6: MONTAGEM FINAL
    // INJEÇÃO DE IMAGEM AUTOMÁTICA (Curador V8.1 - Reativado)
    if (!postData.image) {
        postData.image = getCuratedImage(job.cluster);
    }

    const finalMarkdown = `---
title: "${postData.title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().split('T')[0]}"
description: "${postData.description.replace(/"/g, '\\"')}"
tags: [${postData.tags.map(t => `"${t}"`).join(', ')}]
category: "${job.cluster}"
author: "Lexis Intel AI"
image: "${postData.image}"
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

// --- BANCO DE IMAGENS HUMANIZADAS (Unsplash Curated - V8.1) ---
function getCuratedImage(cluster) {
    const COLLECTIONS = {
        'business': [
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80"
        ],
        'viagem': [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
            "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80"
        ],
        'estudo': [
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
            "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=80",
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80"
        ],
        'mindset': [
            "https://images.unsplash.com/photo-1499209974431-2761e2523676?w=1200&q=80", // Relaxed thinking
            "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&q=80", // Girl thinking
            "https://images.unsplash.com/photo-1555601568-c916f54b1046?w=1200&q=80", // Brain concept
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80", // Meditation focus
            "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80"  // Working focused
        ],
        'default': [
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
        ]
    };
    const key = cluster ? cluster.toLowerCase() : 'default';
    const collection = COLLECTIONS[key] || COLLECTIONS['default'];
    return collection[Math.floor(Math.random() * collection.length)];
}
