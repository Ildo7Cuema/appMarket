@echo off
title AppMarket - Produção
echo ========================================
echo    AppMarket Sistema de Vendas
echo    Iniciando em Modo Produção...
echo ========================================
echo.

cd /d "%~dp0"
set NODE_ENV=production
set PORT=3000

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js não encontrado!
    echo Por favor instale Node.js antes de continuar.
    pause
    exit /b 1
)

echo Verificando dependências...
if not exist "..\node_modules" (
    echo Instalando dependências...
    cd ..
    npm install
    cd server
)

echo Iniciando servidor backend na porta %PORT%...
echo Acesse: http://localhost:%PORT%
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

node index.js

pause 