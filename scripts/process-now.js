
const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/process-queue";

console.log("⚙️  Ligando as máquinas da Lexis...");
console.log("⏳ Aguarde... A IA está escrevendo um novo artigo (pode levar 30-45s)...");

async function run() {
    try {
        const res = await fetch(WORKER_URL);
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.success) {
                console.log("\n✅ SUCESSO! Artigo Publicado.");
                console.log(`📰 Título: ${data.title}`);
                console.log(`🔗 Link:   https://lexis.academy/blog/${data.slug}`);
                console.log(`💻 GitHub: ${data.url}`);
                console.log("\n(O site estará no ar em aprox. 2 minutos)");
            } else {
                console.error("\n❌ FALHA NO PROCESSAMENTO:");
                console.error(`Erro: ${data.error || JSON.stringify(data)}`);
                if (data.reason) console.error(`Motivo: ${data.reason}`);
            }
        } else {
            const text = await res.text();
            console.log(`\nℹ️  INFORMAÇÃO: ${text}`);
        }

    } catch (e) {
        console.error("❌ Erro de conexão:", e.message);
    }
}

run();
