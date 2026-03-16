@echo off
cd C:\Users\aderv\lexis3
git add .
git commit -m "fix(mobile): corrige responsividade em dispositivos moveis - reduz fontes, adiciona word-wrap, melhora tabelas"
git push origin main
echo Deploy concluido!
