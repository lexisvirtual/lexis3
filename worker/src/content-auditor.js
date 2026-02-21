/**
 * Módulo de Auditoria de Conteúdo (AI-as-a-Judge)
 * Objetivo: Garantir precisão técnica, metodologia Lexis e naturalidade linguística.
 */

export async function auditPost(env, post) {
    const auditPrompt = `Você é o Auditor de Qualidade Técnica da Lexis Academy. Sua função é ser extremamente rigoroso e crítico com o conteúdo abaixo.

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 3000)}

CRITÉRIOS DE AVALIAÇÃO (0-20 pontos cada):
1. PRECISÃO TÉCNICA (0-20): O conteúdo ensina inglês real e correto? Inventou regras ou acentos inexistentes? (Se inventar algo, a nota é 0).
2. METODOLOGIA LEXIS (0-20): A seção "⚡ O TREINO LEXIS" exige produção ativa? Tem a meta de 20 frases e 2 minutos de fala?
3. NATURALIDADE (0-20): O português do Brasil está natural e sem anglicismos? Usou "se apresentar" em vez de "se introduzir"?
4. ESTRUTURA (0-20): Possui Introdução, Seções ##, Treino Lexis, FAQ e Conclusão? Tem mais de 1000 palavras?
5. VALOR PRÁTICO (0-20): O leitor sai do artigo sabendo EXECUTAR algo novo no idioma ou apenas recebeu informação passiva?

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
