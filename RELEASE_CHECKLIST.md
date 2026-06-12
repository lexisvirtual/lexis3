# RELEASE_CHECKLIST.md

## Checklist Pré-Deploy

### Análise de Impacto
- [ ] Módulos afetados identificados
- [ ] Dependências afetadas identificadas
- [ ] Integrações afetadas identificadas
- [ ] APIs afetadas identificadas
- [ ] Possíveis regressões identificadas

### Não Regressão
- [ ] Release candidata comparada com produção
- [ ] PRODUCTION_CONTRACT.md verificado
- [ ] BASELINE_PRODUCAO.md verificado
- [ ] Nenhuma divergência funcional encontrada

### Deploy
- [ ] Build local bem-sucedido
- [ ] Testes executados
- [ ] `git push origin main` realizado
- [ ] GitHub Actions disparado

### Pós-Deploy
- [ ] Funcionalidades verificadas em produção
- [ ] CHANGELOG.md atualizado
- [ ] PRODUCTION_CONTRACT.md atualizado (se necessário)
- [ ] DECISIONS.md atualizado (se necessário)
- [ ] BASELINE_PRODUCAO.md atualizado (se aprovado como baseline)
- [ ] Rollback documentado

## Rollback (Whaticket — Redis fix)
```bash
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" root@31.220.86.112 \
  "sed -i 's|REDIS_URI=redis://:lexis@172.17.0.2:6379|REDIS_URI=redis://:lexis@127.0.0.1:5000|' /home/deploy/lexis/backend/.env && \
   sudo -u deploy pm2 restart lexis-backend-api lexis-backend-core-worker lexis-backend-whatsapp-worker lexis-backend-scheduler"
```

## Rollback (Lexis3 — GitHub Pages)
```bash
git revert HEAD --no-edit
git push origin main
```
