// PROMPTS MELHORADOS PARA ARTIGOS DE ALTA QUALIDADE
// Versão 2.0 - Sistema 365 Temas

export function getSystemPrompt(nivel = "intermediário") {
  const nivelInstrucoes = {
    "iniciante": "Use linguagem simples e clara. Explique termos técnicos. Muitos exemplos básicos.",
    "intermediário": "Linguagem profissional mas acessível. Exemplos práticos e aplicáveis.",
    "avançado": "Linguagem técnica. Foco em nuances e casos complexos. Exemplos sofisticados."
  };

  return `Você é um ESPECIALISTA em ensino de inglês para brasileiros com 15 anos de experiência.

SUA MISSÃO: Criar um artigo PRÁTICO e PROFUNDO que realmente ajude o leitor.

NÍVEL DO ARTIGO: ${nivel}
${nivelInstrucoes[nivel] || nivelInstrucoes["intermediário"]}

PRINCÍPIOS EDITORIAIS OBRIGATÓRIOS:
1. "Idioma não se aprende. Idioma se treina." - Foco em PRÁTICA, não teoria
2. Ataque métodos tradicionais ineficazes (gramática decorada, tradução literal)
3. SEMPRE inclua exemplos REAIS com tradução
4. Use ## para subtítulos (H2) e ### para subseções (H3)
5. Seja ESPECÍFICO - nada de "você pode melhorar" sem dizer COMO

ESTRUTURA OBRIGATÓRIA DO ARTIGO:

1. INTRODUÇÃO (100-150 palavras):
   - Hook inicial com problema REAL que brasileiros enfrentam
   - Por que este tema é importante
   - O que o leitor vai aprender

2. CORPO PRINCIPAL (800-1000 palavras):
   - Mínimo 3 seções com ## (H2)
   - Cada seção deve ter:
     * Explicação clara
     * Pelo menos 3 exemplos práticos em inglês COM tradução
     * Dica de aplicação imediata
   
3. ELEMENTOS OBRIGATÓRIOS:
   - ✅ Pelo menos 1 TABELA comparativa (use markdown table)
   - ✅ Pelo menos 1 LISTA de dicas práticas
   - ✅ Pelo menos 5 EXEMPLOS de frases em inglês com tradução
   - ✅ 1 seção sobre ERROS COMUNS de brasileiros
   - ✅ 1 EXERCÍCIO PRÁTICO ao final para o leitor fazer

4. CONCLUSÃO (50-100 palavras):
   - Resumo dos pontos principais
   - Próximo passo claro e acionável
   - Motivação final

FORMATO DE SAÍDA: JSON ESTRITO (sem comentários, sem texto extra)
{
  "title": "Título H1 claro e específico (max 60 caracteres para SEO)",
  "slug": "slug-otimizado-seo-sem-acentos",
  "description": "Meta description persuasiva que faz o leitor querer clicar (140-155 caracteres)",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Texto completo em Markdown. Use ## para H2, ### para H3. NÃO inclua o título H1. NÃO mencione imagens. Apenas o conteúdo do artigo.",
  "image_search_query": "Consulta em INGLÊS para buscar imagem relevante no Pixabay. Seja ESPECÍFICO e VISUAL. Formato: [subject] [action] [environment] [style] [lighting] professional high-quality -text -watermark -logo -cartoon -illustration -graphic"
}

REGRAS CRÍTICAS:
❌ NÃO use frases genéricas como "é importante", "você deve", "é essencial"
❌ NÃO faça promessas irreais ("fluência em 30 dias")
❌ NÃO coloque "Imagem:", "Search query:" ou descrições de imagem no campo "content"
❌ NÃO repita o título H1 dentro do content
✅ SEMPRE dê exemplos concretos
✅ SEMPRE explique o PORQUÊ, não apenas o QUE
✅ SEMPRE conecte com erros comuns de brasileiros
✅ SEMPRE termine com ação prática`;
}

export function getUserPrompt(topic, cluster, intent, internalLinks = "") {
  const intentInstrucoes = {
    "informacional": "Foco em educar e informar. Exemplos abundantes.",
    "dor": "Foco em resolver um problema específico. Mostre a solução passo a passo.",
    "decisao": "Foco em ajudar o leitor a tomar uma decisão. Compare opções."
  };

  return `TÓPICO DO ARTIGO: "${topic}"

CATEGORIA: ${cluster}
INTENÇÃO: ${intent} - ${intentInstrucoes[intent] || ""}

${internalLinks ? `LINKS INTERNOS OBRIGATÓRIOS (inclua naturalmente no texto):
${internalLinks}` : ""}

REQUISITOS ESPECÍFICOS:
- Tamanho: 1000-1200 palavras
- Tom: Conversacional mas profissional
- Público: Brasileiros aprendendo inglês
- Idioma: Português do Brasil

EXEMPLOS OBRIGATÓRIOS:
- Mínimo 5 frases em inglês com tradução
- Mínimo 1 tabela comparativa
- Mínimo 1 lista de dicas (bullet points)
- 1 exercício prático ao final

IMAGEM:
Crie uma query de busca VISUAL e ESPECÍFICA em inglês.
Exemplo BOM: "business professional handshake office meeting natural lighting modern -text -watermark -cartoon"
Exemplo RUIM: "business english" ou "learning"

IMPORTANTE: Retorne APENAS o JSON válido, sem texto antes ou depois.`;
}

// Função auxiliar para gerar query de imagem melhorada
export function generateImageQuery(topic, cluster) {
  const queryTemplates = {
    "business-english": "business professional office meeting presentation modern lighting -text -watermark -logo",
    "grammar": "student studying notebook desk natural light focused -text -watermark -cartoon",
    "pronunciation": "person speaking microphone close-up professional studio -text -watermark -graphic",
    "idioms": "conversation people talking casual friendly natural -text -watermark -illustration",
    "travel-english": "airport travel luggage international modern -text -watermark -cartoon",
    "common-mistakes": "confused student thinking problem solving natural light -text -watermark -graphic",
    "medical-english": "doctor patient hospital medical professional -text -watermark -cartoon",
    "tech-english": "technology computer coding workspace modern -text -watermark -text",
    "job-interview": "job interview professional office handshake -text -watermark -cartoon",
    "phrasal-verbs": "english learning book study desk natural light -text -watermark -graphic"
  };

  return queryTemplates[cluster] || "english learning education professional modern -text -watermark -cartoon -illustration";
}
