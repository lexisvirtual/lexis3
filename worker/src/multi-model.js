/**
 * Lexis Multi-Model Layer
 * Aciona modelos externos (GPT-4o, Gemini) para tarefas de elite e supervisão.
 */

export async function callOpenAI(env, prompt, systemPrompt = "Você é o Supervisor de Elite da Lexis Academy.") {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.2
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API Error: ${err}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}

export async function callGemini(env, prompt) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4000 }
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Limpa artefatos de Markdown de um código JSX
 */
export function cleanJSX(text) {
    if (!text) return "";

    // Remove blocos de código markdown (```jsx ... ``` ou ``` ...)
    let clean = text.replace(/```[a-z]*\n/gi, '').replace(/```/g, '');

    // Remove possíveis explicações antes ou depois do código (heurística simples)
    const importIndex = clean.indexOf('import');
    if (importIndex !== -1) {
        clean = clean.substring(importIndex);
    }

    const lastExport = clean.lastIndexOf('export default');
    if (lastExport !== -1) {
        // Tenta achar o fim da declaração (aproximado)
        const endOfLine = clean.indexOf(';', lastExport);
        if (endOfLine !== -1) {
            clean = clean.substring(0, endOfLine + 1);
        }
    }

    return clean.trim();
}

/**
 * Supervisor de Código JSX
 * Garante que a IA não quebrou o React ou deixou Markdown.
 */
export async function superviseJSX(env, originalContent, upgradedContent) {
    const prompt = `Você é um Engenheiro Sênior de Software. Recentemente um modelo Llama-3 atualizou um arquivo React (.jsx) da Lexis Academy. 
  
Sua missão é VALIDAR e CORRIGIR o resultado. 

REGRAS CRÍTICAS:
1. O resultado deve ser CÓDIGO JSX FUNCIONAL. 
2. REMOVA qualquer Markdown (blocos de código \`\`\`, explicações, etc).
3. Garanta que todos os imports e o export default estejam presentes.
4. Mantenha integra a estrutura do Tailwind do arquivo original.

CONTEÚDO ORIGINAL:
${originalContent}

CONTEÚDO ATUALIZADO PELO LLAMA:
${upgradedContent}

Retorne APENAS o código JSX limpo e final. Sem blocos de código, sem explicações.`;

    // Usamos o GPT-4o para essa tarefa crítica de supervisão com instruções específicas para JSX
    const res = await callOpenAI(env, upgradedContent + "\n\nRETORNE APENAS O CONTEÚDO CORRIGIDO. SEM COMENTÁRIOS, SEM EXPLICAÇÕES, SEM 'AQUI ESTÁ O CÓDIGO'.", "Você é o Engenheiro Sênior de Software e Guardião de Código da Lexis Academy.");
    return cleanJSX(res);
}

/**
 * Utilitários de Extração e Limpeza de Conteúdo Blog
 */
export const extractTag = (tag, text) => {
    if (!text) return null;
    const match = text.match(new RegExp(`\\[\\[${tag}\\]\\]:*\\s*([\\s\\S]*?)(?=\\s*\\[\\[|\\s*##|$)`, 'i'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
};

export const cleanFullContent = (text) => {
    if (!text) return "";
    let clean = text;

    // 1. Isolar Frontmatter se existir para protegê-lo da limpeza de chatter
    let frontmatter = "";
    if (clean.trim().startsWith('---')) {
        const secondDashes = clean.indexOf('---', 3);
        if (secondDashes !== -1) {
            frontmatter = clean.substring(0, secondDashes + 3) + "\n\n";
            clean = clean.substring(secondDashes + 3);
        }
    }

    // 2. Remover Teaser/Chatter de IA apenas do CORPO do texto
    // Busca pelo primeiro título Markdown nível 1 (# ) ou nível 2 (## )
    const headingMatch = clean.match(/^#+ /m);
    if (headingMatch) {
        clean = clean.substring(headingMatch.index);
    } else {
        // Fallback: se não houver heading, limpa frases comuns de abertura
        clean = clean.replace(/^(ATIVO DE TREINO DE ELITE|Certo|Aqui está|Aqui está o arquivo|Com certeza|Certamente|Com prazer).*?\n/gi, '');
    }

    // 3. Remover Tags de Metadados e cabeçalhos técnicos residuais
    clean = clean.replace(/##?\s*(SEO DATA|METADADOS|AI DATA|DADOS SEO).*/gi, '');
    clean = clean.replace(/\*?\*?\[\[(DESCRIPTION|AI_SNIPPET|AI_CONTEXT)\]\]\*?\*?[:\s]*.*/gi, '');

    // 4. Corrigir Cabeçalhos Quebrados (A IA as vezes coloca **## Heading**)
    clean = clean.replace(/\*?\*?(##+)\s+(.*?)\*?\*?(\n|$)/g, '$1 $2\n');

    // 5. Remover eventual bloco de código residual no fim (A IA se perde as vezes)
    clean = clean.replace(/```\s*$/g, '');

    return (frontmatter + clean).trim() + "\n";
};
