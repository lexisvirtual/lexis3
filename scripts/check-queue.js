
const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/pauta";

console.log("📡 Conectando ao satélite Lexis (V8.0 IPL Engine)...");

async function run() {
    try {
        const res = await fetch(WORKER_URL);
        const data = await res.json();

        console.log(`\n📦 STATUS DO SISTEMA LEXIS:`);
        console.log(`   Versão: ${data.status.v}`);
        console.log(`   Motor: ${data.status.engine}`);
        console.log(`   Posts publicados (Total): ${data.status.blog.total_posts}`);
        console.log(`   Qualidade (EMA): ${data.status.blog.quality_ema}pts\n`);

        console.log(`📥 ESTOQUE (STOCKPILE): ${data.stockpile.length} posts prontos`);
        data.stockpile.forEach((post, i) => {
            console.log(`   ${i + 1}. [${post.score}pts] ${post.title}`);
        });

        console.log(`\n🔄 TRIAGEM: ${data.triaged.length} itens aguardando refinamento`);
        data.triaged.slice(0, 5).forEach((item, i) => {
            console.log(`   - ${item.title} (${item.source})`);
        });

        if (data.status.lock.is_busy) {
            console.log(`\n⚠️ SISTEMA OCUPADO: ${data.status.lock.owner} (expira às ${data.status.lock.expires})`);
        }

    } catch (e) {
        console.error("❌ Erro ao conectar:", e.message);
    }
}

run();
