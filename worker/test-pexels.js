// Teste da integração Pexels API

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
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
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
      console.log(`✅ Sucesso! URL: ${imageUrl.substring(0, 80)}...`);
      console.log(`📸 Photographer: ${data.photos[0].photographer}`);
      console.log(`🆔 ID: ${data.photos[0].id}`);
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
  console.log('\n🎯 TESTE PEXELS API - Todas as Categorias\n');
  console.log('='.repeat(60));
  
  for (const [cluster, query] of Object.entries(CLUSTER_QUERIES)) {
    console.log(`\n📌 Categoria: ${cluster.toUpperCase()}`);
    await getPexelsImage(query);
    console.log('-'.repeat(60));
  }
  
  console.log('\n✅ TESTE COMPLETO!\n');
}

testAllCategories();
