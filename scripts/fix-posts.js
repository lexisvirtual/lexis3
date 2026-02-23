
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

        // REGEX DE LIMPEZA (Mesma da V5.8 - Nuclear)
        // Remove qualquer linha que comece com esses metadados, com ou sem negrito
        content = content.replace(/(?:^|\n)\s*(?:\*\*|#)?(SLUG|DESCRIPTION|TAGS|TITLE)(?:\*\*|#)?\s*:.*$/gim, '');

        // CIRURGIA DE TÍTULO (Remove [ ], Título:, aspas extras)
        content = content.replace(/^title:\s*"(.*)"/m, (match, currentTitle) => {
            const cleanTitle = currentTitle
                .replace(/^[\[\s]*(Título|Title)?\s*:?\s*/i, '') // Remove "[ Título:"
                .replace(/[\]]*$/, '') // Remove "]" final
                .replace(/[*"]/g, '') // Remove * e "
                .trim();
            return `title: "${cleanTitle}"`;
        });

        // Remove excesso de quebras de linha
        content = content.replace(/\n{3,}/g, '\n\n');

        // RECONSTRUÇÃO DE METADADOS (Se faltar Title/Desc)
        if (!content.match(/^title:/m)) {
            // Gera título baseado no nome do arquivo (ex: "como-falar.md" -> "Como Falar")
            const derivedTitle = file.replace('.md', '')
                .split('-')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

            // Adiciona title logo após o primeiro "---"
            content = content.replace(/^---\s*\n/m, `---\ntitle: "${derivedTitle}"\ndescription: "Saiba tudo sobre ${derivedTitle} com a Metodologia Lexis."\n`);
        } else {
            // Se JÁ TEM título, verifica se é o genérico "O Problema Real"
            content = content.replace(/^title:\s*"(.*)"/m, (match, currentTitle) => {
                let cleanTitle = currentTitle
                    .replace(/^[\[\s]*(Título|Title)?\s*:?\s*/i, '')
                    .replace(/[\]]*$/, '')
                    .replace(/[*"]/g, '')
                    .trim();

                // DETECTOR DE TÍTULO TÓXICO
                if (cleanTitle === "O Problema Real" || cleanTitle === "A Neurociência Explica") {
                    console.log(`⚠️ Título Genérico Detectado em ${file}. Substituindo...`);
                    cleanTitle = file.replace('.md', '')
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                }

                return `title: "${cleanTitle}"`;
            });
        }

        // NOVO: Detector de Descrição Tóxica
        if (content.match(/description:\s*"(Post legado resgatado\.?|.*descrição curta.*)"/i)) {
            console.log(`⚠️ Descrição Genérica/Tóxica em ${file}. Substituindo...`);
            const derivedTitle = file.replace('.md', '')
                .split('-')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

            content = content.replace(/^description:.*$/m, `description: "Explore o universo de ${derivedTitle} e como dominar esse contexto em inglês com a Lexis Academy."`);
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Processado: ${file}`);
    });
} else {
    console.error("Diretório de posts não encontrado!");
}
