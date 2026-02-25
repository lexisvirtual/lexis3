/**
 * Leo Sync Module
 * Objetivo: Sincronizar ordens de comando vindas do Hub Central (Google Sheets).
 */

export async function fetchCommands(env) {
    const sheetUrl = env.GOOGLE_SHEETS_COMMAND_URL || "https://script.google.com/macros/s/AKfycbz-96tMxLYXAP2TrMpZFcAur8Ge8qauTSlxflpqa258CJUOGwWeuK_esiI3rnGR4yo/exec";

    console.log(`[LEO-SYNC] Buscando em: ${sheetUrl}`);

    try {
        let response = await fetch(sheetUrl, {
            method: 'GET',
            redirect: 'follow'
        });

        const rawText = await response.text();
        console.log(`[LEO-SYNC] Status: ${response.status}, Tipo: ${response.headers.get('content-type')}`);

        if (!rawText.trim().startsWith('[') && !rawText.trim().startsWith('{')) {
            console.error(`[LEO-SYNC] Resposta não parece JSON. Início: ${rawText.substring(0, 50)}`);
            return [];
        }

        const data = JSON.parse(rawText);
        return Array.isArray(data) ? data : (data.commands || []);
    } catch (e) {
        console.error("[LEO-SYNC] Erro catastrófico:", e.message);
        return [];
    }
}

export async function processTopCommand(env, commands) {
    if (!commands || commands.length === 0) return null;

    // Filtra apenas comandos pendentes e ordena por prioridade decrescente
    const pending = commands
        .filter(c => c.status === 'PENDING')
        .sort((a, b) => b.priority - a.priority);

    if (pending.length === 0) return null;

    const topCommand = pending[0];
    console.log(`[LEO-SYNC] Comando de alta prioridade encontrado: ${topCommand.action} para ${topCommand.url}`);

    return topCommand;
}
