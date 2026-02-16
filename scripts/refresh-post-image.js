import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');
const IMAGES_DIR = path.join(__dirname, '../public/img/posts');

// Chave da API do Pixabay
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || '54644686-7efa1461402a91a56a1f92e8b';

/**
 * Extrai o slug da URL do blog
 */
function extractSlugFromUrl(url) {
    const match = url.match(/\/blog\/([^\/\?#]+)/);
    if (!match) {
        throw new Error('URL inválida. Use o formato: https://lexis.academy/blog/slug-do-post');
    }
    return match[1];
}

/**
 * Extrai informações do post (título, tags, categoria)
 */
function extractPostInfo(slug) {
    const postPath = path.join(POSTS_DIR, `${slug}.md`);

    if (!fs.existsSync(postPath)) {
        throw new Error(`Post não encontrado: ${postPath}`);
    }

    const content = fs.readFileSync(postPath, 'utf-8');

    // Extrai título
    const titleMatch = content.match(/^title:\s*"([^"]*)"/m);
    const title = titleMatch ? titleMatch[1] : '';

    // Extrai tags
    const tagsMatch = content.match(/^tags:\s*\[([^\]]*)\]/m);
    const tags = tagsMatch ? tagsMatch[1].replace(/"/g, '').split(',').map(t => t.trim()) : [];

    // Extrai categoria
    const categoryMatch = content.match(/^category:\s*"([^"]*)"/m);
    const category = categoryMatch ? categoryMatch[1] : '';

    return { title, tags, category };
}

/**
 * Busca imagem no Pixabay baseada no conteúdo do post
 */
async function fetchPixabayImage(query) {
    return new Promise((resolve, reject) => {
        const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=20`;

        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.hits && json.hits.length > 0) {
                        // Seleciona aleatoriamente
                        const randomIndex = Math.floor(Math.random() * json.hits.length);
                        resolve(json.hits[randomIndex].largeImageURL);
                    } else {
                        reject(new Error('Nenhuma imagem encontrada no Pixabay'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Baixa uma imagem de uma URL e retorna o buffer
 */
async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Falha ao baixar imagem: HTTP ${response.statusCode}`));
                return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Otimiza e salva a imagem
 */
async function optimizeAndSaveImage(imageUrl, slug) {
    console.log(`📥 Baixando imagem de: ${imageUrl.substring(0, 60)}...`);

    // Otimiza via wsrv.nl (redimensiona para 1200px, converte para WebP, Q=80)
    const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&output=webp&q=80`;

    try {
        const imageBuffer = await downloadImage(optimizedUrl);

        // Garante que o diretório existe
        if (!fs.existsSync(IMAGES_DIR)) {
            fs.mkdirSync(IMAGES_DIR, { recursive: true });
        }

        const imagePath = path.join(IMAGES_DIR, `${slug}.webp`);
        fs.writeFileSync(imagePath, imageBuffer);

        console.log(`✅ Imagem salva em: ${imagePath}`);
        return `/img/posts/${slug}.webp`;
    } catch (error) {
        console.error(`❌ Erro ao otimizar imagem: ${error.message}`);
        throw error;
    }
}


/**
 * Atualiza o frontmatter do post com o novo caminho da imagem
 */
function updatePostImage(slug, newImagePath) {
    const postPath = path.join(POSTS_DIR, `${slug}.md`);

    if (!fs.existsSync(postPath)) {
        throw new Error(`Post não encontrado: ${postPath}`);
    }

    let content = fs.readFileSync(postPath, 'utf-8');

    // Regex para encontrar e substituir a linha "image:" no frontmatter
    const imageRegex = /^image:\s*"[^"]*"/m;

    if (!imageRegex.test(content)) {
        // Se não achar com aspas, tenta sem aspas ou cria
        const imageRegexNoQuotes = /^image:\s*.*$/m;
        if (imageRegexNoQuotes.test(content)) {
            content = content.replace(imageRegexNoQuotes, `image: "${newImagePath}"`);
        } else {
            // Se não existir, insere após author
            content = content.replace(/^author:.*$/m, `$&${"\n"}image: "${newImagePath}"`);
        }
    } else {
        content = content.replace(imageRegex, `image: "${newImagePath}"`);
    }

    fs.writeFileSync(postPath, content, 'utf-8');
    console.log(`✅ Post atualizado: ${postPath}`);
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('❌ Uso: node scripts/refresh-post-image.js <URL_DO_POST>');
        console.error('   Exemplo: node scripts/refresh-post-image.js https://lexis.academy/blog/imersao-na-linguagem-de-amor');
        console.error('\n   O script buscará automaticamente uma nova imagem baseada no conteúdo do post.');
        process.exit(1);
    }

    const postUrl = args[0];

    try {
        console.log('🚀 Iniciando atualização automática de imagem...\n');

        // 1. Extrai o slug da URL
        const slug = extractSlugFromUrl(postUrl);
        console.log(`📝 Slug detectado: ${slug}\n`);

        // 2. Extrai informações do post
        const { title, tags, category } = extractPostInfo(slug);
        console.log(`📄 Post: "${title}"`);
        console.log(`🏷️  Tags: ${tags.join(', ')}`);
        console.log(`📂 Categoria: ${category}\n`);

        // 3. Monta query de busca (usa tags + categoria)
        const searchQuery = [...tags, category].filter(Boolean).join(' ');
        console.log(`🔍 Buscando imagem para: "${searchQuery}"\n`);

        // 4. Busca imagem no Pixabay
        const newImageUrl = await fetchPixabayImage(searchQuery);
        console.log(`🎨 Imagem encontrada!\n`);

        // 5. Baixa, otimiza e salva a nova imagem (sobrescreve a antiga)
        const localImagePath = await optimizeAndSaveImage(newImageUrl, slug);

        // [CORREÇÃO] Atualiza o post para apontar para a imagem local
        updatePostImage(slug, localImagePath);

        console.log('\n🎉 Imagem atualizada com sucesso!');

        // 6. Commit automático
        console.log('\n📦 Fazendo commit das alterações...');
        const { execSync } = await import('child_process');

        try {
            execSync(`git add public/img/posts/${slug}.webp src/posts/${slug}.md`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            execSync(`git commit -m "chore(post): refresh image for ${slug}"`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            // NOVO: Faz pull antes de dar push para evitar rejeição
            console.log('🔄 Sincronizando com o GitHub...');
            execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            execSync('git push origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            console.log('\n✅ Alterações commitadas e enviadas para o GitHub!');
        } catch (error) {
            console.error('\n⚠️  Erro ao fazer commit. Faça manualmente:');
            console.log(`   git add public/img/posts/${slug}.webp`);
            console.log(`   git commit -m "chore(post): refresh image for ${slug}"`);
            console.log(`   git push origin main`);
        }

    } catch (error) {
        console.error(`\n❌ Erro: ${error.message}`);
        process.exit(1);
    }
}

main();
