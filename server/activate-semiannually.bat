@echo off
:loop
timeout /t 15552000 /nobreak >nul
node activation.js semestral
goto loop