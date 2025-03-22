@echo off
:loop
timeout /t 7776000 /nobreak >nul
node activation.js trimestral
goto loop