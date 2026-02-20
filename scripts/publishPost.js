// Script para publicar um novo post no Lexis Academy
// Usa a API do Cloudflare Worker para adicionar um tópico à fila

const WORKER_URL = 'https://lexis-publisher.lexisvirtual.workers.dev';

async function publishPost() {
    // Tópico para o novo post
    const postData = {
        topic: 'Como melhorar a pronúncia em inglês: técnicas práticas',
        cluster: 'pronuncia',
        intent: 'informacional',
        type: 'evergreen',
        priority: 1
    };

    console.log('📝 Publicando novo post...');
    console.log('Tópico:', postData.topic);
    console.log('Cluster:', postData.cluster);
    console.log('');

    try {
        // Adicionar tópico à fila
        const response = await fetch(`${WORKER_URL}/add-topic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Post adicionado à fila com sucesso!');
            console.log('ID:', result.id);
            console.log('Status:', result.job.status);
            console.log('');
            console.log('📊 Dados do job:');
            console.log(JSON.stringify(result.job, null, 2));
            console.log('');
            console.log('⏳ O post será processado automaticamente pelo CRON job às 09:00 UTC');
            console.log('💡 Para processar imediatamente, execute: node scripts/processQueue.js');
        } else {
            console.error('❌ Erro ao adicionar post:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

publishPost();
