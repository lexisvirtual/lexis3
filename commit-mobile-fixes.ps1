#!/usr/bin/env pwsh
Set-Location "C:\Users\aderv\lexis3"

Write-Host "=== COMMIT MOBILE FIXES ===" -ForegroundColor Cyan
Write-Host ""

# Verificar status
Write-Host "[1/5] Verificando status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[2/5] Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "[3/5] Criando commit..." -ForegroundColor Yellow
git commit -m "fix(mobile): corrige responsividade em dispositivos moveis - reduz fontes, adiciona word-wrap, melhora tabelas"

Write-Host ""
Write-Host "[4/5] Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "[5/5] Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Deploy iniciado!" -ForegroundColor Green
Write-Host "🔗 Acompanhe em: https://github.com/lexisvirtual/lexis3/actions" -ForegroundColor Cyan
Write-Host "🌐 Site estará atualizado em 3-5 minutos" -ForegroundColor Cyan
Write-Host ""
