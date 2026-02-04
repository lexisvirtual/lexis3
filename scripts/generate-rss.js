import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITE_URL = 'https://lexis.academy';

function generateRSS() {
    console.log('🎙️ Gerando Feed RSS...');

    // Verifica se diretório de posts existe
    if (!fs.existsSync(POSTS_DIR)) {
        console.warn('⚠️ Diretório de posts não encontrado. Pulando geração de RSS.');
        return;
    }

    // Ler arquivos
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

    const posts = files.map(filename => {
        const filePath = path.join(POSTS_DIR, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);

        return {
            title: data.title,
            description: data.description,
            date: new Date(data.date), // Garante objeto Date
            link: `${SITE_URL}/blog/${filename.replace('.md', '')}`,
            guid: `${SITE_URL}/blog/${filename.replace('.md', '')}`
        };
    }).sort((a, b) => b.date - a.date); // Ordenar por mais recente

    // Montar XML
    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Lexis Academy Blog</title>
    <link>${SITE_URL}</link>
    <description>Estratégias de guerra para quem não tem tempo a perder com métodos tradicionais de inglês.</description>
    <language>pt-br</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts.map(post => `
    <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${post.link}</link>
        <guid>${post.guid}</guid>
        <pubDate>${post.date.toUTCString()}</pubDate>
        <description><![CDATA[${post.description}]]></description>
    </item>`).join('')}
</channel>
</rss>`;

    // Salvar
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR);
    }
    fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), xml);
    console.log(`✅ RSS gerado com sucesso: ${posts.length} posts.`);
}

generateRSS();
