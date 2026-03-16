@echo off
echo ========================================
echo DEPLOY: Mobile Responsiveness Fixes
echo ========================================
echo.

cd C:\Users\aderv\lexis3

echo [1/4] Adicionando arquivos...
git add .

echo [2/4] Criando commit...
git commit -m "fix(mobile): corrige responsividade em dispositivos móveis - reduz fontes, adiciona word-wrap, melhora tabelas"

echo [3/4] Enviando para GitHub...
git push origin main

echo [4/4] Aguardando GitHub Actions...
echo.
echo ✅ Deploy iniciado!
echo 🔗 Acompanhe em: https://github.com/lexisvirtual/lexis3/actions
echo 🌐 Site estará atualizado em 3-5 minutos
echo.
pause
