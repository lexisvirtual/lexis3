// Teste de integração com Unsplash API
const UNSPLASH_ACCESS_KEY = 'qMQTTHCD80yz4EPtYQcJ4B8HS1BwZ2UMiASUPB5i2oI';

async function testUnsplash() {
  console.log('🧪 Testando integração com Unsplash API...\n');
  
  const queries = {
    business: 'business professional office',
    viagem: 'travel adventure world',
    estudo: 'study learning education',
    mindset: 'motivation mindfulness meditation',
    default: 'english learning language'
  };
  
  for (const [cluster, query] of Object.entries(queries)) {
    try {
      console.log(`📸 Testando categoria: ${cluster}`);
      console.log(`   Query: "${query}"`);
      
      const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`   ❌ Erro HTTP: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`   ✅ Sucesso!`);
      console.log(`   URL: ${data.urls.regular}`);
      console.log(`   Autor: ${data.user.name}`);
      console.log(`   Descrição: ${data.description || data.alt_description || 'N/A'}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }
  
  console.log('✅ Teste concluído!');
}

testUnsplash();
