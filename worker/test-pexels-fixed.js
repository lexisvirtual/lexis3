// Teste CORRIGIDO da integração Pexels API
// Formato correto: Authorization: YOUR_API_KEY (sem "Bearer")

const PEXELS_API_KEY = 'n7ElvtAOKtbzcGzknBVD0Q0oLMZ9NPuk3JnVHt6wp03pgVW9wc74TROk';

const CLUSTER_QUERIES = {
  business: 'business meeting office',
  viagem: 'travel destination adventure',
  estudo: 'study learning education',
  mindset: 'motivation success mindset',
  default: 'professional workspace'
};

async function getPexelsImage(query) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    
    console.log(`\n🔍 Buscando: "${query}"`);
    console.log(`🌐 URL: ${url}`);
    
    // FORMATO CORRETO: Authorization: API_KEY (sem Bearer!)
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY  // Formato correto!
      }
    });
    
    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erro: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    const imageUrl = data.photos?.[0]?.src?.large;
    
    if (imageUrl) {
      console.log(`✅ SUCESSO! URL: ${imageUrl}`);
      console.log(`📸 Photographer: ${data.photos[0].photographer}`);
      console.log(`🆔 ID: ${data.photos[0].id}`);
      console.log(`📎 Link: ${data.photos[0].url}`);
    } else {
      console.log(`⚠️ Nenhuma imagem encontrada`);
    }
    
    return imageUrl;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return null;
  }
}

async function testAllCategories() {
  console.log('\n🎯 TESTE PEXELS API - FORMATO CORRIGIDO\n');
  console.log('='.repeat(70));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [cluster, query] of Object.entries(CLUSTER_QUERIES)) {
    console.log(`\n📌 Categoria: ${cluster.toUpperCase()}`);
    const result = await getPexelsImage(query);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    console.log('-'.repeat(70));
  }
  
  console.log(`\n📊 RESULTADO FINAL:`);
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
  console.log('\n' + (successCount === 5 ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️ Alguns testes falharam'));
}

testAllCategories();
