import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');
const PUBLISHED_LOG = path.join(__dirname, '../.published-linkedin.json');
const SITE_URL = 'https://lexis.academy';

// Configuração da API do LinkedIn
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const LINKEDIN_TOKEN = process.env.LINKEDIN_TOKEN;

/**
 * Carrega o log de posts já publicados
 */
function loadPublishedLog() {
    if (fs.existsSync(PUBLISHED_LOG)) {
        return JSON.parse(fs.readFileSync(PUBLISHED_LOG, 'utf-8'));
    }
    return { posts: [] };
}

/**
 * Salva o log de posts publicados
 */
function savePublishedLog(log) {
    fs.writeFileSync(PUBLISHED_LOG, JSON.stringify(log, null, 2));
}

/**
 * Obtém informações do perfil do LinkedIn
 */
async function getLinkedInProfile() {
    const response = await fetch(`${LINKEDIN_API_URL}/me`, {
        headers: {
            'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Erro ao obter perfil: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Converte markdown para texto simples (LinkedIn não suporta markdown em posts)
 */
function markdownToPlainText(markdown) {
    return markdown
        // Remove headers
        .replace(/#{1,6}\s+/g, '')
        // Remove bold/italic
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove links mas mantém o texto
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        // Remove imagens
        .replace(/!\[.*?\]\(.+?\)/g, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`(.+?)`/g, '$1')
        // Remove blockquotes
        .replace(/>\s+/g, '')
        // Limpa linhas extras
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Cria um resumo do post (primeiros 200 caracteres)
 */
function createSummary(content, maxLength = 200) {
    const plainText = markdownToPlainText(content);
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Publica um artigo no LinkedIn
 */
async function publishToLinkedIn(authorId, post) {
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
    const summary = createSummary(post.content, 150);

    // Criar texto do post com link
    const postText = `${post.title}

${summary}

Leia o artigo completo: ${canonicalUrl}

#inglês #educação #aprendizado #lexisacademy`;

    const payload = {
        author: `urn:li:person:${authorId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: postText
                },
                shareMediaCategory: 'ARTICLE',
                media: [
                    {
                        status: 'READY',
                        originalUrl: canonicalUrl,
                        title: {
                            text: post.title
                        },
                        description: {
                            text: post.description || summary
                        }
                    }
                ]
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    const response = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao publicar: ${error}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Processa todos os posts não publicados
 */
async function processUnpublishedPosts() {
    console.log('💼 Iniciando publicação no LinkedIn...\n');

    // Verificar token
    if (!LINKEDIN_TOKEN) {
        console.error('❌ LINKEDIN_TOKEN não configurado!');
        console.log('\n📋 Para configurar:');
        console.log('1. Acesse: https://www.linkedin.com/developers/apps');
        console.log('2. Crie um app ou use um existente');
        console.log('3. Obtenha um Access Token com permissões: w_member_social');
        console.log('4. Configure a variável de ambiente: set LINKEDIN_TOKEN=seu_token');
        console.log('5. Ou crie um arquivo .env na raiz do projeto\n');
        return;
    }

    try {
        // Obter perfil do LinkedIn
        const profile = await getLinkedInProfile();
        const authorId = profile.id;
        console.log(`✅ Conectado ao LinkedIn\n`);

        // Carregar log de publicações
        const publishedLog = loadPublishedLog();
        const publishedSlugs = new Set(publishedLog.posts.map(p => p.slug));

        // Ler posts locais
        const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

        let newPublications = 0;
        let errors = 0;

        for (const filename of files) {
            const slug = filename.replace('.md', '');

            // Pular se já foi publicado
            if (publishedSlugs.has(slug)) {
                console.log(`⏭️  Pulando "${slug}" (já publicado)`);
                continue;
            }

            try {
                // Ler post
                const filePath = path.join(POSTS_DIR, filename);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);

                const post = {
                    slug,
                    title: data.title,
                    description: data.description,
                    content: content
                };

                console.log(`📤 Publicando: "${post.title}"...`);

                // Publicar no LinkedIn
                const result = await publishToLinkedIn(authorId, post);

                console.log(`✅ Publicado com sucesso!`);
                console.log(`   ID: ${result.id}\n`);

                // Registrar publicação
                publishedLog.posts.push({
                    slug,
                    title: post.title,
                    linkedinId: result.id,
                    publishedAt: new Date().toISOString()
                });

                savePublishedLog(publishedLog);
                newPublications++;

                // Aguardar entre publicações
                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error) {
                console.error(`❌ Erro ao publicar "${slug}": ${error.message}\n`);
                errors++;
            }
        }

        console.log('\n📊 Resumo:');
        console.log(`   ✅ Publicados: ${newPublications}`);
        console.log(`   ❌ Erros: ${errors}`);
        console.log(`   📝 Total no log: ${publishedLog.posts.length}`);

    } catch (error) {
        console.error(`❌ Erro geral: ${error.message}`);
    }
}

// Executar
processUnpublishedPosts();
