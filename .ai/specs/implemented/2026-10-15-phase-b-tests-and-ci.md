# Faza B — testy i CI

Specyfikacja wykonawcza fazy B z [2026-10-15-tech-stack-and-engineering-standards](../2026-10-15-tech-stack-and-engineering-standards.md) (§3.5, §3.6, §5.2, §8).

## Cel

Zabezpieczyć dalszy rozwój automatycznymi testami na trzech poziomach (unit, integracja z prawdziwym Postgresem, E2E z dostępnością) i pipeline'em CI, który uruchamia wszystkie sprawdzenia na każdym PR.

## Zakres i kryteria ukończenia

| #   | Krok                                                                                                                                                              | Kryterium                                                                                     | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| B1  | Vitest 5 — konfiguracja projektów w roocie (`core` unit, `db` integracja), skrypty `test`, `test:unit`, `test:integration`, `test:coverage`                       | `npm test` uruchamia oba projekty                                                             | ✅     |
| B2  | Testy jednostkowe `core`: `computePathProgress`, `getLessons`, `lessonKey`, `LearningPathService`, `ProgressService`, `AdminService`, `registerCore` (fake porty) | pokrycie `packages/core` ≥ 90% linii i gałęzi (próg w konfiguracji — CI pada poniżej)         | ✅     |
| B3  | Testy integracyjne `db` na Testcontainers (Postgres 17, prawdziwe migracje + seeder): każda metoda każdego repozytorium, idempotencja seedera, `readDbEnv`        | każda metoda repozytorium ma ≥ 1 test; testy zielone na czystym kontenerze                    | ✅     |
| B4  | Playwright + `@axe-core/playwright` w `packages/app/e2e`: smoke wszystkich stron, nawigacja katalog → ścieżka → lekcja, 404, skan a11y                            | E2E zielone; 0 naruszeń axe `serious`/`critical` (WCAG 2.2 A/AA)                              | ✅     |
| B5  | Turborepo: `turbo.json` (lint, typecheck, test, build) z cache                                                                                                    | `npx turbo run lint typecheck test:unit` działa, drugi przebieg z cache                       | ✅     |
| B6  | GitHub Actions `ci.yml`: checks (format, lint, typecheck, knip, unit, integracja, build) + e2e (Postgres service, migracje, seed, build, Playwright)              | workflow poprawny składniowo; kroki identyczne z lokalnymi skryptami (zweryfikowane lokalnie) | ✅     |
| B7  | Renovate: `minimumReleaseAge` 14 dni (zgodnie z `.npmrc`), grupy Next/React, MikroORM, shadcn/Base UI, lint, test                                                 | `renovate.json` poprawny wg schematu                                                          | ✅     |
| B8  | Dokumentacja: AGENTS.md (zasady testów, Definition of Done), README (skrypty)                                                                                     | zaktualizowane                                                                                | ✅     |

## Decyzje

- **Wersje zgodne z polityką 14 dni** (`.npmrc` `min-release-age=14`): Vitest 5.0.3, Playwright 1.63, Testcontainers 12.2.0, Turborepo 2.11.6 (stan na 2026-10-15).
- **Testy obok kodu** (`*.test.ts`); integracyjne `db` jako `*.int.test.ts`, żeby `test:unit` nie wymagał Dockera.
- **Izolacja testów integracyjnych**: jeden kontener na przebieg (`globalSetup`), migracje + seed raz; testy tylko czytają (repozytoria są dziś read-only). Gdy dojdą zapisy (faza D) — transakcja z rollbackiem per test.
- **E2E przeciw buildowi produkcyjnemu** (`next start`), nie `next dev` — zachowanie Cache Components/PPR jest inne w dev. Baza: lokalny docker compose / service w CI, migracje + seed przed testami.
- **Brak testów komponentów (Testing Library)** w tej fazie: obecne komponenty klienckie (`NavLink`, `AdminNav`) nie mają stanu; ich zachowanie (aktywny link) pokrywa E2E. Testing Library dochodzi z pierwszym komponentem ze stanem.
- **CI tylko na GitHub Actions** (remote `origin` na GitHubie). Uruchomienie samego workflow wymaga pusha — weryfikujemy lokalnie wszystkie kroki i składnię (actionlint).

## Postęp

- 2026-10-15 — spec utworzony.
- 2026-10-15 — faza B wdrożona:
  - B1 Vitest 5.0.3: `packages/core/vitest.config.ts` (unit + progi pokrycia 90%), `packages/db/vitest.config.ts` (projekty `db:unit` i `db:integration`); skrypty `test`, `test:coverage`, `test:integration`.
  - B2 17 testów `core` (domena, 3 serwisy, `registerCore` + scoping) na fake'owych portach; pokrycie: linie 94,1%, gałęzie 100%, funkcje 100%, instrukcje 95%.
  - B3 13 testów `db` (4 unit `readDbEnv`, 9 integracyjnych): każda metoda 3 repozytoriów + idempotencja seedera; Testcontainers Postgres 17, prawdziwe migracje (ładowane przez `dynamicImportProvider` w runnerze Vitest) i seed.
  - B4 10 testów Playwright 1.63 + axe 4.13: 5 stron publicznych + 2 admina z pełnym skanem WCAG 2.2 A/AA, nawigacja katalog → ścieżka → lekcja → następna, aktywny link, 404. **Skan znalazł i naprawiono 3 realne problemy dostępności**: kontrast `--muted-foreground` na `--muted` 4,34:1 (token shadcn → `oklch(0.52 0 0)`, teraz ≥ 4,5:1), `opacity-80` w CTA dashboardu (4,49:1), link w tekście odróżniony tylko kolorem (dodane podkreślenie). Dodatkowo status lekcji w liście: `aria-label` na `<span>` → tekst `sr-only` + `aria-hidden` na ikonie.
  - B5 Turborepo 2.11.6 (`turbo.json`), root skrypty przez `turbo run`; drugi przebieg „FULL TURBO” (10/10 z cache).
  - B6 `.github/workflows/ci.yml` (job `checks` + `e2e`), akcje przypięte do SHA w wersjach ≥ 14 dni; actionlint ✅. Oba joby odtworzone lokalnie krok po kroku (`npm ci`, świeży Postgres) — **replay wykrył błąd: `db:seed` padał, bo SeedManager importował test z `src/seeders/`** (test przeniesiony, ostrzeżenie w configu i AGENTS.md) oraz brak testów unit `db` w workflow (dodane `test`).
  - Audyt: `npm audit` zgłaszał 8× high — jedno zgłoszenie GHSA-vfj7-8cjw-p6xm (`braces`, brak poprawki) przez `awilix` i CLI `shadcn`. `shadcn` przeniesiony do `devDependencies` (narzędzie build-time); `audit-ci` z uzasadnioną allowlistą (sprawdzone: bez allowlisty exit 1).
  - B7 `renovate.json` (min. wiek 14 dni, wyjątek Next.js, grupy, ESLint `<10`, pinning digestów akcji) — `renovate-config-validator` ✅.
  - B8 AGENTS.md: „Testy (obowiązkowe)”, „Weryfikacja i Definition of Done”, „Zależności”; README: skrypty testowe, sekcja CI.
  - Ograniczenie: workflow nie został uruchomiony na GitHubie (wymaga pusha) — zweryfikowany lokalnym replayem i actionlintem.
