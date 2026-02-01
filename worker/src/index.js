
export default {
    // --- ROTAS HTTP (API Manual) ---
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Adicionar pauta
        if (url.pathname === "/add-topic") {
            if (request.method !== "POST") return new Response("Use POST", { status: 405 });

            const body = await request.json().catch(() => ({}));
            if (!body.topic) return new Response("JSON deve ter { topic: '...' }", { status: 400 });

            // Configuração avançada da pauta (default values)
            const jobData = {
                topic: body.topic,
                type: body.type || "evergreen", // ou 'trending'
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
            const list = await env.LEXIS_PAUTA.list({ prefix: "job:" });
            const jobs = [];
            for (const key of list.keys) {
                const value = await env.LEXIS_PAUTA.get(key.name);
                jobs.push({ id: key.name, ...JSON.parse(value) });
            }
            return new Response(JSON.stringify(jobs, null, 2), { headers: { "Content-Type": "application/json" } });
        }

        // 3. Forçar Processamento (Manual Trigger)
        if (url.pathname === "/process-queue") {
            return await processNextJob(env);
        }

        // Compatibilidade Legada (Teste Direto)
        if (url.pathname === "/auto-blog") {
            const topic = url.searchParams.get("topic");
            if (!topic) return new Response("Use ?topic=...", { status: 400 });
            // Cria job temporário e processa
            return await generateAndPublishPost(env, { topic, type: "manual" });
        }

        return new Response("Lexis Publisher 4.0 (Anti-Duplication + Filter) Ativo!", { status: 200 });
    },

    // --- TRIGGERS AGENDADOS (CRON Auto) ---
    async scheduled(event, env, ctx) {
        ctx.waitUntil(processNextJob(env));
    }
};

// --- ORQUESTRADOR ---

async function processNextJob(env) {
    // Pega 1 item da fila
    const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit: 1 });

    if (list.keys.length === 0) {
        console.log("Fila vazia.");
        return new Response("Fila vazia", { status: 200 });
    }

    const jobKey = list.keys[0].name;
    const jobData = JSON.parse(await env.LEXIS_PAUTA.get(jobKey));

    console.log(`[ORCHESTRATOR] Iniciando job: ${jobData.topic}`);

    // 1. FILTRO DE PALAVRAS FRACAS (Economia de Recursos)
    const weakKeywords = ["o que é", "significado", "traducao", "grátis", "pdf", "baixar"];
    const isWeak = weakKeywords.some(w => jobData.topic.toLowerCase().includes(w));

    if (isWeak) {
        console.warn(`[DISCARD] Tópico fraco descartado: ${jobData.topic}`);
        await env.LEXIS_PAUTA.delete(jobKey);
        return new Response(`Descartado (Weak Query): ${jobData.topic}`, { status: 200 });
    }

    try {
        const result = await generateAndPublishPost(env, jobData);

        if (result.success) {
            await env.LEXIS_PAUTA.delete(jobKey); // Remove da fila se sucesso
            return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
        } else {
            // Tratamento especial para duplicatas: remove da fila também (já foi feito antes)
            if (result.reason === "DUPLICATE_SLUG") {
                console.warn(`[SKIP] Duplicata detectada: ${jobData.topic}`);
                await env.LEXIS_PAUTA.delete(jobKey);
                return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
            }

            console.error(`[FAIL] Job ${jobKey} erro: ${result.error}`);
            // Mantém na fila para retry se for erro técnico
            return new Response(JSON.stringify(result), { status: 422, headers: { "Content-Type": "application/json" } });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

// --- NÚCLEO INTELIGENTE (IA + VALIDAÇÃO) ---

async function generateAndPublishPost(env, job) {
    console.log(`[AI] Gerando conteúdo para: ${job.topic}`);

    // PROMPT ARQUITETADO PARA TEXTO PLANO E FILOSOFIA LEXIS
    const systemPrompt = `
    Você é o Evangelista Chefe da Lexis Academy.
    Sua missão é destruir mitos do ensino tradicional de inglês e promover a Metodologia Lexis.
    
    PRINCÍPIOS EDITORIAIS (OBRIGATÓRIO SEGUIR):
    1. AXIOMA CENTRAL: "Idioma não se aprende. Idioma se treina." Trate inglês como esporte/habilidade, não como matéria escolar.
    2. INIMIGO COMUM: Ataque métodos tradicionais (focados em gramática, tradução mental, lentidão).
    3. SOLUÇÃO: Imersão intensiva, repetição deliberada, erro como ferramenta, alta densidade (120h em 2 semanas).
    4. TOM DE VOZ: Autoritário, motivador, direto, contra-intuitivo. Use frases curtas e impactantes.
    
    FORMATO DE RESPOSTA OBRIGATÓRIO (TEXTO PLANO):
    TITLE: [Título H1 provocativo e otimizado SEO]
    SLUG: [slug-kebab-case]
    DESCRIPTION: [Meta description focada na dor do aluno]
    TAGS: [tag1, tag2]
    CONTENT:
    [Escreva o artigo completo em Markdown. Comece com um GANCHO: "O problema não é falta de estudo, é excesso de método errado". Use H2, H3. Finalize com CTA para a Imersão Lexis.]
  `;

    const userPrompt = `
    Tópico: "${job.topic}"
    Tipo: ${job.type}
    
    Escreva um artigo de blog PODEROSO sob a ótica da Neurociência e Treino de Habilidade (Lexis).
    Não dê dicas genéricas. Dê estratégias de TREINO.
    Mínimo de 6 parágrafos. Use Português do Brasil.
  `;

    let aiResponse;
    try {
        aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });
    } catch (e) {
        return { success: false, error: `AI Failed: ${e.message}` };
    }

    // PARSER DE TEXTO PLANO (INFALÍVEL)
    let raw = aiResponse.response;
    let postData = {};

    try {
        // Regex que pega tudo após os prefixos
        const getField = (prefix) => {
            const regex = new RegExp(`${prefix}:\\s*(.*)`);
            const match = raw.match(regex);
            return match ? match[1].trim() : null;
        };

        postData.title = getField("TITLE");
        postData.slug = getField("SLUG");
        postData.description = getField("DESCRIPTION");

        const tagsRaw = getField("TAGS");
        postData.tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()) : ["english", "learning"];

        // Conteúdo é tudo depois de "CONTENT:"
        const contentSplit = raw.split("CONTENT:");
        if (contentSplit.length > 1) {
            postData.content_markdown = contentSplit[1].trim();
        }

        // Validação de sanidade
        if (!postData.title || !postData.content_markdown) {
            throw new Error("Missing TITLE or CONTENT fields in AI response");
        }

    } catch (e) {
        return { success: false, error: "Parsing Failed", raw: raw.substring(0, 200) + "..." };
    }

    // ETAPA 4: VALIDAÇÃO AUTOMÁTICA
    const validation = validatePost(postData);
    if (!validation.valid) {
        return { success: false, error: `Validation Failed: ${validation.reason}` };
    }

    // ETAPA 4.5: CHECK ANTI-DUPLICIDADE
    const exists = await checkFileExists(env, `${postData.slug}.md`);
    if (exists) {
        return { success: false, reason: "DUPLICATE_SLUG", error: "File already exists on GitHub" };
    }

    // ETAPA 5: MONTAGEM DO ARQUIVO
    const finalMarkdown = `---
title: "${postData.title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().split('T')[0]}"
description: "${postData.description.replace(/"/g, '\\"')}"
tags: [${postData.tags.map(t => `"${t}"`).join(', ')}]
author: "Lexis Intel AI"
---

${postData.content_markdown}
  `;

    // ETAPA 6: COMMIT GITHUB
    const fileName = `${postData.slug}.md`;
    try {
        const uploadResult = await uploadToGitHub(env, fileName, finalMarkdown, `feat(blog): ${postData.title}`);
        return { success: true, url: uploadResult.url, slug: postData.slug };
    } catch (e) {
        return { success: false, error: `GitHub Upload Failed: ${e.message}` };
    }
}

// --- CHECKER ---
async function checkFileExists(env, fileName) {
    const githubUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${fileName}`;

    const response = await fetch(githubUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "Lexis-Publisher-Worker",
            "Accept": "application/vnd.github.v3+json",
        }
    });

    return response.status === 200; // 200 = Existe, 404 = Não existe
}


// --- REGRAS DE VALIDAÇÃO ---
function validatePost(post) {
    if (!post.title || !post.content_markdown) return { valid: false, reason: "Missing fields" };

    // Mínimo de caracteres (tamanho)
    // Relaxado para 400 caracteres para evitar falso-negativo em testes
    if (post.content_markdown.length < 400) {
        return { valid: false, reason: `Conteúdo curto (${post.content_markdown.length} chars)` };
    }

    // Estrutura obrigatória
    if (!post.content_markdown.includes("##")) {
        return { valid: false, reason: "Sem H2" };
    }

    return { valid: true };
}

// --- GITHUB HELPER ---
async function uploadToGitHub(env, fileName, content, commitMessage) {
    const contentEncoded = btoa(unescape(encodeURIComponent(content)));
    const githubUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${fileName}`;

    const response = await fetch(githubUrl, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "Lexis-Publisher-Worker",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
            message: commitMessage,
            content: contentEncoded,
            branch: env.GITHUB_BRANCH,
        }),
    });

    const data = await response.json();
    if (response.ok) {
        return { url: data.content.html_url };
    } else {
        throw new Error(`GitHub Error: ${data.message}`);
    }
}

async function createTestFile(env) {
    return uploadToGitHub(env, `hello-world-${Date.now()}.md`, "# Test", "chore: test");
}
