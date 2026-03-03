import { callOpenAI } from './multi-model.js';

export async function auditPost(env, post) {
    const auditPrompt = `Você é o Auditor de Elite da Lexis Academy (Roger 3.0). Sua missão mudou: você não avalia apenas estilo, você mede o IPL (Indicador de Performance Linguística).

🚨 O QUE É IPL? É a medida de quanto um Workshop aumenta a capacidade do aluno de formular respostas executivas de alto impacto sob pressão.

🚨 REGRAS DE OURO LEXIS (INVIOLÁVEIS):
1. TÍTULOS EM PORTUGUÊS: Todos os títulos (H1, H2, H3) DEVEM estar em PT.
2. DNA DE TREINO (30/70): Proporção: 30% PT (Instrução) e 70% EN (Músculo/Prática).
3. COERÊNCIA DE INTEGRAÇÃO (NOVA): Toda expressão C1 apresentada no Nível 1 DEVE aparecer aplicada no Nível 2 (Cenário) ou Nível 3 (Roleplay). Se não houver integração real -> -20 pontos automáticos na densidade.

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 4500)}

🚨 SEU PROCESSO DE AUDITORIA ANTES DE DAR A NOTA:
Responda mentalmente (e reflita no "reason"):
1. O aluno consegue usar isso amanhã em uma boardroom real?
2. Existe pressão real no cenário ou é artificial/escolar?
3. As expressões C1 estão integradas na narrativa ou são apenas uma lista?
4. O drill (Plano 7 dias) gera repetição estruturada ou é genérico?
5. Existe Hedging estratégico e linguagem diplomática sob tensão?

CRITÉRIOS DE AVALIAÇÃO IPL (0-20 pontos cada):
1. RELEVÂNCIA E DNA (0-20): É workshop de treino ou informativo?
2. INTEGRAÇÃO LEXICAL (0-20): As expressões do Nível 1 são usadas nos desafios?
3. TENSÃO CORPORATIVA (0-20): O cenário de Nível 2 é plausível e desafiador?
4. DENSIDADE C1 REAL (0-20): Uso de expressões de elite em contexto de boardroom.
5. OTIMIZAÇÃO E ESTRUTURA (0-20): Títulos em PT e Resposta Rápida técnica.

🚨 FORMATO DE SAÍDA (JSON PURO):
{
  "score": 0-100,
  "verdict": "APROVADO" ou "REJEITADO",
  "reason": "Explicação ácida medindo o IPL. Seja específico sobre a falta de integração ou tensão.",
  "ipl_metrics": {
    "c1_integrated_count": 0-15,
    "tension_score": "baixa/media/alta",
    "drill_validity": "sim/nao"
  },
  "specific_fixes": [
    {
      "section": "Nome da Seção",
      "issue": "Problema no IPL detectado.",
      "english_directive": "Technical command in English for Leo to fix this."
    }
  ],
  "roger_to_leo_english_command": "Consolidated technical command in English."
}

REGRAS PARA REJEIÇÃO IMEDIATA:
- Nota < 65.
- Qualquer título em inglês (H2, H3).
- Falta de integração de pelo menos 5 expressões C1 nos cenários.
- Inglês funcional < 50%.`;

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
