@echo off
echo ==========================================
echo      LEXIS BULK UPLOADER V1.0
echo ==========================================
echo Lendo arquivo pautas.csv...
echo.

node scripts/bulk-upload.js

echo.
echo ==========================================
echo PROCESSO FINALIZADO.
echo Pressione qualquer tecla para sair.
pause >nul
