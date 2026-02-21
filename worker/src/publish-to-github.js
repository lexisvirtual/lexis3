/**
 * Módulo de Publicação Automática no GitHub
 * Pega posts de LEXIS_REWRITTEN_POSTS → publica em src/posts/
 * Imagem otimizada → commit em public/img/posts/
 */

export async function publishPostsToGitHub(env, maxPosts = 3) {
  const rewrittenList = await env.LEXIS_REWRITTEN_POSTS.list({ prefix: 'post:', limit: maxPosts });
  const publishedPosts = [];
  const errors = [];

  for (const key of rewrittenList.keys) {
    const rawData = await env.LEXIS_REWRITTEN_POSTS.get(key.name);
    if (!rawData) continue;

    let post;
    try {
      post = JSON.parse(rawData);
    } catch (e) {
      errors.push({ key: key.name, error: 'JSON parse error: ' + e.message });
      continue;
    }

    // Garantir slug válido
    if (!post.slug) {
      post.slug = generateSlug(post.title || 'post-sem-titulo');
    }

    try {
      // 1. Verificar se já existe (evitar duplicatas)
      const exists = await checkFileExists(env, `${post.slug}.md`);
      if (exists) {
        console.log(`[PUBLISH] Post já existe: ${post.slug}.md — ignorando.`);
        await env.LEXIS_REWRITTEN_POSTS.delete(key.name);
        continue;
      }

      // 2. Buscar e fazer upload da imagem (opcional - não bloqueia publicação)
      let imagePath = '/img/posts/default.webp';
      try {
        imagePath = await uploadImage(env, post);
      } catch (imgErr) {
        console.warn(`[PUBLISH] Erro na imagem (usando default): ${imgErr.message}`);
      }

      // 3. Gerar markdown final
      const markdown = buildMarkdown(post, imagePath);
      const filename = `${post.slug}.md`;

      // 4. Commit do post no GitHub
      await commitFileToGitHub(
        env,
        `src/posts/${filename}`,
        stringToBase64(markdown),
        `feat(blog): ${post.title}`
      );

      // 5. Registrar como publicado
      const publishedRecord = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        imagePath,
        originalSource: post.originalSource,
        publishedAt: new Date().toISOString()
      };

      await env.LEXIS_PUBLISHED_POSTS.put(
        `published:${post.id || post.slug}`,
        JSON.stringify(publishedRecord)
      );

      // 6. Registrar hash do título (deduplicação futura)
      await env.LEXIS_PUBLISHED_POSTS.put(
        `title:${simpleHash(post.title)}`,
        'true'
      );

      // 7. Remover da fila
      await env.LEXIS_REWRITTEN_POSTS.delete(key.name);

      publishedPosts.push(publishedRecord);
      console.log(`[PUBLISH] ✅ Publicado: ${post.title}`);

    } catch (error) {
      console.error(`[PUBLISH] ❌ Erro ao publicar "${post.title}": ${error.message}`);
      errors.push({ post: post.title, error: error.message });
    }
  }

  return {
    success: true,
    published: publishedPosts.length,
    posts: publishedPosts,
    errors
  };
}

// ================================================
// Upload de imagem para o GitHub (public/img/posts/)
// ================================================
async function uploadImage(env, post) {
  // Tenta usar a URL da imagem já extraída pelo content-rewriter ou image-source-extractor
  const imageUrl = post.image?.url || post.image?.originalUrl || (typeof post.image === 'string' ? post.image : null);

  if (!imageUrl || imageUrl.includes('default.webp')) {
    return '/img/posts/default.webp';
  }

  try {
    // Baixar imagem via wsrv.nl (otimização automática)
    const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&output=webp&q=80`;
    const response = await fetch(optimizedUrl, {
      headers: { 'User-Agent': 'LexisPublisher/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem: HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    const filename = `${post.slug}.webp`;
    const githubPath = `public/img/posts/${filename}`;

    await commitFileToGitHub(
      env,
      githubPath,
      base64,
      `feat(img): Add image for "${post.title}"`
    );

    return `/img/posts/${filename}`;

  } catch (error) {
    console.warn(`[IMAGE] Usando URL externa (upload falhou): ${error.message}`);
    // Fallback: usar URL direta da imagem (não ideal, mas funciona)
    return imageUrl;
  }
}

// ================================================
// Geração do Markdown do post
// ================================================
function buildMarkdown(post, imagePath) {
  const title = escapeYaml(post.title || 'Sem Título');
  const description = escapeYaml(post.description || post.title || 'Aprenda inglês de forma prática e eficiente');
  const category = post.category || 'Dicas';
  const date = new Date().toISOString().split('T')[0];
  const content = post.content || '';

  return `---
title: "${title}"
date: "${date}"
category: "${category}"
description: "${description}"
image: "${imagePath}"
---

${content}
`;
}

// ================================================
// GitHub API - Commit de arquivo
// ================================================
async function commitFileToGitHub(env, path, contentBase64, message) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || 'main';
  const token = env.GITHUB_TOKEN;

  if (!token) throw new Error('GITHUB_TOKEN não configurado nos secrets do worker.');

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // Verificar se arquivo já existe (para atualizar com SHA)
  let sha = null;
  try {
    const checkRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'LexisPublisher/1.0'
      }
    });
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      sha = fileData.sha;
    }
  } catch (_) {
    // arquivo não existe, seguir em frente
  }

  const body = { message, content: contentBase64, branch };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'LexisPublisher/1.0'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub API ${res.status}: ${errText}`);
  }

  return await res.json();
}

// ================================================
// Verificar se arquivo já existe no GitHub
// ================================================
async function checkFileExists(env, filename) {
  const token = env.GITHUB_TOKEN;
  if (!token) return false;

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/src/posts/${filename}?ref=${env.GITHUB_BRANCH || 'main'}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'LexisPublisher/1.0'
      }
    }
  );
  return res.status === 200;
}

// ================================================
// Utilitários
// ================================================
function escapeYaml(text) {
  return String(text).replace(/"/g, '\\"');
}

function generateSlug(title) {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function simpleHash(text) {
  let hash = 0;
  const normalized = String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function stringToBase64(str) {
  // Converte string UTF-8 (com acentos em português) para base64 corretamente
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
