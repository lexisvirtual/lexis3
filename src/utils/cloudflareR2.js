/**
 * Cloudflare R2 Integration
 * Gerencia upload e transformação de imagens no Cloudflare R2
 */

import fetch from 'node-fetch';

class CloudflareR2 {
  constructor(accountId, accessKeyId, secretAccessKey, bucketName = 'lexis-images') {
    this.accountId = accountId;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucketName = bucketName;
    this.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    this.publicUrl = `https://cdn.lexis.academy`; // Configurar com domínio real
  }

  /**
   * Faz upload de arquivo para R2
   */
  async uploadFile(filePath, fileName, fileBuffer) {
    try {
      const url = `${this.endpoint}/${this.bucketName}/${fileName}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}`,
          'Content-Type': 'image/webp'
        },
        body: fileBuffer
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return {
        success: true,
        fileName: fileName,
        publicUrl: `${this.publicUrl}/${fileName}`,
        r2Url: `${this.endpoint}/${this.bucketName}/${fileName}`
      };
    } catch (error) {
      console.error('Erro ao fazer upload para R2:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera URL pública para imagem no R2
   */
  getPublicUrl(fileName) {
    return `${this.publicUrl}/${fileName}`;
  }

  /**
   * Gera nome de arquivo único baseado em hash
   */
  generateFileName(originalUrl, extension = 'webp') {
    const hash = require('crypto')
      .createHash('md5')
      .update(originalUrl)
      .digest('hex');
    return `blog/${hash}.${extension}`;
  }
}

export default CloudflareR2;
