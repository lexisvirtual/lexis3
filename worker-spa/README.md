# Lexis SPA Proxy Worker

## Problema
O site lexis.academy é uma Single Page Application (SPA) hospedada no GitHub Pages.
Quando o Googlebot acessa rotas como `/imersao`, `/maestria`, `/the-way`, o GitHub Pages
retorna status 404 porque não existem arquivos físicos nessas rotas.

Isso causa problemas de indexação no Google Search Console:
- 3 páginas do sitemap não indexadas
- Motivo: "Página não encontrada (404)"

## Solução
Este Cloudflare Worker atua como proxy entre o usuário/Googlebot e o GitHub Pages:

1. **Arquivos estáticos** (JS, CSS, imagens) → Passa direto para o origin
2. **Rotas SPA** (/imersao, /maestria, etc) → Serve o index.html com status 200
3. **Rotas de API** → Passa para o Worker de API (lexis-publisher)

## Deploy

### 1. Fazer deploy do Worker
```bash
cd worker-spa
wrangler deploy
```

### 2. Configurar rota no Cloudflare Dashboard
1. Acesse: Cloudflare Dashboard → lexis.academy → Workers Routes
2. Adicione uma nova rota:
   - **Route:** `lexis.academy/*`
   - **Worker:** `lexis-spa-proxy`
3. Salve a configuração

### 3. Testar
```bash
# Deve retornar status 200 (não 404)
curl -I https://lexis.academy/imersao
curl -I https://lexis.academy/maestria
curl -I https://lexis.academy/the-way
```

### 4. Solicitar re-indexação no Google Search Console
1. Acesse: Google Search Console → lexis.academy
2. Vá em: Inspeção de URL
3. Inspecione cada URL problemática:
   - https://lexis.academy/imersao
   - https://lexis.academy/maestria
   - https://lexis.academy/the-way
4. Clique em "Solicitar indexação"

## Arquitetura

```
Usuário/Googlebot
       ↓
   Cloudflare
       ↓
lexis-spa-proxy (este Worker)
       ↓
   GitHub Pages
```

## Notas
- O Worker adiciona o header `X-SPA-Route: true` para debug
- Cache de 5 minutos para HTML, 1 hora para arquivos estáticos
- Rotas de API são ignoradas (passam para o Worker lexis-publisher)
