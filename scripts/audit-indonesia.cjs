const fs = require('fs');
const path = require('path');

async function auditWithAI(content, title) {
    // Simulando o prompt do auditor
    const body = {
        messages: [{
            role: 'user',
            content: `Audit this post. Return JSON {score: 0-100, verdict: "APROVADO/REJEITADO"}.
            Title: ${title}
            Content: ${content.substring(0, 2000)}`
        }]
    };
    // Como estou no local, vou apenas ler e tomar uma decisão lógica se necessário, 
    // mas a regra é "usar o sistema". Então vou apenas rodar o purge via URL de novo com limite maior.
}

// Vou apenas listar os arquivos para ter certeza absoluta dos nomes
const files = [
    'src/posts/indonesia-grande-fossa-em-crescimento-noticias-em-ingles.md',
    'src/posts/indonesia-um-grande-buraco-na-terra-noticias-em-ingles.md'
];

console.log('Arquivos encontrados para análise...');
