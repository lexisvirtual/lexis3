@echo off
cls
cd /d "%~dp0"

echo.
echo Processando fila de posts...
echo.
echo ==========================================
echo      LEXIS INSTANT PUBLISHER
echo ==========================================
echo.
node scripts/process-now.js

if errorlevel 1 (
    echo.
    echo Erro ao executar o script
    echo.
)
echo.
echo ==========================================
echo Pressione qualquer tecla para fechar.
pause >nul