#!/bin/zsh

PROJECT_DIR="/Users/marques/Documents/Drive Marques/Projetos Github/OKR AB2L"
URL="http://127.0.0.1:8080"
LOG_FILE="/tmp/okr-ab2-server.log"

cd "$PROJECT_DIR" || exit 1

if ! /usr/bin/curl -sI "$URL" >/dev/null 2>&1; then
  nohup /usr/bin/python3 -m http.server 8080 >"$LOG_FILE" 2>&1 &

  # Aguarda o servidor subir por ate 5s.
  i=0
  while [ $i -lt 10 ]; do
    /bin/sleep 0.5
    if /usr/bin/curl -sI "$URL" >/dev/null 2>&1; then
      break
    fi
    i=$((i+1))
  done
fi

if /usr/bin/curl -sI "$URL" >/dev/null 2>&1; then
  /usr/bin/open -a Safari "$URL"
else
  /usr/bin/osascript -e 'display dialog "Nao foi possivel iniciar o servidor local na porta 8080.\n\nVeja o log em /tmp/okr-ab2-server.log" buttons {"OK"} default button "OK"'
fi
