@echo off
start /min "Quasar Dev" cmd /c quasar dev
start /min "Node Server" cmd /c node server/index.js
exit