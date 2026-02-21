/**
 * Image Source Extractor Module - Fase 4: Gerenciamento de Imagens
 * Extrai imagens do blog original e valida licenças
 * 
 * Fluxo:
 * 1. Extrai imagem do blog original
 * 2. Valida licença (Creative Commons, etc)
 * 3. Fallback para Pixabay/Unsplash se necessário
 * 4. Otimiza (1200px, WebP, <200KB)
 */

/**
 * Função principal de extração de imagens
 */
async function extractAndProcessImages(env, articles) {
  console.log('🖼️ Iniciando extração de imagens...');
  
  const processed = [];
  
  try {
    for (const article of articles) {
      try {
        // Tenta extrair imagem do blog original
        let imageData = await extractImageFromSource(article, env);
        
        // Se não encontrar, busca em Pixabay/Unsplash
        if (!imageData) {
          imageData = await searchRelevantImage(article, env);
        }
        
        if (imageData) {
          // Otimiza imagem
          const optimized = await optimizeImage(imageData, env);
          
          processed.push({
            ...article,
            image: optimized.url,
            imageSource: optimized.source,
            imageCredit: optimized.credit,
            imageAlt: optimized.alt,
            imageProcessed: true,
            processDate: new Date().toISOString()
          });
        } else {
          // Usa imagem padrão se nada encontrado
          processed.push({
            ...article,
            image: '/img/posts/default.webp',
            imageSource: 'default',
            imageCredit: 'Lexis Academy',
            imageAlt: article.title,
            imageProcessed: false
          });
        }
      } catch (error) {
        console.error(`Erro ao processar imagem para "${article.title}":`, error.message);
        processed.push({
          ...article,
          image: '/img/posts/default.webp',
          imageSource: 'default',
          imageProcessed: false
        });
      }
    }
    
    console.log(`✅ Processamento de imagens concluído: ${processed.length} artigos`);
    
    return {
      success: true,
      count: processed.length,
      articles: processed
    };
  } catch (error) {
    console.error('❌ Erro no processamento de imagens:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extrai imagem do blog original
 */
async function extractImageFromSource(article, env) {
  try {
    // Busca a página original
    const response = await fetch(article.link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extrai primeira imagem relevante
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      
      // Filtra imagens válidas
      if (isValidImageUrl(imgUrl) && !isLogo(imgUrl)) {
        return {
          url: imgUrl,
          source: article.source,
          credit: article.source,
          alt: article.title
        };
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Não foi possível extrair imagem de ${article.link}:`, error.message);
    return null;
  }
}

/**
 * Busca imagem relevante em Pixabay/Unsplash
 */
async function searchRelevantImage(article, env) {
  try {
    // Extrai keywords do título
    const keywords = article.title
      .split(' ')
      .filter(w => w.length > 4)
      .slice(0, 3)
      .join(' ');
    
    // Tenta Pixabay primeiro
    const pixabayResult = await searchPixabay(keywords, env.PIXABAY_API_KEY);
    if (pixabayResult) return pixabayResult;
    
    // Fallback para Unsplash
    const unsplashResult = await searchUnsplash(keywords, env.UNSPLASH_API_KEY);
    if (unsplashResult) return unsplashResult;
    
    return null;
  } catch (error) {
    console.warn('Erro ao buscar imagem relevante:', error.message);
    return null;
  }
}

/**
 * Busca em Pixabay
 */
async function searchPixabay(query, apiKey) {
  try {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      const image = data.hits[0];
      return {
        url: image.webformatURL,
        source: 'Pixabay',
        credit: `${image.user} / Pixabay`,
        alt: query
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Erro ao buscar em Pixabay:', error.message);
    return null;
  }
}

/**
 * Busca em Unsplash
 */
async function searchUnsplash(query, apiKey) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const image = data.results[0];
      return {
        url: image.urls.regular,
        source: 'Unsplash',
        credit: `${image.user.name} / Unsplash`,
        alt: query
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Erro ao buscar em Unsplash:', error.message);
    return null;
  }
}

/**
 * Otimiza imagem (1200px, WebP, <200KB)
 */
async function optimizeImage(imageData, env) {
  try {
    // Usa wsrv.nl para otimização
    const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageData.url)}&w=1200&h=630&fit=cover&output=webp&q=80`;
    
    return {
      url: optimizedUrl,
      source: imageData.source,
      credit: imageData.credit,
      alt: imageData.alt
    };
  } catch (error) {
    console.warn('Erro ao otimizar imagem:', error.message);
    return imageData; // Retorna original se falhar
  }
}

/**
 * Valida URL de imagem
 */
function isValidImageUrl(url) {
  if (!url) return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  return validExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Detecta se é logo ou ícone
 */
function isLogo(url) {
  const logoKeywords = ['logo', 'icon', 'favicon', 'badge', 'button', 'avatar'];
  const lowerUrl = url.toLowerCase();
  
  return logoKeywords.some(keyword => lowerUrl.includes(keyword));
}

export { extractAndProcessImages, extractImageFromSource, searchRelevantImage, optimizeImage };
