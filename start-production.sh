#!/bin/bash

echo "========================================"
echo "   AppMarket Sistema de Vendas"
echo "   Iniciando em Modo Produção..."
echo "========================================"
echo

cd "$(dirname "$0")"

export NODE_ENV=production
export PORT=3000

echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado!"
    echo "Por favor instale Node.js antes de continuar."
    echo "Download: https://nodejs.org/"
    exit 1
fi

echo "Node.js encontrado: $(node --version)"
echo "NPM versão: $(npm --version)"
echo

echo "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

echo "Fazendo build da aplicação..."
if command -v quasar &> /dev/null; then
    quasar build
else
    echo "Quasar CLI não encontrado, instalando..."
    npm install -g @quasar/cli
    quasar build
fi

echo
echo "Iniciando servidor backend na porta $PORT..."
echo "Acesse: http://localhost:$PORT"
echo
echo "Para parar o servidor, pressione Ctrl+C"
echo

# Iniciar servidor em background e salvar PID
nohup node server/index.js > appmarket.log 2>&1 &
echo $! > appmarket.pid

echo "Servidor iniciado com PID: $(cat appmarket.pid)"
echo "Logs salvos em: appmarket.log"
echo
echo "Para parar o servidor execute:"
echo "kill \$(cat appmarket.pid)"
echo

# Opção de seguir os logs
read -p "Deseja acompanhar os logs em tempo real? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tail -f appmarket.log
fi 