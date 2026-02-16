import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');
const IMAGES_DIR = path.join(__dirname, '../public/img/posts');

/**
 * Extrai o slug da URL do blog
 * Ex: https://lexis.academy/blog/dicas-neurociencia-pronuncia-ingles -> dicas-neurociencia-pronuncia-ingles
 */
function extractSlugFromUrl(url) {
    const match = url.match(/\/blog\/([^\/\?#]+)/);
    if (!match) {
        throw new Error('URL inválida. Use o formato: https://lexis.academy/blog/slug-do-post');
    }
    return match[1];
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
    console.log(`📥 Baixando imagem de: ${imageUrl}`);

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
        throw new Error('Frontmatter "image:" não encontrado no post');
    }

    content = content.replace(imageRegex, `image: "${newImagePath}"`);

    fs.writeFileSync(postPath, content, 'utf-8');
    console.log(`✅ Post atualizado: ${postPath}`);
}

/**
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('❌ Uso: node scripts/fix-post-image.js <URL_DO_POST>');
        console.error('   Exemplo: node scripts/fix-post-image.js https://lexis.academy/blog/dicas-neurociencia-pronuncia-ingles');
        process.exit(1);
    }

    const postUrl = args[0];

    try {
        console.log('🚀 Iniciando correção de imagem...\n');

        // 1. Extrai o slug da URL
        const slug = extractSlugFromUrl(postUrl);
        console.log(`📝 Slug detectado: ${slug}\n`);

        // 2. Lê o post para pegar a URL da imagem atual
        const postPath = path.join(POSTS_DIR, `${slug}.md`);
        if (!fs.existsSync(postPath)) {
            throw new Error(`Post não encontrado: ${postPath}`);
        }

        const content = fs.readFileSync(postPath, 'utf-8');
        const imageMatch = content.match(/^image:\s*"([^"]*)"/m);

        if (!imageMatch) {
            throw new Error('Imagem não encontrada no frontmatter do post');
        }

        const currentImageUrl = imageMatch[1];
        console.log(`🖼️  Imagem atual: ${currentImageUrl}\n`);

        // Se já é uma imagem local, avisa e sai
        if (currentImageUrl.startsWith('/img/posts/')) {
            console.log('ℹ️  A imagem já está hospedada localmente. Nada a fazer.');
            process.exit(0);
        }

        // 3. Baixa, otimiza e salva a imagem
        const newImagePath = await optimizeAndSaveImage(currentImageUrl, slug);

        // 4. Atualiza o post
        updatePostImage(slug, newImagePath);

        console.log('\n🎉 Imagem corrigida com sucesso!');
        console.log(`   Novo caminho: ${newImagePath}`);

        // 5. Commit automático
        console.log('\n📦 Fazendo commit das alterações...');
        const { execSync } = await import('child_process');

        try {
            execSync(`git add src/posts/${slug}.md public/img/posts/${slug}.webp`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            execSync(`git commit -m "fix(post): self-host image for ${slug}"`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            // NOVO: Faz pull antes de dar push para evitar rejeição
            console.log('🔄 Sincronizando com o GitHub...');
            execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            execSync('git push origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            console.log('\n✅ Alterações commitadas e enviadas para o GitHub!');
        } catch (error) {
            console.error('\n⚠️  Erro ao fazer commit. Faça manualmente:');
            console.log(`   git add src/posts/${slug}.md public/img/posts/${slug}.webp`);
            console.log(`   git commit -m "fix(post): self-host image for ${slug}"`);
            console.log(`   git push origin main`);
        }


    } catch (error) {
        console.error(`\n❌ Erro: ${error.message}`);
        process.exit(1);
    }
}

main();
