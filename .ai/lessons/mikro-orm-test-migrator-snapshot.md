# Migrator w testach zapisywał `.snapshot-test.json` do repo

## Co się stało

Po fazie B w commicie `6eb90bd` znalazł się `packages/db/src/migrations/.snapshot-test.json`. Testy integracyjne uruchamiają `orm.migrator.up()` na bazie z Testcontainers (nazwa bazy `test`), a MikroORM domyślnie (`snapshotOnMigrate`) zapisuje po migracji snapshot schematu `.snapshot-<dbName>.json` do katalogu migracji.

## Rozwiązanie

`startTestDatabase()` (`packages/db/src/testing/database.ts`) ustawia `migrations.snapshot: false`; plik usunięty z repo.

## Jak stosować

Każde narzędzie testowe uruchamiające migrator/seeder ma wyłączony zapis snapshotów. Po `npm run test:integration` `git status` musi być czysty.
