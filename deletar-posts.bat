@echo off
cd C:\Users\aderv\lexis3
echo Deletando todos os posts...
rmdir /s /q src\posts
echo Posts deletados!
echo.
echo Fazendo commit...
git add .
git commit -m "chore: remover todos os 75 posts do blog"
echo.
echo Fazendo push...
git push
echo.
echo Concluido!
pause
