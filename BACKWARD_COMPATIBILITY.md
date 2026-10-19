# Kompatybilność wsteczna — chronione powierzchnie kontraktowe

Ten plik wymienia powierzchnie DevMentor, których zmiana może zepsuć kod, dane lub użytkowników poza samym diffem. Skille review sprawdzają zmiany względem tego pliku; skille implementujące ostrzegają, gdy zmiana go narusza. Zmiana dotykająca którejkolwiek z poniższych powierzchni domyślnie dostaje `risk-high` (zob. `SDLC.md`).

Projekt nie publikuje pakietów do npm ani publicznego API — konsumentami kontraktów są inne pakiety monorepo, baza danych z istniejącymi danymi, środowiska uruchomieniowe i użytkownicy (adresy URL).

## 1. Schemat bazy danych i migracje

**Powierzchnia:** encje w `packages/db/src/entities/`, migracje w `packages/db/src/migrations/`, `.snapshot-*.json`, seedy.

**Zmiana łamiąca:** usunięcie lub zmiana nazwy tabeli/kolumny, zawężenie typu, dodanie `NOT NULL` bez wartości domyślnej, usunięcie indeksu używanego przez zapytania, edycja zastosowanej migracji, seed, który nie jest idempotentny.

**Wymagana ścieżka:**

- Każda zmiana schematu = nowa migracja + snapshot w tym samym PR-ze; `migration:check` bez różnic.
- Expand → contract: najpierw dodaj (nowa kolumna/tabela, zapis do obu), w osobnym PR-ze po wdrożeniu usuń stare. Nigdy jednym krokiem.
- Plan rollbacku (metoda `down` lub opis) w opisie PR-a; test migracji na prawdziwym Postgresie (Testcontainers).

## 2. Porty i typy domenowe (`@devmentor/core`)

**Powierzchnia:** wszystko eksportowane z `packages/core/src/index.ts` — typy domenowe (`LearningPath`, `PathSummary`, `PlatformStats`, `UserProgress`, …), porty (`LearningPathRepository`, `ProgressRepository`, `StatsRepository`), serwisy, `registerCore` i `CoreCradle`.

**Zmiana łamiąca:** usunięcie/zmiana nazwy eksportu, zmiana sygnatury metody portu lub serwisu, zawężenie typu zwracanego (np. `T | null` → `T` jest OK, `T` → `T | null` nie), zmiana nazwy klucza rejestracji DI.

**Wymagana ścieżka:** w tym samym PR-ze zaktualizuj wszystkie implementacje (`packages/db/src/repositories/`) i konsumentów (`packages/app`) oraz ich testy; monorepo pozwala na atomową zmianę, ale typecheck i testy wszystkich pakietów muszą przejść. Nazwy rejestracji DI zmieniaj razem z `CoreCradle`/`DbCradle` i `packages/app/lib/container.ts`.

## 3. Eksporty pakietów

**Powierzchnia:** pola `exports` w `package.json`:

- `@devmentor/core` — `.`
- `@devmentor/db` — `.`, `./testing` (`startTestDatabase()` i helpery testów integracyjnych)
- `@devmentor/ui` — `./globals.css`, `./lib/*`, `./components/*`

**Zmiana łamiąca:** usunięcie lub przeniesienie ścieżki eksportu, zmiana nazwy pliku komponentu w `packages/ui/src/components/` (ścieżka `@devmentor/ui/components/<nazwa>` jest kontraktem), zmiana propsów komponentu shadcn używanego w `/admin`.

**Wymagana ścieżka:** zaktualizuj importy we wszystkich pakietach w tym samym PR-ze; knip musi pozostać czysty.

## 4. Tokeny motywu (`@devmentor/ui/globals.css`)

**Powierzchnia:** zmienne CSS i klasy Tailwind motywu (`--primary`, `--background`, `--muted-foreground`, …).

**Zmiana łamiąca:** usunięcie lub zmiana nazwy tokenu; zmiana wartości obniżająca kontrast poniżej WCAG AA.

**Wymagana ścieżka:** zaktualizuj użycia w `app` i `ui`; uruchom testy integracyjne z audytem a11y (`seriousA11yViolations()` = `[]`).

## 5. Trasy (adresy URL)

**Powierzchnia:** strony w `packages/app/app/`:

- publiczne: `/`, `/paths`, `/paths/[slug]`, `/paths/[slug]/[lesson]`, `/dashboard`
- panel: `/admin`, `/admin/paths`

**Zmiana łamiąca:** usunięcie lub zmiana ścieżki, zmiana znaczenia segmentu dynamicznego (np. `slug` → `id`), zmiana formatu slugów w danych.

**Wymagana ścieżka:** przekierowanie ze starego adresu (`redirects` w `next.config.ts` lub trasa przekierowująca), test integracyjny starego i nowego adresu, wzmianka w opisie PR-a.

## 6. Zmienne środowiskowe

**Powierzchnia:** schematy Zod w `packages/db/src/env.ts` (`NODE_ENV`, `DATABASE_URL`, `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`, `DATABASE_DEBUG`) i `packages/app/lib/env.ts` (`DEMO_USER_EMAIL`), `.env.example`, jeden `.env` w roocie.

**Zmiana łamiąca:** nowa wymagana zmienna bez wartości domyślnej, zmiana nazwy, zawężenie formatu, zmiana znaczenia wartości domyślnej.

**Wymagana ścieżka:** nowa zmienna z bezpieczną wartością domyślną lub jawnie opisana w opisie PR-a jako wymagana zmiana konfiguracji; zawsze wpis w `.env.example`; zmiana nazwy przez okres przejściowy, w którym czytane są obie.

## 7. Skrypty npm i infrastruktura deweloperska

**Powierzchnia:** skrypty w root `package.json` (`dev`, `build`, `check`, `test:coverage`, `test:integration`, `ci:local`, `db:*`, `audit`), `docker-compose.yml`, joby CI (`build`, `lint`, `unit`, `integration` — nazwy są wymaganymi checkami), `.ai/agentic.config.json`.

**Zmiana łamiąca:** usunięcie lub zmiana nazwy skryptu używanego w `AGENTS.md`, `SDLC.md`, CI lub `validation.commands`; zmiana nazwy joba CI będącego wymaganym checkiem.

**Wymagana ścieżka:** zaktualizuj w tym samym PR-ze wszystkie odwołania (`AGENTS.md`, `SDLC.md`, `.github/workflows/`, `scripts/ci-local.sh`, `.ai/agentic.config.json`); zmianę nazwy wymaganego checka uzgodnij z maintainerem (ochrona gałęzi). Weryfikacja przez `npm run ci:local`.
