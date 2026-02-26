import { callOpenAI } from './multi-model.js';

export async function auditPost(env, post) {
    const auditPrompt = `Você é o Auditor de Elite da Lexis Academy. Sua função é garantir que o conteúdo seja ÚTIL, PROFISSIONAL e de ALTA PERFORMANCE.

REGRAS EDITORIAIS LEXIS (INVIOLÁVEIS):
1. UTILIDADE PRÁTICA: O tema é ouro para o aluno? Ensina algo que um profissional usará em reuniões, viagens ou networking?
2. ZERO REPETIÇÃO: Proibido usar frases ou exemplos idênticos em seções diferentes. Se uma frase apareceu no Vocabulário, não pode aparecer no Treino 3F. Cada seção deve ser inédita.
3. DENSIDADE LINGUÍSTICA C1: O inglês ensinado deve conter Phrasal Verbs, Collocations ou expressões idiomáticas. Se for inglês de nível "básico/infantil", REJEITADO.
4. ESTRUTURA METODOLÓGICA: O post deve conter obrigatoriamente "## Quick Answer", "## 3F Training Engine" e "## AI Summary".
5. TOM DE VOZ: O texto deve ser autoritário, elegante e mentorar o aluno.

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 4000)}

CRITÉRIOS DE AVALIAÇÃO (0-20 pontos cada):
1. RELEVÂNCIA E UTILIDADE (0-20): O tema é aplicável ao mundo real?
2. ORIGINALIDADE E ZERO REPETIÇÃO (0-20): O conteúdo é variado? (Dê 0 se houver frases repetidas).
3. QUALIDADE DO TREINO LEXIS (0-20): O treino exige esforço e musculatura real?
4. DENSIDADE DO INGLÊS (0-20): O vocabulário é de alto nível?
5. OTIMIZAÇÃO IA/LEO (0-20): A Quick Answer está clara e técnica?

Responda APENAS com um JSON puro no formato:
{
  "score": 0-100,
  "verdict": "APROVADO" ou "REJEITADO",
  "reason": "Explicação curta e ácida do motivo da aprovação ou rejeição"
}

REGRAS PARA REJEIÇÃO IMEDIATA:
- Nota total menor que 80.
- Presença de qualquer frase repetida entre seções.
- Tema considerado "Boring" ou sem utilidade comercial/executiva imediata.`;

    try {
        let resultText;
        if (env.OPENAI_API_KEY) {
            console.log(`[AUDITOR] 🔎 Auditoria de Elite: ${post.title}`);
            resultText = await callOpenAI(env, auditPrompt, "Você é o Auditor Chefe da Lexis Academy. Seja implacável.");
        } else {
            const response = await env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
                messages: [{ role: 'user', content: auditPrompt }],
                max_tokens: 512,
                temperature: 0.1
            });
            resultText = response.response || response;
        }

        resultText = (resultText || '').trim();
        const jsonStart = resultText.indexOf('{');
        const jsonEnd = resultText.lastIndexOf('}');

        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const audit = JSON.parse(resultText.substring(jsonStart, jsonEnd + 1));
            console.log(`[AUDITOR] Nota: ${audit.score} | Veredito: ${audit.verdict} | ${audit.reason}`);
            return audit;
        }

        return { score: 0, verdict: 'REJEITADO', reason: 'Falha no parser do Roger' };
    } catch (e) {
        console.error('[AUDITOR] Erro:', e.message);
        return { score: 50, verdict: 'REJEITADO', reason: 'Erro na conexão de auditoria' };
    }
}
