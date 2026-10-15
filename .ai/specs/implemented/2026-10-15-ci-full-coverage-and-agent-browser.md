# CI na PR: build, lint, 100% testów jednostkowych, integracja przez agent-browser

## Cel

Na każdym pull requeście GitHub CI ma osobno sprawdzać: build, lint, testy jednostkowe (TypeScript) i testy integracyjne, w których PostgreSQL startuje przez Testcontainers, a tymczasowa instancja aplikacji jest testowana przez **agent-browser** (CLI Vercela do automatyzacji przeglądarki przez agentów AI). Istniejący kod ma mieć 100% pokrycia testami jednostkowymi, a zasada „każda nowa funkcja = 100% pokrycia” trafia do AGENTS.md.

## Kontekst

- Wymagania użytkownika z 2026-10-15.
- Stan po fazie B ([spec](2026-10-15-phase-b-tests-and-ci.md)): Vitest (unit tylko w `core` z progiem 90% oraz `env` w `db`), Testcontainers dla repozytoriów `db`, E2E w Playwright + axe przeciw Postgresowi z docker compose / service w CI, jeden job `checks` + job `e2e`.
- agent-browser 0.38.1 (najnowsza wersja ≥ 14 dni): natywne binarki w paczce npm, JSON `{success, data, error}`, exit 1 przy błędzie, wbudowany audyt axe (`a11y --json`), sesje (`--session`), `find role … --name`, `wait --text`.

## Decyzje projektowe

1. **agent-browser zastępuje Playwright.** Ma wbudowany audyt axe, więc pokrywa E2E i dostępność. Dwa frameworki przeglądarkowe dublowałyby się. Wszystkie dotychczasowe scenariusze Playwright przenosimy, żeby nie stracić pokrycia.
2. **Jeden harness integracyjny** w `packages/app/integration/`:
   - Vitest `globalSetup` startuje Postgres przez Testcontainers, stosuje prawdziwe migracje i seed, uruchamia `next start` (build produkcyjny) z `DATABASE_URL` kontenera na wolnym porcie i czeka na gotowość.
   - Helper `browser.ts` opakowuje CLI agent-browser (`--json`, osobna sesja na plik testowy, sprzątanie przez `close`).
   - Start bazy jest współdzielony z testami `db`: `@devmentor/db/testing` → `startTestDatabase()`.
3. **CI bez `services: postgres`.** Bazę zawsze zapewnia Testcontainers, tak samo lokalnie i w CI.
4. **Osobne joby na PR**: `build`, `lint` (z formatem, typecheck, knip, audit), `unit` (pokrycie 100%), `integration` (Testcontainers: `db` + `app` z agent-browser). Każdy wymóg jest osobnym statusem na PR.
5. **100% pokrycia jednostkowego** (linie, gałęzie, funkcje, instrukcje), próg `100` w `vitest.config.ts` każdego pakietu. Z pomiaru wyłączone są tylko pliki, które nie są kodem aplikacji:
   - pliki testowe i infrastruktura testów (`**/*.test.*`, `src/testing/**`, `integration/**`);
   - wygenerowane migracje (pokrywa je integracja);
   - configi narzędzi (`next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`).

   `mikro-orm.config.ts` zawiera logikę ładowania `.env`, więc jest testowany.

6. **Testy jednostkowe warstw:**
   - `core`: fake'owe porty;
   - `db`: fake `EntityManager` dla repozytoriów i seedera; prawdziwe metadane encji przez `new MikroORM()` bez połączenia z bazą;
   - `ui` i `app`: jsdom + Testing Library. Mocki: `next/navigation`, `next/server`, `next/font`, `server-only`, `@/lib/container`.
   - Asynchroniczne Server Components testujemy przez `await Component(props)` i renderowanie zwróconego drzewa. Komponenty asynchroniczne zagnieżdżone w `<Suspense>` wydzielamy do `components/` (jak `PathGrid`), żeby dało się je testować osobno.

## Plan — fazy i kryteria ukończenia

| #   | Faza                                                                                                                                                                     | Kryterium ukończenia                                                                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | `@devmentor/db/testing`: `startTestDatabase()` (Testcontainers + migracje + seed), użyty w `db` globalSetup                                                              | testy integracyjne `db` zielone na nowym helperze                                                                                                                      | ✅     |
| 2   | Harness integracyjny `app` (Testcontainers + `next start` + agent-browser), testy strony głównej i panelu admina + migracja scenariuszy Playwright, usunięcie Playwright | `npm run test:integration` zielone (db + app); scenariusze: strona główna, panel admina (przegląd + tabela), katalog, ścieżka, lekcja, dashboard, nawigacja, 404, a11y | ✅     |
| 3   | Unit testy do 100%: `core`, `db`, `ui`, `app` + progi 100 w każdym pakiecie                                                                                              | `npm run test:coverage` zielone, każdy pakiet 100/100/100/100                                                                                                          | ✅     |
| 4   | GitHub CI: joby `build`, `lint`, `unit`, `integration`                                                                                                                   | actionlint OK; każdy job odtworzony lokalnie od `npm ci`                                                                                                               | ✅     |
| 5   | AGENTS.md (zasada 100% dla nowych funkcji, harness integracyjny), README                                                                                                 | dokumenty zaktualizowane                                                                                                                                               | ✅     |

## Otwarte pytania

- Brak. Zakres i narzędzia wskazał użytkownik.

## Postęp

- 2026-10-15 — spec utworzony.
- 2026-10-15 — wdrożone wszystkie fazy:
  - 1: `@devmentor/db/testing` → `startTestDatabase()`; testy `db:integration` (9) na nowym helperze.
  - 2: harness `packages/app/integration/` (Testcontainers → `next start` na wolnym porcie → agent-browser 0.38.1). 14 testów: strona główna (4), panel admina (4: statystyki, tabela, aktywna nawigacja, a11y), ścieżki/lekcje/dashboard/nagłówek/404/a11y (6). Playwright usunięty (wszystkie scenariusze przeniesione). Audyt agent-browser wykrył nowe naruszenie: `aria-label` na `div` bez roli w szkieletach ładowania (`aria-prohibited-attr`) → `role="status"`. Dodatkowo `/admin/paths` dostał `<h1>`; asynchroniczne `PlatformStats` i `PathsTable` wydzielone do `components/admin/`.
  - 3: 100% pokrycia (linie, gałęzie, funkcje, instrukcje) we wszystkich pakietach: `core` 19 testów, `db` 30, `ui` 9, `app` 55. Progi `100` w każdym `vitest.config.ts`; sprawdzone, że niepokryta funkcja daje exit 1.
  - 4: `ci.yml` z jobami `build`, `lint`, `unit`, `integration` (bez `services: postgres`); actionlint ✅. Każdy job odtworzony lokalnie od `npm ci` (integracja przy zatrzymanym Postgresie z compose).
  - 5: AGENTS.md — jednoznaczna zasada 100% pokrycia dla nowych funkcji, wzorce testów, DoD; README — skrypty i CI.
  - Znalezione przy okazji: (a) `.snapshot-test.json` z testów trafił do commita `6eb90bd` — usunięty, `snapshot: false` w helperze; (b) formatowanie migracji przez Prettier uruchomiony z katalogu pakietu — przywrócone z `HEAD`.
  - Ograniczenie: workflow nie był uruchomiony na GitHubie (wymaga pusha); krok `agent-browser install --with-deps` sprawdzony tylko składniowo (Linux).
