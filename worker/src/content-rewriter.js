/**
 * Content Rewriter Module - Fase 3: Reescrita com IA
 * Reescreve artigos em voz Lexis com keywords SEO naturais
 * 
 * Características:
 * - Voz Lexis integrada (Start-Run-Fly-Liberty)
 * - Keywords SEO naturalmente inseridas
 * - Originalidade >80%
 * - Exemplos brasileiros
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Função principal de reescrita
 */
async function rewriteArticles(env, articles) {
  console.log('🤖 Iniciando reescrita com IA...');
  
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const rewritten = [];
  
  try {
    for (const article of articles) {
      try {
        const rewrittenContent = await rewriteWithGemini(
          model,
          article,
          env
        );
        
        if (rewrittenContent) {
          rewritten.push({
            ...article,
            originalTitle: article.title,
            originalDescription: article.description,
            title: rewrittenContent.title,
            content: rewrittenContent.content,
            keywords: rewrittenContent.keywords,
            category: rewrittenContent.category,
            status: 'rewritten',
            originalityScore: rewrittenContent.originalityScore,
            rewriteDate: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Erro ao reescrever "${article.title}":`, error.message);
      }
    }
    
    // Armazena em KV
    if (rewritten.length > 0) {
      const timestamp = new Date().toISOString();
      await env.LEXIS_REWRITTEN_POSTS.put(
        `batch_${timestamp}`,
        JSON.stringify({
          timestamp,
          count: rewritten.length,
          articles: rewritten
        }),
        { expirationTtl: 30 * 24 * 60 * 60 }
      );
    }
    
    console.log(`✅ Reescrita concluída: ${rewritten.length} artigos`);
    
    return {
      success: true,
      count: rewritten.length,
      articles: rewritten
    };
  } catch (error) {
    console.error('❌ Erro na reescrita:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reescreve artigo usando Google Gemini
 */
async function rewriteWithGemini(model, article, env) {
  const prompt = `
Você é um especialista em educação de inglês com metodologia Lexis.

Reescreva o seguinte artigo em português brasileiro coloquial, seguindo a metodologia Lexis:

Título Original: ${article.title}
Descrição: ${article.description}
Fonte: ${article.source}

Requisitos:
1. Reescreva em voz Lexis (Start-Run-Fly-Liberty framework)
2. Inclua exemplos brasileiros naturalmente
3. Adicione 3-5 keywords SEO relevantes
4. Mantenha originalidade >80%
5. Estruture em seções claras
6. Use linguagem acessível e engajante
7. Inclua dicas práticas

Retorne em JSON com este formato:
{
  "title": "Título reescrito",
  "content": "Conteúdo completo reescrito",
  "keywords": ["palavra-chave1", "palavra-chave2", ...],
  "category": "Categoria apropriada",
  "originalityScore": 85
}
`;
  
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extrai JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }
    
    const rewritten = JSON.parse(jsonMatch[0]);
    
    // Valida resposta
    if (!rewritten.title || !rewritten.content) {
      throw new Error('Resposta incompleta do Gemini');
    }
    
    return rewritten;
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error.message);
    return null;
  }
}

/**
 * Valida originalidade do conteúdo
 */
async function validateOriginality(rewrittenContent, originalContent, env) {
  // Implementação simplificada
  // Em produção, usar API de detecção de plágio
  
  const rewrittenWords = rewrittenContent.toLowerCase().split(/\s+/);
  const originalWords = originalContent.toLowerCase().split(/\s+/);
  
  const commonWords = rewrittenWords.filter(w => originalWords.includes(w));
  const similarity = commonWords.length / Math.max(rewrittenWords.length, originalWords.length);
  
  return (1 - similarity) * 100; // Retorna % de originalidade
}

/**
 * Extrai keywords do conteúdo
 */
function extractKeywords(content, count = 5) {
  // Implementação simplificada
  // Em produção, usar NLP mais avançado
  
  const words = content
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4);
  
  const frequency = {};
  words.forEach(w => {
    frequency[w] = (frequency[w] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

export { rewriteArticles, rewriteWithGemini, validateOriginality, extractKeywords };
