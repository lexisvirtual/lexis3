@echo off
cd C:\Users\aderv\lexis3
echo === GIT STATUS LOCAL ===
git status
echo.
echo === ULTIMO COMMIT LOCAL ===
git log -1 --oneline
echo.
echo === COMPARACAO COM REMOTO ===
git fetch origin
git log HEAD..origin/main --oneline
echo.
echo === ARQUIVOS NAO COMMITADOS ===
git diff --name-only
git diff --cached --name-only
