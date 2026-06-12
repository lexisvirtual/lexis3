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

### Whaticket (Plataforma de Atendimento)

| Componente | Detalhe |
|------------|---------|
| Servidor | `31.220.86.112` — VPS 11GB RAM, 194GB SSD |
| Acesso | `ssh -i ~/.ssh/id_ed25519 root@31.220.86.112` |
| Painel | `https://lexis.whaticket.net` |
| API | `https://api.whaticket.net` |
| Usuário admin | `vitoria@admin.com` |
| Gerenciador de processos | PM2 (deploy user) |
| Proxy reverso / SSL | Traefik (Docker) |
| Redis | Container `redis-lexis` (`172.17.0.2:6379`) — senha: `lexis` |
| PostgreSQL | Container `evolution-postgres-1` + n8n + typebot |
| Outros serviços | Evolution API, n8n, Typebot, Portainer |

### Processos PM2 (Whaticket)

| Nome | Função | Porta |
|------|--------|-------|
| `lexis-backend-api` | API REST | 4000 |
| `lexis-backend-core-worker` | Worker de tarefas | — |
| `lexis-backend-whatsapp-worker` | Worker WhatsApp | — |
| `lexis-backend-scheduler` | Agendador | — |
| `lexis-frontend` | Frontend produção | 3000 |
| `lexis-frontend-canary` | Canary | 3010 |
| `lexis-frontend-staging` | Staging | 3005 |

### Contato / Responsável

- Projeto: Lexis Academy — Blog e Dashboard
