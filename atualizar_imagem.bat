@echo off
setlocal
title Lexis Academy - Atualizar Imagem de Post

echo ======================================================
echo    LEXIS ACADEMY - ATUALIZADOR DE IMAGENS (PIXABAY)
echo ======================================================
echo.

set /p POST_URL="Cole a URL do post (ex: https://lexis.academy/blog/...): "

if "%POST_URL%"=="" (
    echo.
    echo [ERROR] Voce precisa fornecer uma URL.
    pause
    exit /b
)

echo.
echo [PROCESS] Iniciando processo para: %POST_URL%
echo.

node scripts/refresh-post-image.js "%POST_URL%"

echo.
echo ======================================================
echo    PROCESSO CONCLUIDO!
echo ======================================================
echo.
pause
