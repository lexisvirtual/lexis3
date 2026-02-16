@echo off
chcp 65001 > nul
echo.
echo ==========================================
echo      LEXIS PUBLISHER - GERADOR DE PAUTAS IA
echo ==========================================
echo.
echo 🤖 Solicitando análise de histórico e geração de temas...
echo ⏳ Aguarde alguns segundos...
echo.

curl -s "https://lexis-publisher.lexis-english-account.workers.dev/ai-plan"

echo.
echo.
echo ✅ Processo concluído! Os novos temas foram adicionados à fila.
echo.
pause
