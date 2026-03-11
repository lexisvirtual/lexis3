import { callOpenAI } from './multi-model.js';

export async function auditPost(env, post) {
  const auditPrompt = `Você é o Auditor de Elite da Lexis Academy (Roger 3.5). Sua missão é medir o IPL (Indicador de Performance Linguística) com foco em Bilinguismo Funcional e Ancoragem Lexical.

🚨 O QUE É IPL? É a medida de quanto um Workshop aumenta a capacidade do aluno de formular respostas executivas de alto impacto sob pressão.

🚨 REGRAS DE OURO LEXIS (VERSÃO 3.6 - CLEAN SEO):
1. ESTRUTURA SEM H1 INTERNO (OK): O Leo NÃO deve escrever o título # (H1), pois o site já o gera. O texto deve começar em ## (H2).
2. TÍTULOS HÍBRIDOS (H2/H3): Devem seguir o formato \"Título PT | Authority Hook EN\".
3. DNA DE TREINO (40/60): Alvo pedagógico: 40% PT (Instrução) e 60% EN (Músculo/Prática). 
4. ANCORAGEM LEXICAL (NEGRITO): Verifique se o Leo colocou em **negrito** os termos do Nível 1 quando usados na prática. Se não houver negrito -> -15 pontos.
5. INTEGRAÇÃO REAL: Toda expressão C1 apresentada no Nível 1 DEVE aparecer aplicada no Nível 2 ou 3. Se não houver integração real -> -20 pontos.
6. SEO & AUTORIDADE: Verifique se há 1 link externo no início (referência) e 1-2 links internos no final. Se faltar link -> -10 pontos.

ARTIGO PARA AUDITORIA:
Título: ${post.title}
Conteúdo: ${post.content.substring(0, 4500)}

🚨 SEU PROCESSO DE AUDITORIA:
1. Verifique a TENSÃO: O cenário é corporativo real (boardroom, crise, negociação) ou escolar? (Dê nota alta para tensão realista).
2. Verifique o BILINGUISMO: Há resumos em inglês na Resposta Rápida e no FAQ?
3. Verifique a ANCORAGEM: Os termos estão destacados em negrito no meio do texto?
4. Verifique os LINKS: Há links para fontes externas e páginas internas da Lexis?

CRITÉRIOS DE AVALIAÇÃO IPL (0-20 pontos cada):
1. RELEVÂNCIA E DNA (0-20): É workshop de treino? Segue a proporção 60/40?
2. INTEGRAÇÃO & ANCORAGEM (0-20): Termos vinculados e negritados corretamente?
3. TENSÃO CORPORATIVA (0-20): Cenário de pressão executiva plausível?
4. DENSIDADE C1 REAL (0-20): Uso de expressões de elite em contexto.
5. OTIMIZAÇÃO BILINGUE (0-20): Títulos híbridos e bilinguismo na Resposta Rápida/FAQ.

🚨 FORMATO DE SAÍDA (JSON PURO):
{
  "score": 0-100,
  "verdict": "APROVADO" ou "REJEITADO",
  "reason": "Explicação ácida medindo o IPL. Seja específico sobre a falta de integração, negrito (ancoragem) ou tensão.",
  "ipl_metrics": {
    "c1_integrated_count": 0-15,
    "tension_score": "baixa/media/alta",
    "anchoring_validity": "sim/nao"
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
- Falta de integração de pelo menos 5 expressões C1 nos cenários.
- Inglês funcional < 45% (Piso de segurança).`;

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
