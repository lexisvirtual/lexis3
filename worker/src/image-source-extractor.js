/**
 * Módulo de Extração e Otimização de Imagens
 * Busca imagens relevantes no Pixabay/Unsplash
 */

export async function extractAndOptimizeImage(env, post) {
  const keywords = extractKeywords(post.title);
  
  // Tentar Pixabay primeiro
  let imageUrl = await searchPixabay(env, keywords);
  
  // Fallback para Unsplash
  if (!imageUrl) {
    imageUrl = await searchUnsplash(env, keywords);
  }
  
  // Fallback para imagem genérica
  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200';
  }

  // Otimizar via wsrv.nl
  const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&output=webp&q=80`;

  return {
    url: optimizedUrl,
    originalUrl: imageUrl,
    keywords: keywords.join(', ')
  };
}

async function searchPixabay(env, keywords) {
  if (!env.PIXABAY_API_KEY) return null;

  try {
    const query = keywords.slice(0, 3).join('+');
    const url = `https://pixabay.com/api/?key=${env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20&safesearch=true`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.hits && data.hits.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(data.hits.length, 10));
      return data.hits[randomIndex].largeImageURL;
    }
  } catch (error) {
    console.error('Erro Pixabay:', error);
  }

  return null;
}

async function searchUnsplash(env, keywords) {
  if (!env.UNSPLASH_ACCESS_KEY) return null;

  try {
    const query = keywords.slice(0, 3).join(' ');
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&client_id=${env.UNSPLASH_ACCESS_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 10));
      return data.results[randomIndex].urls.regular;
    }
  } catch (error) {
    console.error('Erro Unsplash:', error);
  }

  return null;
}

function extractKeywords(title) {
  const keywords = ['english', 'learning', 'education', 'study'];
  const titleWords = title.toLowerCase().split(/\s+/);
  
  const relevantWords = titleWords.filter(word => 
    word.length > 4 && 
    !['sobre', 'para', 'como', 'mais', 'muito', 'quando', 'onde'].includes(word)
  );

  return [...new Set([...keywords, ...relevantWords.slice(0, 3)])];
}
