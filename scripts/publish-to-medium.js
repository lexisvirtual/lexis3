import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');
const PUBLISHED_LOG = path.join(__dirname, '../.published-medium.json');
const SITE_URL = 'https://lexis.academy';

// Configuração da API do Medium
const MEDIUM_API_URL = 'https://api.medium.com/v1';
const MEDIUM_TOKEN = process.env.MEDIUM_TOKEN; // Você vai precisar configurar isso

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
 * Obtém informações do usuário do Medium
 */
async function getMediumUser() {
    const response = await fetch(`${MEDIUM_API_URL}/me`, {
        headers: {
            'Authorization': `Bearer ${MEDIUM_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Erro ao obter usuário: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Publica um post no Medium
 */
async function publishToMedium(userId, post) {
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

    // Adiciona nota no início do post sobre a fonte original
    const contentWithAttribution = `> *Este artigo foi originalmente publicado em [Lexis Academy](${canonicalUrl})*\n\n${post.content}`;

    const payload = {
        title: post.title,
        contentFormat: 'markdown',
        content: contentWithAttribution,
        tags: post.tags || ['inglês', 'educação', 'aprendizado'],
        publishStatus: 'public', // ou 'draft' para rascunho
        canonicalUrl: canonicalUrl, // Importante para SEO!
        notifyFollowers: true
    };

    const response = await fetch(`${MEDIUM_API_URL}/users/${userId}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${MEDIUM_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao publicar: ${error}`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Processa todos os posts não publicados
 */
async function processUnpublishedPosts() {
    console.log('📝 Iniciando publicação no Medium...\n');

    // Verificar token
    if (!MEDIUM_TOKEN) {
        console.error('❌ MEDIUM_TOKEN não configurado!');
        console.log('\n📋 Para configurar:');
        console.log('1. Acesse: https://medium.com/me/settings/security');
        console.log('2. Gere um Integration Token');
        console.log('3. Configure a variável de ambiente: set MEDIUM_TOKEN=seu_token');
        console.log('4. Ou crie um arquivo .env na raiz do projeto\n');
        return;
    }

    try {
        // Obter usuário do Medium
        const user = await getMediumUser();
        console.log(`✅ Conectado como: ${user.name} (@${user.username})\n`);

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
                    content: content,
                    tags: data.tags || []
                };

                console.log(`📤 Publicando: "${post.title}"...`);

                // Publicar no Medium
                const result = await publishToMedium(user.id, post);

                console.log(`✅ Publicado com sucesso!`);
                console.log(`   URL: ${result.url}\n`);

                // Registrar publicação
                publishedLog.posts.push({
                    slug,
                    title: post.title,
                    mediumUrl: result.url,
                    publishedAt: new Date().toISOString()
                });

                savePublishedLog(publishedLog);
                newPublications++;

                // Aguardar um pouco entre publicações para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 2000));

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
