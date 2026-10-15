# Jeden `.env` w roocie monorepo — kto go wczytuje

## Co odkryto

README zalecało `cp .env.example .env` w roocie, ale ten plik nie był nigdzie wczytywany: Next.js szuka `.env*` tylko w katalogu projektu (`packages/app`), a MikroORM CLI (uruchamiane w `packages/db`) nie wczytuje `.env` wcale. Działało tylko dlatego, że domyślne wartości pasowały do docker compose. Wyszło na jaw po dodaniu walidacji env (faza A), bo produkcyjny `next start` wymaga `DATABASE_URL`.

`--env-file`/`--env-file-if-exists` nie są dozwolone w `NODE_OPTIONS`, więc nie da się tego załatwić skryptem npm.

## Rozwiązanie

- `packages/app/next.config.ts`: `loadEnvConfig(<root>)` z `@next/env` — ta sama semantyka co natywne ładowanie Next (`.env`, `.env.local`, `.env.<NODE_ENV>`).
- `packages/db/mikro-orm.config.ts`: `process.loadEnvFile()` dla `../../.env.local` i `../../.env`; zmienne już ustawione mają pierwszeństwo.

## Jak stosować

Nowy proces uruchamiany z innego pakietu (worker, skrypt) musi jawnie wczytać root `.env` w swoim punkcie wejścia. Wartości czytaj tylko przez moduły `env.ts` (Zod).
