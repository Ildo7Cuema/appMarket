@echo off
title AppMarket - Build e Inicialização
echo ========================================
echo    AppMarket Sistema de Vendas
echo    Build e Inicialização Automática
echo ========================================
echo.

cd /d "%~dp0\.."

echo Verificando Quasar CLI...
quasar --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Quasar CLI não encontrado!
    echo Instalando Quasar CLI...
    npm install -g @quasar/cli
)

echo Fazendo build da aplicação...
echo Isso pode levar alguns minutos...
quasar build

if %errorlevel% neq 0 (
    echo ERRO: Falha no build!
    pause
    exit /b 1
)

echo Build concluído com sucesso!
echo.
echo Iniciando servidor em modo produção...
cd server
call start-production.bat 