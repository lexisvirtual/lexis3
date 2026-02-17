@echo off
echo ========================================
echo Deploy do Blog Lexis Academy
echo ========================================
echo.
echo Adicionando arquivos ao Git...
git add .
echo.
echo Fazendo commit...
git commit -m "Limpar blog - preparar para sistema 365 temas unicos"
echo.
echo Enviando para GitHub (isso vai disparar o deploy automatico)...
git push origin main
echo.
echo ========================================
echo Deploy iniciado! GitHub Actions vai:
echo 1. Fazer build do site
echo 2. Gerar RSS
echo 3. Fazer deploy para GitHub Pages
echo.
echo Acompanhe em: https://github.com/lexisvirtual/lexis3/actions
echo ========================================
pause
