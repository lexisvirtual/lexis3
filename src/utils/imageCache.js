/**
 * Image Cache Manager
 * Gerencia cache local de URLs de imagens e mapeamento para CDN próprio
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para arquivo de cache
const CACHE_DIR = path.join(__dirname, '../../.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'image-cache.json');

/**
 * Estrutura do cache:
 * {
 *   "original_url": {
 *     "cloudflare_url": "https://cdn.example.com/image.webp",
 *     "local_path": "/public/images/blog/image.webp",
 *     "timestamp": 1234567890,
 *     "source": "unsplash|pixabay|local"
 *   }
 * }
 */

class ImageCache {
  constructor() {
    this.cache = this.loadCache();
  }

  /**
   * Carrega cache do arquivo
   */
  loadCache() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Erro ao carregar cache de imagens:', error.message);
    }
    return {};
  }

  /**
   * Salva cache no arquivo
   */
  saveCache() {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Erro ao salvar cache de imagens:', error.message);
    }
  }

  /**
   * Obtém URL em cache ou retorna null
   */
  get(originalUrl) {
    if (!originalUrl) return null;
    
    const normalized = this.normalizeUrl(originalUrl);
    return this.cache[normalized] || null;
  }

  /**
   * Armazena mapeamento de imagem em cache
   */
  set(originalUrl, cloudflareUrl, localPath, source = 'external') {
    if (!originalUrl) return;

    const normalized = this.normalizeUrl(originalUrl);
    this.cache[normalized] = {
      cloudflare_url: cloudflareUrl,
      local_path: localPath,
      timestamp: Date.now(),
      source: source
    };

    this.saveCache();
  }

  /**
   * Normaliza URL para uso como chave
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove parâmetros de query para normalizar
      return urlObj.origin + urlObj.pathname;
    } catch {
      // Se não for URL válida, usa como está
      return url.toLowerCase().trim();
    }
  }

  /**
   * Obtém todas as URLs em cache
   */
  getAll() {
    return this.cache;
  }

  /**
   * Limpa cache
   */
  clear() {
    this.cache = {};
    this.saveCache();
  }

  /**
   * Remove entrada específica do cache
   */
  remove(originalUrl) {
    const normalized = this.normalizeUrl(originalUrl);
    delete this.cache[normalized];
    this.saveCache();
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const entries = Object.entries(this.cache);
    const sources = {};
    
    entries.forEach(([_, data]) => {
      sources[data.source] = (sources[data.source] || 0) + 1;
    });

    return {
      total: entries.length,
      sources: sources,
      cacheFile: CACHE_FILE
    };
  }
}

// Exporta singleton
export default new ImageCache();
