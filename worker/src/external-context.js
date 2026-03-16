// External Context Integration
// Integração com Google Trends e Apple.com para contexto dinâmico

/**
 * Busca tendências do Google Trends para datas comemorativas
 * @returns {Promise<Object>} Contexto com tendências atuais
 */
async function fetchGoogleTrends() {
  try {
    const response = await fetch('https://trends.google.com/trends/api/dailytrends?hl=pt-BR&geo=BR');
    if (!response.ok) throw new Error('Google Trends API error');
    
    const data = await response.text();
    // Remove o prefixo de segurança do Google
    const jsonStr = data.replace(/^\)\]\}\'
/, '');
    const trends = JSON.parse(jsonStr);
    
    return {
      source: 'google-trends',
      timestamp: new Date().toISOString(),
      trends: trends.default.trendingSearchesDays[0].trendingSearches || [],
      priority: 'high'
    };
  } catch (error) {
    console.error('Erro ao buscar Google Trends:', error);
    return null;
  }
}

/**
 * Busca informações de design do Apple.com
 * @returns {Promise<Object>} Contexto com informações de design
 */
async function fetchAppleDesign() {
  try {
    const response = await fetch('https://www.apple.com');
    if (!response.ok) throw new Error('Apple.com fetch error');
    
    const html = await response.text();
    
    // Extrai informações de design (cores, temas, campanhas atuais)
    const designContext = {
      source: 'apple-design',
      timestamp: new Date().toISOString(),
      theme: extractAppleTheme(html),
      campaigns: extractAppleCampaigns(html),
      priority: 'high'
    };
    
    return designContext;
  } catch (error) {
    console.error('Erro ao buscar Apple Design:', error);
    return null;
  }
}

/**
 * Extrai tema de design do HTML do Apple
 */
function extractAppleTheme(html) {
  // Procura por meta tags e classes que indicam o tema atual
  const themeMatch = html.match(/theme["']?:\s*["']([^"']+)["']/i);
  const colorMatch = html.match(/primary-color["']?:\s*["']([^"']+)["']/i);
  
  return {
    theme: themeMatch ? themeMatch[1] : 'light',
    primaryColor: colorMatch ? colorMatch[1] : '#000000',
    season: detectSeason()
  };
}

/**
 * Extrai campanhas ativas do Apple
 */
function extractAppleCampaigns(html) {
  const campaigns = [];
  
  // Procura por padrões de campanhas no HTML
  const campaignPattern = /campaign["']?:\s*["']([^"']+)["']/gi;
  let match;
  
  while ((match = campaignPattern.exec(html)) !== null) {
    campaigns.push(match[1]);
  }
  
  return campaigns.length > 0 ? campaigns : ['default'];
}

/**
 * Detecta a estação atual
 */
function detectSeason() {
  const month = new Date().getMonth() + 1;
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * Função principal que retorna o contexto externo consolidado
 * @param {Object} options - Opções de configuração
 * @returns {Promise<Object>} Contexto externo consolidado
 */
export async function getExternalContext(options = {}) {
  const { useGoogle = true, useApple = true, timeout = 5000 } = options;
  
  try {
    const promises = [];
    
    if (useGoogle) {
      promises.push(fetchGoogleTrends());
    }
    
    if (useApple) {
      promises.push(fetchAppleDesign());
    }
    
    // Executa com timeout
    const results = await Promise.race([
      Promise.all(promises),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
    
    return {
      externalContext: {
        google: useGoogle ? results[0] : null,
        apple: useApple ? results[1] : null,
        timestamp: new Date().toISOString(),
        active: true
      }
    };
  } catch (error) {
    console.error('Erro ao obter contexto externo:', error);
    
    // Retorna contexto vazio em caso de erro
    return {
      externalContext: {
        google: null,
        apple: null,
        timestamp: new Date().toISOString(),
        active: false,
        error: error.message
      }
    };
  }
}

// Export para uso em outros módulos
export { fetchGoogleTrends, fetchAppleDesign };