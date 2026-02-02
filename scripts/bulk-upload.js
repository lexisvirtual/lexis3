
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURAÇÃO
const WORKER_URL = "https://lexis-publisher.lexis-english-account.workers.dev/add-topic";
const CSV_FILE = "../pautas.csv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, CSV_FILE);

async function uploadLine(line, index) {
    const parts = line.split(';'); // Separador ponto-e-vírgula (para não quebrar com vírgulas do texto)
    if (parts.length < 2) return; // Ignora linhas vazias

    const [topic, cluster, intent] = parts.map(s => s.trim());
    if (topic === 'topic') return; // Pula cabeçalho

    const payload = {
        topic,
        cluster: cluster || 'geral',
        intent: intent || 'informacional',
        priority: 5
    };

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`✅ [${index}] Enviado: "${topic}"`);
        } else {
            console.error(`❌ [${index}] Falha: ${response.statusText}`);
        }
    } catch (e) {
        console.error(`❌ [${index}] Erro de Rede: ${e.message}`);
    }
}

async function main() {
    if (!fs.existsSync(csvPath)) {
        console.error("Arquivo pautas.csv não encontrado na raiz!");
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    console.log(`🚀 Iniciando Upload de ${lines.length - 1} pautas...`);

    // Envia em série para não engasgar o worker
    for (let i = 0; i < lines.length; i++) {
        await uploadLine(lines[i], i);
        // Pequena pausa para ser gentil com a API
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("🏁 Carga em Lote Finalizada!");
}

main();
