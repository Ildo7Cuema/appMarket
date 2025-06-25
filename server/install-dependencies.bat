@echo off
title AppMarket - Instalação de Dependências
echo ========================================
echo    AppMarket Sistema de Vendas
echo    Instalando Dependências...
echo ========================================
echo.

cd /d "%~dp0\.."

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js não encontrado!
    echo Por favor baixe e instale Node.js de: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado!
node --version
npm --version
echo.

echo Limpando cache do npm...
npm cache clean --force

echo Removendo node_modules existente...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo Instalando dependências do projeto...
npm install

echo Instalando Quasar CLI globalmente...
npm install -g @quasar/cli

echo.
echo ========================================
echo Instalação concluída com sucesso!
echo.
echo Próximos passos:
echo 1. Execute: quasar build (para produção)
echo 2. Execute: server\start-production.bat
echo ========================================
pause 