
const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/auto-publish";

console.log("⚙️  Disparando Gatilho de Publicação Lexis...");
console.log("⏳ Aguarde... O sistema está verificando o estoque ou gerando novo conteúdo...");

async function run() {
    try {
        const res = await fetch(WORKER_URL);
        const data = await res.json();

        if (data.success) {
            console.log(`\n✅ SUCESSO! ${data.message}`);
            if (data.result && data.result.posts && data.result.posts.length > 0) {
                const post = data.result.posts[0];
                console.log(`📰 Título: ${post.title}`);
                console.log(`🔗 Link:   https://lexis.academy/blog/${post.slug}`);
            }
            console.log("\n(O site será atualizado em aprox. 2-5 minutos via GitHub Actions)");
        } else {
            console.error("\n❌ FALHA NO PROCESSAMENTO:");
            console.error(`Erro: ${data.message}`);
            if (data.errors) console.error(`Detalhes: ${JSON.stringify(data.errors)}`);
        }

    } catch (e) {
        console.error("❌ Erro de conexão:", e.message);
    }
}

run();
