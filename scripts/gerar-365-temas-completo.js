// Script para Gerar Lista Completa de 365 Temas usando IA
// Uso: node scripts/gerar-365-temas-completo.js

const CATEGORIAS = [
  {
    nome: "Vocabulário Temático",
    quantidade: 40,
    descricao: "Vocabulário específico por área profissional ou tema",
    exemplos: ["Negócios", "Médico", "Tecnologia", "Marketing", "Finanças", "Aviação", "Hotelaria", "Gastronomia"]
  },
  {
    nome: "Gramática Prática",
    quantidade: 35,
    descricao: "Gramática aplicada com foco em uso real",
    exemplos: ["Tempos verbais", "Modais", "Phrasal verbs", "Preposições", "Conditionals", "Passive voice"]
  },
  {
    nome: "Pronúncia e Fonética",
    quantidade: 30,
    descricao: "Sons, ritmo, entonação e sotaques",
    exemplos: ["Sons difíceis", "Word stress", "Intonation", "Connected speech", "Sotaques"]
  },
  {
    nome: "Expressões e Idioms",
    quantidade: 40,
    descricao: "Idioms, phrasal verbs e expressões idiomáticas",
    exemplos: ["Idioms com animais", "Phrasal verbs por verbo", "Slang moderno", "Expressões de negócios"]
  },
  {
    nome: "Situações do Dia a Dia",
    quantidade: 35,
    descricao: "Situações práticas e conversas reais",
    exemplos: ["Aeroporto", "Hotel", "Restaurante", "Médico", "Banco", "Entrevista", "Reunião"]
  },
  {
    nome: "Erros Comuns de Brasileiros",
    quantidade: 30,
    descricao: "Erros típicos e como corrigi-los",
    exemplos: ["False friends", "Preposições", "Verbos", "Artigos", "Plural"]
  },
  {
    nome: "Preparação para Exames",
    quantidade: 25,
    descricao: "TOEFL, IELTS, Cambridge e outros exames",
    exemplos: ["TOEFL sections", "IELTS strategies", "Cambridge exams", "Essay writing"]
  },
  {
    nome: "Cultura e Curiosidades",
    quantidade: 30,
    descricao: "Diferenças culturais e curiosidades",
    exemplos: ["EUA vs Brasil", "UK vs Brasil", "Holidays", "British vs American English", "Etiqueta"]
  },
  {
    nome: "Inglês para Negócios",
    quantidade: 30,
    descricao: "Inglês corporativo e profissional",
    exemplos: ["Emails", "Reuniões", "Apresentações", "Negociação", "Networking"]
  },
  {
    nome: "Tecnologia e Métodos",
    quantidade: 25,
    descricao: "Apps, técnicas e métodos de estudo",
    exemplos: ["Apps", "Shadowing", "Immersion", "Spaced repetition", "Netflix"]
  },
  {
    nome: "Escrita e Redação",
    quantidade: 20,
    descricao: "Técnicas de escrita e tipos de texto",
    exemplos: ["Essay types", "Paragraph structure", "Academic writing", "Transitions"]
  },
  {
    nome: "Temas Diversos",
    quantidade: 25,
    descricao: "Números, datas, medidas e outros",
    exemplos: ["Números", "Datas", "Horas", "Medidas", "Pontuação"]
  }
];

const WORKER_URL = 'https://lexis-publisher.aderval.workers.dev';

async function gerarTemasComIA() {
  console.log('🤖 Gerando 365 temas únicos com IA...');
  console.log('\nCategorias:');
  CATEGORIAS.forEach(cat => {
    console.log(`  - ${cat.nome}: ${cat.quantidade} temas`);
  });
  
  const todosTemas = [];
  let diaAtual = 1;
  
  for (const categoria of CATEGORIAS) {
    console.log(`\n📝 Gerando ${categoria.quantidade} temas de "${categoria.nome}"...`);
    
    const prompt = `Você é um especialista em ensino de inglês para brasileiros.

Gere ${categoria.quantidade} títulos de artigos de blog sobre: ${categoria.nome}

Descrição: ${categoria.descricao}
Exemplos de subtemas: ${categoria.exemplos.join(", ")}

REQUISITOS:
1. Títulos específicos e práticos (não genéricos)
2. Foco em problemas reais de brasileiros
3. Cada título deve ser único e diferente
4. Use números quando possível ("10 dicas", "5 erros", etc.)
5. Máximo 80 caracteres por título

Formato de saída: JSON array
[
  "Título 1",
  "Título 2",
  ...
]

Retorne APENAS o JSON, sem texto extra.`;

    try {
      // Aqui você pode usar a API do Gemini, Claude ou outra IA
      // Por enquanto, vou criar temas de exemplo
      const temas = gerarTemasExemplo(categoria, diaAtual);
      
      temas.forEach((tema, index) => {
        todosTemas.push({
          dia: diaAtual + index,
          categoria: categoria.nome,
          topic: tema.topic,
          cluster: tema.cluster,
          intent: tema.intent,
          nivel: tema.nivel,
          keywords: tema.keywords
        });
      });
      
      diaAtual += categoria.quantidade;
      console.log(`  ✅ ${categoria.quantidade} temas gerados`);
      
    } catch (error) {
      console.error(`  ❌ Erro ao gerar temas: ${error.message}`);
    }
  }
  
  // Salvar em arquivo
  const fs = await import('fs');
  const conteudo = `// Lista Completa de 365 Temas Gerados por IA
// Gerado em: ${new Date().toISOString()}

export const TEMAS_365 = ${JSON.stringify(todosTemas, null, 2)};

// Função para obter tema do dia
export function getTemaDoAno() {
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 0);
  const diff = agora - inicioAno;
  const umDia = 1000 * 60 * 60 * 24;
  const diaDoAno = Math.floor(diff / umDia);
  
  return TEMAS_365[diaDoAno % 365];
}

export function getTema(dia) {
  return TEMAS_365[(dia - 1) % 365];
}
`;
  
  fs.writeFileSync('worker/src/temas365-completo.js', conteudo);
  
  console.log(`\n✅ Arquivo gerado: worker/src/temas365-completo.js`);
  console.log(`   Total de temas: ${todosTemas.length}`);
  console.log(`\nPróximo passo: Revisar e substituir worker/src/temas365.js`);
}

// Função auxiliar para gerar temas de exemplo
function gerarTemasExemplo(categoria, diaInicial) {
  const templates = {
    "Vocabulário Temático": [
      { topic: "50 Termos de ${area} em Inglês que Todo Profissional Precisa Saber", cluster: "vocabulary", intent: "informacional", nivel: "intermediário" },
      { topic: "Vocabulário de ${area}: Guia Completo para Brasileiros", cluster: "vocabulary", intent: "informacional", nivel: "intermediário" }
    ],
    "Gramática Prática": [
      { topic: "${topico}: Quando e Como Usar (Com 20 Exemplos)", cluster: "grammar", intent: "dor", nivel: "intermediário" },
      { topic: "Domine ${topico}: Guia Prático para Brasileiros", cluster: "grammar", intent: "informacional", nivel: "intermediário" }
    ],
    "Pronúncia e Fonética": [
      { topic: "Como Pronunciar ${som} em Inglês: Guia Completo", cluster: "pronunciation", intent: "dor", nivel: "iniciante" },
      { topic: "${topico}: Técnicas para Melhorar sua Pronúncia", cluster: "pronunciation", intent: "informacional", nivel: "intermediário" }
    ]
  };
  
  // Retorna array de temas baseado na categoria
  const temas = [];
  for (let i = 0; i < categoria.quantidade; i++) {
    temas.push({
      topic: `${categoria.nome} - Tema ${i + 1} (A ser desenvolvido)`,
      cluster: categoria.nome.toLowerCase().replace(/ /g, '-'),
      intent: "informacional",
      nivel: "intermediário",
      keywords: ["english", "learning"]
    });
  }
  
  return temas;
}

gerarTemasComIA().catch(console.error);
