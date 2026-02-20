const https = require('https');

https.get('https://lexis-publisher.lexis-english-account.workers.dev/queue', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const jobs = JSON.parse(data);
      console.log('\n=== FILA DE TEMAS ===\n');
      jobs.slice(0, 5).forEach((job, index) => {
        console.log(`${index + 1}. ${job.topic}`);
        console.log(`   Cluster: ${job.cluster}`);
        console.log(`   Intent: ${job.intent}`);
        console.log(`   Status: ${job.status}\n`);
      });
    } catch (e) {
      console.error('Erro ao parsear resposta:', e.message);
      console.log('Resposta bruta:', data);
    }
  });
}).on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});
