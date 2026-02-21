#!/bin/zsh
set -e

PROJECT_DIR="/Users/marques/Documents/Drive Marques/Projetos Github/OKR AB2"
BRANCH="main"
LOVABLE_REMOTE="lovable"
LOVABLE_URL="https://github.com/docdanielmarques/okr-ab2.git"

cd "$PROJECT_DIR"

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "$BRANCH" ]; then
  git checkout "$BRANCH"
fi

# Garante remoto do Lovable configurado corretamente.
if git remote get-url "$LOVABLE_REMOTE" >/dev/null 2>&1; then
  git remote set-url "$LOVABLE_REMOTE" "$LOVABLE_URL"
else
  git remote add "$LOVABLE_REMOTE" "$LOVABLE_URL"
fi

git add -A

if git diff --cached --quiet; then
  git pull --rebase origin "$BRANCH" || true
  git push origin "$BRANCH"
  git push --force "$LOVABLE_REMOTE" "$BRANCH"
  /usr/bin/osascript -e 'display notification "Sem novas alterações locais. Repositórios sincronizados." with title "OKR AB2"'
  exit 0
fi

msg="sync: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$msg"

git pull --rebase origin "$BRANCH" || true
git push origin "$BRANCH"
git push --force "$LOVABLE_REMOTE" "$BRANCH"

/usr/bin/osascript -e 'display notification "Atualizações enviadas para GitHub e Lovable." with title "OKR AB2"'
