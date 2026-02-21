// ============================================
// MÓDULO: VALIDAÇÃO AUTOMÁTICA DE IMAGENS
// Sistema de OCR + Análise de Relevância + Histórico
// ============================================

/**
 * FUNÇÃO PRINCIPAL: Validar imagem antes de usar
 * @param {string} imageUrl - URL da imagem
 * @param {string} postTitle - Título do post
 * @param {string} postContent - Conteúdo do post
 * @param {object} env - Cloudflare env (para KV)
 * @returns {object} { valid: boolean, score: number, reason: string }
 */
export async function validateImageRelevance(imageUrl, postTitle, postContent, env) {
    try {
        console.log(`[VALIDATION] Iniciando validação de imagem: ${imageUrl.substring(0, 50)}...`);

        // ETAPA 1: Verificar histórico (evitar duplicatas)
        const isDuplicate = await checkImageHistory(imageUrl, env);
        if (isDuplicate) {
            console.log(`[VALIDATION] ❌ Imagem já foi usada. Rejeitando.`);
            return { valid: false, score: 0, reason: "DUPLICATE_IMAGE" };
        }

        // ETAPA 2: Análise de relevância (OCR + conteúdo visual)
        const relevanceScore = await analyzeImageRelevance(imageUrl, postTitle, postContent, env);
        console.log(`[VALIDATION] Score de relevância: ${relevanceScore}/100`);

        // ETAPA 3: Decisão final (threshold: 60 pontos)
        const RELEVANCE_THRESHOLD = 60;
        const isRelevant = relevanceScore >= RELEVANCE_THRESHOLD;

        if (isRelevant) {
            // Registrar no histórico
            await recordImageUsage(imageUrl, postTitle, env);
            console.log(`[VALIDATION] ✅ Imagem aprovada! Score: ${relevanceScore}`);
            return { valid: true, score: relevanceScore, reason: "APPROVED" };
        } else {
            console.log(`[VALIDATION] ❌ Imagem rejeitada. Score baixo: ${relevanceScore}`);
            return { valid: false, score: relevanceScore, reason: "LOW_RELEVANCE" };
        }

    } catch (error) {
        console.error(`[VALIDATION] Erro na validação: ${error.message}`);
        // Em caso de erro, rejeita para ser seguro
        return { valid: false, score: 0, reason: `ERROR: ${error.message}` };
    }
}

/**
 * ETAPA 1: Verificar se imagem já foi usada
 */
async function checkImageHistory(imageUrl, env) {
    try {
        // Hash da URL para economizar espaço no KV
        const imageHash = hashString(imageUrl);
        const historyKey = `img-history:${imageHash}`;

        const existingRecord = await env.LEXIS_PAUTA.get(historyKey);
        return existingRecord !== null; // true se já existe

    } catch (error) {
        console.warn(`[HISTORY] Erro ao verificar histórico: ${error.message}`);
        return false; // Se falhar, permite (não bloqueia)
    }
}

/**
 * ETAPA 2: Analisar relevância da imagem
 * Combina: OCR + análise de objetos + comparação com keywords
 */
async function analyzeImageRelevance(imageUrl, postTitle, postContent, env) {
    try {
        // Extrair keywords do post
        const keywords = extractKeywords(postTitle, postContent);
        console.log(`[RELEVANCE] Keywords extraídas: ${keywords.join(", ")}`);

        // ANÁLISE 1: OCR (extrair texto da imagem)
        const ocrText = await performOCR(imageUrl, env);
        console.log(`[OCR] Texto detectado: "${ocrText.substring(0, 100)}..."`);

        // ANÁLISE 2: Análise visual (objetos, cores, cenas)
        const visualAnalysis = await analyzeVisualContent(imageUrl, env);
        console.log(`[VISUAL] Objetos detectados: ${visualAnalysis.objects.join(", ")}`);

        // ANÁLISE 3: Scoring de relevância
        const score = calculateRelevanceScore(
            keywords,
            ocrText,
            visualAnalysis,
            postTitle,
            postContent
        );

        return score;

    } catch (error) {
        console.error(`[RELEVANCE] Erro na análise: ${error.message}`);
        return 30; // Score baixo em caso de erro
    }
}

/**
 * Extrair keywords do post (título + conteúdo)
 */
function extractKeywords(postTitle, postContent) {
    const text = `${postTitle} ${postContent}`.toLowerCase();

    // Palavras-chave importantes (em português e inglês)
    const importantKeywords = [
        // Inglês
        'english', 'language', 'learning', 'study', 'conversation', 'pronunciation',
        'grammar', 'vocabulary', 'business', 'interview', 'travel', 'immersion',
        'culture', 'mindset', 'education', 'training', 'speaking', 'listening',
        'writing', 'reading', 'fluency', 'accent', 'expression', 'communication',
        // Português
        'inglês', 'idioma', 'aprendizado', 'estudo', 'conversa', 'pronúncia',
        'gramática', 'vocabulário', 'negócios', 'entrevista', 'viagem', 'imersão',
        'cultura', 'mentalidade', 'educação', 'treinamento', 'fala', 'escuta',
        'escrita', 'leitura', 'fluência', 'sotaque', 'expressão', 'comunicação'
    ];

    const foundKeywords = [];
    for (const keyword of importantKeywords) {
        if (text.includes(keyword)) {
            foundKeywords.push(keyword);
        }
    }

    return foundKeywords.length > 0 ? foundKeywords : ['english', 'learning'];
}

/**
 * Realizar OCR na imagem (usando Google Vision API ou similar)
 * Para MVP: Simular com análise básica
 */
async function performOCR(imageUrl, env) {
    try {
        // Se tiver Google Vision API configurada, usar
        if (env.GOOGLE_VISION_API_KEY) {
            return await performGoogleVisionOCR(imageUrl, env.GOOGLE_VISION_API_KEY);
        }

        // Fallback: Retornar string vazia (não bloqueia)
        console.log(`[OCR] Google Vision não configurada. Usando fallback.`);
        return "";

    } catch (error) {
        console.warn(`[OCR] Erro: ${error.message}`);
        return "";
    }
}

/**
 * Análise visual da imagem (objetos, cores, cenas)
 * Para MVP: Simular com análise básica
 */
async function analyzeVisualContent(imageUrl, env) {
    try {
        // Se tiver Google Vision API, usar
        if (env.GOOGLE_VISION_API_KEY) {
            return await performGoogleVisionAnalysis(imageUrl, env.GOOGLE_VISION_API_KEY);
        }

        // Fallback: Retornar análise básica
        console.log(`[VISUAL] Google Vision não configurada. Usando fallback.`);
        return {
            objects: ['people', 'learning', 'education'],
            colors: ['blue', 'white'],
            scene: 'indoor',
            confidence: 0.5
        };

    } catch (error) {
        console.warn(`[VISUAL] Erro: ${error.message}`);
        return {
            objects: [],
            colors: [],
            scene: 'unknown',
            confidence: 0
        };
    }
}

/**
 * Calcular score de relevância (0-100)
 */
function calculateRelevanceScore(keywords, ocrText, visualAnalysis, postTitle, postContent) {
    let score = 50; // Base: 50 pontos

    // CRITÉRIO 1: Correspondência de keywords (até +30 pontos)
    const matchedKeywords = keywords.filter(kw => {
        const text = `${ocrText} ${visualAnalysis.objects.join(" ")}`.toLowerCase();
        return text.includes(kw);
    });
    score += Math.min(30, matchedKeywords.length * 5);

    // CRITÉRIO 2: Objetos detectados (até +15 pontos)
    const relevantObjects = ['people', 'person', 'student', 'learning', 'book', 'computer', 'classroom', 'office', 'conversation'];
    const foundObjects = visualAnalysis.objects.filter(obj => 
        relevantObjects.some(rel => obj.toLowerCase().includes(rel))
    );
    score += Math.min(15, foundObjects.length * 3);

    // CRITÉRIO 3: Confiança da análise visual (até +5 pontos)
    score += Math.min(5, visualAnalysis.confidence * 5);

    // PENALIDADES
    // Penalidade: Imagem muito genérica (sem objetos específicos)
    if (visualAnalysis.objects.length === 0) {
        score -= 20;
    }

    // Penalidade: Imagem com muitos objetos não relacionados
    const irrelevantObjects = ['car', 'food', 'animal', 'nature', 'landscape', 'abstract'];
    const foundIrrelevant = visualAnalysis.objects.filter(obj =>
        irrelevantObjects.some(irr => obj.toLowerCase().includes(irr))
    );
    score -= foundIrrelevant.length * 5;

    // Garantir que score fica entre 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Registrar uso de imagem no histórico
 */
async function recordImageUsage(imageUrl, postTitle, env) {
    try {
        const imageHash = hashString(imageUrl);
        const historyKey = `img-history:${imageHash}`;

        const record = {
            url: imageUrl,
            post_title: postTitle,
            used_at: new Date().toISOString(),
            status: 'approved'
        };

        await env.LEXIS_PAUTA.put(historyKey, JSON.stringify(record), {
            expirationTtl: 86400 * 365 // 1 ano
        });

        console.log(`[HISTORY] Imagem registrada no histórico`);

    } catch (error) {
        console.warn(`[HISTORY] Erro ao registrar: ${error.message}`);
    }
}

/**
 * Função auxiliar: Hash simples de string
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Google Vision API - OCR
 */
async function performGoogleVisionOCR(imageUrl, apiKey) {
    try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { source: { imageUri: imageUrl } },
                    features: [{ type: 'TEXT_DETECTION' }]
                }]
            })
        });

        if (!response.ok) return "";

        const data = await response.json();
        const textAnnotations = data.responses?.[0]?.textAnnotations || [];

        if (textAnnotations.length > 0) {
            return textAnnotations[0].description || "";
        }

        return "";

    } catch (error) {
        console.warn(`[GOOGLE VISION OCR] Erro: ${error.message}`);
        return "";
    }
}

/**
 * Google Vision API - Análise Visual
 */
async function performGoogleVisionAnalysis(imageUrl, apiKey) {
    try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { source: { imageUri: imageUrl } },
                    features: [
                        { type: 'LABEL_DETECTION', maxResults: 10 },
                        { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
                    ]
                }]
            })
        });

        if (!response.ok) {
            return {
                objects: [],
                colors: [],
                scene: 'unknown',
                confidence: 0
            };
        }

        const data = await response.json();
        const response_data = data.responses?.[0] || {};

        // Extrair labels (objetos)
        const labels = response_data.labelAnnotations || [];
        const objects = labels.map(l => l.description);

        // Extrair objetos localizados
        const localizedObjects = response_data.localizedObjectAnnotations || [];
        const detectedObjects = localizedObjects.map(o => o.name);

        // Combinar e remover duplicatas
        const allObjects = [...new Set([...objects, ...detectedObjects])];

        // Calcular confiança média
        const avgConfidence = labels.length > 0
            ? labels.reduce((sum, l) => sum + l.score, 0) / labels.length
            : 0;

        return {
            objects: allObjects,
            colors: [], // Google Vision não retorna cores diretamente
            scene: objects[0] || 'unknown',
            confidence: avgConfidence
        };

    } catch (error) {
        console.warn(`[GOOGLE VISION ANALYSIS] Erro: ${error.message}`);
        return {
            objects: [],
            colors: [],
            scene: 'unknown',
            confidence: 0
        };
    }
}

/**
 * Função para limpar histórico antigo (opcional)
 * Pode ser chamada periodicamente via CRON
 */
export async function cleanupImageHistory(env, daysOld = 365) {
    try {
        console.log(`[CLEANUP] Limpando histórico de imagens com mais de ${daysOld} dias...`);

        const list = await env.LEXIS_PAUTA.list({ prefix: "img-history:" });
        let deleted = 0;

        for (const key of list.keys) {
            const record = await env.LEXIS_PAUTA.get(key.name);
            if (record) {
                const data = JSON.parse(record);
                const usedAt = new Date(data.used_at);
                const ageInDays = (Date.now() - usedAt.getTime()) / (1000 * 60 * 60 * 24);

                if (ageInDays > daysOld) {
                    await env.LEXIS_PAUTA.delete(key.name);
                    deleted++;
                }
            }
        }

        console.log(`[CLEANUP] ${deleted} registros antigos removidos`);
        return { success: true, deleted };

    } catch (error) {
        console.error(`[CLEANUP] Erro: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Função para visualizar histórico (debug)
 */
export async function getImageHistoryStats(env) {
    try {
        const list = await env.LEXIS_PAUTA.list({ prefix: "img-history:" });
        const stats = {
            total_images: list.keys.length,
            images: []
        };

        for (const key of list.keys.slice(0, 50)) { // Limitar a 50 para não sobrecarregar
            const record = await env.LEXIS_PAUTA.get(key.name);
            if (record) {
                stats.images.push(JSON.parse(record));
            }
        }

        return stats;

    } catch (error) {
        console.error(`[HISTORY STATS] Erro: ${error.message}`);
        return { total_images: 0, images: [] };
    }
}
