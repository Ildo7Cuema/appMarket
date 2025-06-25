@echo off
title AppMarket - Backup do Banco de Dados
echo ========================================
echo    AppMarket - Backup do Banco
echo ========================================
echo.

cd /d "%~dp0"

:: Criar pasta de backups se não existir
if not exist "backups" mkdir "backups"

:: Gerar nome do backup com data e hora
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "backup_name=appmarket_backup_%timestamp%.db"

echo Fazendo backup do banco de dados...
echo Arquivo: %backup_name%

if exist "appmarket.db" (
    copy "appmarket.db" "backups\%backup_name%"
    if %errorlevel% equ 0 (
        echo.
        echo ✓ Backup criado com sucesso!
        echo Localização: backups\%backup_name%
        echo.
        
        :: Manter apenas os últimos 10 backups
        echo Limpando backups antigos (mantendo os 10 mais recentes)...
        for /f "skip=10 tokens=*" %%i in ('dir /b /o-d "backups\appmarket_backup_*.db"') do (
            echo Removendo backup antigo: %%i
            del "backups\%%i"
        )
    ) else (
        echo ✗ ERRO: Falha ao criar backup!
    )
) else (
    echo ✗ ERRO: Arquivo appmarket.db não encontrado!
)

echo.
pause 