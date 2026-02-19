/**
 * Fallback Image Manager
 * Gerencia um pool dinâmico de imagens genéricas de "pessoas conversando"
 * Busca 10 imagens do Pixabay quando o pool está vazio
 * Remove imagens após uso para evitar reutilização
 */

const PIXABAY_API_KEY = '54644686-7efa1461402a91a56a1f92e8b';
const FALLBACK_POOL_KEY = 'fallback_image_pool';
const FALLBACK_USED_KEY = 'fallback_used_images';
const POOL_SIZE = 10;

/**
 * Busca imagens genéricas do Pixabay para o pool de fallback
 */
async function fetchFallbackImagesFromPixabay() {
  try {
    const query = 'people talking conversation';
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${POOL_SIZE}&safesearch=true&order=latest`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      return data.hits.map(hit => ({
        id: hit.id,
        url: hit.webformatURL,
        source: 'pixabay'
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar imagens do Pixabay:', error);
    return [];
  }
}

/**
 * Obtém uma imagem do pool de fallback
 * Se o pool está vazio, busca novas imagens
 */
async function getFallbackImage(env) {
  try {
    // Tenta obter o pool atual
    let pool = await env.LEXIS_KV.get(FALLBACK_POOL_KEY);
    
    if (!pool) {
      // Pool vazio, busca novas imagens
      console.log('Pool de fallback vazio, buscando novas imagens...');
      const newImages = await fetchFallbackImagesFromPixabay();
      
      if (newImages.length === 0) {
        console.error('Não foi possível buscar imagens de fallback');
        return null;
      }
      
      pool = newImages;
    } else {
      pool = JSON.parse(pool);
    }
    
    if (pool.length === 0) {
      // Pool vazio novamente, busca mais imagens
      const newImages = await fetchFallbackImagesFromPixabay();
      if (newImages.length === 0) return null;
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
    
    console.log(`Imagem de fallback usada: ${image.id}`);
    return image.url;
  } catch (error) {
    console.error('Erro ao obter imagem de fallback:', error);
    return null;
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
    
    return {
      poolSize: pool ? JSON.parse(pool).length : 0,
      usedCount: usedImages ? JSON.parse(usedImages).length : 0
    };
  } catch (error) {
    console.error('Erro ao obter status do pool:', error);
    return { poolSize: 0, usedCount: 0 };
  }
}

module.exports = {
  getFallbackImage,
  refreshFallbackPool,
  getFallbackPoolStatus,
  markImageAsUsed
};
