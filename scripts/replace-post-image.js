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
 * Função principal
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('❌ Uso: node scripts/replace-post-image.js <URL_DO_POST> <URL_DA_NOVA_IMAGEM>');
        console.error('   Exemplo: node scripts/replace-post-image.js https://lexis.academy/blog/imersao-na-linguagem-de-amor https://images.unsplash.com/photo-1234567890?w=1200');
        process.exit(1);
    }

    const postUrl = args[0];
    const newImageUrl = args[1];

    try {
        console.log('🚀 Iniciando substituição de imagem...\n');

        // 1. Extrai o slug da URL
        const slug = extractSlugFromUrl(postUrl);
        console.log(`📝 Slug detectado: ${slug}\n`);

        // 2. Verifica se o post existe
        const postPath = path.join(POSTS_DIR, `${slug}.md`);
        if (!fs.existsSync(postPath)) {
            throw new Error(`Post não encontrado: ${postPath}`);
        }

        // 3. Baixa, otimiza e salva a nova imagem (sobrescreve a antiga)
        const newImagePath = await optimizeAndSaveImage(newImageUrl, slug);

        console.log('\n🎉 Imagem substituída com sucesso!');
        console.log(`   Novo caminho: ${newImagePath}`);

        // 4. Commit automático
        console.log('\n📦 Fazendo commit das alterações...');
        const { execSync } = await import('child_process');

        try {
            execSync(`git add public/img/posts/${slug}.webp`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            execSync(`git commit -m "fix(post): replace image for ${slug}"`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            // NOVO: Faz pull antes de dar push para evitar rejeição
            console.log('🔄 Sincronizando com o GitHub...');
            execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

            execSync('git push origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            console.log('\n✅ Alterações commitadas e enviadas para o GitHub!');
        } catch (error) {
            console.error('\n⚠️  Erro ao fazer commit. Faça manualmente:');
            console.log(`   git add public/img/posts/${slug}.webp`);
            console.log(`   git commit -m "fix(post): replace image for ${slug}"`);
            console.log(`   git push origin main`);
        }

    } catch (error) {
        console.error(`\n❌ Erro: ${error.message}`);
        process.exit(1);
    }
}

main();
