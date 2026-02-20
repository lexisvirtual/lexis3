#!/usr/bin/env node

/**
 * Script para baixar imagens do Pixabay, converter para WebP
 * e armazenar localmente como fallback seguro
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXABAY_API_KEY = '54644686-7efa1461402a91a56a1f92e8b';
const TEMP_DIR = path.join(__dirname, '..', '.temp-fallback');
const FALLBACK_IMAGES_DIR = path.join(__dirname, '..', 'public', 'fallback-images');

// Prompt simples e efetivo baseado em resultados do Pixabay
// "people talking" retorna 16.992 fotos de alta qualidade
// Pessoas conversando em diversos cenários profissionais e casuais
const FALLBACK_QUERY = 'people talking';

/**
 * Criar diretórios necessários
 */
function setupDirectories() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`✓ Diretório temporário criado: ${TEMP_DIR}`);
  }
  
  if (!fs.existsSync(FALLBACK_IMAGES_DIR)) {
    fs.mkdirSync(FALLBACK_IMAGES_DIR, { recursive: true });
    console.log(`✓ Diretório de fallback criado: ${FALLBACK_IMAGES_DIR}`);
  }
}

/**
 * Baixar imagem do Pixabay
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Converter imagem para WebP usando ImageMagick
 */
function convertToWebP(inputPath, outputPath) {
  try {
    // Tenta usar ImageMagick (convert command)
    execSync(`convert "${inputPath}" -quality 85 "${outputPath}"`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.warn(`⚠️ ImageMagick não disponível, tentando ffmpeg...`);
    try {
      execSync(`ffmpeg -i "${inputPath}" -q:v 5 "${outputPath}" -y`, { stdio: 'pipe' });
      return true;
    } catch (err2) {
      console.warn(`⚠️ ffmpeg também não disponível, usando imagem original`);
      return false;
    }
  }
}

/**
 * Buscar imagens do Pixabay
 */
function fetchPixabayImages(query) {
  return new Promise((resolve, reject) => {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20&safesearch=true&order=latest`;
    
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.hits && result.hits.length > 0) {
            resolve(result.hits);
          } else {
            reject(new Error(`Nenhuma imagem encontrada para: ${query}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Processar e salvar imagens
 */
async function processImages() {
  try {
    setupDirectories();
    
    console.log('\n🔄 Buscando imagens do Pixabay com prompt profissional...');
    console.log(`🎨 Query: ${FALLBACK_QUERY}`);
    const images = await fetchPixabayImages(FALLBACK_QUERY);
    
    console.log(`📥 Processando ${Math.min(10, images.length)} imagens...`);
    
    const processedImages = [];
    let successCount = 0;
    
    for (let i = 0; i < Math.min(10, images.length); i++) {
      const image = images[i];
      const tempFile = path.join(TEMP_DIR, `temp-${i}.jpg`);
      const webpFile = path.join(FALLBACK_IMAGES_DIR, `fallback-${String(i + 1).padStart(2, '0')}.webp`);
      const jpgFile = path.join(FALLBACK_IMAGES_DIR, `fallback-${String(i + 1).padStart(2, '0')}.jpg`);
      
      try {
        // Baixar imagem
        await downloadImage(image.webformatURL, tempFile);
        console.log(`  ✓ Baixado: fallback-${String(i + 1).padStart(2, '0')}`);
        
        // Tentar converter para WebP
        const converted = convertToWebP(tempFile, webpFile);
        
        if (converted) {
          // Se converteu, usar WebP
          fs.unlinkSync(tempFile);
          processedImages.push({
            id: `fallback-${String(i + 1).padStart(2, '0')}`,
            url: `/fallback-images/fallback-${String(i + 1).padStart(2, '0')}.webp`,
            format: 'webp',
            source: image.pageURL
          });
          console.log(`  ✓ Convertido para WebP`);
        } else {
          // Se não converteu, usar JPG original
          fs.renameSync(tempFile, jpgFile);
          processedImages.push({
            id: `fallback-${String(i + 1).padStart(2, '0')}`,
            url: `/fallback-images/fallback-${String(i + 1).padStart(2, '0')}.jpg`,
            format: 'jpg',
            source: image.pageURL
          });
          console.log(`  ✓ Salvo como JPG`);
        }
        
        successCount++;
      } catch (err) {
        console.error(`  ❌ Erro ao processar imagem ${i + 1}: ${err.message}`);
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }
    
    // Limpar diretório temporário
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true });
    }
    
    // Salvar metadados
    const metadata = {
      timestamp: new Date().toISOString(),
      totalImages: successCount,
      images: processedImages,
      query: FALLBACK_QUERY
    };
    
    fs.writeFileSync(
      path.join(FALLBACK_IMAGES_DIR, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`\n✅ ${successCount} imagens processadas com sucesso!`);
    console.log(`📁 Localização: ${FALLBACK_IMAGES_DIR}`);
    console.log(`📊 Metadados salvos em: metadata.json`);
    
    return processedImages;
  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

// Executar
await processImages();
