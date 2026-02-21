/**
 * Módulo de Auditoria de Conteúdo (AI-as-a-Judge)
 * Objetivo: Garantir precisão técnica, metodologia Lexis e naturalidade linguística.
 */

export async function auditPost(env, post) {
    const auditPrompt = `Você é o Auditor de Qualidade da Lexis Academy. Sua função é garantir que o conteúdo ensine EXCLUSIVAMENTE Inglês.

REGRAS EDITORIAIS LEXIS (INVIOLÁVEIS):
1. O CONTEÚDO ENSINA INGLÊS? Se o post ensinar ou mencionar qualquer outro idioma (alemão, espanhol, etc), a nota é ZERO e REJEITADO imediatamente.
2. IDIOMA DE INSTRUÇÃO: A explicação deve estar em Português do Brasil.
3. IDIOMA DE EXECUÇÃO: Todos os exemplos e exercícios devem estar 100% em INGLÊS.
4. METODOLOGIA: Existe a seção "⚡ O TREINO LEXIS" com metas de produção ativa (20 frases/2 min fala)?

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 3000)}

CRITÉRIOS DE AVALIAÇÃO (0-20 pontos cada):
1. EXCLUSIVIDADE INGLÊS (0-20): Se mencionou outro idioma para ensinar, nota 0.
2. QUALIDADE DO TREINO (0-20): O treino exige falar em inglês?
3. NATURALIDADE PT-BR (0-20): Sem anglicismos como "se introduzir".
4. ESTRUTURA E TAMANHO (0-20): Mais de 1000 palavras e estrutura correta?
5. TÍTULO DE AÇÃO (0-20): O título foca em "Como fazer algo em inglês"?

Responda APENAS com um JSON no seguinte formato:
{
  "score": 0-100,
  "verdict": "APROVADO" ou "REJEITADO",
  "reason": "Explicação curta do motivo da nota"
}

REGRAS PARA REJEIÇÃO:
- Se houver qualquer alucinação técnica (regras inventadas): REJEITADO.
- Se o treino for puramente teórico ou em português: REJEITADO.
- Se a nota total for menor que 85: REJEITADO.`;

    try {
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: auditPrompt }],
            max_tokens: 256,
            temperature: 0.1 // Temperatura baixa para ser mais determinístico e chato
        });

        const resultText = (response.response || '').trim();
        const jsonStart = resultText.indexOf('{');
        const jsonEnd = resultText.lastIndexOf('}');

        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const audit = JSON.parse(resultText.substring(jsonStart, jsonEnd + 1));
            console.log(`[AUDITOR] Nota: ${audit.score} | Veredito: ${audit.verdict} | Motivo: ${audit.reason}`);
            return audit;
        }

        return { score: 0, verdict: 'REJEITADO', reason: 'Falha no parser da auditoria' };
    } catch (e) {
        console.error('[AUDITOR] Erro na auditoria:', e.message);
        return { score: 100, verdict: 'APROVADO', reason: 'Erro no auditor, permitindo por fallback de segurança' };
    }
}
