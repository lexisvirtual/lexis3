/**
 * Image Processor
 * Processa, converte e otimiza imagens para WebP
 */

import fetch from 'node-fetch';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import imageCache from './imageCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../../public/images/blog');

class ImageProcessor {
  /**
   * Download de imagem de URL externa
   */
  async downloadImage(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      return await response.buffer();
    } catch (error) {
      console.error('Erro ao fazer download de imagem:', error.message);
      return null;
    }
  }

  /**
   * Converte imagem para WebP
   */
  async convertToWebP(imageBuffer, options = {}) {
    try {
      const defaultOptions = {
        quality: 80,
        effort: 6,
        ...options
      };

      const webpBuffer = await sharp(imageBuffer)
        .webp(defaultOptions)
        .toBuffer();

      return webpBuffer;
    } catch (error) {
      console.error('Erro ao converter para WebP:', error.message);
      return null;
    }
  }

  /**
   * Salva imagem localmente
   */
  async saveImage(imageBuffer, fileName) {
    try {
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }

      const filePath = path.join(IMAGES_DIR, fileName);
      fs.writeFileSync(filePath, imageBuffer);

      return {
        success: true,
        filePath: filePath,
        relativePath: `/public/images/blog/${fileName}`
      };
    } catch (error) {
      console.error('Erro ao salvar imagem:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa imagem completa: download -> conversão -> salvamento
   */
  async processImage(imageUrl, fileName = null) {
    try {
      // Verifica cache
      const cached = imageCache.get(imageUrl);
      if (cached) {
        return {
          success: true,
          cached: true,
          ...cached
        };
      }

      // Download
      const imageBuffer = await this.downloadImage(imageUrl);
      if (!imageBuffer) {
        throw new Error('Falha ao fazer download da imagem');
      }

      // Gera nome de arquivo se não fornecido
      if (!fileName) {
        const hash = crypto
          .createHash('md5')
          .update(imageUrl)
          .digest('hex');
        fileName = `${hash}.webp`;
      }

      // Conversão para WebP
      const webpBuffer = await this.convertToWebP(imageBuffer);
      if (!webpBuffer) {
        throw new Error('Falha ao converter para WebP');
      }

      // Salvamento
      const saveResult = await this.saveImage(webpBuffer, fileName);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }

      // Armazena em cache
      imageCache.set(
        imageUrl,
        saveResult.relativePath,
        saveResult.filePath,
        'processed'
      );

      return {
        success: true,
        cached: false,
        fileName: fileName,
        filePath: saveResult.filePath,
        relativePath: saveResult.relativePath,
        size: webpBuffer.length
      };
    } catch (error) {
      console.error('Erro ao processar imagem:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa múltiplas imagens em lote
   */
  async processImageBatch(imageUrls) {
    const results = [];
    for (const url of imageUrls) {
      const result = await this.processImage(url);
      results.push({
        url: url,
        ...result
      });
    }
    return results;
  }

  /**
   * Obtém informações de imagem local
   */
  getImageInfo(fileName) {
    try {
      const filePath = path.join(IMAGES_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      return {
        fileName: fileName,
        filePath: filePath,
        relativePath: `/public/images/blog/${fileName}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error.message);
      return null;
    }
  }
}

export default new ImageProcessor();
