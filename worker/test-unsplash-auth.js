// Teste detalhado de autenticação Unsplash
// Verificar se o problema é a chave ou o formato da requisição

const ACCESS_KEY = 'qMQTTHCD80yz4EPtYQcJ4B8HS1BwZ2UMiASUPB5i2oI';

// Teste 1: Endpoint público (sem autenticação)
async function testPublicEndpoint() {
  console.log('\n🔍 TESTE 1: Endpoint Público (sem auth)');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://api.unsplash.com/';
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    const data = await response.text();
    console.log('Resposta:', data.substring(0, 200));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Teste 2: Busca com Access Key no header (método correto)
async function testWithAuthHeader() {
  console.log('\n🔍 TESTE 2: Com Authorization Header');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://api.unsplash.com/photos/random?query=english&count=1';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${ACCESS_KEY}`
      }
    });
    
    console.log('URL:', url);
    console.log('Status:', response.status);
    console.log('Headers Resposta:');
    console.log('  X-Ratelimit-Limit:', response.headers.get('X-Ratelimit-Limit'));
    console.log('  X-Ratelimit-Remaining:', response.headers.get('X-Ratelimit-Remaining'));
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCESSO!');
      if (Array.isArray(data)) {
        console.log('Imagem URL:', data[0]?.urls?.regular);
        console.log('Descrição:', data[0]?.description || data[0]?.alt_description);
      } else {
        console.log('Imagem URL:', data?.urls?.regular);
        console.log('Descrição:', data?.description || data?.alt_description);
      }
    } else {
      console.log('❌ ERRO:', data);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Teste 3: Busca com client_id na URL (método alternativo)
async function testWithClientIdParam() {
  console.log('\n🔍 TESTE 3: Com client_id na URL');
  console.log('=' .repeat(60));
  
  try {
    const url = `https://api.unsplash.com/photos/random?query=english&count=1&client_id=${ACCESS_KEY}`;
    const response = await fetch(url);
    
    console.log('Status:', response.status);
    console.log('Headers Resposta:');
    console.log('  X-Ratelimit-Limit:', response.headers.get('X-Ratelimit-Limit'));
    console.log('  X-Ratelimit-Remaining:', response.headers.get('X-Ratelimit-Remaining'));
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCESSO!');
      if (Array.isArray(data)) {
        console.log('Imagem URL:', data[0]?.urls?.regular);
        console.log('Descrição:', data[0]?.description || data[0]?.alt_description);
      } else {
        console.log('Imagem URL:', data?.urls?.regular);
        console.log('Descrição:', data?.description || data?.alt_description);
      }
    } else {
      console.log('❌ ERRO:', data);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Teste 4: Verificar se a chave está válida
async function testKeyValidity() {
  console.log('\n🔍 TESTE 4: Validação da Chave');
  console.log('=' .repeat(60));
  console.log('Access Key:', ACCESS_KEY);
  console.log('Tamanho:', ACCESS_KEY.length, 'caracteres');
  console.log('Formato válido:', /^[A-Za-z0-9_-]+$/.test(ACCESS_KEY) ? '✅' : '❌');
}

// Executar todos os testes
async function runAllTests() {
  console.log('\n🚀 DIAGNÓSTICO COMPLETO - UNSPLASH API');
  console.log('=' .repeat(60));
  console.log('Data:', new Date().toISOString());
  
  await testKeyValidity();
  await testPublicEndpoint();
  await testWithAuthHeader();
  await testWithClientIdParam();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Testes concluídos!');
}

runAllTests();
