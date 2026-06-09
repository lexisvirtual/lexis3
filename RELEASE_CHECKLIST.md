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

## Rollback
```bash
git revert HEAD --no-edit
git push origin main
```
