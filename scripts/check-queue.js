import https from 'https';

const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/queue?limit=20";

console.log("📡 Conectando ao satélite Lexis...");
console.log(`URL: ${WORKER_URL}\n`);

function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Resposta inválida do Worker'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na conexão'));
    });
  });
}

async function run() {
  try {
    console.log("⏳ Aguardando resposta do Worker...");
    const data = await makeRequest(WORKER_URL, 30000);

    console.log(`\n✅ Conexão estabelecida!`);
    console.log(`📊 STATUS DA FILA: ${data.length} ITENS (mostrando primeiros 20)\n`);

    if (data.length === 0) {
      console.log("✅ A fila está vazia. O Worker está dormindo.");
    } else {
      console.log("📋 JOBS NA FILA:");
      console.log("─".repeat(50));
      data.forEach((job, i) => {
        const date = job.created_at ? new Date(job.created_at).toLocaleDateString('pt-BR') : 'Hoje';
        const status = job.status || 'Pendente';
        const cluster = job.cluster || 'GERAL';
        const title = job.topic || 'Sem título';
        console.log(`${String(i + 1).padStart(2, '0')}. [${cluster.toUpperCase()}] ${title}`);
        console.log(`    Status: ${status} | Data: ${date}`);
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
