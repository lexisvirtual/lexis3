/**
 * Sistema de Saneamento Retroativo - Lexis Academy
 * Busca posts antigos, audita e força reescrita ou deleção.
 */

import { auditPost } from './content-auditor.js';

// Função de deleção movida para cá para evitar erros de importação cíclica/reversão
async function deleteFileFromGitHub(env, path, message = 'chore: remove low-quality post') {
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Lexis/1.0' }
        });
        if (!getRes.ok) return false;
        const fileData = await getRes.json();
        const delRes = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'Lexis/1.0' },
            body: JSON.stringify({ message, sha: fileData.sha, branch })
        });
        return delRes.ok;
    } catch (e) { return false; }
}

export async function performGreatPurge(env, limit = 5) {
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src/posts?ref=${branch}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Lexis/1.0' }
        });
        const mdFiles = (await res.json()).filter(f => f.name.endsWith('.md'));
        const results = { approved: [], deleted: [], errors: [] };
        let processed = 0;

        for (const file of mdFiles) {
            if (processed >= limit) break;
            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();

            if (content.includes('audit_status: "verified"')) continue;

            const audit = await auditPost(env, { title: file.name, content });
            processed++;

            if (audit.verdict === 'APROVADO' && audit.score >= 85) {
                results.approved.push(file.name);
            } else {
                const deleted = await deleteFileFromGitHub(env, `src/posts/${file.name}`, `refactor: kill low-quality post (${audit.score})`);
                if (deleted) results.deleted.push(file.name);
                else results.errors.push(file.name);
            }
        }
        return { success: true, ...results };
    } catch (e) { return { success: false, error: e.message }; }
}

export async function sanitizeOldPosts(env, limit = 5) {
    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/src/posts?ref=${branch}`, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Lexis/1.0' }
        });
        const mdFiles = (await res.json()).filter(f => f.name.endsWith('.md'));
        const sanitized = [];
        let count = 0;
        for (const file of mdFiles) {
            if (count >= limit) break;
            const fileRes = await fetch(file.download_url);
            const content = await fileRes.text();
            if (!content.includes('lexis_version: "2.0"')) {
                const info = extractOriginalInfo(content);
                if (info.link) {
                    await env.LEXIS_TRIAGED_ARTICLES.put(`triaged:legacy:${generateShortId(file.name)}`, JSON.stringify({
                        id: 'legacy-' + generateShortId(file.name),
                        title: info.title || file.name,
                        link: info.link
                    }));
                    sanitized.push(file.name);
                    count++;
                }
            }
        }
        return { success: true, sanitized };
    } catch (e) { return { success: false, error: e.message }; }
}

function extractOriginalInfo(content) {
    const match = content.match(/\*Fonte Original: \[(.*?)\]\((.*?)\)\*/);
    return match ? { title: match[1], link: match[2] } : { title: null, link: null };
}

function generateShortId(text) {
    return Math.abs(text.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(36).substring(0, 6);
}
