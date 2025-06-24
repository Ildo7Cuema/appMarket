#!/bin/bash

# Caminho absoluto da pasta onde este script está salvo
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Abrir Quasar Dev em uma nova janela do Terminal, no diretório do script
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && quasar dev\"" > /dev/null

# Abrir Node Server em outra nova janela do Terminal, no diretório do script
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && node index.js\"" > /dev/null

exit 0
