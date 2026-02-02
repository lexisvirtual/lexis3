@echo off
echo ==========================================
echo      LEXIS QUEUE MONITOR
echo ==========================================
echo.
node scripts/check-queue.js
echo.
echo ==========================================
echo Pressione qualquer tecla para fechar.
pause >nul
