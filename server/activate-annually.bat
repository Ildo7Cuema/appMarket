@echo off
:loop
timeout /t 31536000 /nobreak >nul
node activation.js anual
goto loop