# Execution plan: setup-installer

Source doc: .ai/specs/2026-10-19-setup-installer.md
Issue: #1 · Spec PR: #3

## Goal

`npm run setup` (bash `scripts/setup.sh`) performs the README "Uruchomienie lokalne" steps idempotently; README documents it with manual steps kept as alternative.

## Scope

- `scripts/setup.sh` (new), root `package.json` (`setup` script), `README.md`.

Non-goals: changes to existing scripts, compose, migrations or seeder; Windows without bash; starting `npm run dev`.

## Implementation Plan

### Phase 1: Installer

1. Add `scripts/setup.sh` + `setup` npm script (prerequisites from `.nvmrc`, npm ≥ 11, Docker; npm install; `.env` only when missing with DATABASE_URL drift warning; `docker compose up -d --wait postgres`; migrate; seed; summary).
2. Verify idempotency and failure paths manually (second run, Docker stopped, `.env` untouched).

### Phase 2: Docs

1. README: `npm run setup` as recommended path, manual steps as alternative, row in scripts table.

## Risks

- Port 5432 busy → compose fails; handled by ERR trap message.
- Validation gate `npm run ci:local` needs Docker; the spec file is materialized from spec PR #3 and stays untracked (not part of this PR).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Installer

- [x] 1.1 Add setup script and npm entry — a64db07
- [x] 1.2 Verify idempotency and failure paths — a64db07 (manual: fresh run, 2nd run, Docker stopped, port 5432 busy, DATABASE_URL drift)

### Phase 2: Docs

- [x] 2.1 Document npm run setup in README — 85e46ae
