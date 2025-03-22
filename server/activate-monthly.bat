@echo off
:loop
timeout /t 2592000 /nobreak >nul
node activation.js mensal
goto loop