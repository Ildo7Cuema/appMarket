#!/bin/bash

# Mapeia os períodos para segundos
get_sleep_time() {
  case "$1" in
    mensal) echo 2592000 ;;    # 30 dias
    trimestral) echo 7776000 ;; # 90 dias
    semestral) echo 15552000 ;; # 180 dias
    anual) echo 31536000 ;;    # 365 dias
    *)
      echo "Tipo inválido. Use: mensal, trimestral, semestral ou anual."
      exit 1
      ;;
  esac
}

# Verifica se foi passado um argumento
if [ -z "$1" ]; then
  echo "Uso: ./activar.sh [mensal|trimestral|semestral|anual]"
  exit 1
fi

TIPO=$1
TEMPO=$(get_sleep_time "$TIPO")

echo "Iniciando ativação do tipo '$TIPO' a cada $TEMPO segundos."

while true
do
  echo "[$(date)] Executando: node activation.js $TIPO"
  node activation.js "$TIPO"
  echo "[$(date)] Esperando $TEMPO segundos até a próxima execução..."
  sleep "$TEMPO"
done

