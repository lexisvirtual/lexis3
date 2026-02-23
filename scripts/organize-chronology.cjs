const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'src', 'posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Organizando ${files.length} posts...`);

// Ordenar alfabeticamente ou manter a ordem original
// Aqui vamos apenas dar datas sequenciais retroativas
let currentDate = new Date(); // Começa hoje

files.forEach((file, index) => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Gerar data YYYY-MM-DD
    const dateStr = currentDate.toISOString().split('T')[0];

    // Substituir a data no frontmatter
    content = content.replace(/date: ".*"/, `date: "${dateStr}"`);
    content = content.replace(/date: .*/, `date: "${dateStr}"`); // Fallback sem aspas

    fs.writeFileSync(filePath, content);
    console.log(`[DATE UPGRADE] ${file} -> ${dateStr}`);

    // Decrementar 1 dia para o próximo (para os mais antigos ficarem embaixo)
    currentDate.setDate(currentDate.getDate() - 1);
});

console.log('Organização concluída!');
