
export default {
    // 1. Escuta requisições HTTP (API Manual)
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Adicionar pauta na fila (POST)
        if (url.pathname === "/add-topic") {
            if (request.method !== "POST") return new Response("Use POST", { status: 405 });
            const body = await request.json();
            if (!body.topic) return new Response("JSON deve ter { topic: '...' }", { status: 400 });

            // Salvar no KV com status 'pending'
            const id = Date.now().toString();
            await env.LEXIS_PAUTA.put(`job:${id}`, JSON.stringify({
                topic: body.topic,
                status: 'pending',
                created_at: new Date().toISOString()
            }));

            return new Response(`Pauta adicionada ID: ${id}`, { status: 200 });
        }

        // Listar fila
        if (url.pathname === "/queue") {
            const list = await env.LEXIS_PAUTA.list({ prefix: "job:" });
            const jobs = [];
            for (const key of list.keys) {
                const value = await env.LEXIS_PAUTA.get(key.name);
                jobs.push({ id: key.name, ...JSON.parse(value) });
            }
            return new Response(JSON.stringify(jobs, null, 2), { headers: { "Content-Type": "application/json" } });
        }

        // Gatilho Manual para Processar Fila (simula o CRON)
        if (url.pathname === "/process-queue") {
            return await processNextJob(env);
        }

        // Manter as rotas antigas para compatibilidade e teste direto
        if (url.pathname === "/auto-blog") {
            const topic = url.searchParams.get("topic");
            if (!topic) return new Response("Use ?topic=...", { status: 400 });
            return await generateAndPublishPost(env, topic);
        }

        if (url.pathname === "/test-github") {
            return await createTestFile(env);
        }

        return new Response("Lexis Publisher 2.0 (KV + CRON) Ativo!", { status: 200 });
    },

    // 2. Escuta o Relógio do CRON (Automático)
    async scheduled(event, env, ctx) {
        ctx.waitUntil(processNextJob(env));
    }
};

async function processNextJob(env) {
    // Buscar 1 job pendente
    const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit: 1 });

    if (list.keys.length === 0) {
        console.log("Fila vazia.");
        return new Response("Fila vazia", { status: 200 });
    }

    const jobKey = list.keys[0].name;
    const jobData = JSON.parse(await env.LEXIS_PAUTA.get(jobKey));

    console.log(`Processando job: ${jobData.topic}`);

    try {
        // Gerar o post
        const resultResponse = await generateAndPublishPost(env, jobData.topic);

        if (resultResponse.ok) {
            // Sucesso: Remover da fila
            await env.LEXIS_PAUTA.delete(jobKey);
            return new Response(`Sucesso: ${jobData.topic} publicado e removido da fila.`, { status: 200 });
        } else {
            // Falha: Manter na fila (ou mover para 'failed')
            // Por simplicidade, mantemos lá para tentar de novo no próximo CRON
            return new Response(`Falha ao publicar ${jobData.topic}`, { status: 500 });
        }
    } catch (e) {
        return new Response(`Erro crítico: ${e.message}`, { status: 500 });
    }
}

// --- Funções Auxiliares (Mesmas de antes) ---

async function generateAndPublishPost(env, topic) {
    const prompt = `
    Aja como um especialista em ensino de inglês e neurociência. Escreva um post de blog atraente sobre: "${topic}".
    
    Regras de Formatação:
    - O formato DEVE ser Markdown estrito.
    - NÃO use blocos de código (code fences).
    - Comece IMEDIATAMENTE com o frontmatter.
    
    Estrutura:
    ---
    title: "Título Criativo Aqui"
    date: "${new Date().toISOString().split('T')[0]}"
    description: "Descrição curta para SEO."
    ---
    
    # Título Principal (h1)
    
    [Introdução]
    
    ## Subtítulo
    [Conteúdo...]
    
    ## Conclusão com CTA para Lexis Academy
  `;

    try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'Expert da Lexis Academy.' },
                { role: 'user', content: prompt }
            ]
        });

        const generatedContent = aiResponse.response;
        const titleMatch = generatedContent.match(/title:\s*"(.*?)"/);
        const safeTitle = titleMatch ? titleMatch[1] : topic;
        const slug = safeTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
        const fileName = `${slug}.md`;

        return await uploadToGitHub(env, fileName, generatedContent, `feat(blog): auto-post ${topic}`);

    } catch (err) {
        throw new Error(`Erro IA: ${err.message}`);
    }
}

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
        return new Response(JSON.stringify({ success: true, url: data.content.html_url }), { headers: { "Content-Type": "application/json" } });
    } else {
        throw new Error(`GitHub Error: ${JSON.stringify(data)}`);
    }
}

async function createTestFile(env) {
    return uploadToGitHub(env, `hello-world-${Date.now()}.md`, "# Test", "chore: test");
}
