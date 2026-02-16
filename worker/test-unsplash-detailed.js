// Teste detalhado de integração com Unsplash API
const UNSPLASH_ACCESS_KEY = 'qMQTTHCD80yz4EPtYQcJ4B8HS1BwZ2UMiASUPB5i2oI';

async function testUnsplashDetailed() {
  console.log('🔍 Teste Detalhado - Unsplash API\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const query = 'english learning language';
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`;
  
  console.log('📋 Configuração:');
  console.log(`   Access Key: ${UNSPLASH_ACCESS_KEY.substring(0, 10)}...`);
  console.log(`   Query: "${query}"`);
  console.log(`   URL: ${url.substring(0, 80)}...\n`);
  
  try {
    console.log('🚀 Enviando requisição...\n');
    
    const response = await fetch(url);
    
    console.log('📥 Resposta recebida:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`);
    console.log(`      Content-Type: ${response.headers.get('content-type')}`);
    console.log(`      X-Ratelimit-Limit: ${response.headers.get('x-ratelimit-limit')}`);
    console.log(`      X-Ratelimit-Remaining: ${response.headers.get('x-ratelimit-remaining')}`);
    console.log('');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ERRO NA REQUISIÇÃO:');
      console.log(`   Resposta: ${errorText}\n`);
      
      if (response.status === 401) {
        console.log('💡 Possíveis causas do erro 401:');
        console.log('   1. A aplicação está em modo Demo (limitações)');
        console.log('   2. A chave precisa ser aprovada para produção');
        console.log('   3. A chave pode estar inválida ou expirada');
        console.log('   4. Falta de permissões na aplicação\n');
        console.log('🔧 Solução: Aplicar para modo Production no Unsplash');
        console.log('   Link: https://unsplash.com/oauth/applications/868398\n');
      }
      
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ SUCESSO!');
    console.log(`   ID: ${data.id}`);
    console.log(`   URL Regular: ${data.urls.regular}`);
    console.log(`   URL Small: ${data.urls.small}`);
    console.log(`   Autor: ${data.user.name} (@${data.user.username})`);
    console.log(`   Descrição: ${data.description || data.alt_description || 'N/A'}`);
    console.log(`   Largura: ${data.width}px`);
    console.log(`   Altura: ${data.height}px`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ ERRO DE REDE: ${error.message}\n`);
  }
  
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Teste concluído!');
}

testUnsplashDetailed();
