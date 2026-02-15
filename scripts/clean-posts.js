import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/posts');

/**
 * Função de limpeza de conteúdo (mesma lógica do worker)
 */
function sanitizeContent(content) {
    if (!content) return content;

    let cleaned = content;

    // 1. Remove linhas com "image_search_query" (formato JSON ou texto solto)
    cleaned = cleaned.replace(/[,\s]*"image_search_query"\s*:\s*"[^"]*"/gi, '');
    cleaned = cleaned.replace(/.*image_search_query.*\n?/gi, '');

    // 2. Remove restos de JSON artifacts (chaves soltas, vírgulas extras)
    cleaned = cleaned.replace(/^\s*[,}\]]\s*$/gm, ''); // Linhas com apenas }, ], ou vírgulas
    cleaned = cleaned.replace(/,\s*}/g, '}'); // Vírgulas antes de fechar objeto
    cleaned = cleaned.replace(/,\s*\]/g, ']'); // Vírgulas antes de fechar array

    // 3. Remove aspas escapadas desnecessárias no meio do texto
    cleaned = cleaned.replace(/\\"/g, '"');

    // 4. Remove blocos de código JSON vazios ou quebrados
    cleaned = cleaned.replace(/```json\s*\n\s*```/gi, '');
    cleaned = cleaned.replace(/```\s*\n\s*```/g, '');

    // 5. Limpa múltiplas linhas em branco consecutivas (deixa no máximo 2)
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // 6. Remove espaços em branco no final das linhas
    cleaned = cleaned.replace(/[ \t]+$/gm, '');

    return cleaned.trim();
}

/**
 * Processa todos os posts e limpa metadados vazados
 */
function cleanAllPosts() {
    console.log('🧹 Iniciando limpeza de posts...\n');

    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

    let cleaned = 0;
    let unchanged = 0;

    for (const filename of files) {
        const filePath = path.join(POSTS_DIR, filename);
        const originalContent = fs.readFileSync(filePath, 'utf-8');

        // Separa frontmatter do conteúdo (suporta \n e \r\n)
        const frontmatterMatch = originalContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

        if (!frontmatterMatch) {
            console.log(`⚠️  ${filename}: Formato inválido (sem frontmatter)`);
            continue;
        }

        const frontmatter = frontmatterMatch[1];
        const content = frontmatterMatch[2];

        // Limpa o conteúdo
        const cleanedContent = sanitizeContent(content);

        // Verifica se houve mudança
        if (cleanedContent !== content) {
            const newFileContent = `---\n${frontmatter}\n---\n${cleanedContent}`;
            fs.writeFileSync(filePath, newFileContent, 'utf-8');
            console.log(`✅ ${filename}: Limpo`);
            cleaned++;
        } else {
            unchanged++;
        }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Limpos: ${cleaned}`);
    console.log(`   ⏭️  Sem alteração: ${unchanged}`);
    console.log(`   📝 Total: ${files.length}`);
}

// Executar
cleanAllPosts();
