#!/usr/bin/env bash
# Replays the GitHub CI jobs (build, lint, unit, integration) on a CLEAN checkout of the current
# working tree. Gitignored artifacts (.next/types, coverage, .turbo) and the Turborepo cache shared
# between worktrees can hide failures that appear on CI — this script rules both out.
#
# Usage: npm run ci:local [-- --skip-integration]
# Note: untracked files are not included — `git add` new files first.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
snapshot="$(git -C "$repo_root" stash create)"
snapshot="${snapshot:-HEAD}"
workdir="$(mktemp -d "${TMPDIR:-/tmp}/devmentor-ci-XXXXXX")"

cleanup() {
  git -C "$repo_root" worktree remove --force "$workdir" >/dev/null 2>&1 || rm -rf "$workdir"
  git -C "$repo_root" worktree prune
}
trap cleanup EXIT

git -C "$repo_root" worktree add --quiet --detach "$workdir" "$snapshot"
cd "$workdir"

step() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

step "npm ci"
LEFTHOOK=0 npm ci --no-audit --no-fund

step "job: lint"
npm run format:check
npx turbo run lint typecheck --force
npm run knip
npm run audit

step "job: build"
npx turbo run build --force

step "job: unit"
npx turbo run test:coverage --force

if [[ "${1:-}" != "--skip-integration" ]]; then
  step "job: integration (Docker required)"
  npx turbo run test:integration --force
fi

step "working tree must stay clean after CI"
if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  echo "✖ CI steps modified tracked files (see above)" >&2
  exit 1
fi

printf '\n\033[32m✔ All CI jobs passed on a clean checkout of %s\033[0m\n' "$snapshot"
