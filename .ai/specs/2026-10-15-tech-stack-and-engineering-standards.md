# DevMentor — tech stack, standardy inżynieryjne, coding standards i wzorce projektowe

> Status: **propozycja do akceptacji** — po zatwierdzeniu wdrażana fazami (sekcja 8). Każda faza dostaje własną specyfikację wykonawczą.
> Research: 2026-10-15 (npm registry, bundled docs Next.js 16.4 w `node_modules/next/dist/docs/`, źródła w sekcji 10).

## 1. Cel

Ustalić docelowy, możliwie najlepszy na dziś zestaw technologii i zasad, w którym DevMentor (platforma ścieżek nauki — patrz README) będzie rozwijany: od wyboru bibliotek, przez standardy procesu i jakości, po konwencje kodu i wzorce architektoniczne. Dokument jest punktem odniesienia dla ludzi i agentów AI; obowiązujące, krótkie reguły trafiają do AGENTS.md w miarę wdrażania faz.

## 2. Kontekst i ograniczenia

- **Narzucone przez właściciela projektu** (nie podlegają zmianie bez jego zgody): Next.js (najnowszy) + React + TypeScript, PostgreSQL + MikroORM, Awilix, Tailwind (frontend), shadcn/ui (backend/admin), monorepo `packages/{app,core,db,ui}`.
- **Stan na 2026-10-15** (commit `004919c` + faza 9 lint): Next 16.4.1 z `cacheComponents`, React 19.3, MikroORM 7.2, Awilix 13, Tailwind 4, shadcn 4 (Base UI), npm workspaces, TypeScript 5.9, ESLint 9 z regułami granic pakietów. **Brak**: testów, CI, formattera, uwierzytelniania, mutacji danych, walidacji env, logowania/obserwowalności.
- **Domena**: treści (ścieżki → moduły → lekcje), postęp użytkownika, panel administracyjny. Zapisy będą głównie małe i transakcyjne (ukończenie lekcji, zapis na ścieżkę), odczyty — dominujące i dobrze cache'owalne (katalog treści).
- **Kontekst prawny**: produkt edukacyjny w UE → European Accessibility Act (od 28.06.2025) i RODO.

### Kryteria wyboru technologii

1. Zgodność z narzuconym stosem i Next.js 16 (Cache Components, RSC, Server Actions).
2. Dojrzałość i utrzymanie (wydania w ostatnich miesiącach, duża baza użytkowników).
3. Jak najmniej infrastruktury (PostgreSQL jako jedyny stanowy komponent — bez Redisa, dopóki nie jest konieczny).
4. Typowanie end-to-end i walidacja na granicach systemu.
5. Szybka pętla zwrotna dla ludzi i agentów (szybkie testy, deterministyczne narzędzia, czytelne błędy).
6. **Polityka wersji**: wybieramy wydania starsze niż 14 dni (ochrona przed przejętymi/wadliwymi publikacjami w łańcuchu dostaw); wersje w lockfile, aktualizacje przez bota z opóźnieniem.

## 3. Tech stack

Legenda statusu: ✅ już jest · ➕ dodać · 🔄 zmienić/zaktualizować · ⏳ później (gdy pojawi się potrzeba).

### 3.1 Platforma i narzędzia bazowe

| Obszar                      | Wybór                                        | Status    | Uzasadnienie                                                                                             | Odrzucone / alternatywy                                                                                                                                                                              |
| --------------------------- | -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                     | **Node.js 24 LTS** (`engines`, `.nvmrc`)     | ➕        | Aktywny LTS do 2028; Node 26 wejdzie w LTS pod koniec października 2026 — przejście po jego wydaniu LTS. | Node 26 (jeszcze „Current”), Bun (niezgodność z częścią ekosystemu Next/MikroORM).                                                                                                                   |
| Menedżer pakietów           | **npm 11 workspaces**                        | ✅        | Już w użyciu, `allowScripts` blokuje skrypty instalacyjne.                                               | pnpm (szybszy, ale zmiana bez wyraźnej korzyści przy 4 pakietach).                                                                                                                                   |
| Orkiestracja zadań monorepo | **Turborepo 2**                              | ➕ (z CI) | Nakładka na npm workspaces, ~30 linii configu, cache `lint/typecheck/test/build` lokalnie i w CI.        | Nx — mocniejsze grafy i generatory, ale zbędne dla 1 aplikacji i małego zespołu; granice pakietów już egzekwuje ESLint.                                                                              |
| Język                       | **TypeScript 6.0** (`strict` + flagi z §6.1) | 🔄 z 5.9  | Najnowsza wersja wspierana przez `typescript-eslint` (peer `<6.1`).                                      | **TypeScript 7.0** (kompilator w Go, ~10× szybszy) — stabilny od lipca 2026, ale bez stabilnego API programistycznego do 7.1, więc `typescript-eslint` go nie obsługuje. Wrócić do tematu po TS 7.1. |

### 3.2 Aplikacja

| Obszar           | Wybór                                                                                                                              | Status                                   | Uzasadnienie                                                                                                   | Odrzucone / alternatywy                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | **Next.js 16.4 App Router**, `cacheComponents`, `partialPrefetching`                                                               | ✅                                       | Narzucony; PPR daje statyczny shell + strumieniowane dane.                                                     | —                                                                                                                                                                                                                                                                                                                   |
| UI runtime       | **React 19.3** (Server Components domyślnie)                                                                                       | ✅                                       | —                                                                                                              | —                                                                                                                                                                                                                                                                                                                   |
| Walidacja        | **Zod 4**                                                                                                                          | ➕                                       | Schematy wejścia Server Actions, env, parametrów URL; inferencja typów.                                        | Valibot (mniejszy bundle, ale mniejszy ekosystem).                                                                                                                                                                                                                                                                  |
| Konfiguracja/env | **Moduł `env.ts` na Zod** (osobno: `packages/db` — `DATABASE_URL`; `packages/app` — reszta), walidacja przy starcie                | ➕                                       | Brak dodatkowej zależności; Next wymaga, by tylko warstwa serwerowa czytała `process.env`.                     | `@t3-oss/env-nextjs` (dobry, ale rzadko wydawany; własny moduł to ~20 linii).                                                                                                                                                                                                                                       |
| Uwierzytelnianie | **Better Auth 1.x** z adapterem SQL (pula `pg`/Kysely) + plugin `admin` (role)                                                     | ➕                                       | Rekomendowany w 2026 dla nowych projektów TS, self-hosted (dane w naszym Postgresie — RODO), wsparcie Next 16. | Auth.js (mniej rozwijany, słabszy model ról); Clerk (SaaS, dane poza UE, koszt per MAU). **Adapter `better-auth-mikro-orm` odrzucony** — społecznościowy, peer `@mikro-orm/core ^6`. Tabele Better Auth tworzymy migracją MikroORM (SQL wygenerowany `better-auth generate`), a encja `User` mapuje tę samą tabelę. |
| Formularze       | **Server Actions + `useActionState` + Zod**; `react-hook-form` tylko dla złożonych formularzy klienckich (edytor treści w adminie) | ➕                                       | Progressive enhancement, mniej JS.                                                                             | Formularze wyłącznie klienckie.                                                                                                                                                                                                                                                                                     |
| Stan URL         | **nuqs 2**                                                                                                                         | ⏳ (filtry katalogu)                     | Typowany stan w query string, zgodny z App Router.                                                             | Ręczne `useSearchParams`.                                                                                                                                                                                                                                                                                           |
| Treść lekcji     | **Markdown w bazie**, renderowany po stronie serwera (`remark`/`rehype` z sanitizacją)                                             | ⏳ (z edytorem treści)                   | Treść edytowana w panelu admina, bez redeployu; brak wykonywania kodu z bazy (w przeciwieństwie do MDX).       | MDX w repo (wymaga deployu do zmiany treści, tylko dla deweloperów).                                                                                                                                                                                                                                                |
| i18n             | **Brak (tylko PL)**; teksty UI trzymane w komponentach/stałych, daty i liczby przez `Intl` z `pl-PL`                               | ✅                                       | YAGNI. Gdy dojdzie drugi język → **next-intl 4**.                                                              | —                                                                                                                                                                                                                                                                                                                   |
| Zadania w tle    | **pg-boss 12** (kolejka w PostgreSQL)                                                                                              | ⏳ (pierwsze zdarzenia domenowe/e-maile) | Brak Redisa; enqueue w tej samej transakcji co zapis (wzorzec outbox), cron, retry, DLQ.                       | Graphile Worker (świetny przy enqueue z triggerów SQL — u nas zdarzenia powstają w kodzie); BullMQ (wymaga Redisa).                                                                                                                                                                                                 |

### 3.3 Dane

| Obszar        | Wybór                                                                                                     | Status  | Uzasadnienie                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Baza          | **PostgreSQL 17** (dev: docker compose)                                                                   | ✅      | Ta sama wersja we wszystkich środowiskach. Upgrade do 18 osobną decyzją, razem z hostingiem produkcyjnym (§9). |
| ORM           | **MikroORM 7** (`defineEntity`, Unit of Work, Identity Map, migracje, seedy)                              | ✅      | Narzucony; v7 = natywny ESM, zero zależności core, Kysely jako runner.                                         |
| Migracje      | MikroORM Migrator, pliki TS w repo, snapshot                                                              | ✅      | Jedno źródło prawdy dla schematu, także tabel auth i kolejki.                                                  |
| Pula połączeń | Wbudowana pula MikroORM (`pool.max` z env); w produkcji serverless → pooler (PgBouncer / pooler dostawcy) | ✅ / ⏳ | Zależne od hostingu (§9).                                                                                      |

### 3.4 UI

| Obszar            | Wybór                                                    | Status | Uwagi                                 |
| ----------------- | -------------------------------------------------------- | ------ | ------------------------------------- |
| CSS               | **Tailwind CSS 4**, tokeny w `@devmentor/ui/globals.css` | ✅     | Kolory tylko przez tokeny.            |
| Komponenty admina | **shadcn/ui 4 (Base UI)** w `packages/ui`                | ✅     | Dodawanie przez CLI z `packages/app`. |
| Ikony             | **lucide-react**                                         | ✅     | —                                     |
| Klasy warunkowe   | `cn` (clsx + tailwind-merge)                             | ✅     | —                                     |

### 3.5 Jakość i testy

| Obszar                       | Wybór                                                                                                                                                                                                                                 | Status                     | Uzasadnienie                                                                                                   | Odrzucone                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Testy unit/integracyjne      | **Vitest 5** (projekty per pakiet)                                                                                                                                                                                                    | ➕                         | Szybki, ESM, ten sam config TS; standard dla Next w 2026.                                                      | Jest (wolniejszy, gorsza obsługa ESM).                                                                                                                         |
| Testy komponentów klienckich | **Testing Library (React) 16** + jsdom                                                                                                                                                                                                | ➕                         | Tylko komponenty klienckie; RSC testujemy E2E albo jako funkcje.                                               | —                                                                                                                                                              |
| Testy repozytoriów           | **Testcontainers (`@testcontainers/postgresql`)** + prawdziwe migracje                                                                                                                                                                | ➕                         | Testy na prawdziwym Postgresie, nie na mockach ORM-a; izolacja przez transakcję/rollback lub schemat per plik. | SQLite in-memory (inny dialekt), mockowanie EntityManagera.                                                                                                    |
| E2E                          | **Playwright 1.6x** + `@axe-core/playwright`                                                                                                                                                                                          | ➕                         | Krytyczne ścieżki użytkownika + automatyczne testy dostępności na każdej stronie.                              | Cypress.                                                                                                                                                       |
| Mock HTTP                    | **MSW 3**                                                                                                                                                                                                                             | ⏳                         | Gdy pojawią się zewnętrzne API (e-mail, płatności).                                                            | —                                                                                                                                                              |
| Testy własności              | **fast-check**                                                                                                                                                                                                                        | ⏳                         | Dla czystej logiki domenowej (np. liczenie postępu/serii).                                                     | —                                                                                                                                                              |
| Lint                         | **ESLint 9.x → 10** (10 po wsparciu w `eslint-config-next`, zob. lekcja `eslint-10-blocked-by-next-config`) + `typescript-eslint` (type-aware: `recommendedTypeChecked`) + `eslint-config-next` + reguły granic (`eslint.shared.mjs`) | 🔄 z ESLint 9 (EOL wg npm) | Reguły Next/React i type-aware TS nie mają pełnych odpowiedników w szybszych linterach.                        | Biome 2 / Oxlint — szybsze, ale bez wtyczki Next i z węższym type-aware lintingiem; ocenić Oxlint jako dodatkową, szybką warstwę, gdy lint zacznie spowalniać. |
| Formatowanie                 | **Prettier 3** + `prettier-plugin-tailwindcss`                                                                                                                                                                                        | ➕                         | Deterministyczny format, sortowanie klas Tailwind.                                                             | Biome format (zostajemy przy jednym ekosystemie z ESLint).                                                                                                     |
| Martwy kod / zależności      | **knip**                                                                                                                                                                                                                              | ➕                         | Wykrywa nieużywane pliki, eksporty i zależności w workspaces.                                                  | —                                                                                                                                                              |
| Git hooks                    | **lefthook** (pre-commit: format + lint zmienionych plików; commit-msg: commitlint)                                                                                                                                                   | ➕                         | Szybki, bez zależności od `husky` + `lint-staged`.                                                             | husky + lint-staged.                                                                                                                                           |
| Konwencja commitów           | **Conventional Commits** + `@commitlint/cli`                                                                                                                                                                                          | ➕                         | Czytelna historia, przyszły changelog.                                                                         | —                                                                                                                                                              |

### 3.6 Operacje

| Obszar                   | Wybór                                                                                                                       | Status                  | Uzasadnienie                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------- |
| CI                       | **GitHub Actions**: install → lint → typecheck → test (Postgres jako service/Testcontainers) → build → e2e; cache Turborepo | ➕                      | Wymaga potwierdzenia hostingu repo (§9).     |
| Aktualizacje zależności  | **Renovate** z `minimumReleaseAge: "14 days"`, grupowanie (Next/React, MikroORM, shadcn)                                    | ➕                      | Spójne z polityką wersji (§2).               |
| Logowanie                | **pino 10** (JSON, poziomy, redakcja PII), korelacja z trace id                                                             | ⏳ (z obserwowalnością) | —                                            |
| Tracing                  | **OpenTelemetry** przez `instrumentation.ts` (`@vercel/otel` lub SDK Node przy self-hostingu)                               | ⏳                      | Zalecane w docs Next 16.                     |
| Błędy                    | **Sentry (`@sentry/nextjs`)** + `onRequestError` w `instrumentation.ts`                                                     | ⏳                      | —                                            |
| Bezpieczeństwo nagłówków | CSP (nonce), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`                                        | ⏳                      | Guide `content-security-policy` w docs Next. |

## 4. Architektura i wzorce projektowe

### 4.1 Warstwy (Ports & Adapters / architektura heksagonalna)

```
packages/app   — adaptery wejściowe: strony (RSC), Server Actions, route handlers, composition root
packages/core  — aplikacja + domena: serwisy (use cases), polityki, typy domenowe, porty
packages/db    — adaptery wyjściowe: repozytoria MikroORM, encje, migracje, (później) kolejka
packages/ui    — prezentacja bez logiki biznesowej
```

Kierunek zależności `app → core/db/ui`, `db → core` jest egzekwowany przez ESLint (już wdrożone). Domena nie zna frameworka ani ORM-a — dzięki temu logika jest testowalna jednostkowo bez bazy i bez Next.js.

### 4.2 Wzorce obowiązujące

| Wzorzec                                   | Gdzie                                   | Zasada                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Composition Root + DI (Awilix)**        | `packages/app/lib/container.ts`         | Jedyne miejsce łączenia pakietów. Singletony: `orm`, `config`, (później) `logger`, `queue`. Scope per żądanie: `em`, repozytoria, serwisy. Klasy dostają zależności przez obiekt w konstruktorze. **Do dodania**: `scope.dispose()` po odpowiedzi przez `after()` z `next/server`. |
| **Data Access Layer** (zalecenie Next.js) | serwisy `core` wołane przez `resolve()` | Tylko serwer (`server-only`), **autoryzacja w DAL** (nie w proxy/middleware — CVE-2025-29927 pokazał, że middleware nie jest granicą bezpieczeństwa), zwracane minimalne DTO, nie encje.                                                                                           |
| **Repository**                            | `packages/db/src/repositories`          | Implementuje port z `core`, zwraca typy domenowe; zapytania z jawnym `populate`/`fields` (żadnego lazy loadingu w renderze).                                                                                                                                                       |
| **Unit of Work**                          | `em` per scope                          | Serwis komendy kończy się jednym `em.flush()` (lub `em.transactional`); repozytoria nie flushują same.                                                                                                                                                                             |
| **CQRS-lite**                             | `core/services`                         | Rozdzielenie _queries_ (read modele, np. `AdminService`, katalog — cache'owalne) od _commands_ (`CompleteLesson`, `EnrollInPath` — walidacja, autoryzacja, transakcja, zdarzenie). Bez osobnych baz — tylko osobne ścieżki kodu.                                                   |
| **Thin Server Actions**                   | `packages/app/app/**/actions.ts`        | `'use server'` → `zod.safeParse` → `getCurrentUser()` → `resolve(service).command(...)` → `updateTag/revalidatePath` → zwrot `ActionState`. Zero logiki biznesowej w akcji. Każda akcja traktowana jak publiczny endpoint.                                                         |
| **Result dla błędów oczekiwanych**        | `core`                                  | Błędy biznesowe (np. lekcja nie istnieje, brak zapisu na ścieżkę) jako dyskryminowana unia `{ ok: true, value } \| { ok: false, error: DomainError }`; wyjątki tylko dla błędów programistycznych/infrastruktury. Mapowanie na komunikaty PL w warstwie `app`.                     |
| **Policy (autoryzacja)**                  | `core/policies`                         | Czyste funkcje `can(user, action, resource)`; role: `learner`, `author`, `admin`. Serwisy wołają polityki przed odczytem/zapisem danych chronionych; sprawdzanie własności rekordu (IDOR) zawsze po stronie serwera.                                                               |
| **Domain events + Outbox**                | `core` (definicje), `db` (pg-boss)      | Np. `LessonCompleted` → aktualizacja serii dni, e-mail. Enqueue w tej samej transakcji co zapis; handlery idempotentne.                                                                                                                                                            |
| **Value Objects / branded types**         | `core/domain`                           | `Slug`, `UserId`, `LessonKey` jako typy brandowane tworzone przez parser (Zod) — mniej pomyłek przy przekazywaniu stringów.                                                                                                                                                        |
| **Request-scoped memo**                   | `React.cache`                           | `getCurrentUser()`, `getRequestContainer()` — jeden odczyt na żądanie, bez przekazywania przez propsy.                                                                                                                                                                             |
| **Streaming UI**                          | strony                                  | Statyczny shell + `<Suspense>` ze szkieletem dla danych; `loading.tsx` dla tras dynamicznych.                                                                                                                                                                                      |
| **Caching treści**                        | katalog/lekcje                          | Docelowo `'use cache'` + `cacheTag('path:<slug>')` dla read-modeli publicznych treści, unieważniane `updateTag` po edycji w adminie. Wymaga ścieżki rozwiązywania serwisów bez `connection()` — osobna specyfikacja (faza F), bo dziś każdy dostęp do bazy jest request-time.      |

### 4.3 Antywzorce (zakazane)

- Logika biznesowa lub zapytania do bazy w komponentach/stronach i Server Actions poza wywołaniem serwisu.
- Przekazywanie encji MikroORM do komponentów klienckich lub w odpowiedziach akcji.
- Globalny `orm.em`, `RequestContext` „magiczny” zamiast jawnego scope'u.
- Autoryzacja wyłącznie w `proxy.ts`/layoucie.
- `useEffect` do pobierania danych, które można pobrać w RSC.
- Importy między pakietami ścieżkami względnymi, cykle zależności.

## 5. Standardy inżynieryjne

### 5.1 Proces

- **Specification-Driven Development** (AGENTS.md): nietrywialna zmiana = spec w `.ai/specs/` z fazami i kryteriami ukończenia → implementacja → `implemented/`.
- **Trunk-based**: krótkie gałęzie (≤ 2 dni), małe PR-y (cel < 400 zmienionych linii bez lockfile'ów/migracji), squash merge, Conventional Commits w tytule PR.
- **Definition of Done**: spełnione kryteria ze specu; `lint`, `typecheck`, `test`, `build` zielone; testy dla nowej logiki; migracja + aktualny snapshot przy zmianie schematu; brak nowych naruszeń a11y (axe); dokumentacja (README/AGENTS) zaktualizowana, jeśli zmienia się architektura lub sposób pracy; lekcja w `.ai/lessons/` przy nietrywialnym odkryciu.
- **Code review**: poprawność, autoryzacja i walidacja wejścia, granice pakietów, testy, wydajność zapytań (N+1, brakujące indeksy), a11y, czytelność. Każdy PR przegląda człowiek albo agent z checklistą (`om-code-review`).
- **Decyzje architektoniczne** zapisujemy w sekcji „Decyzje projektowe” specyfikacji (pełni rolę ADR); zmiana decyzji = nowa specyfikacja, stara → `archive/`.

### 5.2 Testy — piramida i progi

| Poziom     | Zakres                                                                     | Narzędzie                | Próg                                   |
| ---------- | -------------------------------------------------------------------------- | ------------------------ | -------------------------------------- |
| Unit       | `core`: serwisy (z fake'owymi portami), polityki, funkcje domenowe         | Vitest                   | ≥ 90% linii i gałęzi w `packages/core` |
| Integracja | `db`: repozytoria i migracje na prawdziwym Postgresie                      | Vitest + Testcontainers  | każda metoda repozytorium ≥ 1 test     |
| Komponenty | komponenty klienckie z interakcją                                          | Vitest + Testing Library | dla każdego komponentu ze stanem       |
| E2E        | krytyczne ścieżki: katalog → ścieżka → lekcja; dashboard; logowanie; admin | Playwright + axe         | 0 naruszeń axe `serious`/`critical`    |

Zasady: testy deterministyczne (stały czas przez fake timers, seed danych per test), brak zależności od kolejności, nazwy testów opisują zachowanie po angielsku (`it("returns null when the path does not exist")`). Błąd naprawiony = test regresyjny.

### 5.3 Baza danych

- Każda zmiana schematu = migracja w repo; zastosowanych migracji nie edytujemy.
- **Zmiany wstecznie zgodne (expand → migrate → contract)**: najpierw dodaj kolumnę/tabelę, wdroż kod obsługujący obie wersje, dopiero potem usuń stare.
- **Indeks na każdym kluczu obcym**, który nie jest pierwszą kolumną istniejącego indeksu (Postgres nie tworzy ich automatycznie). **Dziś brakuje**: `path_module.path_id`, `enrollment.path_id`, `lesson_completion.lesson_id`.
- Czas w UTC (`timestamptz`), formatowanie do strefy użytkownika w UI.
- Seedy idempotentne; dane testowe nie trafiają do migracji.

### 5.4 Bezpieczeństwo (OWASP ASVS L2 jako punkt odniesienia)

- Walidacja każdego wejścia Zodem na granicy (akcje, route handlers, parametry URL, env).
- Autoryzacja w DAL; sprawdzenie własności rekordu przy każdej komendzie.
- Sekrety tylko w env, czytane wyłącznie w modułach serwerowych (`server-only`); `.env*` poza repo (jest `.env.example`).
- Nagłówki bezpieczeństwa + CSP z nonce; rate limiting logowania i akcji zapisujących (Better Auth ma wbudowany dla auth; dla akcji — licznik w Postgresie).
- Łańcuch dostaw: lockfile, `allowScripts` (npm 11), opóźnienie aktualizacji 14 dni, `npm audit` w CI (blokuje `high`/`critical` z dostępną poprawką).
- RODO: minimalizacja danych, brak PII w logach (redakcja w pino), możliwość usunięcia konta (kaskady FK już są).

### 5.5 Dostępność

- **Cel: WCAG 2.2 AA.** Wymóg prawny EAA odwołuje się do EN 301 549 (obecnie WCAG 2.1 AA), ale 2.2 AA to bezpieczny cel i dobra praktyka.
- Semantyczny HTML, pełna obsługa klawiatury, widoczny focus (`outline-ring`), kontrast tokenów sprawdzony w obu motywach, `aria-*` tylko gdy semantyka nie wystarcza, cele dotykowe ≥ 24×24 px (WCAG 2.2 2.5.8).
- axe w E2E + ręczny przegląd klawiaturą dla nowych ekranów.

### 5.6 Wydajność

- Budżety (p75, mobile): **LCP < 2,5 s, INP < 200 ms, CLS < 0,1**.
- Domyślnie Server Components; `'use client'` tylko dla interakcji; brak bibliotek klienckich do rzeczy, które robi serwer.
- Zapytania: jawny `populate`, brak N+1, paginacja list w adminie; logi wolnych zapytań (`DATABASE_DEBUG`/OTel).
- Obrazy przez `next/image`, fonty przez `next/font` (już jest).

### 5.7 Obserwowalność

- Logi strukturalne (pino, JSON) z `requestId`/`traceId`; poziomy: `error` (wymaga działania), `warn`, `info` (zdarzenia biznesowe), `debug` (lokalnie).
- Błędy nieobsłużone → Sentry przez `onRequestError`; zdarzenia domenowe → logi `info`.

## 6. Coding standards

### 6.1 TypeScript

- `strict: true` + **`noUncheckedIndexedAccess`**, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` (wymusza `import type`), `exactOptionalPropertyTypes` — ocenić przy wdrożeniu (może być uciążliwe z bibliotekami).
- Zakaz `any` (`unknown` + zawężanie), zakaz non-null assertion `!` (dziś 2 wystąpienia w `DatabaseSeeder.ts` — do poprawy), zakaz `@ts-ignore` (dopuszczalne `@ts-expect-error` z komentarzem).
- Typy domenowe jako `type` (unie, mapowane), `interface` dla portów (kontrakty implementowane przez klasy).
- Dyskryminowane unie zamiast flag boolowskich dla stanów; wyczerpujące `switch` z `satisfies never`.
- Funkcje publiczne pakietu z jawnie typowanym wynikiem; wewnątrz — inferencja.
- `async/await` (bez łańcuchów `.then`), równoległe niezależne operacje przez `Promise.all`.

### 6.2 Nazewnictwo i struktura plików

| Element               | Konwencja                                                | Przykład                                    |
| --------------------- | -------------------------------------------------------- | ------------------------------------------- |
| Pliki                 | `kebab-case`                                             | `learning-path-service.ts`, `path-card.tsx` |
| Komponenty React      | `PascalCase`, nazwany eksport                            | `export function PathCard`                  |
| Hooki                 | `useX`                                                   | `useLessonTimer`                            |
| Serwisy / repozytoria | `XService`, `MikroXRepository`, port `XRepository`       | `ProgressService`                           |
| Encje                 | liczba pojedyncza, tabele `snake_case`                   | `LessonCompletion` → `lesson_completion`    |
| Rejestracje DI        | `camelCase` nazwy klasy                                  | `learningPathService`                       |
| Stałe                 | `camelCase` (moduł) lub `UPPER_SNAKE` dla wartości z env | `levelLabels`, `DATABASE_URL`               |
| Testy                 | obok kodu: `*.test.ts(x)`; E2E w `packages/app/e2e/`     | `progress.test.ts`                          |

- Eksporty domyślne tylko tam, gdzie wymaga ich Next.js (`page`, `layout`, `loading`, configi).
- Pakiety eksportują publiczne API przez `src/index.ts` (lub jawne `exports` w `ui`); nie importujemy „głęboko” do cudzych plików.
- Kolejność importów: zewnętrzne → `@devmentor/*` → `@/` → względne (Prettier/ESLint).

### 6.3 Język

- **Kod, identyfikatory, komentarze, commity, nazwy testów: angielski.**
- **Teksty widoczne dla użytkownika: polski** (do czasu i18n). Dokumentacja projektu (`.ai/`, README, AGENTS): polski.
- Komentarze wyjaśniają „dlaczego”, nie „co”; JSDoc dla publicznego API pakietów.

### 6.4 React / Next.js

- Server Component domyślnie; `'use client'` na najniższym możliwym poziomie (wyspy interaktywności).
- Dane pobierane w RSC przez serwisy; do klienta tylko serializowalne DTO.
- Każdy komponent czytający dane w `<Suspense>` ze szkieletem o stabilnych wymiarach (CLS).
- Hooki URL (`usePathname`, `useSearchParams`) w `<Suspense>` (lekcja: `cache-components-usepathname-suspense`).
- Formularze działają bez JS (Server Actions); stany `pending`/błędów przez `useActionState`/`useFormStatus`.
- Linki przez `next/link`, nawigacja programowa przez `redirect`/`router` tylko gdy konieczna.
- Przed użyciem API Next.js — lektura bundled docs (`node_modules/next/dist/docs/`).

### 6.5 Stylowanie

- Tylko tokeny motywu (`bg-primary`, `text-muted-foreground`, …); zakaz hexów i dowolnych wartości `[...]` bez uzasadnienia w komentarzu.
- Warunkowe klasy przez `cn()`; warianty komponentów przez `cva`.
- Strony publiczne — własne komponenty Tailwind; admin — shadcn/ui; zmiany w `packages/ui/src/components` traktujemy jak kod biblioteki (wstecznie zgodne API).

### 6.6 MikroORM

- Encje przez `defineEntity` + `setClass`; relacje z jawnym `deleteRule`; unikalność i indeksy zadeklarowane w encji.
- Zapytania wyłącznie w repozytoriach; `populate` jawnie; brak `em.find` w pętli.
- Serwis komendy = jedna transakcja (`em.transactional` lub pojedynczy `flush`).
- Mapowanie encja → DTO w repozytorium (funkcja `toDomain`).

## 7. Analiza luk — stan obecny vs docelowy

| Obszar                    | Teraz                        | Docelowo                                 | Faza |
| ------------------------- | ---------------------------- | ---------------------------------------- | ---- |
| TypeScript                | 5.9, `strict`                | 6.0 + dodatkowe flagi (§6.1)             | A    |
| Lint                      | ESLint 9, bez type-aware     | ESLint 10 + `recommendedTypeChecked`     | A    |
| Format                    | brak                         | Prettier + plugin Tailwind               | A    |
| Hooki/commity             | brak                         | lefthook + commitlint                    | A    |
| Env                       | `process.env` z fallbackami  | walidacja Zod przy starcie               | A    |
| Martwy kod                | brak                         | knip                                     | A    |
| Indeksy FK                | brak 3 indeksów              | migracja z indeksami                     | A    |
| Testy                     | brak                         | Vitest + Testcontainers + Playwright/axe | B    |
| CI                        | brak                         | GitHub Actions + Turborepo + Renovate    | B    |
| Auth                      | konto demo, `/admin` otwarty | Better Auth + role + polityki            | C    |
| Mutacje                   | brak                         | Server Actions + Result + transakcje     | D    |
| Zdarzenia/jobs            | brak                         | pg-boss + outbox                         | D    |
| Obserwowalność / nagłówki | brak                         | pino + OTel + Sentry + CSP               | E    |
| Cache treści              | wszystko request-time        | `'use cache'` + tagi dla katalogu        | F    |
| DI                        | scope bez dispose            | `after(() => scope.dispose())`           | A    |

## 8. Plan wdrożenia — fazy i kryteria ukończenia

Każda faza = osobna specyfikacja wykonawcza w `.ai/specs/` (na bazie tego dokumentu) i osobny PR.

| #   | Faza                                                                                                                                                                                                               | Kryterium ukończenia                                                                                                                          | Status                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A   | **Fundament jakości**: TS 6 + flagi, ESLint type-aware (9.x — zob. odstępstwo), Prettier, knip, lefthook + commitlint, `env.ts` (Zod), indeksy FK, `scope.dispose()`, usunięcie `!` w seederze, `engines`/`.nvmrc` | `npm run lint/typecheck/build` zielone przy nowych regułach; `knip` bez zgłoszeń; migracja z indeksami zastosowana; brak `!` i `any` w kodzie | ✅ 2026-10-15 ([spec](implemented/2026-10-15-phase-a-quality-foundation.md)) |
| B   | **Testy i CI**: Vitest (core unit, db integracja z Testcontainers), Playwright + axe (smoke wszystkich stron), Turborepo, GitHub Actions, Renovate                                                                 | CI zielone na PR; pokrycie `core` ≥ 90%; każda metoda repozytorium ma test; E2E bez naruszeń axe serious/critical                             | ✅ 2026-10-15 ([spec](implemented/2026-10-15-phase-b-tests-and-ci.md))       |
| C   | **Uwierzytelnianie i autoryzacja**: Better Auth (e-mail+hasło, sesje w Postgresie), role, polityki w `core`, ochrona `/admin` w DAL                                                                                | Niezalogowany nie widzi `/dashboard` ani `/admin`; `learner` nie ma dostępu do admina (test E2E); konto demo usunięte z kodu runtime          | ⏳                                                                           |
| D   | **Mutacje i zdarzenia**: zapis na ścieżkę, ukończenie lekcji (Server Actions + Result), pg-boss + `LessonCompleted` → seria dni                                                                                    | Akcje odporne na brak JS i powtórzenia (idempotentne); testy unit + integracja + E2E ścieżki „ukończ lekcję”                                  | ⏳                                                                           |
| E   | **Obserwowalność i hardening**: pino, OTel, Sentry, CSP + nagłówki, rate limiting                                                                                                                                  | Każdy błąd serwera trafia do Sentry z trace id; nagłówki zweryfikowane (np. securityheaders)                                                  | ⏳                                                                           |
| F   | **Wydajność i cache treści**: `'use cache'` + `cacheTag` dla katalogu, budżety CWV mierzone w CI (Lighthouse CI)                                                                                                   | Katalog i lekcje serwowane z cache; LCP/INP/CLS w budżecie na stronach publicznych                                                            | ⏳                                                                           |

Kolejność A → B jest twarda (testy i CI zabezpieczają dalsze fazy); C–F mogą być przestawiane według priorytetów produktowych.

## 9. Otwarte pytania

1. **Hosting produkcyjny** (Vercel + zarządzany Postgres vs. self-hosting w kontenerach)? Wpływa na: pooling połączeń, worker pg-boss (proces długo żyjący), `@vercel/otel` vs SDK OTel, wersję Postgresa (17 → 18).
2. **Hosting repozytorium/CI**: GitHub (założenie dla GitHub Actions i Renovate)?
3. **Uwierzytelnianie**: e-mail + hasło na start, czy od razu OAuth (GitHub/Google — naturalne dla programistów)? Czy potrzebne SSO dla firm (wtedy rozważyć zarządzane CIAM)?
4. **Edycja treści**: czy autorzy treści to osoby spoza zespołu (→ edytor Markdown w adminie, rola `author`), czy treść może żyć w repo (→ MDX)?
5. **Analityka produktowa** (np. PostHog self-hosted) — czy i kiedy?
6. Próg pokrycia testami 90% dla `core` — akceptowalny?

## 10. Źródła

- Next.js 16.4 bundled docs: `data-security.md` (Data Access Layer, Server Actions), `authentication-with-cache-components.md`, `open-telemetry.md`, `instrumentation.md`, `content-security-policy.md`, `production-checklist.md`, `testing/vitest.md`, `testing/playwright.md`.
- Wersje pakietów: npm registry (2026-10-15) — m.in. TypeScript 7.0.2 / 6.0.3, ESLint 10.12, typescript-eslint 8.71 (peer TS `<6.1`), Vitest 5.0, Playwright 1.64, Zod 4.6, Better Auth 1.7, Turborepo 2.11, pg-boss 12, pino 10, Sentry 11.7, `better-auth-mikro-orm` 0.5 (peer MikroORM ^6), Node.js 24 LTS (nodejs.org/dist).
- [MikroORM 7 released](https://mikro-orm.io/blog/mikro-orm-7-released)
- [TypeScript 7 released — InfoQ](https://infoq.com/news/2026/08/typescript-7-released/), [Announcing TypeScript 7.0 RC](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/)
- [Better Auth vs Clerk vs NextAuth (Makerkit)](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk), [Best auth library for Next.js 2026 (LogRocket)](https://blog.logrocket.com/best-auth-library-nextjs-2026/), [Better Auth community adapters](https://better-auth.com/docs/adapters/community-adapters), [better-auth-mikro-orm README](https://unpkg.com/better-auth-mikro-orm@0.4.0/readme.md)
- [Turborepo vs Nx 2026 (PkgPulse)](https://www.pkgpulse.com/guides/turborepo-vs-nx-monorepo-2026), [Monorepo tooling 2026 (CoderCops)](https://blog.codercops.com/blog/monorepo-tooling-turborepo-nx-pnpm-2026)
- [Biome vs ESLint vs Oxlint 2026 (PkgPulse)](https://www.pkgpulse.com/guides/biome-vs-eslint-vs-oxlint-2026), [ESLint vs Biome vs Oxlint (Tech Insider)](https://tech-insider.org/eslint-vs-biome-vs-oxlint-2026/)
- [Next.js testing with Vitest & Playwright 2026](https://stacknotice.com/blog/nextjs-testing-vitest-playwright-2026), [Testcontainers in Node.js (Flavio Copes)](https://flaviocopes.com/nodejs-testcontainers/)
- [Next.js Server Actions security (Makerkit)](https://makerkit.dev/blog/tutorials/secure-nextjs-server-actions), [Next.js data security guide](https://nextjs.org/docs/app/guides/data-security)
- [pg-boss README](https://cdn.jsdelivr.net/gh/timgit/pg-boss@master/README.md), [Graphile Worker / background tasks](https://postgraphile.org/postgraphile/5/background-tasks)
- [OpenTelemetry in Next.js (LaunchDarkly)](https://launchdarkly.com/docs/eu-docs/tutorials/the-complete-guide-to-opentelemetry-in-next-js), [Sentry Next.js logs](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [EU web accessibility requirements (European Commission)](https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/accessibility/what-accessibility_en)
- [@wyrly/next `createServerDI`](https://jsr.io/@wyrly/next/doc/~/createServerDI) — wzorzec scope per żądanie z `cache()` + `after()` (inspiracja dla dispose w Awilix)

## 11. Postęp wdrożenia

- 2026-10-15 — **faza A** ✅ ([spec](implemented/2026-10-15-phase-a-quality-foundation.md)). Odstępstwo: ESLint pozostaje na 9.x (wtyczki `eslint-config-next` nie wspierają 10).
- 2026-10-15 — **faza B** ✅ ([spec](implemented/2026-10-15-phase-b-tests-and-ci.md)). Polityka 14 dni (§2) egzekwowana przez `.npmrc` (`min-release-age=14`) i Renovate; wyjątek dla `next`/`@next/*`/`eslint-config-next` (wymóg najnowszego Next.js). Zależności zainstalowane przed wprowadzeniem polityki (m.in. MikroORM 7.2.5, shadcn 4.21.5, Base UI 1.9.0, lucide 1.57.0) nie zostały cofnięte — zaktualizuje je Renovate.
- Fazy **C–F** czekają na decyzje z §9 (hosting, sposób logowania, edycja treści). Pytanie 2 (hosting repo/CI) rozstrzygnięte: GitHub (`origin`), GitHub Actions.
- 2026-10-15 — [CI na PR + 100% pokrycia + agent-browser](implemented/2026-10-15-ci-full-coverage-and-agent-browser.md): **odstępstwa od §3.5/§5.2 na życzenie właściciela** — próg pokrycia testami jednostkowymi podniesiony z 90% (`core`) do **100% we wszystkich pakietach**; E2E/a11y przeniesione z Playwright + `@axe-core/playwright` na **agent-browser** (Vercel) z bazą z Testcontainers; testy komponentów (Testing Library + jsdom) wprowadzone od razu.
