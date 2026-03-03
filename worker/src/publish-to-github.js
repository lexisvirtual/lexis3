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

      // 2. Gerar markdown final
      const markdown = buildMarkdown(post);
      const filename = `${post.slug}.md`;

      // 3. Commit do post no GitHub
      const githubRes = await commitFileToGitHub(
        env,
        `src/posts/${filename}`,
        stringToBase64(markdown),
        `feat(blog): ${post.title}`
      );
      console.log(`[PUBLISH] GitHub Response: ${JSON.stringify(githubRes).substring(0, 100)}...`);

      // 3.5 Remover IMEDIATAMENTE da fila (Evitar duplicatas em caso de timeout posterior)
      await env.LEXIS_REWRITTEN_POSTS.delete(key.name);
      console.log(`[PUBLISH] Remoção precoce da fila (${key.name}) confirmada.`);

      // 4. Registrar como publicado
      const publishedRecord = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        originalSource: post.originalSource,
        publishedAt: new Date().toISOString()
      };

      await env.LEXIS_PUBLISHED_POSTS.put(
        `published:${post.id || post.slug}`,
        JSON.stringify(publishedRecord)
      );

      // 5. Registrar hash do título e link (deduplicação futura)
      await env.LEXIS_PUBLISHED_POSTS.put(
        `title:${simpleHash(post.title)}`,
        'true'
      );

      // Registrar Link Original
      if (post.originalSource) {
        await env.LEXIS_PUBLISHED_POSTS.put(
          `link:${simpleHash(post.originalSource)}`,
          'true'
        );
      }

      // 6. Incrementar contador de posts totais
      const currentTotal = parseInt(await env.LEXIS_PUBLISHED_POSTS.get('system:totalPosts') || '0');
      await env.LEXIS_PUBLISHED_POSTS.put('system:totalPosts', String(currentTotal + 1));

      publishedPosts.push(publishedRecord);
      console.log(`[PUBLISH] ✅ Publicado: ${post.title} (Total: ${currentTotal + 1})`);

    } catch (error) {
      console.error(`[PUBLISH] ❌ Erro ao publicar "${post.title}": ${error.message}`);
      errors.push({ post: post.title, error: error.message });
    }
  }

  // 9. Disparar Build no GitHub Actions (para atualizar o site estático)
  if (publishedPosts.length > 0) {
    await triggerGithubBuild(env);
  }

  return {
    success: true,
    published: publishedPosts.length,
    posts: publishedPosts,
    errors
  };
}

// ================================================
// Geração do Markdown do post
// ================================================
function buildMarkdown(post) {
  const title = escapeYaml(post.title || 'Sem Título');
  let description = escapeYaml(post.description || post.title || 'Aprenda inglês de forma prática e eficiente');

  // Nível de Segurança 2: Sanitização final de descrição
  if (description.includes("Post legado resgatado") || description.length < 15) {
    description = `Aprenda tudo sobre "${escapeYaml(post.title)}" com foco em business e fluência real na Lexis Academy.`;
  }

  const category = post.category || 'Dicas';
  // Garante data da postagem real (Hoje) e não a data de quando foi triado
  const date = new Date().toISOString().split('T')[0];
  const content = post.content || '';
  const keywords = post.keywords || 'aprender inglês, praticar inglês, curso de inglês, inglês por imersão, inglês intensivo';

  const aiSnippet = post.seo?.ai_snippet || '';
  const aiContext = post.seo?.ai_context || '';
  const slug = post.slug || '';

  // Leo: JSON-LD for AI Search & Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "datePublished": date,
    "author": { "@type": "Organization", "name": "Lexis Academy" },
    "publisher": { "@type": "Organization", "name": "Lexis English Academy" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://lexis.academy/blog/${slug}` },
    "abstract": aiSnippet,
    "mentions": [
      { "@type": "Thing", "name": "Inglês por Imersão" },
      { "@type": "Thing", "name": "Intercâmbio sem sair do Brasil" }
    ]
  };

  return `---
title: "${title}"
date: "${date}"
category: "${category}"
description: "${description}"
keywords: "${keywords}"
author: "Lexis Academy"
publisher: "Lexis English Academy"
mainEntityOfPage: "https://lexis.academy/blog/${slug}"
ai_snippet: "${escapeYaml(aiSnippet)}"
ai_context: "${escapeYaml(aiContext)}"
lexis_version: "${post.lexis_version || '2.5-leo'}"
${post.upgrade_mandatory ? 'upgrade_mandatory: true\n' : ''}---

${content}

---
*Este conteúdo foi gerado por IA com base em fontes premium de ensino de inglês e revisado pela metodologia Lexis Academy.*
${post.originalSource ? `*Fonte Original: [${post.originalTitle || 'Ver no site original'}](${post.originalSource})*` : ''}
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
// GitHub API - Trigger Build (Workflow Dispatch)
// ================================================
async function triggerGithubBuild(env) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const token = env.GITHUB_TOKEN;
  const workflowFile = 'deploy.yml'; // Deve bater com o .github/workflows/deploy.yml

  console.log(`[BUILD] 🚀 Verificando gatilho de build para ${workflowFile}...`);

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'LexisPublisher/1.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: env.GITHUB_BRANCH || 'main' })
      }
    );

    if (res.status === 204) {
      console.log(`[BUILD] ✅ Build disparado com sucesso no GitHub Actions.`);
      return true;
    } else {
      const err = await res.text();
      console.error(`[BUILD] ⚠️ Erro ao disparar build: ${res.status} ${err}`);
      return false;
    }
  } catch (e) {
    console.error(`[BUILD] ❌ Erro fatal no trigger: ${e.message}`);
    return false;
  }
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
  // Normalização agressiva: lowercase, remove acentos, remove pontuação
  // E remove preposições/artigos comuns (de, da, do, em, na, no, a, o, as, os, para, com)
  const stopwords = /\b(de|da|do|em|na|no|a|o|as|os|para|com|um|uma|nas|nos|pelo|pela|dos|das)\b/gi;

  const normalized = String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(stopwords, '') // Remove conectores
    .replace(/[^a-z0-9]/g, ''); // Remove todo o resto (espaços, pontuação)

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
