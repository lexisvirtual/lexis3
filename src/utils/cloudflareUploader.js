/**
 * Cloudflare Images Uploader
 * Gerencia upload de imagens para Cloudflare Images
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import cloudflareConfig from './cloudflareConfig.js';
import imageCache from './imageCache.js';

class CloudflareUploader {
  constructor() {
    this.config = cloudflareConfig.imagesConfig;
    this.apiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`;
  }

  /**
   * Faz upload de arquivo para Cloudflare Images
   */
  async uploadFile(filePath, fileName, metadata = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      
      form.append('file', fileBuffer, fileName);
      
      if (metadata.title) {
        form.append('metadata', JSON.stringify({ title: metadata.title }));
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: form
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.errors?.[0]?.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const imageData = result.result;
        return {
          success: true,
          id: imageData.id,
          fileName: fileName,
          url: `${this.config.publicUrl}/${imageData.id}`,
          variants: imageData.variants,
          uploadedAt: new Date().toISOString()
        };
      } else {
        throw new Error('Upload não foi bem-sucedido');
      }
    } catch (error) {
      console.error('Erro ao fazer upload para Cloudflare Images:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Faz upload de buffer para Cloudflare Images
   */
  async uploadBuffer(fileBuffer, fileName, metadata = {}) {
    try {
      const form = new FormData();
      form.append('file', fileBuffer, fileName);
      
      if (metadata.title) {
        form.append('metadata', JSON.stringify({ title: metadata.title }));
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: form
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.errors?.[0]?.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const imageData = result.result;
        return {
          success: true,
          id: imageData.id,
          fileName: fileName,
          url: `${this.config.publicUrl}/${imageData.id}`,
          variants: imageData.variants,
          uploadedAt: new Date().toISOString()
        };
      } else {
        throw new Error('Upload não foi bem-sucedido');
      }
    } catch (error) {
      console.error('Erro ao fazer upload para Cloudflare Images:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Faz upload em lote
   */
  async uploadBatch(files) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file.path, file.name, file.metadata);
      results.push(result);
    }
    return results;
  }

  /**
   * Deleta imagem do Cloudflare Images
   */
  async deleteImage(imageId) {
    try {
      const response = await fetch(`${this.apiUrl}/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return {
        success: true,
        imageId: imageId
      };
    } catch (error) {
      console.error('Erro ao deletar imagem:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lista imagens no Cloudflare Images
   */
  async listImages(limit = 100) {
    try {
      const response = await fetch(`${this.apiUrl}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          images: result.result.images,
          pagination: result.result.pagination
        };
      } else {
        throw new Error('Falha ao listar imagens');
      }
    } catch (error) {
      console.error('Erro ao listar imagens:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém informações de uma imagem
   */
  async getImageInfo(imageId) {
    try {
      const response = await fetch(`${this.apiUrl}/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          image: result.result
        };
      } else {
        throw new Error('Falha ao obter informações da imagem');
      }
    } catch (error) {
      console.error('Erro ao obter informações da imagem:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new CloudflareUploader();
