/**
 * Image Cache Module for Cloudflare Worker
 * Provides cached image URLs from local storage
 */

// Cache de imagens processadas
const IMAGE_CACHE = {
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952': '/public/images/blog/cdb960b530d5ffcc4340693d7df98651.webp',
  'https://images.unsplash.com/photo-1552664730-d307ca884978': '/public/images/blog/64050c147e8704e25a267ee3f1fac9b8.webp',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97': '/public/images/blog/a8b5ebac3b49ee14774c03146983a006.webp',
};

/**
 * Busca imagem do cache local
 * @param {string} originalUrl - URL original da imagem
 * @returns {string|null} - Caminho local da imagem ou null
 */
export function getImageFromCache(originalUrl) {
  if (!originalUrl) return null;
  
  // Remove parâmetros de query (ex: ?w=1200&q=80)
  const baseUrl = originalUrl.split('?')[0];
  
  // Busca no cache
  const cachedPath = IMAGE_CACHE[baseUrl];
  
  if (cachedPath) {
    console.log(`[IMAGE_CACHE] Imagem encontrada no cache: ${baseUrl} -> ${cachedPath}`);
    return cachedPath;
  }
  
  console.log(`[IMAGE_CACHE] Imagem não encontrada no cache: ${baseUrl}`);
  return null;
}

/**
 * Busca imagem com fallback para cache local
 * @param {string} originalUrl - URL original da imagem
 * @param {string} fallbackUrl - URL de fallback se não encontrar no cache
 * @returns {string} - URL da imagem (cache local ou fallback)
 */
export function getImageWithCacheFallback(originalUrl, fallbackUrl = null) {
  const cachedImage = getImageFromCache(originalUrl);
  
  if (cachedImage) {
    return cachedImage;
  }
  
  // Se não encontrar no cache, retorna fallback ou URL original
  return fallbackUrl || originalUrl;
}

/**
 * Adiciona nova imagem ao cache (para uso em runtime)
 * @param {string} originalUrl - URL original
 * @param {string} cachedPath - Caminho local da imagem
 */
export function addToImageCache(originalUrl, cachedPath) {
  const baseUrl = originalUrl.split('?')[0];
  IMAGE_CACHE[baseUrl] = cachedPath;
  console.log(`[IMAGE_CACHE] Imagem adicionada ao cache: ${baseUrl}`);
}

/**
 * Retorna o cache completo
 * @returns {Object} - Objeto com todas as imagens em cache
 */
export function getFullImageCache() {
  return { ...IMAGE_CACHE };
}

/**
 * Retorna número de imagens em cache
 * @returns {number} - Quantidade de imagens
 */
export function getCacheSize() {
  return Object.keys(IMAGE_CACHE).length;
}
