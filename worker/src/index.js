
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Rota 1: Teste simples (Cria Hello World)
        if (url.pathname === "/test-github") {
            return await createTestFile(env);
        }

        // Rota 2: Geração Automática com IA
        // Exemplo: /auto-blog?topic=Importancia da Imersão
        if (url.pathname === "/auto-blog") {
            const topic = url.searchParams.get("topic");
            if (!topic) return new Response("Por favor forneça um ?topic=...", { status: 400 });

            return await generateAndPublishPost(env, topic);
        }

        return new Response("Lexis Publisher AI está ON! Use /auto-blog?topic=SeuTema para criar um post.", { status: 200 });
    },
};

async function generateAndPublishPost(env, topic) {
    // 1. Pedir para a IA gerar o conteúdo
    const prompt = `
    Aja como um especialista em ensino de inglês e neurociência. Escreva um post de blog atraente sobre: "${topic}".
    
    Regras de Formatação:
    - O formato DEVE ser Markdown estrito.
    - NÃO use blocos de código (code fences) para envolver o texto todo.
    - Comece IMEDIATAMENTE com o frontmatter.
    
    Estrutura Obrigatória:
    ---
    title: "Um Título Criativo e Chamativo Aqui"
    date: "${new Date().toISOString().split('T')[0]}"
    description: "Uma descrição curta e persuasiva para SEO (max 160 caracteres)."
    ---
    
    # Título Principal (h1)
    
    [Introdução impactante]
    
    ## Subtítulo (h2)
    [Conteúdo educativo...]
    
    ## Conclusão
    [Chamada para ação para a Lexis Academy]
  `;

    try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'Você é um redator expert da Lexis Academy, focado em alta conversão e autoridade.' },
                { role: 'user', content: prompt }
            ]
        });

        const generatedContent = aiResponse.response;

        // 2. Extrair o título para usar no nome do arquivo (slug)
        // Tentativa simples de pegar o title do frontmatter
        const titleMatch = generatedContent.match(/title:\s*"(.*?)"/);
        const safeTitle = titleMatch ? titleMatch[1] : topic;
        const slug = safeTitle.toLowerCase()
            .replace(/[^\w\s-]/g, '') // remove chars especiais
            .replace(/\s+/g, '-')     // espaços vira hifens
            .substring(0, 50);        // limita tamanho

        const fileName = `${slug}.md`;

        // 3. Publicar no GitHub
        return await uploadToGitHub(env, fileName, generatedContent, `feat(blog): new post about ${topic}`);

    } catch (err) {
        return new Response(`Erro na IA: ${err.message}`, { status: 500 });
    }
}

async function uploadToGitHub(env, fileName, content, commitMessage) {
    // Codificar conteúdo em Base64
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
        return new Response(JSON.stringify({
            success: true,
            file: fileName,
            url: data.content.html_url,
            preview: content.substring(0, 200) // Mostra o começo do texto gerado
        }), { headers: { "Content-Type": "application/json" } });
    } else {
        return new Response(JSON.stringify({ success: false, error: data }), { status: 500 });
    }
}

// Manter função antiga de teste por compatibilidade
async function createTestFile(env) {
    return uploadToGitHub(env, `hello-world-${Date.now()}.md`, "# Test File\nCreated manually.", "chore: test file");
}
