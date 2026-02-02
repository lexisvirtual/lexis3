
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.join(__dirname, '../src/posts');

console.log(`🧹 Iniciando limpeza em: ${postsDir}`);

if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);

    files.forEach(file => {
        if (!file.endsWith('.md')) return;

        const filePath = path.join(postsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        const originalSize = content.length;

        // REGEX DE LIMPEZA (Mesma da V5.7)
        // Remove linhas de metadados vazados no corpo
        content = content.replace(/^(SLUG|DESCRIPTION|TAGS|TITLE)\s*:.*$/gim, '');

        // Remove excesso de quebras de linha
        content = content.replace(/\n{3,}/g, '\n\n');

        if (content.length !== originalSize) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✅ Reparado: ${file} (-${originalSize - content.length} chars)`);
        } else {
            console.log(`✨ Já limpo: ${file}`);
        }
    });
} else {
    console.error("Diretório de posts não encontrado!");
}
