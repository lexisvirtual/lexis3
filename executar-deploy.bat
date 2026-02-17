@echo off
cd /d C:\Users\aderv\lexis3
echo ========================================
echo DEPLOY - Blog Lexis Academy Limpo
echo ========================================
echo.
echo Adicionando arquivos ao Git...
git add .
echo.
echo Status:
git status --short
echo.
echo Fazendo commit...
git commit -m "Limpar blog - preparar para sistema 365 temas unicos"
echo.
echo Enviando para GitHub...
git push origin main
echo.
echo ========================================
echo Deploy iniciado com sucesso!
echo.
echo Acompanhe em:
echo https://github.com/lexisvirtual/lexis3/actions
echo.
echo O blog ficara vazio em ~3-5 minutos:
echo https://lexis.academy/blog
echo ========================================
