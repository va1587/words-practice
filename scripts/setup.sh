#!/usr/bin/env bash
# Idempotent local development setup: the README "Uruchomienie lokalne" steps in one command.
# Safe to re-run — steps that are already done are skipped or are no-ops (`.env` is never overwritten).
#
# Usage: npm run setup
# Spec: .ai/specs/2026-10-19-setup-installer.md
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

current_step=""
summary=()

step() {
  current_step="$1"
  printf '\n\033[1m▶ %s\033[0m\n' "$1"
}
record() { summary+=("✔ ${current_step}: $1"); }
warn() { printf '\033[33m⚠ %s\033[0m\n' "$*" >&2; }
fail() {
  printf '\033[31m✖ %s\033[0m\n' "$*" >&2
  exit 1
}
trap 'printf "\n\033[31m✖ Krok „%s” nie powiódł się (kod %s).\033[0m\n" "$current_step" "$?" >&2' ERR

# Value of KEY in a dotenv file (last assignment wins); empty when absent. Never printed.
env_value() { { grep -E "^$1=" "$2" || true; } | tail -n 1 | cut -d= -f2-; }

step "Wymagania"
required_node="$(tr -d '[:space:]v' <.nvmrc)"
required_node="${required_node%%.*}"
command -v node >/dev/null || fail "Brak Node.js. Zainstaluj Node ${required_node} (np. nvm install ${required_node})."
node_major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
[[ "$node_major" == "$required_node" ]] ||
  fail "Wymagany Node ${required_node}, wykryto $(node -v). Przełącz wersję: nvm use"
npm_major="$(npm -v | cut -d. -f1)"
((npm_major >= 11)) || fail "Wymagany npm 11 lub nowszy, wykryto $(npm -v). Zaktualizuj: npm install -g npm@11"
command -v docker >/dev/null || fail "Brak Dockera. Zainstaluj Docker Desktop: https://docs.docker.com/get-docker/"
docker compose version >/dev/null 2>&1 || fail "Brak wtyczki docker compose (wymagany Docker Compose v2)."
docker info >/dev/null 2>&1 || fail "Docker nie działa. Uruchom Docker Desktop i spróbuj ponownie."
record "Node $(node -v), npm $(npm -v), Docker działa"

step "Zależności (npm install)"
npm install --no-audit --no-fund
record "zainstalowane"

step "Plik .env"
if [[ -f .env ]]; then
  env_url="$(env_value DATABASE_URL .env)"
  if [[ -n "$env_url" && "$env_url" != "$(env_value DATABASE_URL .env.example)" ]]; then
    warn "DATABASE_URL w .env różni się od .env.example — migracje i seed trafią na skonfigurowaną bazę, nie na kontener compose."
  fi
  record "pominięto (plik istnieje, bez zmian)"
else
  cp .env.example .env
  record "utworzono z .env.example"
fi

step "PostgreSQL (docker compose)"
docker compose up -d --wait postgres ||
  fail "Nie udało się uruchomić PostgreSQL. Sprawdź, czy port 5432 nie jest zajęty (np. przez lokalny Postgres)."
record "działa (healthcheck OK)"

step "Migracje"
npm run db:migrate
record "aktualne"

step "Dane przykładowe (seed)"
npm run db:seed
record "gotowe"

printf '\n\033[32mGotowe — środowisko skonfigurowane.\033[0m\n'
printf '  %s\n' "${summary[@]}"
printf '\nUruchom aplikację: npm run dev  →  http://localhost:3000\n'
