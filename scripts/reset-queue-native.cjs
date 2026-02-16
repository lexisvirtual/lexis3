
if (!global.fetch) {
    console.error("Este script requer Node.js 18+");
    process.exit(1);
}

const BASE_URL = "https://lexis-publisher.lexis-english-account.workers.dev";

async function run() {
    console.log('🗑️  Esvaziando fila manual...');
    try {
        const r = await fetch(BASE_URL + '/purge');
        console.log('✅ Purge:', await r.text());
    } catch (e) {
        console.error('❌ Falha Purge:', e.message);
    }

    console.log('\n🤖 Solicitando IA...');
    try {
        const r = await fetch(BASE_URL + '/ai-plan');
        const data = await r.json();

        if (data.success && data.new_jobs) {
            console.log('✅ Novos Temas:');
            data.new_jobs.forEach((j, i) => {
                console.log(`${i + 1}. [${j.cluster}] ${j.topic}`);
            });
        } else {
            console.error('❌ IA Falhou:', data);
        }
    } catch (e) {
        console.error('❌ Erro IA:', e.message);
    }
}

run();
