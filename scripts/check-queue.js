const WORKER_URL = "https://lexis-publisher.lexisvirtual.workers.dev/queue";

console.log("📡 Conectando ao satélite Lexis...");
console.log(`URL: ${WORKER_URL}\n`);

// Função com timeout
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
    
    console.log(`Status HTTP: ${res.status}`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log(`\n✅ Conexão estabelecida!`);
    console.log(`📊 STATUS DA FILA: ${data.length} ITENS\n`);

    if (data.length === 0) {
      console.log("✅ A fila está vazia. O Worker está dormindo.");
    } else {
      console.log("📋 JOBS NA FILA:");
      console.log("─".repeat(50));
      data.forEach((job, i) => {
        const date = job.created_at ? new Date(job.created_at).toLocaleDateString('pt-BR') : 'Hoje';
        const status = job.status || 'Pendente';
        const cluster = job.cluster || 'GERAL';
        console.log(`${String(i + 1).padStart(2, '0')}. [${cluster.toUpperCase()}] ${status} - ${date}`);
      });
      console.log("─".repeat(50));
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
