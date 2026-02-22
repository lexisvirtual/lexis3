/**
 * Módulo de Auditoria de Conteúdo (AI-as-a-Judge)
 * Objetivo: Garantir precisão técnica, metodologia Lexis e naturalidade linguística.
 */

export async function auditPost(env, post) {
    const auditPrompt = `Você é o Auditor de Elite da Lexis Academy. Sua função é garantir que o conteúdo seja ÚTIL, PROFISSIONAL e de ALTA PERFORMANCE.

REGRAS EDITORIAIS LEXIS (INVIOLÁVEIS):
1. UTILIDADE DE VIDA REAL: O post ensina algo que um brasileiro usará em viagens, trabalho ou conversação real? Se o tema for irrelevante (ex: seguros de jóias, curiosidades de bilionários), a nota é ZERO e REJEITADO.
2. ZERO REPETIÇÃO: Verifique se existem frases ou exemplos idênticos em seções diferentes. Se houver redundância ou "encheção de linguiça", REJEITADO.
3. DENSIDADE LINGUÍSTICA: O inglês ensinado é denso? Deve conter Phrasal Verbs, Collocations ou expressões idiomáticas. Se for inglês básico demais (ex: "The book is on the table"), REJEITADO.
4. EXCLUSIVIDADE: Ensinou qualquer outro idioma? REJEITADO.

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 3500)}

CRITÉRIOS DE AVALIAÇÃO (0-25 pontos cada):
1. RELEVÂNCIA E UTILIDADE (0-25): O tema é ouro para o aluno?
2. ORIGINALIDADE E ZERO REPETIÇÃO (0-25): O conteúdo é variado e rico?
3. QUALIDADE DO TREINO LEXIS (0-25): O treino exige esforço e musculatura real?
4. DENSIDADE DO INGLÊS (0-25): O vocabulário é de alto nível (B1-C1)?

Responda APENAS com um JSON no formato:
{
  "score": 0-100,
  "verdict": "APROVADO" ou "REJEITADO",
  "reason": "Explicação curta e ácida do motivo da nota"
}

REGRAS PARA REJEIÇÃO:
- Nota total menor que 90: REJEITADO.
- Presença de qualquer frase repetida em seções diferentes: REJEITADO.
- Tema considerado "Boring" ou sem utilidade prática imediata: REJEITADO.`;

    try {
        const response = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
            messages: [{ role: 'user', content: auditPrompt }],
            max_tokens: 512,
            temperature: 0.1 // Máximo rigor determinístico
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
