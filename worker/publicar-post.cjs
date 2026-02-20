// Script para publicar o primeiro post
const https = require('node:https');

// URL do worker em produção (precisa estar deployado)
const WORKER_URL = 'https://lexis-publisher.lexis-english-account.workers.dev';

async function addTopic() {
  console.log('📝 Adicionando pauta...');
  
  const data = JSON.stringify({
    topic: "Como Falar Inglês em Reuniões de Trabalho: Frases Essenciais",
    cluster: "negocios",
    intent: "dor"
  });

  const options = {
    hostname: 'lexis-publisher.lexis-english-account.workers.dev',
    path: '/add-topic',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('✅ Pauta adicionada:', body);
        resolve(JSON.parse(body));
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function processQueue() {
  console.log('\n🚀 Processando fila...');
  
  const options = {
    hostname: 'lexis-publisher.lexis-english-account.workers.dev',
    path: '/process-queue',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('✅ Resposta:', body);
        resolve(body);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    // 1. Adicionar pauta
    await addTopic();
    
    // 2. Aguardar 2 segundos
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Processar fila
    await processQueue();
    
    console.log('\n🎉 Concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
