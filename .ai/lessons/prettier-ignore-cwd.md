# Prettier czyta `.prettierignore` tylko z bieżącego katalogu

## Co się stało

`npx prettier --write src` uruchomione w `packages/db` sformatowało wygenerowane migracje MikroORM i snapshot schematu, mimo że `packages/db/src/migrations` jest w root `.prettierignore`. Zmiany były kosmetyczne, ale migracji nie wolno edytować — przywrócone z `git checkout`.

## Przyczyna

Prettier 3 szuka `.prettierignore` w bieżącym katalogu roboczym (cwd), nie w katalogach nadrzędnych.

## Wniosek / jak stosować

Formatuj wyłącznie z roota (`npm run format`, hook pre-commit działa z roota). Po masowym formatowaniu sprawdź `git status packages/db/src/migrations` — powinno być puste.
