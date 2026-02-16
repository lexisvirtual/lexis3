
// Script para resetar a fila e repopular via IA usando fetch nativo

async function resetQueue() {
    console.log('🗑️  Esvaziando fila manual...');
    const BASE_URL = "https://lexis-publisher.lexis-english-account.workers.dev";

    // 1. Limpar
    try {
        const purgeRes = await fetch(`${BASE_URL}/purge`);
        console.log(`✅ Status Limpeza: ${await purgeRes.text()}`);
    } catch (e) {
        console.error('❌ Erro Purge:', e.message);
    }

    // 2. Repopular
    console.log('\n🤖 Solicitando novos temas para a IA...');
    try {
        const aiRes = await fetch(`${BASE_URL}/ai-plan`);
        const aiData = await aiRes.json();

        if (aiData.success && aiData.new_jobs) {
            console.log('\n✅ SUCESSO! Novos temas gerados:\n');
            aiData.new_jobs.forEach((job, i) => {
                console.log(`${i + 1}. [${job.cluster.toUpperCase()}] ${job.topic}`);
                console.log(`   Justificativa: ${job.justification}\n`);
            });
        } else {
            console.error('❌ Falha na IA:', aiData);
        }
    } catch (e) {
        console.error('❌ Erro IA:', e.message);
    }
}

resetQueue();
