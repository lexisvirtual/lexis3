import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executa um script e retorna uma Promise
 */
function runScript(scriptPath, scriptName) {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 Executando: ${scriptName}`);
        console.log(`${'='.repeat(60)}\n`);

        const process = spawn('node', [scriptPath], {
            stdio: 'inherit',
            shell: true
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ ${scriptName} concluído com sucesso!\n`);
                resolve();
            } else {
                console.log(`\n⚠️  ${scriptName} finalizou com código ${code}\n`);
                resolve(); // Continua mesmo com erro
            }
        });

        process.on('error', (error) => {
            console.error(`\n❌ Erro ao executar ${scriptName}: ${error.message}\n`);
            resolve(); // Continua mesmo com erro
        });
    });
}

/**
 * Executa todos os scripts de publicação em sequência
 */
async function publishToAll() {
    console.log('\n🌐 PUBLICAÇÃO EM MÚLTIPLAS PLATAFORMAS');
    console.log('='.repeat(60));
    console.log('Este script vai publicar seus posts no Medium e LinkedIn');
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
        // Publicar no Medium
        await runScript(
            path.join(__dirname, 'publish-to-medium.js'),
            'Medium'
        );

        // Aguardar um pouco entre plataformas
        console.log('⏳ Aguardando 5 segundos antes da próxima plataforma...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Publicar no LinkedIn
        await runScript(
            path.join(__dirname, 'publish-to-linkedin.js'),
            'LinkedIn'
        );

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 PUBLICAÇÃO CONCLUÍDA!');
        console.log('='.repeat(60));
        console.log(`⏱️  Tempo total: ${duration}s`);
        console.log('✅ Verifique os logs acima para detalhes de cada plataforma');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error(`\n❌ Erro durante a publicação: ${error.message}\n`);
        process.exit(1);
    }
}

// Executar
publishToAll();
