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

            const id = Date.now().toString();
            await env.LEXIS_PAUTA.put(`job:${id}`, JSON.stringify(jobData));

            return new Response(JSON.stringify({ success: true, id, job: jobData }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Ver Fila
        if (url.pathname === "/queue") {
            const limit = parseInt(url.searchParams.get("limit")) || 100; // Default: 100 items
            const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit });
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

        // 6. ANALYTICS (Ver dados)
        if (url.pathname === "/analytics") {
            const analysis = await analyzePostHistory(env);
            const context = getTemporalContext();

            return new Response(JSON.stringify({
                analysis,
                context,
                recommendations: analysis.gaps
            }, null, 2), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 7. PLANEJAMENTO IA (Gerar Pautas)
        if (url.pathname === "/ai-plan") {
            const result = await selectThemesByAI(env);
            return new Response(JSON.stringify(result, null, 2), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 8. SITEMAP DINÂMICO (SEO)
        if (url.pathname === "/sitemap.xml") {
            return await generateDynamicSitemap(env);
        }

        // 9. RSS FEED DINÂMICO (SEO)
        if (url.pathname === "/rss.xml" || url.pathname === "/feed.xml") {
            return await generateDynamicRSS(env);
        }

        return new Response("Lexis Publisher V5.8 (Advanced Art Director) Ativo", { status: 200 });
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
        console.log("[AUTO-REFILL] Fila vazia. Iniciando geração automática de pautas...");
        try {
            const plan = await selectThemesByAI(env);
            if (plan.success && plan.new_jobs && plan.new_jobs.length > 0) {
                console.log(`[AUTO-REFILL] Sucesso! ${plan.new_jobs.length} novas pautas geradas.`);
                // Recursivamente processa o primeiro da nova lista
                return await processNextJob(env);
            } else {
                return new Response(`Fila vazia. Auto-geração falhou: ${plan.error || "Sem Jobs"}`, { status: 200 });
            }
        } catch (e) {
            return new Response(`Fila vazia. Erro no refill: ${e.message}`, { status: 500 });
        }
    }

    const jobKey = list.keys[0].name;
    const rawValue = await env.LEXIS_PAUTA.get(jobKey);

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
            await addToClusterIndex(env, jobData.cluster, {
                title: result.title,
                slug: result.slug,
                intent: jobData.intent,
                published_at: new Date().toISOString().split('T')[0]
            });

            return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
        } else {
            console.error(`[FAIL] ${result.error}`);
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
    const relatedPosts = await getRelatedPosts(env, job.cluster);
    const internalLinksPrompt = relatedPosts.length > 0
        ? `INCLUA LINKS INTERNOS PARA: ${relatedPosts.map(p => `[${p.title}](/blog/${p.slug})`).join(", ")}`
        : "";

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
      "content": "Texto completo do artigo em Markdown. Use ## para subtítulos. NÃO coloque o título H1 aqui dentro, apenas o corpo do texto. NUNCA coloque 'Imagem:', 'Search query:' ou descrições da imagem dentro deste campo.",
      "image_search_query": "English visual search query for Pixabay. Follow the Advanced Anti-Noise template: [who], [specific action], [specific environment], [emotional tone], [lighting], [color direction], [composition], [quality markers], [minimum 6 exclusions with -]"
    }
  `;

    const userPrompt = `
Tópico: "${job.topic}"
Cluster: "${job.cluster}"
Intenção: "${job.intent}"
    
    ${internalLinksPrompt}
    
    Escreva um artigo de > 1000 palavras.
    Use Português do Brasil.

    IMPORTANTE: Retorne APENAS o JSON válido.
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

    let raw = aiResponse.response.trim();
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
        raw = raw.substring(firstBrace, lastBrace + 1);
    }

    const postData = { cluster: job.cluster, intent: job.intent };
    let parseSuccess = false;

    try {
        const parsed = JSON.parse(raw);
        Object.assign(postData, parsed);
        if (parsed.content) postData.content_markdown = parsed.content;
        parseSuccess = true;
    } catch (e) {
        console.warn("[PARSER] JSON.parse falhou. Tentando extração manual...");
    }

    if (!parseSuccess) {
        try {
            const extract = (key) => {
                const match = raw.match(new RegExp(`"${key}"\\s *: \\s * "(.*?)"`, 's'));
                return match ? match[1] : null;
            };

            postData.title = extract("title");
            postData.slug = extract("slug");
            postData.description = extract("description");

            const contentMatch = raw.match(/"content"\s*:\s*"(.*)"\s*}/s) || raw.match(/"content"\s*:\s*"(.*)/s);
            if (contentMatch) {
                let content = contentMatch[1];
                if (content.endsWith('"}')) content = content.slice(0, -2);
                else if (content.endsWith('"')) content = content.slice(0, -1);
                postData.content_markdown = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            }

            const tagsMatch = raw.match(/"tags"\s*:\s*\[(.*?)\]/s);
            if (tagsMatch) {
                postData.tags = tagsMatch[1].split(',').map(t => t.replace(/["\s]/g, ''));
            }
        } catch (e2) {
            console.error("Parser Regex falhou também.");
        }
    }

    // TENTATIVA 3 (Extra): Extrair image_search_query via Regex isolado se não veio
    if (!postData.image_search_query) {
        const imgMatch = raw.match(/"image_search_query"\s*:\s*"(.*?)"/s);
        if (imgMatch) postData.image_search_query = imgMatch[1];
    }

    // FALLBACKS DE SEGURANÇA (Se tudo falhar, não perde o post)
    if (!postData.title) postData.title = job.topic;
    if (!postData.slug) postData.slug = job.topic.toLowerCase().replace(/ /g, '-');
    if (!postData.content_markdown) {
        console.warn("IA ignorou JSON. Usando RAW como conteúdo.");
        postData.content_markdown = raw;
    }

    postData.slug = postData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    postData.title = postData.title.trim();

    const validation = validatePost(postData);
    if (!validation.valid) return { success: false, error: validation.reason };

    if (await checkFileExists(env, `${postData.slug}.md`)) {
        return { success: false, reason: "DUPLICATE_SLUG", error: "Exists" };
    }

    // ETAPA 6: MONTAGEM FINAL
    // INJEÇÃO DE IMAGEM AUTOMÁTICA (Curador V8.1 - Reativado)
    if (!postData.image) {
        // [MELHORIA] Tradução de Query
        // Se a query visual não veio, ou se parece com o título em PT, tentamos traduzir/gerar keywords em inglês.
        let searchQuery = postData.image_search_query;

        if (!searchQuery || searchQuery.trim() === job.topic.trim()) {
            const translated = await generateVisualKeywords(env, job.topic);
            if (translated) searchQuery = translated;
        }

        // Passamos a query final (da AI ou traduzida) + o cluster
        postData.image = await getImageWithFallback(job.cluster, env, searchQuery || job.topic);
    }

    // LIMPEZA DE CONTEÚDO V8.3 - Remove metadados técnicos vazados
    postData.content_markdown = sanitizeContent(postData.content_markdown);

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

    const result = await uploadToGitHub(env, `${postData.slug}.md`, finalMarkdown, `feat(blog): [${job.cluster}] ${postData.title} `);
    return { success: true, url: result.url, slug: postData.slug, title: postData.title };
}

// --- KV HELPER (BRAIN) ---
async function addToClusterIndex(env, cluster, postMeta) {
    const key = `index:${cluster}`;
    let current = await env.LEXIS_PAUTA.get(key);
    let posts = current ? JSON.parse(current) : [];

    if (!postMeta.published_at) {
        postMeta.published_at = new Date().toISOString().split('T')[0];
    }

    if (!posts.find(p => p.slug === postMeta.slug)) {
        posts.push(postMeta);
        await env.LEXIS_PAUTA.put(key, JSON.stringify(posts));
    }
}

async function getRelatedPosts(env, cluster) {
    const key = `index:${cluster}`;
    const data = await env.LEXIS_PAUTA.get(key);
    if (!data) return [];

    const posts = JSON.parse(data);
    return posts.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// --- UTILS ---
function sanitizeContent(content) {
    if (!content) return content;

    let cleaned = content;

    // 1. Remove linhas com "image_search_query" (formato JSON ou texto solto)
    cleaned = cleaned.replace(/[,\s]*"image_search_query"\s*:\s*"[^"]*"/gi, '');
    cleaned = cleaned.replace(/.*image_search_query.*\n?/gi, '');

    // 2. Remove restos de JSON artifacts (chaves soltas, vírgulas extras)
    cleaned = cleaned.replace(/^\s*[,}\]]\s*$/gm, ''); // Linhas com apenas }, ], ou vírgulas
    cleaned = cleaned.replace(/,\s*}/g, '}'); // Vírgulas antes de fechar objeto
    cleaned = cleaned.replace(/,\s*\]/g, ']'); // Vírgulas antes de fechar array

    // 3. Remove aspas escapadas desnecessárias no meio do texto
    cleaned = cleaned.replace(/\\"/g, '"');

    // 4. Remove blocos de código JSON vazios ou quebrados
    cleaned = cleaned.replace(/```json\s*\n\s*```/gi, '');
    cleaned = cleaned.replace(/```\s*\n\s*```/g, '');

    // 5. Limpa múltiplas linhas em branco consecutivas (deixa no máximo 2)
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // 6. Remove espaços em branco no final das linhas
    cleaned = cleaned.replace(/[ \t]+$/gm, '');

    // 7. Remove artefatos de final de JSON (", ou " ou }, no final do arquivo)
    cleaned = cleaned.replace(/",\s*$/, "");
    cleaned = cleaned.replace(/"\s*$/, "");

    // 8. [NOVO] Remove metadados descritivos de imagem vazados (Identificados pelo User)
    // Ex: "Imagem: Uma foto...", "Search query: ...", "| A imagem não condiz..."
    cleaned = cleaned.replace(/^Imagem:.*$/gim, '');
    cleaned = cleaned.replace(/^Image:.*$/gim, '');
    cleaned = cleaned.replace(/^Search query:.*$/gim, '');
    cleaned = cleaned.replace(/^Query:.*$/gim, '');
    cleaned = cleaned.replace(/\| A imagem não condiz com o tema/gi, ''); // Remoção cirúrgica do erro relatado

    return cleaned.trim();
}
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

// Mapa de queries para cada cluster (para buscar no Unsplash)
const CLUSTER_QUERIES = {
    'business': 'business professional office work',
    'viagem': 'travel adventure landscape nature',
    'estudo': 'study learning education books',
    'imersao': 'immersion study language travel brazil',
    'cultural': 'brazil culture carnival festival parade',
    'mindset': 'meditation focus mindfulness wellness',
    'default': 'inspiration motivation success'
};

// ============================================
// FUNÇÃO PRINCIPAL: Buscar imagem com fallback
// ============================================
async function getImageWithFallback(cluster, env, specificQuery = null) {
    console.log(`[IMAGE] Buscando imagem. Cluster: ${cluster} | Query Específica: ${specificQuery || "Nenhuma"}`);

    // Define a query final: Se tiver específica (da IA), usa ela. Se não, usa a do cluster.
    // Se a específica for muito curta (<3 chars), ignora.
    let finalQuery = (specificQuery && specificQuery.length > 3)
        ? specificQuery
        : (CLUSTER_QUERIES[cluster] || CLUSTER_QUERIES['default']);

    // TENTATIVA 1: Pixabay API
    if (env.PIXABAY_API_KEY && env.PEXELS_ENABLED === 'true') {
        try {
            console.log(`[PIXABAY] Buscando: "${finalQuery}"`);
            const image = await getPixabayImage(finalQuery, env.PIXABAY_API_KEY);
            if (image) {
                console.log(`[PIXABAY] ✅ Sucesso! URL: ${image.substring(0, 50)}...`);
                return image;
            }
        } catch (error) {
            console.warn(`[PIXABAY] ❌ Falha: ${error.message}. Usando fallback...`);
        }
    } else {
        console.log(`[PIXABAY] Desabilitado ou sem chave. Usando banco curado.`);
    }

    // FALLBACK 1: Banco de imagens curado
    console.log(`[FALLBACK] Usando banco de imagens estático...`);
    const curatedImage = getCuratedImage(cluster);
    if (curatedImage) {
        console.log(`[FALLBACK] ✅ Imagem curada encontrada`);
        return curatedImage;
    }

    // FALLBACK 2: Imagem padrão final
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80";
}

// ============================================
// FUNÇÃO: Buscar do Pixabay API
// ============================================
async function getPixabayImage(query, accessKey) {
    try {
        const url = `https://pixabay.com/api/?key=${accessKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=20`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();

        // CORREÇÃO: Seleciona aleatoriamente uma das imagens retornadas para evitar duplicidade
        if (data.hits && data.hits.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.hits.length);
            const imageUrl = data.hits[randomIndex].largeImageURL;

            console.log(`[PIXABAY] ✅ Sucesso! URL: ${imageUrl.substring(0, 50)}... (Index: ${randomIndex}/${data.hits.length})`);
            return imageUrl;
        }

        return null;
    } catch (error) {
        console.error(`[PIXABAY API] ❌ Erro: ${error.message}`);
        return null;
    }
}

// --- BANCO DE IMAGENS ---
function getCuratedImage(cluster) {
    const COLLECTIONS = {
        'business': [
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
        ],
        'viagem': [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80"
        ],
        'estudo': [
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
            "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=80"
        ],
        'mindset': [
            "https://images.unsplash.com/photo-1499209974431-2761e2523676?w=1200&q=80",
            "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&q=80"
        ],
        'default': [
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
        ]
    };
    const key = cluster ? cluster.toLowerCase() : 'default';
    const collection = COLLECTIONS[key] || COLLECTIONS['default'];
    return collection[Math.floor(Math.random() * collection.length)];
}

// ============================================
// MODULO: PLANEJAMENTO ESTRATÉGICO (IA)
// ============================================

// 1. Analisar Histórico do GitHub
async function analyzePostHistory(env) {
    console.log('[ANALISE] Iniciando análise de histórico...');

    try {
        const response = await fetch(
            `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts`,
            {
                headers: {
                    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                    'User-Agent': 'Lexis-Worker'
                }
            }
        );

        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
        const files = await response.json();

        const categoryCounts = {};
        let totalFiles = 0;

        // Categorias base para garantir que existam no objeto
        const baseCategories = ['estudo', 'imersao', 'viagem', 'vocabulario', 'profissional', 'mindset', 'pronuncia', 'gramatica', 'conversacao', 'neurociencia'];
        baseCategories.forEach(c => categoryCounts[c] = 0);

        // Amostragem: Analisar os 20 últimos posts para ser rápido (ou todos se der)
        // O GitHub retorna em ordem alfabética. Vamos pegar os últimos 20.
        // Slice(-20) pega os últimos 20 elementos do array.
        const allFiles = files.filter(f => f.name.endsWith('.md'));
        const targetFiles = allFiles.slice(-20);

        console.log(`[ANALISE] Encontrados ${targetFiles.length} arquivos.`);

        // Processamento paralelo limitado (batch de 5)
        for (let i = 0; i < targetFiles.length; i += 5) {
            const batch = targetFiles.slice(i, i + 5);
            await Promise.all(batch.map(async (file) => {
                try {
                    const contentResponse = await fetch(file.download_url);
                    const content = await contentResponse.text();

                    // Extrair cluster/categoria
                    const match = content.match(/cluster:\s*["']?([^"'\n]+)["']?/i) || content.match(/category:\s*["']?([^"'\n]+)["']?/i);
                    if (match) {
                        const cat = match[1].trim().toLowerCase();
                        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                        totalFiles++;
                    }
                } catch (e) {
                    console.warn(`Erro ao ler ${file.name}: ${e.message}`);
                }
            }));
        }

        // Estatísticas
        const distribution = {};
        for (const [cat, count] of Object.entries(categoryCounts)) {
            distribution[cat] = {
                count,
                percentage: totalFiles > 0 ? ((count / totalFiles) * 100).toFixed(1) : "0.0"
            };
        }

        // Gaps (< 10%)
        const gaps = Object.entries(distribution)
            .filter(([_, data]) => parseFloat(data.percentage) < 10)
            .map(([cat]) => cat);

        return { distribution, gaps, totalPosts: totalFiles };

    } catch (e) {
        console.error(`[ANALISE] Falha Fatal: ${e.message}`);
        return { distribution: {}, gaps: ['geral'], error: e.message };
    }
}

// 2. Contexto Temporal
function getTemporalContext() {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;

    // Eventos (Simplificado & Localizado)
    const eventosVals = [
        { m: 1, d: 1, n: 'Ano Novo' },
        { m: 2, d: 14, n: 'Valentine\'s Day (Data Americana/Internacional)' },
        { m: 2, d: 20, n: 'Carnaval (Brasil)' },
        { m: 3, d: 8, n: 'Dia da Mulher' },
        { m: 3, d: 17, n: 'St. Patrick\'s Day (Cultural)' },
        { m: 4, d: 21, n: 'Páscoa' },
        { m: 6, d: 12, n: 'Dia dos Namorados (Brasil)' },
        { m: 7, d: 4, n: 'Independence Day (USA - Cultural)' },
        { m: 10, d: 12, n: 'Dia das Crianças / N. Sra. Aparecida' },
        { m: 10, d: 31, n: 'Halloween (Cultural)' },
        { m: 11, d: 2, n: 'Finados' },
        { m: 11, d: 15, n: 'Proclamação da República' },
        { m: 11, d: 25, n: 'Thanksgiving (USA - Cultural)' },
        { m: 12, d: 25, n: 'Natal' }
    ];

    const eventosProximos = eventosVals
        .filter(e => e.m === mes || e.m === mes + 1)
        .map(e => e.n);

    let estacao = (mes >= 12 || mes <= 2) ? 'Verão (Brasil)' : (mes >= 6 && mes <= 8) ? 'Inverno (Brasil)' : (mes >= 3 && mes <= 5) ? 'Outono (Brasil)' : 'Primavera (Brasil)';

    return {
        data: hoje.toISOString().split('T')[0],
        estacao,
        eventosProximos
    };
}

// 3. Seleção IA
async function selectThemesByAI(env) {
    const analysis = await analyzePostHistory(env);
    const context = getTemporalContext();

    const prompt = `
    ATUE COMO: Estrategista de Conteúdo Sênior da Lexis Academy (Escola de Inglês para Brasileiros).
    
    DADOS:
    - Total Posts: ${analysis.totalPosts}
    - GAPS (Prioridade): ${analysis.gaps.join(', ')}
    - Contexto: ${context.data} (${context.estacao}). Eventos Próximos: ${context.eventosProximos.join(', ')}
    
    TAREFA:
    Gere 3 sugestões de pauta INÉDITAS para preencher os gaps e aproveitar o contexto.
    
    REGRAS:
    1. Público: Brasileiros aprendendo inglês.
    2. Contexto Cultural: Se citar datas comemorativas estrangeiras (ex: Valentine's Day em Fev), aborde como "Curiosidade Cultural" ou "Vocabulário Específico", deixando claro a diferença para o Brasil.
    3. Títulos: Magnéticos e em Português.
    4. Diversifique os clusters.
    
    SAÍDA (JSON Puro):
    {
      "temas": [
        {
          "topic": "Título do Post",
          "cluster": "categoria-do-gap",
          "intent": "dor|decisao|cultural",
          "justificativa": "Motivo da escolha"
        }
      ]
    }
    `;

    try {
        const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [{ role: 'user', content: prompt }]
        });

        let text = aiRes.response;
        let temas = [];

        // TENTATIVA 1: JSON.parse DIRETO
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                temas = data.temas || data.themes || [];
            }
        } catch (e) {
            console.warn("[IA-PLAN] JSON Parse falhou. Tentando Regex...");
        }

        // TENTATIVA 2: REGEX FALLBACK (Se o JSON veio quebrado)
        if (temas.length === 0) {
            // Regex para capturar objetos { "topic": ... } individualmente
            const objectRegex = /{\s*"topic":\s*"(.*?)",\s*"cluster":\s*"(.*?)",\s*"intent":\s*"(.*?)",\s*"justificativa":\s*"(.*?)"\s*}/g;
            let match;
            while ((match = objectRegex.exec(text)) !== null) {
                temas.push({
                    topic: match[1],
                    cluster: match[2],
                    intent: match[3],
                    justificativa: match[4]
                });
            }
        }

        // TENTATIVA 3 (Último recurso): Regex mais permissivo
        if (temas.length === 0) {
            const simpleRegex = /"topic":\s*"(.*?)".*?"cluster":\s*"(.*?)"/gs;
            let match;
            while ((match = simpleRegex.exec(text)) !== null) {
                temas.push({
                    topic: match[1],
                    cluster: match[2],
                    intent: 'informacional', // Default
                    justificativa: 'Recuperado via Regex Simples'
                });
                if (temas.length >= 3) break;
            }
        }

        if (temas.length === 0) {
            return {
                success: false,
                error: "IA não retornou temas válidos. Parse falhou.",
                raw: text
            };
        }

        const added = [];
        for (const tema of temas) {
            const id = Date.now().toString() + Math.floor(Math.random() * 1000);
            const job = {
                topic: tema.topic,
                cluster: tema.cluster.toLowerCase(),
                intent: tema.intent || 'informacional',
                status: 'pending',
                created_at: new Date().toISOString(),
                ai_generated: true,
                justification: tema.justificativa || tema.justification
            };

            await env.LEXIS_PAUTA.put(`job:${id}`, JSON.stringify(job));
            added.push(job);
        }

        return { success: true, analysis, new_jobs: added };

    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ============================================
// HELPER: GERAÇÃO DE PROMPTS PROFISSIONAIS (ART DIRECTOR)
// ============================================
async function generateVisualKeywords(env, topic) {
    if (!topic) return null;
    console.log(`[ART DIRECTOR] Gerando prompt avançado (TEMPLATE ANTIRRUÍDO) para: "${topic}"`);

    const FORBIDDEN_KEYWORDS = [
        'neuroscience', 'brain', 'science', 'concept', 'abstract',
        'success', 'motivation', 'inspiration', 'achievement',
        'communication', 'connection', 'network', 'idea',
        'innovation', 'creativity', 'strategy', 'solution'
    ];

    try {
        const artDirectorPrompt = `
        ACT AS: Strategic Art Director specialized in keyword-based image banks (Pixabay, Unsplash, Pexels).
        USER MISSION: Create a highly assertive English prompt for a blog hero image.

        BLOG TOPIC: "${topic}"

        STEP 1: INTERNAL DIAGNOSIS (Do not include in output)
        1. Classify the theme into ONE category: Relationship, Business, Technology, Culture, Education, Productivity, Health, Marketing, or Other.
        2. Convert the abstract theme into a CONCRETE HUMAN SCENE with:
           - Specific Action
           - Real Environment
           - Predominant Emotion
        3. Identify ambiguous words in the theme that might cause "noise" in the image bank.

        STEP 2: PROMPT CONSTRUCTION RULES
        - 100% English
        - Real life scenes, NO abstract concepts
        - Defined characters and clear actions
        - Specific environment and explicit emotion
        - Defined lighting and suggested color palette
        - Hero Image requirements: Include "wide horizontal composition" and "negative space for headline"
        - Mandatory Quality Markers: "realistic editorial photography", "high resolution", "natural expressions"
        - Category-based Exclusions (Include at least 6 with a minus sign):
          * Relationship: -festival -decoration -ceramic -handmade -craft -cartoon -wedding stage -proposal ring closeup
          * Business: -handshake closeup -cartoon office -3d render -clipart -illustration -graph isolated
          * Technology: -futuristic neon -robot cartoon -3d abstract background -digital illustration -metaverse art
          * Culture: -pottery -traditional craft -costume performance -folk dance stage -artisan workshop -decoration closeup
          * Education: -children cartoon -clipart -school drawing -illustration -blackboard isolated
          * Productivity: -abstract concept -3d clock -floating icons -illustration -minimal icon set

        OUTPUT FORMAT (Strictly one line, no explanation):
        [who], [specific action], [specific environment], [emotional tone], [lighting], [color direction], [composition], [quality markers], [minimum 6 exclusions]

        EXAMPLE:
        A group of diverse friends laughing, sharing a meal at a rustic outdoor wooden table, feeling joyful and connected, soft golden hour sunlight, warm earth tones, wide horizontal composition, negative space for headline, realistic editorial photography, high resolution, natural expressions, -festival -decoration -ceramic -handmade -craft -cartoon -wedding stage -proposal ring closeup
        `;

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: artDirectorPrompt },
                { role: 'user', content: `Generate the assertive English prompt for: ${topic}` }
            ],
            max_tokens: 250
        });

        let prompt = response.response.trim();

        // Limpeza de artifacts
        prompt = prompt.replace(/^["']|["']$/g, ''); // Remove aspas
        prompt = prompt.replace(/^(Here is|Here's|Prompt:|The prompt is:?|Result:?)/gi, '').trim();
        prompt = prompt.replace(/\n.*/g, ''); // Remove linhas extras

        // Validação básica: Se o prompt for muito curto ou não tiver exclusões, tenta forçar
        if (prompt.length < 50 || !prompt.includes('-')) {
            console.warn("[ART DIRECTOR] Prompt gerado parece incompleto. Usando estrutura de segurança.");
            const fallbackSuffix = "wide horizontal composition, negative space for headline, realistic editorial photography, high resolution, natural expressions, -cartoon -clipart -3d -illustration -abstract -background";
            prompt = `${topic} scene with people, ${fallbackSuffix}`;
        }

        console.log(`[ART DIRECTOR] Prompt final: "${prompt.substring(0, 100)}..."`);
        return prompt;

    } catch (e) {
        console.warn(`[ART DIRECTOR] Falha: ${e.message}`);
        return "authentic diverse people engaged in real activity, natural lighting, specific environment, wide horizontal composition, negative space for headline, realistic editorial photography, high resolution, -cartoon -clipart -3d -illustration";
    }
}

// 4. SITEMAP DINÂMICO (SEO V5.7)
async function generateDynamicSitemap(env) {
    const baseUrl = "https://lexis.academy";
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: today },
        { loc: "/imersao", priority: "0.9", changefreq: "monthly", lastmod: today },
        { loc: "/maestria", priority: "0.9", changefreq: "monthly", lastmod: today },
        { loc: "/the-way", priority: "0.9", changefreq: "monthly", lastmod: today },
        { loc: "/blog", priority: "0.8", changefreq: "daily", lastmod: today },
    ];

    const clusters = ["ingles", "metodologia", "imersao", "dicas", "estudo", "business", "viagem", "mindset"];
    const blogPosts = [];

    for (const cluster of clusters) {
        const indexKey = `index:${cluster}`;
        const indexData = await env.LEXIS_PAUTA.get(indexKey);
        if (indexData) {
            try {
                const posts = JSON.parse(indexData);
                for (const post of posts) {
                    blogPosts.push({
                        loc: `/blog/${post.slug}`,
                        priority: "0.7",
                        changefreq: "monthly",
                        lastmod: post.published_at || today
                    });
                }
            } catch (e) {
                console.error(`Erro ao parsear index:${cluster}`, e);
            }
        }
    }

    const urls = [...staticPages, ...blogPosts];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
        }
    });
}

// --- RSS FEED DINÂMICO (SEO V5.7) ---
async function generateDynamicRSS(env) {
    const baseUrl = "https://lexis.academy";
    const today = new Date().toUTCString();

    const clusters = ["ingles", "metodologia", "imersao", "dicas", "estudo", "business", "viagem", "mindset"];
    const allPosts = [];

    for (const cluster of clusters) {
        const indexKey = `index:${cluster}`;
        const indexData = await env.LEXIS_PAUTA.get(indexKey);
        if (indexData) {
            try {
                const posts = JSON.parse(indexData);
                for (const post of posts) {
                    allPosts.push({
                        title: post.title,
                        link: `${baseUrl}/blog/${post.slug}`,
                        pubDate: post.published_at ? new Date(post.published_at).toUTCString() : today,
                        category: cluster
                    });
                }
            } catch (e) {
                console.error(`Erro ao parsear index:${cluster}`, e);
            }
        }
    }

    allPosts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lexis Academy Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Artigos sobre aprendizado de inglês, imersão e fluência real - Metodologia Lexis</description>
    <language>pt-BR</language>
    <lastBuildDate>${today}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${allPosts.slice(0, 20).map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.link}</link>
      <guid>${post.link}</guid>
      <pubDate>${post.pubDate}</pubDate>
      <category>${post.category}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/rss+xml",
            "Cache-Control": "public, max-age=3600"
        }
    });
}
