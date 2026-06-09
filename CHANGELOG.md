# CHANGELOG.md

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
