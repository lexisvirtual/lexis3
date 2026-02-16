
import fetch from 'node-fetch';

async function purgeAndRepopulate() {
    console.log('🗑️  Esvaziando fila manual...');
    const WORKER_BASE = "https://lexis-publisher.lexis-english-account.workers.dev";

    // 1. Limpar fila (Rota /purge)
    try {
        const purgeRes = await fetch(`${WORKER_BASE}/purge`);
        const purgeText = await purgeRes.text();
        console.log(`✅ Status Limpeza: ${purgeText}`);
    } catch (error) {
        console.error('❌ Erro na limpeza:', error.message);
        return;
    }

    console.log('\n🤖 Solicitando novos temas para a IA...');
    // 2. Gerar novos temas via IA (Rota /ai-plan)
    try {
        const aiRes = await fetch(`${WORKER_BASE}/ai-plan`);
        const aiResult = await aiRes.json();

        if (aiResult.success) {
            console.log('\n✅ SUCESSO! Novos temas gerados pela IA e enfileirados:\n');
            if (aiResult.new_jobs && aiResult.new_jobs.length > 0) {
                aiResult.new_jobs.forEach((job, i) => {
                    console.log(`📌 TEMA ${i + 1}: ${job.topic}`);
                    console.log(`   Cluster: ${job.cluster}`);
                    console.log('-----------------------------------');
                });
            } else {
                console.log("⚠️ Nenhum job retornado no array new_jobs.");
            }

        } else {
            console.error('\n❌ Erro na geração de temas:', aiResult.error);
        }
    } catch (error) {
        console.error('❌ Erro na requisição IA:', error.message);
    }
}

purgeAndRepopulate();
