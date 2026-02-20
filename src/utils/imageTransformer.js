/**
 * Image Transformer
 * Transforma URLs de imagens para usar CDN próprio
 */

import imageCache from './imageCache.js';
import cloudflareConfig from './cloudflareConfig.js';

class ImageTransformer {
  /**
   * Transforma URL de imagem para usar CDN próprio
   */
  transformUrl(originalUrl, options = {}) {
    // Verifica cache
    const cached = imageCache.get(originalUrl);
    if (cached && cached.cloudflare_url) {
      return cached.cloudflare_url;
    }

    // Se não estiver em cache, retorna URL original por enquanto
    // Será processada posteriormente
    return originalUrl;
  }

  /**
   * Gera URL otimizada com parâmetros de transformação
   */
  getOptimizedUrl(imageUrl, options = {}) {
    const defaultOptions = {
      format: 'webp',
      quality: 80,
      width: null,
      height: null,
      fit: 'scale-down'
    };

    const opts = { ...defaultOptions, ...options };
    const params = [];

    if (opts.format) params.push(`format=${opts.format}`);
    if (opts.quality) params.push(`quality=${opts.quality}`);
    if (opts.width) params.push(`width=${opts.width}`);
    if (opts.height) params.push(`height=${opts.height}`);
    if (opts.fit) params.push(`fit=${opts.fit}`);

    const queryString = params.join(',');
    return `${imageUrl}?${queryString}`;
  }

  /**
   * Transforma URL para usar Cloudflare Images
   */
  transformToCloudflareImages(fileName, options = {}) {
    const baseUrl = cloudflareConfig.imagesConfig.publicUrl;
    const optimized = this.getOptimizedUrl(`${baseUrl}/${fileName}`, options);
    return optimized;
  }

  /**
   * Transforma URL para usar R2
   */
  transformToR2(fileName, options = {}) {
    const baseUrl = cloudflareConfig.imagesConfig.publicUrl;
    const optimized = this.getOptimizedUrl(`${baseUrl}/${fileName}`, options);
    return optimized;
  }

  /**
   * Processa lote de URLs
   */
  transformBatch(urls, options = {}) {
    return urls.map(url => this.transformUrl(url, options));
  }

  /**
   * Obtém variações de uma imagem
   */
  getImageVariants(imageUrl, baseFileName) {
    return {
      original: imageUrl,
      webp: this.transformToCloudflareImages(baseFileName, { format: 'webp', quality: 80 }),
      avif: this.transformToCloudflareImages(baseFileName, { format: 'avif', quality: 80 }),
      thumbnail: this.transformToCloudflareImages(baseFileName, { format: 'webp', width: 300, quality: 80 }),
      medium: this.transformToCloudflareImages(baseFileName, { format: 'webp', width: 800, quality: 80 }),
      large: this.transformToCloudflareImages(baseFileName, { format: 'webp', width: 1200, quality: 80 })
    };
  }
}

export default new ImageTransformer();
