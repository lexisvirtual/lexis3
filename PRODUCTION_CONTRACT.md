# PRODUCTION_CONTRACT.md — Lexis Academy

## Contrato de Produção

Este documento define o contrato funcional da aplicação em produção. Nenhuma funcionalidade documentada pode ser removida, alterada ou degradada sem autorização explícita.

### Funcionalidades Ativas

| Módulo | Funcionalidade | Status |
|--------|---------------|--------|
| Blog | Geração e publicação de posts | Ativo |
| Blog | RSS Feed | Ativo |
| Blog | Imagens auto-hospedadas em `/img/posts/` | Ativo |
| Dashboard DRE | `/dre.html` — Demonstrativo de Resultados | Ativo |
| Dashboard DRE | Autenticação via PIN (3 dígitos) | Ativo |
| Dashboard DRE | Abas: DRE, Despesas, Notas Fiscais | Ativo |
| Dashboard DRE | Lançamento de despesas com categorias | Ativo |
| Dashboard DRE | Upload/link de comprovantes | Ativo |
| Dashboard DRE | Integração Worker Cloudflare (`api-lexis`) | Ativo |
| Landing Page | `/aplicacao` — Página de aplicação | Ativo |
| Worker Cloudflare | Geração autônoma de conteúdo | Ativo |
| Worker Cloudflare | Commit de imagens/posts no repositório | Ativo |

### Pipeline de Deploy

1. `git push origin main`
2. GitHub Actions: build + RSS + deploy GitHub Pages
3. Disponível em: https://lexisvirtual.github.io/lexis3/

### Variáveis de Ambiente / URLs de Produção

- Worker API: `https://api-lexis.lexis-english-account.workers.dev`
- Repositório: `https://github.com/lexisvirtual/lexis3`
- GitHub Pages: `https://lexisvirtual.github.io/lexis3/`

### Contato / Responsável

- Projeto: Lexis Academy — Blog e Dashboard
