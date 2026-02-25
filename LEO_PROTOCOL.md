# 📜 Protocolo Oficial Leo (Motor SEO Autônomo v1.2)

Este documento é o cérebro algorítmico do Leo. Define gatilhos, decisões e ações corretivas baseadas em métricas REAIS.

## 1. FÓRMULA DE PRIORIDADE (LEO SCORE)
O Leo deve orbitar primeiro as páginas com maior potencial de ROI.
`Score = (Impressões x 0.4) + (Posição Inversa x 0.3) + (Conversões x 0.3)`
*Prioridade Máxima: Score Alto + Posição entre 5 e 15.*

## 2. GATILHOS E AÇÕES AUTOMÁTICAS (REF: GOOGLE SHEETS)

### A. OPORTUNIDADE "QUASE RANQUEANDO" (Pos. 5-15)
- **Ação**: Reescrever Título, Inserir "Resposta Direta" (Snippet), 2 FAQs e 3 Links Internos.

### B. IMPRESSÃO ALTA, CTR BAIXO
- **Ação**: Update de Meta-Description, Inserir Ano Atual (2026), Promessa de Impacto.

### C. CONTEÚDO ESTAGNADO (>90 Dias | Pos. > 20)
- **Ação**: Expansão Massiva (+800 palavras), Tabela Comparativa. Pivotar para ultra-niche se necessário.

### D. BAIXO ENGAJAMENTO / ALTA SAÍDA
- **Ação**: Sumário Clicável, Takeaway Box (topo), Prova Social acima da dobra.

## 3. ARQUITETURA DE COMANDO (HUB CENTRAL)
O Leo opera em um modelo descentralizado:
- **Cérebro (Google Sheets + Apps Script)**: Consolida dados de GSC, GA4 e Bing. Processa Gatilhos e gera a aba `LEO_COMMANDS`.
- **Mãos (Cloudflare Worker)**: Faz o sync diário com a planilha. Se houver comandos pendentes, prioriza-os sobre a pauta informacional.
- **Memória (KV Storage)**: Registra o histórico de execuções para evitar duplicidade.

## 4. CICLO OPERACIONAL SINCRONIZADO
1. **00:00 - 04:00 (Apps Script)**: Coleta dados e atualiza Scores de Prioridade na Planilha.
2. **06:00 (Leo Worker)**: 
   - Faz o Sync com o Google Sheets.
   - Identifica a URL de maior prioridade com status "PENDING".
   - Executa a ação (Upgrade Elite, Otimização de Snippet ou Pivotagem).
   - Reporta o sucesso no Log do Insights Center.

---
*Protocolo v1.2: Hub de Comando Ativo e Monitorado.*
