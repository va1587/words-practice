# MikroORM importuje każdy plik z katalogu seederów i migracji

## Co się stało

Po dodaniu `src/seeders/DatabaseSeeder.int.test.ts` komenda `npm run db:seed` zaczęła padać z błędem „Vitest failed to find the runner”. Lokalnie nikt tego nie zauważył, bo baza z docker compose była już zaseedowana; wyszło dopiero przy odtworzeniu joba CI na świeżej bazie.

## Przyczyna

SeedManager (i Migrator) wczytuje wszystkie pliki pasujące do `glob` (domyślnie `!(*.d).{js,ts}`) z `seeder.path`/`migrations.path` — także testy, które importują Vitest.

## Wniosek / jak stosować

- W `packages/db/src/seeders/` i `src/migrations/` trzymaj wyłącznie seedery/migracje. Testy seederów: `packages/db/src/database-seeder.int.test.ts`.
- Zmiany w CI/skryptach bazy weryfikuj na **świeżej** bazie (pusty kontener), nie na lokalnej z danymi.
