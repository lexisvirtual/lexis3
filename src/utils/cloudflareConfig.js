/**
 * Cloudflare Configuration
 * Gerencia configuração de Cloudflare Images e R2
 */

class CloudflareConfig {
  constructor() {
    // Configuração do Cloudflare Images
    this.imagesConfig = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      accountHash: process.env.CLOUDFLARE_ACCOUNT_HASH || '',
      publicUrl: process.env.CLOUDFLARE_IMAGES_URL || 'https://cdn.lexis.academy'
    };

    // Configuração do R2
    this.r2Config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.CLOUDFLARE_R2_BUCKET || 'lexis-images',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
    };

    // Configuração de cache
    this.cacheConfig = {
      ttl: 86400, // 24 horas
      maxSize: 1000, // Máximo de URLs em cache
      enableLocalCache: true,
      enableCDNCache: true
    };

    // Configuração de processamento de imagens
    this.imageProcessingConfig = {
      quality: 80,
      effort: 6,
      maxWidth: 1920,
      maxHeight: 1080,
      formats: ['webp', 'avif']
    };
  }

  /**
   * Valida configuração do Cloudflare Images
   */
  validateImagesConfig() {
    const required = ['accountId', 'apiToken', 'accountHash'];
    const missing = required.filter(key => !this.imagesConfig[key]);
    
    if (missing.length > 0) {
      console.warn(`Cloudflare Images: Variáveis faltando: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }

  /**
   * Valida configuração do R2
   */
  validateR2Config() {
    const required = ['accountId', 'accessKeyId', 'secretAccessKey'];
    const missing = required.filter(key => !this.r2Config[key]);
    
    if (missing.length > 0) {
      console.warn(`Cloudflare R2: Variáveis faltando: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }

  /**
   * Obtém URL pública para imagem
   */
  getPublicImageUrl(fileName, variant = null) {
    const baseUrl = this.imagesConfig.publicUrl;
    if (variant) {
      return `${baseUrl}/${fileName}/cdn-cgi/image/format=webp,quality=80/${variant}`;
    }
    return `${baseUrl}/${fileName}`;
  }

  /**
   * Obtém configuração completa
   */
  getConfig() {
    return {
      images: this.imagesConfig,
      r2: this.r2Config,
      cache: this.cacheConfig,
      imageProcessing: this.imageProcessingConfig
    };
  }

  /**
   * Obtém variáveis de ambiente necessárias
   */
  static getRequiredEnvVars() {
    return [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ACCOUNT_HASH',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET',
      'CLOUDFLARE_IMAGES_URL'
    ];
  }
}

export default new CloudflareConfig();
