# Sistema de Automação de Imagens e Conteúdo Lexis3 (v9.1)

Este documento resume as melhorias e a arquitetura do sistema de publicação da Lexis Academy implementadas em Fevereiro de 2026.

## 1. Arquitetura de Imagens (Self-Hosted)
Para evitar links quebrados e dependência de APIs externas (Unsplash/Pixabay), o sistema agora hospeda suas próprias imagens.

### Fluxo de Geração (Cloudflare Worker)
1. **Busca Cascata**: Tenta Pixabay (sorteio entre 20 resultados) -> Fallback (Banco Curado).
2. **Otimização Externa**: Utiliza o serviço `wsrv.nl` para redimensionar (1200px), converter para `WebP` e otimizar qualidade (80%).
3. **Persistência**: O Worker baixa o binário otimizado e faz o commit diretamente no repositório GitHub em `public/img/posts/[slug].webp`.
4. **Frontmatter**: O post é gerado com o link local `/img/posts/[slug].webp`.

### Banco de Fallback (`worker/src/fallback_images.js`)
- Contém um pool genérico de imagens de alta qualidade (Pessoas conversando, escritório, rua, lifestyle).
- Usado automaticamente se as APIs de busca falharem.

## 2. Estratégia de Conteúdo (Anti-Alucinação)
O System Prompt do Worker foi atualizado (V9.1) para garantir realismo cultural brasileiro.

- **Foco**: O inglês é o objetivo do treino, mas o ambiente é o Brasil (português).
- **Regra de Ouro**: Nunca dizer que festas brasileiras (Carnaval, etc.) acontecem em inglês.
- **Estilo**: Mentor experiente, parágrafos curtos, uso de negrito e listas para escaneabilidade.

## 3. Scripts de Manutenção Local
Três scripts foram criados na pasta `scripts/` para correções manuais:

1. **`fix-post-image.js`**: Converte links externos antigos em imagens locais hospedadas.
2. **`replace-post-image.js`**: Substitui a imagem de um post por uma URL específica fornecida pelo usuário.
3. **`refresh-post-image.js`**: Busca automaticamente uma nova imagem no Pixabay baseada nas tags do post e a torna local.

### Facilitador Windows
- **`atualizar_imagem.bat`**: Arquivo executável que permite ao usuário apenas colar a URL do blog para rodar o processo de atualização de imagem sem usar comandos complexos.

## 4. Gestão de Conflitos Git
Os scripts de automação agora realizam `git pull --rebase origin main` antes de cada `push`. Isso evita erros de "rejected" causados por commits simultâneos do Worker e do usuário local.

---
**Status**: Estável e Operacional.
**Data**: 16/02/2026
