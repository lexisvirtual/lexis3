// Script para Popular Fila com 365 Temas Únicos
// Uso: node scripts/popular-365-temas.js

import { TEMAS_365 } from '../worker/src/temas365.js';

const WORKER_URL = 'https://lexis-publisher.aderval.workers.dev';

async function popularFila() {
  console.log('🚀 Iniciando população da fila com 365 temas únicos...');
  
  // 1. Limpar fila atual
  console.log('\n🧹 Limpando fila atual...');
  const purgeResponse = await fetch(`${WORKER_URL}/purge`);
  console.log(await purgeResponse.text());
  
  // 2. Adicionar todos os 365 temas
  console.log('\n📝 Adicionando 365 temas...');
  let sucessos = 0;
  let erros = 0;
  
  for (let i = 0; i < TEMAS_365.length; i++) {
    const tema = TEMAS_365[i];
    
    try {
      const response = await fetch(`${WORKER_URL}/add-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: tema.topic,
          cluster: tema.cluster,
          intent: tema.intent,
          type: 'evergreen',
          priority: tema.dia
        })
      });
      
      if (response.ok) {
        sucessos++;
        if (sucessos % 50 === 0) {
          console.log(`  ✅ ${sucessos} temas adicionados...`);
        }
      } else {
        erros++;
        console.error(`  ❌ Erro no tema ${tema.dia}: ${tema.topic}`);
      }
    } catch (error) {
      erros++;
      console.error(`  ❌ Erro no tema ${tema.dia}: ${error.message}`);
    }
    
    // Pequeno delay para não sobrecarregar
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n✅ Concluído!`);
  console.log(`   Sucessos: ${sucessos}`);
  console.log(`   Erros: ${erros}`);
  console.log(`   Total: ${TEMAS_365.length}`);
  
  // 3. Verificar fila
  console.log('\n🔍 Verificando fila...');
  const queueResponse = await fetch(`${WORKER_URL}/queue?limit=5`);
  const queue = await queueResponse.json();
  console.log(`\nPrimeiros 5 itens da fila:`);
  console.log(JSON.stringify(queue, null, 2));
}

popularFila().catch(console.error);
