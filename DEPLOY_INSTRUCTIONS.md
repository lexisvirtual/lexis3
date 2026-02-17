# Instruções de Deploy - Blog Lexis Academy

## Status Atual
✅ **Posts antigos removidos** (backup em `src/posts_backup_20260217/`)
✅ **Imagens antigas removidas** (backup em `public/img/posts_backup_20260217/`)
✅ **Blog limpo** - pronto para começar do zero

## Como Fazer Deploy

### Opção 1: Usando o Script Automático (RECOMENDADO)

```bash
cd C:\Users\aderv\lexis3
deploy.bat
```

Isso vai:
1. Adicionar todas as mudanças ao Git
2. Fazer commit
3. Fazer push para GitHub
4. GitHub Actions vai fazer deploy automático

### Opção 2: Manual

```bash
cd C:\Users\aderv\lexis3
git add .
git commit -m "Limpar blog - preparar para sistema 365 temas unicos"
git push origin main
```

## O que Acontece Após o Push?

O GitHub Actions vai automaticamente:

1. ✅ Fazer checkout do código
2. ✅ Instalar dependências Node.js
3. ✅ Executar `npm run build`:
   - Gerar RSS feed
   - Fazer build do Vite (React)
4. ✅ Fazer deploy para GitHub Pages

## Acompanhar o Deploy

🔗 **GitHub Actions:** https://github.com/lexisvirtual/lexis3/actions
🌐 **Site ao vivo:** https://lexis.academy/blog

## Tempo Estimado

- **Build:** ~2-3 minutos
- **Deploy:** ~1 minuto
- **Total:** ~3-5 minutos

## Próximos Passos Após Deploy

1. Verificar se o blog está vazio: https://lexis.academy/blog
2. Testar geração do primeiro post:
   ```bash
   node scripts/testar-tema-dia.js 1
   ```
3. Se funcionar bem, popular a fila completa:
   ```bash
   node scripts/popular-365-temas.js
   ```

## Troubleshooting

### Se o deploy falhar:

1. Verificar logs no GitHub Actions
2. Verificar se há erros de build localmente:
   ```bash
   npm run build
   ```
3. Se necessário, reverter:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Se precisar restaurar posts antigos:

```bash
cp -r src/posts_backup_20260217/* src/posts/
cp -r public/img/posts_backup_20260217/* public/img/posts/
git add .
git commit -m "Restaurar posts antigos"
git push origin main
```

## Notas Importantes

- ⚠️ O blog ficará **VAZIO** após este deploy
- 💾 Todos os posts antigos estão em backup seguro
- 🚀 Sistema 365 temas está pronto para ser ativado
- 🤖 Worker Cloudflare ainda não foi modificado (segurança)
