// Teste Final - Pixabay API
// Testa todas as categorias para verificar se está funcionando

const PIXABAY_API_KEY = '54644686-7efa1461402a91a56a1f92e8b'; // Substitua pela sua chave de API do Pixabay7efa1461402a91a56a1f92e8b

const CLUSTER_QUERIES = {
  business: 'business meeting office',
  viagem: 'travel destination vacation',
  estudo: 'study learning education',
  mindset: 'motivation success mindset',
  default: 'professional workspace'
};

async function testPixabayCategory(category, query) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testando categoria: ${category.toUpperCase()}`);
  console.log(`Query: "${query}"`);
  console.log('='.repeat(60));
  
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`;
    
    console.log(`\nURL: ${url.replace(PIXABAY_API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`\n❌ ERRO: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    console.log(`\n✅ SUCESSO!`);
    console.log(`Total de imagens encontradas: ${data.totalHits}`);
    console.log(`Imagens retornadas: ${data.hits?.length || 0}`);
    
    if (data.hits && data.hits.length > 0) {
      const firstImage = data.hits[0];
      console.log(`\nPrimeira imagem:`);
      console.log(`  - ID: ${firstImage.id}`);
      console.log(`  - URL: ${firstImage.largeImageURL}`);
      console.log(`  - Tags: ${firstImage.tags}`);
      console.log(`  - User: ${firstImage.user}`);
      return true;
    } else {
      console.log(`\n⚠️ Nenhuma imagem encontrada para esta query`);
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ ERRO: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n');
  console.log('█'.repeat(70));
  console.log('  TESTE FINAL - PIXABAY API');
  console.log('  Verificando se todas as categorias estão funcionando');
  console.log('█'.repeat(70));
  
  const results = {};
  
  for (const [category, query] of Object.entries(CLUSTER_QUERIES)) {
    results[category] = await testPixabayCategory(category, query);
    // Aguardar 1 segundo entre requisições para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Resumo final
  console.log('\n');
  console.log('█'.repeat(70));
  console.log('  RESUMO FINAL');
  console.log('█'.repeat(70));
  
  let successCount = 0;
  for (const [category, success] of Object.entries(results)) {
    const status = success ? '✅ SUCESSO' : '❌ FALHOU';
    console.log(`  ${category.toUpperCase().padEnd(15)} - ${status}`);
    if (success) successCount++;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`  RESULTADO: ${successCount}/${Object.keys(results).length} categorias funcionando`);
  
  if (successCount === Object.keys(results).length) {
    console.log('\n  🎉 PERFEITO! Todas as categorias estão funcionando!');
    console.log('  O sistema Pixabay está 100% operacional!');
  } else if (successCount > 0) {
    console.log('\n  ⚠️ ATENÇÃO: Algumas categorias falharam.');
    console.log('  Pode ser rate limiting ou problema com queries específicas.');
  } else {
    console.log('\n  ❌ PROBLEMA: Nenhuma categoria funcionou.');
    console.log('  Verificar API key ou status da conta Pixabay.');
  }
  console.log('='.repeat(70));
  console.log('\n');
}

runTests();
