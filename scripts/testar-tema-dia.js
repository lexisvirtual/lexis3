// Script para Testar Geração de Artigo do Tema do Dia
// Uso: node scripts/testar-tema-dia.js [dia]

import { getTema, getTemaDoAno } from '../worker/src/temas365.js';

const WORKER_URL = 'https://lexis-publisher.aderval.workers.dev';

async function testarTema() {
  const diaArg = process.argv[2];
  const tema = diaArg ? getTema(parseInt(diaArg)) : getTemaDoAno();
  
  console.log('🎯 Tema selecionado:');
  console.log(`   Dia: ${tema.dia}`);
  console.log(`   Categoria: ${tema.categoria}`);
  console.log(`   Tópico: ${tema.topic}`);
  console.log(`   Cluster: ${tema.cluster}`);
  console.log(`   Nível: ${tema.nivel}`);
  console.log(`   Intent: ${tema.intent}`);
  
  console.log('\n🚀 Adicionando à fila...');
  
  const response = await fetch(`${WORKER_URL}/add-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: tema.topic,
      cluster: tema.cluster,
      intent: tema.intent,
      type: 'evergreen',
      priority: 1
    })
  });
  
  const result = await response.json();
  console.log('\n✅ Adicionado à fila:', result);
  
  console.log('\n⏳ Processando artigo (isso pode levar 1-2 minutos)...');
  
  const processResponse = await fetch(`${WORKER_URL}/process-queue`);
  const processResult = await processResponse.json();
  
  if (processResult.success) {
    console.log('\n✅ Artigo gerado com sucesso!');
    console.log(`   Título: ${processResult.title}`);
    console.log(`   Slug: ${processResult.slug}`);
    console.log(`   URL: https://lexis.academy/blog/${processResult.slug}`);
    console.log(`   Imagem: ${processResult.image_url}`);
  } else {
    console.log('\n❌ Erro ao gerar artigo:');
    console.log(processResult);
  }
}

testarTema().catch(console.error);
