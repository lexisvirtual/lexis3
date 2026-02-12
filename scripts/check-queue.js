const WORKER_URL = "https://lexis-publisher.lexisvirtual.workers.dev/queue";

console.log("📡 Conectando ao satélite Lexis...");

async function run() {
  try {
    const res = await fetch(WORKER_URL);
    const data = await res.json();

    console.log(`\n📊 STATUS DA FILA: ${data.length} ITENS\n`);

    if (data.length === 0) {
      console.log("✅ A fila está vazia. O Worker está dormindo.");
    } else {
      data.forEach((job, i) => {
        const date = job.created_at ? new Date(job.created_at).toLocaleDateString('pt-BR') : 'Hoje';
        console.log(`${String(i + 1).padStart(2, '0')}. [${job.cluster || 'GERAL').toUpperCase()}] ${job.status || 'Pendente'}\n`);
      });
    }
  } catch (e) {
    console.error("❌ Erro ao conectar:", e.message);
  }
}

run();
