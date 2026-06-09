# DECISIONS.md — Histórico de Decisões Arquiteturais

## 2026-06-08

### DRE Dashboard como HTML estático em `public/`
- **Decisão**: Manter `dre.html` como arquivo HTML estático na pasta `public/`, sem integrar ao framework React/Vite do blog.
- **Motivo**: O DRE é uma ferramenta administrativa independente, com ciclo de vida diferente do blog. Não requer SSR, roteamento ou estado global do React.
- **Consequência**: O Worker Cloudflare (`api-lexis`) é a única fonte de dados. O frontend é servido como estático pelo GitHub Pages.

### Uso de Tailwind via CDN
- **Decisão**: Tailwind CSS carregado via CDN (`cdn.tailwindcss.com`) em vez de build local.
- **Motivo**: Simplificação — sem necessidade de configurar PostCSS para uma única página estática.

### Ausência de Documentos de Governança
- **Decisão**: Criar documentos de governança do zero, baseados nas regras fornecidas pelo responsável do projeto.
- **Motivo**: Projeto não possuía documentação formal de governança.
