#!/bin/zsh
set -e

PROJECT_DIR="/Users/marques/Documents/Drive Marques/Projetos Github/OKR AB2L"
BRANCH="main"

cd "$PROJECT_DIR"

# Garante que estamos na branch certa
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "$BRANCH" ]; then
  git checkout "$BRANCH"
fi

# Adiciona tudo
git add -A

# Se nao houver alteracao, apenas tenta sincronizar remoto local
if git diff --cached --quiet; then
  git pull --rebase origin "$BRANCH" || true
  git push origin "$BRANCH"
  /usr/bin/osascript -e 'display notification "Sem novas alterações locais. Repositório já sincronizado." with title "OKR AB2"'
  exit 0
fi

# Commit automatico com data/hora
msg="sync: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$msg"

# Envia para o GitHub
git push origin "$BRANCH"

/usr/bin/osascript -e 'display notification "Atualizações enviadas para GitHub e Lovable." with title "OKR AB2"'
