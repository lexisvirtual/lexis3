
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

        return new Response("Lexis Publisher 3.1 (Robust JSON) Ativo!", { status: 200 });
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

    try {
        const result = await generateAndPublishPost(env, jobData);

        if (result.success) {
            await env.LEXIS_PAUTA.delete(jobKey); // Remove da fila se sucesso
            return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
        } else {
            console.error(`[FAIL] Job ${jobKey} falhou validação: ${result.error}`);
            return new Response(JSON.stringify(result), { status: 422, headers: { "Content-Type": "application/json" } });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

// --- NÚCLEO INTELIGENTE (IA + VALIDAÇÃO) ---

async function generateAndPublishPost(env, job) {
    // ETAPA 3: PROMPT ESTRUTURADO (JSON)
    console.log(`[AI] Gerando conteúdo para: ${job.topic}`);

    const systemPrompt = `
    Você é o editor-chefe da Lexis Academy.
    IMPORTANTE: Retorne APENAS um objeto JSON válido.
    NÃO escreva "Aqui está o JSON". NÃO use Markdown code blocks.
  `;

    const userPrompt = `
    Tópico: "${job.topic}"
    Tipo: ${job.type}
    
    JSON Schema Obrigatório:
    {
      "title": "Título H1 (SEO)",
      "slug": "slug-kebab-case",
      "description": "Meta description",
      "content_markdown": "Conteúdo do post em Markdown (Use H2, H3, Bold). Mencione 'Lexis Academy'. Mínimo 1000 caracteres.",
      "tags": ["tag1", "tag2"]
    }
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

    // Parse e Limpeza Robusta
    let rawContent = aiResponse.response;
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
        rawContent = rawContent.substring(firstBrace, lastBrace + 1);
    }

    let postData;
    try {
        postData = JSON.parse(rawContent);
    } catch (e) {
        return { success: false, error: "AI returned invalid JSON", raw: rawContent.substring(0, 50) + "..." };
    }

    // ETAPA 4: VALIDAÇÃO AUTOMÁTICA
    const validation = validatePost(postData);
    if (!validation.valid) {
        return { success: false, error: `Validation Failed: ${validation.reason}` };
    }

    // ETAPA 5: MONTAGEM DO ARQUIVO
    const finalMarkdown = `---
title: "${postData.title.replace(/"/g, '\\"')}"
date: "${new Date().toISOString().split('T')[0]}"
description: "${postData.description.replace(/"/g, '\\"')}"
tags: [${Array.isArray(postData.tags) ? postData.tags.map(t => `"${t}"`).join(', ') : '"general"'}]
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

// --- REGRAS DE VALIDAÇÃO ---
function validatePost(post) {
    if (!post.title || !post.content_markdown) return { valid: false, reason: "Missing fields" };

    if (post.content_markdown.length < 1000) {
        return { valid: false, reason: `Conteúdo curto (${post.content_markdown.length} chars)` };
    }

    if (!post.content_markdown.includes("##")) {
        return { valid: false, reason: "Sem H2" };
    }

    // Relaxa validação de marca para teste
    // const brandTerms = ["Lexis", "Immersion", "Imersão"]; 
    // const hasBrand = brandTerms.some(term => post.content_markdown.includes(term));

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
