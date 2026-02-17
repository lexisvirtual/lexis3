# Deploy do Blog Lexis Academy - Blog Limpo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY - Blog Lexis Academy Limpo" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\aderv\lexis3"

Write-Host "Adicionando arquivos ao Git..." -ForegroundColor Green
git add .

Write-Host ""
Write-Host "Status das mudancas:" -ForegroundColor Green
git status --short

Write-Host ""
Write-Host "Fazendo commit..." -ForegroundColor Green
git commit -m "Limpar blog - preparar para sistema 365 temas unicos"

Write-Host ""
Write-Host "Enviando para GitHub (isso vai disparar o deploy automatico)..." -ForegroundColor Green
git push origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy iniciado com sucesso!" -ForegroundColor Green
Write-Host "" 
Write-Host "GitHub Actions vai:" -ForegroundColor Yellow
Write-Host "1. Fazer build do site" -ForegroundColor White
Write-Host "2. Gerar RSS" -ForegroundColor White
Write-Host "3. Fazer deploy para GitHub Pages" -ForegroundColor White
Write-Host ""
Write-Host "Acompanhe em:" -ForegroundColor Yellow
Write-Host "https://github.com/lexisvirtual/lexis3/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "O blog ficara vazio em ~3-5 minutos:" -ForegroundColor Yellow
Write-Host "https://lexis.academy/blog" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
