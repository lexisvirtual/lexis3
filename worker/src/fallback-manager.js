/**
 * Fallback Image Manager - Versão com Armazenamento Seguro
 * Gerencia um pool dinâmico de imagens genéricas de "pessoas conversando"
 * Imagens são armazenadas localmente em WebP (seguro e otimizado)
 * Remove imagens após uso para evitar reutilização
 * Busca novas imagens do Pixabay quando o pool está vazio
 */

const PIXABAY_API_KEY = '54644686-7efa1461402a91a56a1f92e8b';
const FALLBACK_POOL_KEY = 'fallback_image_pool';
const FALLBACK_USED_KEY = 'fallback_used_images';
const FALLBACK_USED_LOCAL_KEY = 'fallback_used_local_images';
const POOL_SIZE = 10;

// URLs das imagens armazenadas localmente (JPG otimizado do Pixabay)
const LOCAL_FALLBACK_IMAGES = [
  '/fallback-images/fallback-01.jpg',
  '/fallback-images/fallback-02.jpg',
  '/fallback-images/fallback-03.jpg',
  '/fallback-images/fallback-04.jpg',
  '/fallback-images/fallback-05.jpg',
  '/fallback-images/fallback-06.jpg',
  '/fallback-images/fallback-07.jpg',
  '/fallback-images/fallback-08.jpg',
  '/fallback-images/fallback-09.jpg',
  '/fallback-images/fallback-10.jpg',
];

/**
 * Queries estratégicas para maximizar qualidade e diversidade
 * Múltiplas queries garantem variedade de cenários
 */
const STRATEGIC_QUERIES = [
  'people talking',
  'happy conversation',
  'business meeting discussion',
  'friends talking indoors',
  'team meeting office'
];

/**
 * Calcula score de popularidade ponderado
 * Prioriza likes (engajamento) sobre downloads e views
 */
function calculatePopularityScore(image) {
  return (
    (image.downloads || 0) * 0.5 +
    (image.likes || 0) * 2 +
    (image.views || 0) * 0.1
  );
}

/**
 * Busca imagens de uma query específica do Pixabay
 */
async function searchPixabayQuery(query) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&category=people&orientation=horizontal&safesearch=true&per_page=100&order=popular&min_width=1200`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.hits || [];
  } catch (error) {
    console.error(`Erro ao buscar query "${query}":`, error);
    return [];
  }
}

/**
 * Busca imagens genéricas do Pixabay para o pool de fallback
 * Sistema multi-query com score de popularidade
 * Garante alta qualidade e diversidade de cenários
 */
async function fetchFallbackImagesFromPixabay() {
  try {
    const allImages = [];
    
    // 1. Rodar múltiplas queries para diversidade
    for (const query of STRATEGIC_QUERIES) {
      const results = await searchPixabayQuery(query);
      allImages.push(...results);
    }
    
    // 2. Remover duplicadas usando ID único
    const uniqueImages = new Map();
    for (const img of allImages) {
      if (!uniqueImages.has(img.id)) {
        uniqueImages.set(img.id, img);
      }
    }
    
    let filtered = Array.from(uniqueImages.values());
    
    // 3. Filtrar por dimensões mínimas (qualidade)
    filtered = filtered.filter(img => 
      img.imageWidth >= 1200 && img.imageHeight >= 630
    );
    
    // 4. Calcular score de popularidade para cada imagem
    filtered = filtered.map(img => ({
      ...img,
      popularityScore: calculatePopularityScore(img)
    }));
    
    // 5. Ordenar por popularidade (mais populares primeiro)
    filtered.sort((a, b) => b.popularityScore - a.popularityScore);
    
    // 6. Retornar top 10 imagens mais populares
    const topImages = filtered.slice(0, POOL_SIZE);
    
    console.log(`Busca multi-query concluída: ${allImages.length} imagens encontradas, ${uniqueImages.size} únicas, ${topImages.length} selecionadas`);
    
    return topImages.map(hit => ({
      id: hit.id,
      url: hit.webformatURL,
      source: 'pixabay',
      timestamp: Date.now(),
      score: hit.popularityScore,
      downloads: hit.downloads,
      likes: hit.likes,
      views: hit.views
    }));
  } catch (error) {
    console.error('Erro ao buscar imagens do Pixabay:', error);
    return [];
  }
}

/**
 * Obtém uma imagem do pool de fallback
 * Prioridade: 1) Imagens locais 2) Pool do KV 3) Pixabay
 */
async function getFallbackImage(env) {
  try {
    // CAMADA 1: Tentar usar imagens locais armazenadas
    let usedLocal = await env.LEXIS_KV.get(FALLBACK_USED_LOCAL_KEY);
    usedLocal = usedLocal ? JSON.parse(usedLocal) : [];
    
    const availableLocal = LOCAL_FALLBACK_IMAGES.filter(img => !usedLocal.includes(img));
    
    if (availableLocal.length > 0) {
      // Pega uma imagem aleatória das disponíveis
      const image = availableLocal[Math.floor(Math.random() * availableLocal.length)];
      
      // Marca como usada
      usedLocal.push(image);
      await env.LEXIS_KV.put(FALLBACK_USED_LOCAL_KEY, JSON.stringify(usedLocal));
      
      console.log(`Imagem de fallback local usada: ${image}`);
      return image;
    }
    
    // Se todas as imagens locais foram usadas, resetar o contador
    if (usedLocal.length > 0) {
      console.log('Todas as imagens locais foram usadas, resetando...');
      await env.LEXIS_KV.delete(FALLBACK_USED_LOCAL_KEY);
      // Retorna uma imagem aleatória
      return LOCAL_FALLBACK_IMAGES[Math.floor(Math.random() * LOCAL_FALLBACK_IMAGES.length)];
    }
    
    // CAMADA 2: Tentar usar o pool do KV (imagens do Pixabay)
    let pool = await env.LEXIS_KV.get(FALLBACK_POOL_KEY);
    
    if (!pool) {
      // Pool vazio, busca novas imagens do Pixabay
      console.log('Pool de fallback vazio, buscando novas imagens do Pixabay...');
      const newImages = await fetchFallbackImagesFromPixabay();
      
      if (newImages.length === 0) {
        console.error('Não foi possível buscar imagens de fallback, usando local como último recurso');
        return LOCAL_FALLBACK_IMAGES[0];
      }
      
      pool = newImages;
    } else {
      pool = JSON.parse(pool);
    }
    
    if (pool.length === 0) {
      // Pool vazio, busca mais imagens
      const newImages = await fetchFallbackImagesFromPixabay();
      if (newImages.length === 0) {
        console.error('Não foi possível buscar imagens de fallback, usando local como último recurso');
        return LOCAL_FALLBACK_IMAGES[0];
      }
      pool = newImages;
    }
    
    // Pega a primeira imagem do pool
    const image = pool[0];
    
    // Remove a imagem do pool
    pool.shift();
    
    // Atualiza o pool no KV
    await env.LEXIS_KV.put(FALLBACK_POOL_KEY, JSON.stringify(pool));
    
    // Registra a imagem como usada
    await markImageAsUsed(env, image.id);
    
    console.log(`Imagem de fallback do Pixabay usada: ${image.id}`);
    return image.url;
  } catch (error) {
    console.error('Erro ao obter imagem de fallback:', error);
    // Último recurso: retornar primeira imagem local
    return LOCAL_FALLBACK_IMAGES[0];
  }
}

/**
 * Marca uma imagem como usada para evitar reutilização
 */
async function markImageAsUsed(env, imageId) {
  try {
    let usedImages = await env.LEXIS_KV.get(FALLBACK_USED_KEY);
    usedImages = usedImages ? JSON.parse(usedImages) : [];
    
    if (!usedImages.includes(imageId)) {
      usedImages.push(imageId);
      await env.LEXIS_KV.put(FALLBACK_USED_KEY, JSON.stringify(usedImages));
    }
  } catch (error) {
    console.error('Erro ao marcar imagem como usada:', error);
  }
}

/**
 * Atualiza o pool de fallback com novas imagens
 * Chamado periodicamente ou quando o pool está vazio
 */
async function refreshFallbackPool(env) {
  try {
    const newImages = await fetchFallbackImagesFromPixabay();
    
    if (newImages.length > 0) {
      await env.LEXIS_KV.put(FALLBACK_POOL_KEY, JSON.stringify(newImages));
      console.log(`Pool de fallback atualizado com ${newImages.length} imagens`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao atualizar pool de fallback:', error);
    return false;
  }
}

/**
 * Obtém o status atual do pool de fallback
 */
async function getFallbackPoolStatus(env) {
  try {
    const pool = await env.LEXIS_KV.get(FALLBACK_POOL_KEY);
    const usedImages = await env.LEXIS_KV.get(FALLBACK_USED_KEY);
    const usedLocal = await env.LEXIS_KV.get(FALLBACK_USED_LOCAL_KEY);
    
    return {
      localImagesAvailable: LOCAL_FALLBACK_IMAGES.length - (usedLocal ? JSON.parse(usedLocal).length : 0),
      localImagesTotal: LOCAL_FALLBACK_IMAGES.length,
      pixabayPoolSize: pool ? JSON.parse(pool).length : 0,
      pixabayUsedCount: usedImages ? JSON.parse(usedImages).length : 0
    };
  } catch (error) {
    console.error('Erro ao obter status do pool:', error);
    return { localImagesAvailable: 0, localImagesTotal: 0, pixabayPoolSize: 0, pixabayUsedCount: 0 };
  }
}

module.exports = {
  getFallbackImage,
  refreshFallbackPool,
  getFallbackPoolStatus,
  markImageAsUsed
};
