
import fetch from 'node-fetch';

async function testAIThemes() {
    console.log('🤖 Testando seleção de temas por IA...');
    console.log('⏳ Aguarde, isso pode levar alguns segundos (análise + geração)...');

    // URL do worker
    const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/ai-plan";

    try {
        const response = await fetch(WORKER_URL);
        const result = await response.json();

        if (result.success) {
            console.log('\n✅ SUCESSO! Temas gerados e adicionados à fila:\n');

            result.new_jobs.forEach((job, i) => {
                console.log(`📌 TEMA ${i + 1}: ${job.topic}`);
                console.log(`   Cluster: ${job.cluster}`);
                console.log(`   Justificativa: ${job.justification}`);
                console.log('-----------------------------------');
            });

            console.log('\n📊 Dados da Análise:');
            console.log(`- Total de posts analisados: ${result.analysis.totalPosts}`);
            console.log(`- Gaps identificados: ${result.analysis.gaps.join(', ')}`);

        } else {
            console.error('\n❌ Erro na resposta:', result.error || result);
            console.log('Detalhes:', JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('\n❌ Erro de conexão:', error.message);
    }
}

testAIThemes();
