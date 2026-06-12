# CHANGELOG.md

## [2026-06-12]

### Corrigido
- **Redis URI incorreta no Whaticket**: `REDIS_URI` apontava para `127.0.0.1:5000` (porta errada, sem serviço). Corrigido para `172.17.0.2:6379` (IP do container `redis-lexis` no Docker bridge).
  - Causa raiz: backend tentava conectar em Redis inexistente na porta 5000 → 224k erros `ECONNREFUSED`
  - Efeitos: auth retornava 500, workers crashavam (620+ restarts), dashboard com `ERR_SESSION_EXPIRED`
  - Correção: `.env` + `ecosystem*.config.cjs` atualizados em produção e staging

### Alterado
- `backend/.env`: `REDIS_URI` corrigido
- `backend-staging/.env`: `REDIS_URI` corrigido
- `backend/ecosystem-prod.config.cjs`: `REDIS_URI` adicionado aos 4 apps
- `backend-staging/ecosystem-staging.config.cjs`: `REDIS_URI` adicionado aos 4 apps
- `backend-staging/ecosystem.config.cjs`: `REDIS_URI` adicionado aos 4 apps

### Operação
- PM2 restart com `--update-env` e `REDIS_URI` explícito no environment
- Logs de erro antigos limpos (14MB+ cada)

## [2026-06-08]

### Adicionado
- `public/dre.html` — Dashboard DRE completo com:
  - Autenticação por PIN de 3 dígitos
  - Abas: DRE, Despesas, Notas Fiscais
  - Integração com Worker Cloudflare (`api-lexis`)
  - Lançamento de despesas por categoria (Operacional, Serviço Terceiro, Facebook Ads, Google Ads, Ferramentas, Outro)
  - Suporte a comprovante via link
  - Tabela por curso com receita/lucro
  - Interface glassmorphism com Tailwind CSS

### Documentação
- Criados documentos de governança: PRODUCTION_CONTRACT.md, CHANGELOG.md, DECISIONS.md, BASELINE_PRODUCAO.md, RELEASE_CHECKLIST.md, AGENT_RULES.md

### Notas
- Commit: `87fcee9` — Deploy via GitHub Actions
