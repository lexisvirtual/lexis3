const WORKER_URL = process.env.WORKER_URL || "https://lexis-publisher.lexis-english-account.workers.dev/queue";

console.log("📡 Conectando ao satélite Lexis...");
console.log(`   URL: ${WORKER_URL}\n`);

function fetchWithTimeout(url, timeout = 10000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout na conexão')), timeout)
        )
    ]);
}

async function run() {
    try {
        console.log("⏳ Aguardando resposta do Worker...");
        const res = await fetchWithTimeout(WORKER_URL, 10000);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log(`\n📦 STATUS DA FILA: ${data.length} ITENS\n`);

        if (data.length === 0) {
            console.log("🍃 A fila está vazia. O Worker está dormindo.");
        } else {
            data.forEach((job, i) => {
                console.log(`${String(i + 1).padStart(2, '0')}. [${(job.cluster || 'GERAL').toUpperCase()}] ${job.topic}`);
                console.log(`    └─ Intenção: ${job.intent || 'N/A'} | Status: ${job.status || 'Pendente'}\n`);
            });
        }
    } catch (e) {
        console.error("\n❌ Erro ao conectar:", e.message);
        console.error("\n⚠️  DIAGNÓSTICO:");
        console.error("   1. URL do Worker:");
        console.error(`      ${WORKER_URL}`);
        console.error("\n   2. Para usar uma URL diferente, execute:");
        console.error("      set WORKER_URL=https://seu-worker.workers.dev/queue");
        console.error("      node scripts/check-queue.js");
        console.error("\n   3. Verifique se o Worker está ativo no Cloudflare Dashboard");
        process.exit(1);
    }
  } catch (e) {
    console.error("\n❌ ERRO AO CONECTAR:");
    console.error(`   Mensagem: ${e.message}`);
    console.error(`   URL: ${WORKER_URL}`);
    console.error("\n💡 Possíveis soluções:");
    console.error("   1. Verifique sua conexão com a internet");
    console.error("   2. Verifique se o Worker está ativo no Cloudflare");
    console.error("   3. Tente novamente em alguns segundos");
    process.exit(1);
  }
}

run();
