const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Download e converte imagem para WebP
 * Uso: node download-image.cjs <url> <filename>
 * Exemplo: node download-image.cjs "https://pixabay.com/..." "meu-post"
 */

const imageUrl = process.argv[2];
const filename = process.argv[3] || 'image';

if (!imageUrl) {
    console.error('❌ Erro: URL da imagem é obrigatória');
    console.error('Uso: node download-image.cjs <url> <filename>');
    process.exit(1);
}

const outputDir = path.join(__dirname, '..', 'public', 'images', 'blog');
const outputPath = path.join(outputDir, `${filename}.webp`);

// Criar diretório se não existir
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📥 Baixando imagem de: ${imageUrl.substring(0, 60)}...`);

const protocol = imageUrl.startsWith('https') ? https : http;

protocol.get(imageUrl, { timeout: 10000 }, (response) => {
    if (response.statusCode !== 200) {
        console.error(`❌ Erro HTTP: ${response.statusCode}`);
        process.exit(1);
    }

    const chunks = [];
    response.on('data', chunk => chunks.push(chunk));
    response.on('end', async () => {
        try {
            const buffer = Buffer.concat(chunks);
            console.log(`✅ Imagem baixada: ${(buffer.length / 1024).toFixed(2)} KB`);

            // Converter para WebP
            console.log(`🔄 Convertendo para WebP...`);
            await sharp(buffer)
                .webp({ quality: 80 })
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            console.log(`✅ Salvo em: ${outputPath}`);
            console.log(`📊 Tamanho final: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`🔗 URL local: /images/blog/${filename}.webp`);
        } catch (error) {
            console.error(`❌ Erro na conversão: ${error.message}`);
            process.exit(1);
        }
    });
}).on('error', (error) => {
    console.error(`❌ Erro no download: ${error.message}`);
    process.exit(1);
});
