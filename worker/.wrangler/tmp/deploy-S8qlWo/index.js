var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var index_default = {
  // --- ROTAS HTTP (API Manual) ---
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/add-topic") {
      if (request.method !== "POST") return new Response("Use POST", { status: 405 });
      const body = await request.json().catch(() => ({}));
      if (!body.topic || !body.cluster) {
        return new Response(JSON.stringify({
          error: "Schema Inv\xE1lido. Obrigat\xF3rio: 'topic' e 'cluster'.",
          required: { query: "string", cluster: "string", intent: "informacional|dor|decisao" }
        }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      const jobData = {
        topic: body.topic.trim(),
        cluster: body.cluster.trim().toLowerCase(),
        intent: body.intent || "informacional",
        type: body.type || "evergreen",
        priority: body.priority || 1,
        status: "pending",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const id = Date.now().toString();
      await env.LEXIS_PAUTA.put(`job:${id}`, JSON.stringify(jobData));
      return new Response(JSON.stringify({ success: true, id, job: jobData }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/queue") {
      const limit = parseInt(url.searchParams.get("limit")) || 100;
      const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit });
      const jobs = [];
      for (const key of list.keys) {
        const value = await env.LEXIS_PAUTA.get(key.name);
        jobs.push({ id: key.name, ...JSON.parse(value) });
      }
      return new Response(JSON.stringify(jobs, null, 2), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/process-queue") {
      return await processNextJob(env);
    }
    if (url.pathname === "/purge") {
      const list = await env.LEXIS_PAUTA.list({ prefix: "job:" });
      for (const key of list.keys) {
        await env.LEXIS_PAUTA.delete(key.name);
      }
      return new Response("Fila limpa! Zero items.", { status: 200 });
    }
    if (url.pathname === "/reset-memory") {
      const list = await env.LEXIS_PAUTA.list({ prefix: "index:" });
      for (const key of list.keys) {
        await env.LEXIS_PAUTA.delete(key.name);
      }
      return new Response("Mem\xF3ria limpa: \xCDndices apagados.", { status: 200 });
    }
    return new Response("Lexis Publisher V5.6 (Slug Shield) Ativo", { status: 200 });
  },
  // --- TRIGGERS AGENDADOS ---
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processNextJob(env));
  }
};
async function processNextJob(env) {
  const list = await env.LEXIS_PAUTA.list({ prefix: "job:", limit: 1 });
  if (list.keys.length === 0) {
    return new Response("Fila vazia", { status: 200 });
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
        intent: jobData.intent
      });
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    } else {
      console.error(`[FAIL] ${result.error}`);
      const isValidationError = ["Short Content", "No Structure (H2)", "Missing Fields", "Parsing Failed"].includes(result.error) || result.reason === "DUPLICATE_SLUG";
      if (isValidationError) {
        console.warn(`[DELETE] Removendo job inv\xE1lido da fila: ${jobData.topic}`);
        await env.LEXIS_PAUTA.delete(jobKey);
      }
      return new Response(JSON.stringify(result), { status: 422, headers: { "Content-Type": "application/json" } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
__name(processNextJob, "processNextJob");
async function generateAndPublishPost(env, job) {
  const relatedPosts = await getRelatedPosts(env, job.cluster);
  const internalLinksPrompt = relatedPosts.length > 0 ? `INCLUA LINKS INTERNOS PARA: ${relatedPosts.map((p) => `[${p.title}](/blog/${p.slug})`).join(", ")}` : "";
  const systemPrompt = `
    Voc\xEA \xE9 o Evangelista Chefe da Lexis Academy.
    
    SUA MISS\xC3O: Escrever um artigo de blog pol\xEAmico e profundo.
    
    PRINC\xCDPIOS EDITORIAIS:
    1. "Idioma n\xE3o se aprende. Idioma se treina."
    2. Ataque m\xE9todos tradicionais (gram\xE1tica, decoreba).
    3. Use H2 para subt\xEDtulos (##).
    
    FORMATO DE SA\xCDDA: JSON (ESTRITAMENTE)
    {
      "title": "T\xEDtulo H1 Impactante",
      "slug": "slug-otimizado-seo",
      "description": "Meta description persuasiva para Google (max 150 chars)",
      "tags": ["tag1", "tag2"],
      "content": "Texto completo do artigo em Markdown. Use ## para subt\xEDtulos. N\xC3O coloque o t\xEDtulo H1 aqui dentro, apenas o corpo do texto."
    }
  `;
  const userPrompt = `
    T\xF3pico: "${job.topic}"
    Cluster: "${job.cluster}"
    Inten\xE7\xE3o: "${job.intent}"
    
    ${internalLinksPrompt}
    
    Escreva um artigo de >1000 palavras.
    Comece atacando o problema imediatamente (sem introdu\xE7\xF5es fofas).
    Use Portugu\xEAs do Brasil.
    
    IMPORTANTE: Retorne APENAS o JSON v\xE1lido. Sem markdown em volta (\`\`\`json).
  `;
  let aiResponse;
  try {
    aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4e3
    });
  } catch (e) {
    return { success: false, error: `AI Failed: ${e.message}` };
  }
  let raw = aiResponse.response.trim();
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    raw = raw.substring(firstBrace, lastBrace + 1);
  }
  let postData = { cluster: job.cluster, intent: job.intent };
  let parseSuccess = false;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(postData, parsed);
    if (parsed.content) postData.content_markdown = parsed.content;
    parseSuccess = true;
  } catch (e) {
    console.warn("[PARSER] JSON.parse falhou. Tentando extra\xE7\xE3o manual (Regex)...");
  }
  if (!parseSuccess) {
    try {
      const extract = /* @__PURE__ */ __name((key) => {
        const match = raw.match(new RegExp(`"${key}"\\s*:\\s*"(.*?)"`, "s"));
        return match ? match[1] : null;
      }, "extract");
      postData.title = extract("title");
      postData.slug = extract("slug");
      postData.description = extract("description");
      const contentMatch = raw.match(/"content"\s*:\s*"(.*)"\s*}/s) || raw.match(/"content"\s*:\s*"(.*)/s);
      if (contentMatch) {
        let content = contentMatch[1];
        if (content.endsWith('"}')) content = content.slice(0, -2);
        else if (content.endsWith('"')) content = content.slice(0, -1);
        postData.content_markdown = content.replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
      const tagsMatch = raw.match(/"tags"\s*:\s*\[(.*?)\]/s);
      if (tagsMatch) {
        postData.tags = tagsMatch[1].split(",").map((t) => t.replace(/["\s]/g, ""));
      }
    } catch (e2) {
      console.error("Parser Regex falhou tamb\xE9m.");
    }
  }
  if (!postData.title) postData.title = job.topic;
  if (!postData.slug) postData.slug = job.topic.toLowerCase().replace(/ /g, "-");
  if (!postData.content_markdown) {
    console.warn("IA ignorou JSON. Usando RAW como conte\xFAdo.");
    postData.content_markdown = raw;
  }
  postData.slug = postData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  postData.title = postData.title.trim();
  const validation = validatePost(postData);
  if (!validation.valid) return { success: false, error: validation.reason };
  if (await checkFileExists(env, `${postData.slug}.md`)) {
    return { success: false, reason: "DUPLICATE_SLUG", error: "Exists" };
  }
  if (!postData.image) {
    postData.image = await getImageWithFallback(job.cluster, env);
  }
  const finalMarkdown = `---
title: "${postData.title.replace(/"/g, '\\"')}"
date: "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}"
description: "${postData.description.replace(/"/g, '\\"')}"
tags: [${postData.tags.map((t) => `"${t}"`).join(", ")}]
category: "${job.cluster}"
author: "Lexis Intel AI"
image: "${postData.image}"
cluster: "${job.cluster}"
intent: "${job.intent}"
---

${postData.content_markdown}

---
*Este artigo \xE9 parte da nossa s\xE9rie sobre **${job.cluster}**. Continue treinando:*
${relatedPosts.map((p) => `- [${p.title}](/blog/${p.slug})`).join("\n")}
  `;
  const result = await uploadToGitHub(env, `${postData.slug}.md`, finalMarkdown, `feat(blog): [${job.cluster}] ${postData.title}`);
  return { success: true, url: result.url, slug: postData.slug, title: postData.title };
}
__name(generateAndPublishPost, "generateAndPublishPost");
async function addToClusterIndex(env, cluster, postMeta) {
  const key = `index:${cluster}`;
  let current = await env.LEXIS_PAUTA.get(key);
  let posts = current ? JSON.parse(current) : [];
  if (!posts.find((p) => p.slug === postMeta.slug)) {
    posts.push(postMeta);
    await env.LEXIS_PAUTA.put(key, JSON.stringify(posts));
  }
}
__name(addToClusterIndex, "addToClusterIndex");
async function getRelatedPosts(env, cluster) {
  const key = `index:${cluster}`;
  const data = await env.LEXIS_PAUTA.get(key);
  if (!data) return [];
  const posts = JSON.parse(data);
  return posts.sort(() => 0.5 - Math.random()).slice(0, 3);
}
__name(getRelatedPosts, "getRelatedPosts");
function validatePost(post) {
  if (post.content_markdown.length < 400) return { valid: false, reason: "Short Content" };
  if (!post.content_markdown.includes("##")) return { valid: false, reason: "No Structure (H2)" };
  return { valid: true };
}
__name(validatePost, "validatePost");
async function checkFileExists(env, fileName) {
  const r = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${fileName}`, {
    headers: { "Authorization": `Bearer ${env.GITHUB_TOKEN}`, "User-Agent": "Lexis-Worker" }
  });
  return r.status === 200;
}
__name(checkFileExists, "checkFileExists");
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
__name(uploadToGitHub, "uploadToGitHub");
var CLUSTER_QUERIES = {
  "business": "business professional office work",
  "viagem": "travel adventure landscape nature",
  "estudo": "study learning education books",
  "mindset": "meditation focus mindfulness wellness",
  "default": "inspiration motivation success"
};
async function getImageWithFallback(cluster, env) {
  console.log(`[IMAGE] Buscando imagem para cluster: ${cluster}`);
  if (env.UNSPLASH_ACCESS_KEY && env.UNSPLASH_ENABLED === "true") {
    try {
      console.log(`[UNSPLASH] Tentando buscar imagem din\xE2mica...`);
      const image = await getUnsplashImage(cluster, env.UNSPLASH_ACCESS_KEY);
      if (image) {
        console.log(`[UNSPLASH] \u2705 Sucesso! URL: ${image.substring(0, 50)}...`);
        return image;
      }
    } catch (error) {
      console.warn(`[UNSPLASH] \u274C Falha: ${error.message}. Usando fallback...`);
    }
  }
  if (env.PEXELS_API_KEY && env.PEXELS_ENABLED === "true") {
    try {
      console.log(`[PEXELS] Tentando buscar imagem din\xE2mica...`);
      const query = CLUSTER_QUERIES[cluster] || CLUSTER_QUERIES["default"];
      const image = await getPixabayImage(query, env.PEXELS_API_KEY);
      if (image) {
        console.log(`[PEXELS] \u2705 Sucesso! URL: ${image.substring(0, 50)}...`);
        return image;
      }
    } catch (error) {
      console.warn(`[PEXELS] \u274C Falha: ${error.message}. Usando fallback...`);
    }
  }
  console.log(`[FALLBACK] Usando banco de imagens est\xE1tico...`);
  const curatedImage = getCuratedImage(cluster);
  if (curatedImage) {
    console.log(`[FALLBACK] \u2705 Imagem curada encontrada`);
    return curatedImage;
  }
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80";
}
__name(getImageWithFallback, "getImageWithFallback");
async function getUnsplashImage(cluster, accessKey) {
  const query = CLUSTER_QUERIES[cluster] || CLUSTER_QUERIES["default"];
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&w=1200&q=80&orientation=landscape`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    const response = await fetch(url, {
      headers: {
        "Authorization": `Client-ID ${accessKey}`,
        "Accept-Version": "v1"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const imageUrl = data.urls.regular;
    return `${imageUrl}?w=1200&q=80`;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`[UNSPLASH API] Timeout (5s) ao buscar imagem`);
    } else {
      console.error(`[UNSPLASH API] Erro: ${error.message}`);
    }
    return null;
  }
}
__name(getUnsplashImage, "getUnsplashImage");
async function getPixabayImage(query, accessKey) {
  try {
    const url = `https://pixabay.com/api/?key=${accessKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    const imageUrl = data.hits?.[0]?.largeImageURL;
    if (imageUrl) {
      console.log(`[PIXABAY] \u2705 Sucesso! URL: ${imageUrl.substring(0, 50)}...`);
      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`[PIXABAY API] \u274C Erro: ${error.message}`);
    return null;
  }
}
__name(getPixabayImage, "getPixabayImage");
function getCuratedImage(cluster) {
  const COLLECTIONS = {
    "business": [
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80"
    ],
    "viagem": [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80"
    ],
    "estudo": [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80"
    ],
    "mindset": [
      "https://images.unsplash.com/photo-1499209974431-2761e2523676?w=1200&q=80",
      // Relaxed thinking
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&q=80",
      // Girl thinking
      "https://images.unsplash.com/photo-1555601568-c916f54b1046?w=1200&q=80",
      // Brain concept
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=80",
      // Meditation focus
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80"
      // Working focused
    ],
    "default": [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
    ]
  };
  const key = cluster ? cluster.toLowerCase() : "default";
  const collection = COLLECTIONS[key] || COLLECTIONS["default"];
  return collection[Math.floor(Math.random() * collection.length)];
}
__name(getCuratedImage, "getCuratedImage");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
