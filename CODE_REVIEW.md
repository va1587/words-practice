# Code review — reguły repozytorium

Reguły review dla DevMentor. Stosuje je automatycznie `om-code-review` (a więc też `om-auto-review-pr`) oraz każdy recenzent-człowiek. Źródłem prawdy dla standardów jest `AGENTS.md` i `.ai/specs/2026-10-15-tech-stack-and-engineering-standards.md` — ten plik mówi, **na co patrzeć w diffie**. Reguły oznaczone _(lint)_ egzekwuje już ESLint; w review sprawdzaj tylko, czy nikt ich nie obszedł.

## 1. Priorytety

1. **Poprawność** — zachowanie zgodne ze specyfikacją w `.ai/specs/`, obsłużone stany brzegowe (brak danych, `null` z repozytorium, nieznany slug → `notFound()`).
2. **Bezpieczeństwo** — brak sekretów w kodzie i logach, `process.env` tylko w `env.ts`, dane z URL/formularzy walidowane, brak wycieku encji ORM lub danych innego użytkownika do klienta.
3. **Kontrakty** — zmiany w powierzchniach z `BACKWARD_COMPATIBILITY.md` (porty, eksporty pakietów, schemat bazy, trasy, zmienne env) są wstecznie zgodne albo mają ścieżkę migracji.
4. **Jakość i utrzymywalność** — architektura pakietów, testy, czytelność.

## 2. Sprawdzenia specyficzne dla repozytorium

### Architektura monorepo

- Kierunek zależności `app → core/db/ui`, `db → core`; `core` bez Next.js/Reacta/MikroORM, `ui` bez `core`/`db` _(lint: `no-restricted-imports`)_. Wyłączenie reguły komentarzem = **blocker**.
- Importy między pakietami tylko przez nazwy (`@devmentor/core`), nigdy ścieżki względne.
- Logika biznesowa w serwisach `packages/core/src/services/`, nie w stronach ani repozytoriach. Strona, która liczy, filtruje lub agreguje dane domenowe = **major**.
- Nowe zapytanie = metoda w porcie (`packages/core/src/domain/ports.ts`) + implementacja `MikroXRepository` w `packages/db/src/repositories/`. Repozytoria zwracają typy domenowe, nie encje.
- Nowy pakiet wewnętrzny: wpis w `transpilePackages` (`packages/app/next.config.ts`), README i tabeli w `AGENTS.md`.

### Dependency Injection (Awilix)

- Rejestracja w `registerCore`/`registerDb`, kompozycja wyłącznie w `packages/app/lib/container.ts`; repozytoria i serwisy `.scoped()`, singletony tylko `orm`/`config`.
- Zależności przez destrukturyzację w konstruktorze; nazwy kluczy = nazwy rejestracji.
- Ręczne `new XService(...)`/`new MikroXRepository(...)` w kodzie aplikacji lub użycie globalnego `orm.em` = **blocker** (rozjazd EntityManagera między żądaniami).

### Next.js (App Router, `cacheComponents: true`)

- Server Components domyślnie; `'use client'` możliwie nisko. Do klienta tylko serializowalne DTO.
- Komponent czytający dane przez `resolve(...)` jest w `<Suspense>` albo trasa ma `loading.tsx` — inaczej build padnie lub prerender złapie dane czasu żądania. Hooki URL (`usePathname`, `useSearchParams`) też w `<Suspense>`.
- `'use cache'` tylko świadomie i opisane w specyfikacji.
- Zmiany w kodzie Next.js zgodne z dokumentacją w `node_modules/next/dist/docs/` (wersja w repo może różnić się od wiedzy modelu).

### Baza danych (MikroORM)

- Encje przez `defineEntity` + `setClass`, dodane do tablicy `entities`.
- Każda zmiana schematu = nowa migracja + zaktualizowany `.snapshot-*.json` w tym samym PR-ze; edycja zastosowanej migracji = **blocker**.
- Indeks na każdym kluczu obcym, który nie jest pierwszą kolumną innego indeksu.
- Zmiany schematu wstecznie zgodne (expand → contract); usunięcie/zmiana typu kolumny w jednym kroku = **major**.
- Seedy idempotentne. Żadnych plików testowych/helperów w `src/migrations/` ani `src/seeders/`.

### UI

- Strony publiczne (`app/(site)/`): Tailwind + komponenty z `packages/app/components/`, bez shadcn. Panel `/admin`: komponenty z `@devmentor/ui/components/*`.
- Kolory tylko przez tokeny motywu (`bg-background`, `text-muted-foreground`, …); zahardkodowany hex = **major**.
- Teksty UI po polsku; kod, identyfikatory, komentarze i nazwy testów po angielsku.
- Dostępność: semantyczne role i nazwy dostępne; zmiana tokenów kolorów wymaga przejścia testów a11y (axe, WCAG 2.2 A/AA).

### TypeScript i jakość kodu

- Zakaz `any`, `!`, `@ts-ignore` _(lint)_; `@ts-expect-error` tylko z opisem.
- `switch` po uniach wyczerpujący _(lint)_; `import type` dla typów _(lint)_.
- `process.env` tylko w `packages/db/src/env.ts` i `packages/app/lib/env.ts` _(lint)_; nowa zmienna = pole w schemacie Zod + wpis w `.env.example`.
- Bez `console.log` _(lint)_.
- Oczekiwane błędy biznesowe jako wynik `{ ok: false, error }`; wyjątki tylko dla błędów programistycznych/infrastruktury.
- Nazewnictwo: pliki `kebab-case`, komponenty `PascalCase` z nazwanym eksportem, `XService`, `XRepository`, `MikroXRepository`, encje w liczbie pojedynczej, tabele `snake_case`.
- knip czysty: brak nieużywanych eksportów, plików, zależności.

### Testy

- **100% pokrycia** (linie, gałęzie, funkcje, instrukcje) w każdym dotkniętym pakiecie. Obniżenie progów lub nowe `exclude`/`/* v8 ignore */` dla kodu aplikacji = **blocker**.
- Każda nowa metoda repozytorium ma ≥ 1 test integracyjny (`*.int.test.ts`, Testcontainers).
- Każda nowa strona/ścieżka użytkownika: test integracyjny treści + `seriousA11yViolations()` = `[]`.
- Naprawiony błąd = test regresyjny.
- Selektory po rolach i nazwach dostępnych, nie po klasach CSS. Testy deterministyczne, bez zapisu plików do repo.
- Wzorce: `core` — fake'owe porty z `src/testing/fixtures.ts`; `db` — `fake-entity-manager.ts`; `app` — mock `@/lib/container`, async Server Components przez `render(await Component(props))`.

### Zależności, CI, proces

- Nowa zależność zadeklarowana w pakiecie, który jej używa; respektuje `min-release-age=14` (wyjątek: `next`, `@next/*`, `eslint-config-next`). Nowe skrypty instalacyjne w `allowScripts` tylko z uzasadnieniem.
- Wpis w `audit-ci.jsonc` tylko z komentarzem: dlaczego nie dotyczy i kiedy wrócić.
- CI: runnery przypięte do wersji (`ubuntu-24.04`), akcje przypięte do SHA; `*-latest` = **major**.
- Zmiany w CI/skryptach/configach narzędzi zweryfikowane przez `npm run ci:local`.
- Conventional Commits; nietrywialna funkcjonalność ma specyfikację w `.ai/specs/`; naprawa nieoczywistego błędu ma wpis w `.ai/lessons/`.

## 3. Bramka walidacji

Review zakłada zieloną bramkę z `.ai/agentic.config.json`:

- `npm run ci:local`

Czerwona bramka lub czerwony wymagany check CI (`build`, `lint`, `unit`, `integration`) to znalezisko **blocker**, raportowane razem z pełnym review (zob. `SDLC.md`).

## 4. Waga znalezisk

| Waga        | Kiedy                                                                                                                                                                          | Skutek                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| **blocker** | Błąd poprawności, luka bezpieczeństwa, złamany kontrakt bez ścieżki migracji, czerwona bramka, spadek pokrycia, obejście reguł lint/architektury, edycja zastosowanej migracji | `changes-requested`    |
| **major**   | Logika w złej warstwie, brak `<Suspense>` przy danych, brakujący test integracyjny lub a11y dla nowej strony, zahardkodowane kolory, niewstecznie zgodna zmiana schematu       | `changes-requested`    |
| **minor**   | Nazewnictwo, czytelność, drobne uproszczenia, brakujący wpis w `.ai/lessons/`                                                                                                  | nie blokuje; follow-up |
| **nit**     | Styl i preferencje nieobjęte Prettierem/lintem                                                                                                                                 | nie blokuje            |

Każde znalezisko wskazuje plik i linię, opisuje konsekwencję i regułę (z tego pliku lub `AGENTS.md`), na której się opiera.
