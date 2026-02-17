// VERSÃO MELHORADA DO WORKER - Sistema 365 Temas
// Este arquivo contém as modificações para usar prompts melhorados
// Para aplicar: copie as funções abaixo para o index.js original

import { getSystemPrompt, getUserPrompt, generateImageQuery } from './prompts-melhorados.js';

// FUNÇÃO MELHORADA: generateAndPublishPost
// Substitui a função original no index.js (linha ~106)

export async function generateAndPublishPost(env, job) {
    const relatedPosts = await getRelatedPosts(env, job.cluster);
    const internalLinksPrompt = relatedPosts.length > 0
        ? `LINKS INTERNOS PARA: ${relatedPosts.map(p => `[${p.title}](/blog/${p.slug})`).join(", ")}`
        : "";

    // NOVO: Usar prompts melhorados
    const nivel = job.nivel || "intermediário";
    const systemPrompt = getSystemPrompt(nivel);
    const userPrompt = getUserPrompt(job.topic, job.cluster, job.intent, internalLinksPrompt);

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
                const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i');
                const match = raw.match(regex);
                return match ? match[1] : null;
            };

            const extractArray = (key) => {
                const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
                const match = raw.match(regex);
                if (!match) return [];
                return match[1].split(',').map(t => t.trim().replace(/"/g, ''));
            };

            const extractContent = () => {
                const regex = /"content"\s*:\s*"([\s\S]+?)"(?=\s*,\s*"image_search_query")/i;
                const match = raw.match(regex);
                return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : null;
            };

            postData.title = extract('title');
            postData.slug = extract('slug');
            postData.description = extract('description');
            postData.tags = extractArray('tags');
            postData.content_markdown = extractContent();
            postData.image_search_query = extract('image_search_query');

            if (postData.title && postData.content_markdown) {
                parseSuccess = true;
                console.log("[PARSER] Extração manual bem-sucedida.");
            }
        } catch (e) {
            console.error("[PARSER] Extração manual falhou:", e.message);
        }
    }

    if (!parseSuccess || !postData.title || !postData.content_markdown) {
        return { success: false, error: "Parsing Failed", raw_response: raw.substring(0, 500) };
    }

    // NOVO: Melhorar query de imagem se necessário
    if (!postData.image_search_query || postData.image_search_query.length < 20) {
        postData.image_search_query = generateImageQuery(job.topic, job.cluster);
        console.log("[IMAGE] Query gerada automaticamente:", postData.image_search_query);
    }

    // Validações
    if (!postData.slug) {
        postData.slug = postData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60);
    }

    if (!postData.description) {
        postData.description = postData.content_markdown.substring(0, 150).replace(/[#*\n]/g, ' ').trim() + '...';
    }

    if (!postData.tags || postData.tags.length === 0) {
        postData.tags = [job.cluster, 'ingles', 'fluencia'];
    }

    // Validações de qualidade
    const wordCount = postData.content_markdown.split(/\s+/).length;
    if (wordCount < 500) {
        return { success: false, error: "Short Content", word_count: wordCount };
    }

    const h2Count = (postData.content_markdown.match(/^## /gm) || []).length;
    if (h2Count < 2) {
        return { success: false, error: "No Structure (H2)", h2_count: h2Count };
    }

    // Verificar duplicata
    const existingPost = await env.LEXIS_PAUTA.get(`post:${postData.slug}`);
    if (existingPost) {
        return { success: false, error: "Duplicate Slug", slug: postData.slug, reason: "DUPLICATE_SLUG" };
    }

    // Buscar imagem
    let imageUrl = null;
    let imageSource = null;

    try {
        const imageResult = await searchImage(env, postData.image_search_query, postData.title);
        imageUrl = imageResult.url;
        imageSource = imageResult.source;
    } catch (e) {
        console.warn("[IMAGE] Falha na busca:", e.message);
    }

    // Criar arquivo markdown
    const frontmatter = `---
title: "${postData.title.replace(/"/g, '\\"')}"
description: "${postData.description.replace(/"/g, '\\"')}"
image: "${imageUrl || '/img/default-blog.jpg'}"
tags: [${postData.tags.map(t => `"${t}"`).join(', ')}]
publishedAt: "${new Date().toISOString()}"
---

`;

    const fullContent = frontmatter + postData.content_markdown;
    const fileName = `public/posts/${postData.slug}.md`;

    // Publicar no GitHub
    try {
        const publishResult = await publishToGitHub(env, fileName, fullContent, postData.title);
        
        if (publishResult.success) {
            await env.LEXIS_PAUTA.put(`post:${postData.slug}`, JSON.stringify({
                title: postData.title,
                slug: postData.slug,
                cluster: job.cluster,
                published_at: new Date().toISOString()
            }));

            return {
                success: true,
                title: postData.title,
                slug: postData.slug,
                url: `https://lexis.academy/blog/${postData.slug}`,
                image_url: imageUrl,
                image_source: imageSource,
                word_count: wordCount,
                h2_count: h2Count
            };
        } else {
            return { success: false, error: "GitHub Publish Failed", details: publishResult.error };
        }
    } catch (e) {
        return { success: false, error: "Publish Exception", message: e.message };
    }
}

// NOTA: As funções auxiliares (getRelatedPosts, searchImage, publishToGitHub) 
// permanecem as mesmas do index.js original
