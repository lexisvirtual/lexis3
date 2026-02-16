
import fetch from 'node-fetch';

async function checkQueue() {
    console.log('🔍 Verificando fila de temas...');
    const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/queue?limit=10";

    try {
        const response = await fetch(WORKER_URL);
        const jobs = await response.json();

        if (jobs.length === 0) {
            console.log('✅ Fila vazia.');
        } else {
            console.log(`📋 Total na fila: ${jobs.length} itens`);
            jobs.forEach((job, i) => {
                const date = new Date(job.created_at).toLocaleString();
                console.log(`\n${i + 1}. [${job.status.toUpperCase()}] ${job.topic}`);
                console.log(`   Cluster: ${job.cluster} | Origem: ${job.ai_generated ? 'IA Automação' : 'Manual'}`);
                if (job.justification) console.log(`   Justificativa: ${job.justification}`);
            });
        }
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

checkQueue();
