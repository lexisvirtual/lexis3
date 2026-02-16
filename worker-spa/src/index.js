/**
 * Lexis SPA Proxy Worker
 * 
 * Este Worker resolve o problema de SEO para Single Page Applications (SPA)
 * hospedadas no GitHub Pages.
 * 
 * PROBLEMA: O Googlebot acessa /imersao, /maestria, /the-way e recebe 404
 * porque o GitHub Pages não tem arquivos físicos nessas rotas.
 * 
 * SOLUÇÃO: Este Worker intercepta todas as requisições e:
 * 1. Para arquivos estáticos (JS, CSS, imagens) -> Passa direto para o origin
 * 2. Para rotas SPA (/imersao, /maestria, etc) -> Busca o index.html e retorna com status 200
 * 3. Para API routes -> Passa para o Worker de API (lexis-publisher)
 * 
 * @version 1.0.0
 * @author Lexis Academy SEO Team
 */

const ORIGIN = 'https://lexisvirtual.github.io/lexis3';

// Rotas SPA conhecidas (páginas do React Router)
const SPA_ROUTES = [
    '/imersao',
    '/maestria', 
    '/the-way',
    '/blog',
    '/metodo',
    '/depoimentos',
    '/consultor',
    '/contato'
];

// Extensões de arquivos estáticos
const STATIC_EXTENSIONS = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.webp', '.mp4', '.webm',
    '.json', '.xml', '.txt', '.pdf', '.zip'
];

// Rotas de API que devem ser ignoradas (passam para outro Worker)
const API_ROUTES = [
    '/add-topic',
    '/queue',
    '/process-queue',
    '/purge',
    '/reset-memory'
];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // 1. Ignorar rotas de API (deixar para o Worker de API)
        if (API_ROUTES.some(route => pathname.startsWith(route))) {
            return fetch(request);
        }

        // 2. Arquivos estáticos -> Passar direto para o origin
        if (isStaticFile(pathname)) {
            return fetchFromOrigin(pathname, request);
        }

        // 3. Página inicial
        if (pathname === '/' || pathname === '/index.html') {
            return fetchFromOrigin('/index.html', request);
        }

        // 4. Sitemap e RSS (arquivos especiais)
        if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
            return fetchFromOrigin(pathname, request);
        }

        // 5. Rotas SPA conhecidas -> Servir index.html com status 200
        if (isSPARoute(pathname)) {
            return serveSPAIndex(request);
        }

        // 6. Rotas de blog dinâmicas (/blog/*)
        if (pathname.startsWith('/blog/')) {
            return serveSPAIndex(request);
        }

        // 7. Qualquer outra rota -> Tentar buscar do origin primeiro
        const originResponse = await fetchFromOrigin(pathname, request);
        
        // Se o origin retornar 404, servir o index.html (pode ser uma rota SPA não listada)
        if (originResponse.status === 404) {
            return serveSPAIndex(request);
        }

        return originResponse;
    }
};

/**
 * Verifica se o pathname é um arquivo estático
 */
function isStaticFile(pathname) {
    return STATIC_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext));
}

/**
 * Verifica se o pathname é uma rota SPA conhecida
 */
function isSPARoute(pathname) {
    return SPA_ROUTES.some(route => 
        pathname === route || pathname === route + '/'
    );
}

/**
 * Busca um recurso do origin (GitHub Pages)
 */
async function fetchFromOrigin(pathname, originalRequest) {
    const originUrl = ORIGIN + pathname;
    
    const response = await fetch(originUrl, {
        method: originalRequest.method,
        headers: {
            'User-Agent': originalRequest.headers.get('User-Agent') || 'Cloudflare-Worker',
            'Accept': originalRequest.headers.get('Accept') || '*/*',
            'Accept-Language': originalRequest.headers.get('Accept-Language') || 'pt-BR,pt;q=0.9,en;q=0.8'
        }
    });

    // Clonar a resposta para poder modificar headers
    const newResponse = new Response(response.body, response);
    
    // Adicionar headers de cache apropriados
    if (response.ok) {
        // Cache de 1 hora para arquivos estáticos
        if (isStaticFile(pathname)) {
            newResponse.headers.set('Cache-Control', 'public, max-age=3600');
        }
    }

    return newResponse;
}

/**
 * Serve o index.html para rotas SPA
 * Isso permite que o React Router funcione corretamente
 */
async function serveSPAIndex(originalRequest) {
    const originUrl = ORIGIN + '/index.html';
    
    const response = await fetch(originUrl, {
        method: 'GET',
        headers: {
            'User-Agent': originalRequest.headers.get('User-Agent') || 'Cloudflare-Worker',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': originalRequest.headers.get('Accept-Language') || 'pt-BR,pt;q=0.9,en;q=0.8'
        }
    });

    if (!response.ok) {
        return new Response('Erro ao carregar a página', { status: 500 });
    }

    // Retornar o index.html com status 200 (não 404!)
    // Isso é crucial para o SEO - o Googlebot verá status 200
    const newResponse = new Response(response.body, {
        status: 200,
        statusText: 'OK',
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300', // Cache de 5 minutos para HTML
            'X-SPA-Route': 'true' // Header para debug
        }
    });

    return newResponse;
}
