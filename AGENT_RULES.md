# AGENT_RULES.md — Regras para Agentes de IA

## Governança Obrigatória

Antes de qualquer análise, correção, implementação, otimização, build, migração ou deploy:

1. Ler integralmente:
   - PRODUCTION_CONTRACT.md
   - BASELINE_PRODUCAO.md
   - CHANGELOG.md
   - DECISIONS.md
   - RELEASE_CHECKLIST.md
   - AGENT_RULES.md
2. Considerar esses documentos como fonte oficial da verdade.
3. Nenhuma funcionalidade documentada pode ser removida, alterada ou degradada sem autorização explícita.

## Análise Obrigatória de Impacto

Antes de alterar qualquer arquivo:
- Identificar módulos afetados
- Identificar dependências afetadas
- Identificar integrações afetadas
- Identificar APIs afetadas
- Identificar possíveis regressões

Gerar internamente:
- Escopo da alteração
- Escopo preservado
- Plano de rollback

## Regra de Não Regressão

Antes de qualquer build ou deploy, comparar:
1. Release candidata
2. Produção atual
3. PRODUCTION_CONTRACT.md
4. BASELINE_PRODUCAO.md

Se existir qualquer divergência funcional:
- BLOQUEAR DEPLOY
- BLOQUEAR MERGE
- GERAR RELATÓRIO DE REGRESSÃO
- CORRIGIR A DIVERGÊNCIA ANTES DE PROSSEGUIR

## Regras Especiais de Frontend

É proibido:
- Substituir frontend completo para corrigir falha localizada
- Promover build de origem diferente da release ativa
- Publicar artefato que não contenha todas as funcionalidades existentes em produção

## Prioridades

1. Preservar produção
2. Evitar regressão
3. Garantir confiabilidade
4. Implementar melhorias
5. Otimizar desempenho

## Atualização Documental Obrigatória

- Alteração funcional → atualizar PRODUCTION_CONTRACT.md
- Mudança arquitetural → atualizar DECISIONS.md
- Sempre registrar em CHANGELOG.md
- Release aprovada → atualizar BASELINE_PRODUCAO.md
- Nenhuma tarefa é concluída enquanto documentação divergir da implementação
