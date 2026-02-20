/**
 * Script de teste para Image Cache
 */

import imageCache from '../src/utils/imageCache.js';
import imageProcessor from '../src/utils/imageProcessor.js';

async function runTests() {
  console.log('\n=== Iniciando testes de Image Cache ===\n');

  // Teste 1: Adicionar entrada ao cache
  console.log('Teste 1: Adicionar entrada ao cache');
  const testUrl = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80';
  imageCache.set(
    testUrl,
    'https://cdn.lexis.academy/blog/abc123.webp',
    '/public/images/blog/abc123.webp',
    'unsplash'
  );
  console.log('✓ Entrada adicionada ao cache\n');

  // Teste 2: Recuperar entrada do cache
  console.log('Teste 2: Recuperar entrada do cache');
  const cached = imageCache.get(testUrl);
  if (cached) {
    console.log('✓ Entrada recuperada:', cached);
  } else {
    console.log('✗ Falha ao recuperar entrada');
  }
  console.log();

  // Teste 3: Normalização de URL
  console.log('Teste 3: Normalização de URL');
  const urlWithParams = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=60';
  const cached2 = imageCache.get(urlWithParams);
  if (cached2) {
    console.log('✓ URL com parâmetros diferentes encontrada no cache (normalização funcionando)');
  } else {
    console.log('✗ Normalização não funcionou como esperado');
  }
  console.log();

  // Teste 4: Adicionar múltiplas entradas
  console.log('Teste 4: Adicionar múltiplas entradas');
  const urls = [
    'https://images.unsplash.com/photo-1234567890123-456789012345',
    'https://images.unsplash.com/photo-2345678901234-567890123456',
    'https://images.unsplash.com/photo-3456789012345-678901234567'
  ];
  
  urls.forEach((url, index) => {
    imageCache.set(
      url,
      `https://cdn.lexis.academy/blog/img${index}.webp`,
      `/public/images/blog/img${index}.webp`,
      'unsplash'
    );
  });
  console.log(`✓ ${urls.length} entradas adicionadas ao cache\n`);

  // Teste 5: Obter estatísticas
  console.log('Teste 5: Obter estatísticas do cache');
  const stats = imageCache.getStats();
  console.log('Estatísticas:', stats);
  console.log();

  // Teste 6: Obter todas as entradas
  console.log('Teste 6: Obter todas as entradas');
  const allEntries = imageCache.getAll();
  console.log(`Total de entradas: ${Object.keys(allEntries).length}`);
  console.log();

  // Teste 7: Remover entrada
  console.log('Teste 7: Remover entrada');
  imageCache.remove(testUrl);
  const removed = imageCache.get(testUrl);
  if (!removed) {
    console.log('✓ Entrada removida com sucesso\n');
  } else {
    console.log('✗ Falha ao remover entrada\n');
  }

  console.log('=== Testes concluídos ===\n');
}

runTests().catch(console.error);
