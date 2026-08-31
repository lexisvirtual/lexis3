// Teste Completo - Simula geração de post com imagem
// Pixabay requer per_page entre 3 e 200

const CATEGORIES = ['business', 'viagem', 'estudo', 'mindset', 'default'];

const QUERIES = {
  business: 'business meeting office',
  viagem: 'travel destination vacation',
  estudo: 'study learning education',
  mindset: 'motivation success mindset',
  default: 'professional workspace'
};

const API_KEY = '54644686-7efa1461402a91a56a1f92e8b';

async function testCompleteFlow() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTE COMPLETO - Simulação de Geração de Post');
  console.log('='.repeat(70) + '\n');

  for (const category of CATEGORIES) {
    console.log(`\n📝 POST: "Como melhorar seu inglês - ${category}"`.toUpperCase());
    console.log(`📁 Categoria: ${category}`);
    console.log(`🔍 Query Pixabay: "${QUERIES[category]}"\n`);

    try {
      const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(QUERIES[category])}&image_type=photo&orientation=horizontal&per_page=3`;
      
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        
        if (data.hits && data.hits.length > 0) {
          const image = data.hits[0];
          
          console.log('✅ IMAGEM ENCONTRADA!');
          console.log(`   URL: ${image.largeImageURL}`);
          console.log(`   Tags: ${image.tags}`);
          console.log(`\n📄 Post seria criado com:`);
          console.log(`   ---`);
          console.log(`   title: "Como melhorar seu inglês - ${category}"`);
          console.log(`   image: "${image.largeImageURL}"`);
          console.log(`   cluster: "${category}"`);
          console.log(`   ---`);
        } else {
          console.log('❌ Nenhuma imagem encontrada');
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro ${response.status}: ${response.statusText}`);
        console.log(`   Detalhes: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉 TESTE COMPLETO FINALIZADO');
  console.log('='.repeat(70) + '\n');
}

testCompleteFlow().catch(console.error);
