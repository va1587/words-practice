# Lessons

Indeks najważniejszych ustaleń i wniosków zebranych podczas pracy AI nad tym projektem. To pamięć długoterminowa projektu — czytaj ją na początku pracy, aktualizuj na końcu.

Szczegółowe wpisy trzymamy w `.ai/lessons/<slug>.md`, a tutaj zostaje tylko jednolinijkowy wpis-wskaźnik do każdego z nich (analogicznie do indeksu, nie treści).

Format wpisu:

```
- [Krótki tytuł](lessons/<slug>.md) — jedno zdanie, czego dotyczy i kiedy to sprawdzić
```

## Wpisy

- [CI a zrzuty kodu z lekcji](lessons/ci-script-names-match-package-json.md) — zrzut z lekcji 3 usunął prettier/knip/audit-ci, a CI dalej je wołał; sprawdź po każdej podmianie `package.json`
- [Nieznane parametry → HTTP 200 przy Cache Components](lessons/cache-components-unknown-params-404.md) — `notFound()` na dynamicznej trasie nie daje statusu 404; sprawdź przy testach 404/SEO
- [Dostęp do bazy przy Cache Components](lessons/cache-components-db-access.md) — dlaczego `getRequestContainer()` woła `connection()` i dane muszą być w `<Suspense>`; sprawdź przy błędach prerenderu z `Date.now()`
- [`usePathname()` w layoucie a Suspense](lessons/cache-components-usepathname-suspense.md) — błąd buildu „URL data outside of Suspense” w nawigacji na trasach dynamicznych
- [Monorepo npm + shadcn/ui](lessons/monorepo-npm-shadcn-setup.md) — peer `react-dom` w `ui`, konfiguracja shadcn dla monorepo, `--` w skryptach delegujących
- [Jeden `.env` w roocie monorepo](lessons/monorepo-root-env-loading.md) — Next.js i MikroORM CLI nie czytają root `.env` same z siebie; jak to rozwiązano
- [lefthook `--all-files` na brudnym drzewie](lessons/lefthook-all-files-dirty-tree.md) — ryzyko utraty niezastage'owanych zmian; do pełnego sprawdzenia używaj `npm run check`
- [ESLint 10 zablokowany przez eslint-config-next](lessons/eslint-10-blocked-by-next-config.md) — zostajemy na ESLint 9.x, dopóki wtyczki Next nie wspierają 10
- [MikroORM importuje każdy plik z `seeders/` i `migrations/`](lessons/mikro-orm-seeders-dir-imports-all.md) — test w katalogu seederów psuł `db:seed`; weryfikuj na świeżej bazie
- [Kontrast `--muted-foreground` shadcn](lessons/shadcn-muted-foreground-contrast.md) — domyślny token nie spełnia WCAG AA na `--muted`; po zmianach tokenów uruchom E2E z axe
- [Prettier i `.prettierignore` z cwd](lessons/prettier-ignore-cwd.md) — formatuj tylko z roota, inaczej Prettier zmieni migracje
- [Snapshot migratora w testach](lessons/mikro-orm-test-migrator-snapshot.md) — testy zapisywały `.snapshot-test.json` do repo; `snapshot: false` w helperze
- [agent-browser w testach integracyjnych](lessons/agent-browser-integration.md) — format JSON, exit codes, `get attr`, audyt a11y, czekanie na dane PPR
- [Lint padał tylko na CI](lessons/ci-clean-checkout-and-generated-types.md) — typy `next typegen` + cache Turborepo ukryły błąd lokalnie; weryfikuj przez `npm run ci:local`
