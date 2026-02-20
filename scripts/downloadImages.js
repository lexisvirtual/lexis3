/**
 * Script de Download de Imagens
 * Faz download de todas as imagens do fallback pool e as converte para WebP
 */

import imageProcessor from '../src/utils/imageProcessor.js';
import imageCache from '../src/utils/imageCache.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs do fallback pool (do worker)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f70504504?w=1200&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
];

async function downloadAllImages() {
  console.log('\n=== Iniciando download de imagens ===\n');
  console.log(`Total de imagens para processar: ${FALLBACK_IMAGES.length}`);
  console.log('Removendo duplicatas...');

  // Remove duplicatas
  const uniqueUrls = [...new Set(FALLBACK_IMAGES)];
  console.log(`Imagens únicas: ${uniqueUrls.length}\n`);

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    console.log(`[${i + 1}/${uniqueUrls.length}] Processando: ${url.substring(0, 60)}...`);

    const result = await imageProcessor.processImage(url);
    
    if (result.success) {
      successCount++;
      console.log(`  ✓ Sucesso - Tamanho: ${(result.size / 1024).toFixed(2)}KB`);
      results.push({
        url: url,
        status: 'success',
        fileName: result.fileName,
        size: result.size,
        cached: result.cached
      });
    } else {
      failureCount++;
      console.log(`  ✗ Erro: ${result.error}`);
      results.push({
        url: url,
        status: 'failed',
        error: result.error
      });
    }
  }

  // Resumo
  console.log('\n=== Resumo do Download ===');
  console.log(`Total processado: ${uniqueUrls.length}`);
  console.log(`✓ Sucesso: ${successCount}`);
  console.log(`✗ Falhas: ${failureCount}`);
  console.log(`Taxa de sucesso: ${((successCount / uniqueUrls.length) * 100).toFixed(2)}%`);

  // Estatísticas do cache
  const stats = imageCache.getStats();
  console.log('\n=== Estatísticas do Cache ===');
  console.log(`Total em cache: ${stats.total}`);
  console.log(`Fontes: ${JSON.stringify(stats.sources)}`);
  console.log(`Arquivo de cache: ${stats.cacheFile}`);

  // Salva relatório
  const reportPath = path.join(__dirname, '../.cache/download-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: uniqueUrls.length,
      success: successCount,
      failed: failureCount,
      successRate: ((successCount / uniqueUrls.length) * 100).toFixed(2) + '%'
    },
    results: results
  };

  const cacheDir = path.dirname(reportPath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nRelatório salvo em: ${reportPath}`);

  console.log('\n=== Download concluído ===\n');
}

downloadAllImages().catch(console.error);
