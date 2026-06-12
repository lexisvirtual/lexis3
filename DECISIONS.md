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

## 2026-06-12

### Correção de Redis URI no Whaticket
- **Decisão**: Alterar `REDIS_URI` de `redis://:lexis@127.0.0.1:5000` para `redis://:lexis@172.17.0.2:6379` (IP do container `redis-lexis` na rede bridge Docker).
- **Motivo**: O backend was configured para conectar em Redis na porta 5000, mas o container Redis (`redis-lexis`) está na porta 6379 com IP `172.17.0.1` (host-gateway) ou `172.17.0.2` (dentro da rede bridge). A porta 6379 não é publicada para o host, então o backend deve conectar via IP do container.
- **Consequência**: Auth, filas Bull e sessões voltaram a funcionar. Workers estabilizam (deixam de acumular restarts).
- **Por que não publicar Redis na porta 6379 do host**: Manter Redis isolado na rede Docker é mais seguro; não há necessidade de expor ao host.
