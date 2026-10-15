# AGENTS.md

Ten plik opisuje, jak agenci AI (Claude, Codex, inne) mają pracować w tym repozytorium. Katalog `.ai/` jest jedynym miejscem, w którym przechowujemy specyfikacje (SDD), logi autonomicznych przebiegów i wnioski/lekcje wyniesione z pracy. Te zasady są obowiązkowe dla każdej sesji agenta pracującej w tym repo.

## Architektura i stos technologiczny (obowiązkowe)

DevMentor to platforma ścieżek nauki dla programistów. Poniższe założenia są wiążące — nie zmieniaj ich bez wyraźnej zgody użytkownika (a zmianę zapisz w specyfikacji w `.ai/specs/`).

### Stos

- **Next.js (najnowszy, App Router) + React + TypeScript** (`strict`). Next.js w tym repo ma `cacheComponents: true` — zanim napiszesz kod Next.js, przeczytaj odpowiedni rozdział w `node_modules/next/dist/docs/` (zob. `packages/app/AGENTS.md`, generowany przez `next dev`).
- **PostgreSQL + MikroORM** (`@mikro-orm/postgresql`) — encje, migracje, seedy, pula połączeń.
- **Awilix** — kontener Dependency Injection (`InjectionMode.PROXY`).
- **Tailwind CSS** — strony frontendowe (publiczne, dla uczących się).
- **shadcn/ui** — strony backendowe (panel administracyjny `/admin`).
- **npm workspaces** — monorepo; menedżer pakietów to npm (nie dodawaj pnpm/yarn lockfile'ów).

### Monorepo — `packages/`

| Pakiet          | Nazwa             | Rola                                                                                                      | Może zależeć od    |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| `packages/app`  | `@devmentor/app`  | Aplikacja Next.js: routing, strony, composition root DI                                                   | `core`, `db`, `ui` |
| `packages/core` | `@devmentor/core` | Części wielokrotnego użytku: typy domenowe, porty (interfejsy repozytoriów), serwisy, czysta logika       | — (tylko `awilix`) |
| `packages/db`   | `@devmentor/db`   | Zarządzanie danymi: encje MikroORM, konfiguracja, migracje, seedy, repozytoria (adaptery portów z `core`) | `core`             |
| `packages/ui`   | `@devmentor/ui`   | Komponenty UI wielokrotnego użytku (shadcn/ui), `cn`, globalny arkusz Tailwind z tokenami motywu          | —                  |

Reguły:

1. **Kierunek zależności jest jednostronny**: `app → core/db/ui`, `db → core`. `core` nie importuje Next.js, Reacta ani MikroORM; `ui` nie importuje `core`/`db`. Nie twórz cykli. Reguły pilnuje ESLint (`no-restricted-imports`, wspólne bloki w `eslint.shared.mjs`, konfiguracja w `packages/*/eslint.config.mjs`) — nie wyłączaj ich, tylko przenieś kod do właściwego pakietu.
2. **Logika biznesowa w `core`**, nie w stronach ani w repozytoriach. Strony tylko pobierają dane przez serwisy i je renderują.
3. **Dostęp do danych wyłącznie przez porty**: nowe zapytanie = metoda w interfejsie w `packages/core/src/domain/ports.ts` + implementacja w `packages/db/src/repositories/`. Repozytoria zwracają typy domenowe (nie encje ORM).
4. **Pakiety eksportują źródła TS** przez pole `exports` (bez kroku build); nowy pakiet wewnętrzny dodaj do `transpilePackages` w `packages/app/next.config.ts`. Importuj przez nazwy pakietów (`@devmentor/core`), nigdy względnymi ścieżkami między pakietami.
5. Nowy pakiet w `packages/` tylko gdy nie pasuje do żadnego z czterech powyższych — i opisz go w README oraz w tej tabeli.

### Dependency Injection (Awilix)

- Każdy pakiet udostępnia funkcję rejestracji (`registerCore`, `registerDb`) i typ fragmentu „cradle” (`CoreCradle`, `DbCradle`). **Kompozycja dzieje się tylko w `packages/app/lib/container.ts`.**
- Kontener root trzyma singletony (`orm` = pula połączeń, `config`); scope per żądanie (`getRequestContainer`, `React.cache`) trzyma `em` (fork EntityManagera), repozytoria i serwisy (`.scoped()`).
- Klasy przyjmują zależności przez destrukturyzację obiektu w konstruktorze (`constructor({ fooRepository })`) — nazwy kluczy = nazwy rejestracji.
- W stronach/komponentach serwerowych używaj `resolve("nazwaSerwisu")` z `@/lib/container`. Nie twórz instancji serwisów/repozytoriów ręcznie i nie używaj globalnego `orm.em`.

### Baza danych (MikroORM)

- Encje definiujemy przez `defineEntity` + `setClass` (bez dekoratorów) w `packages/db/src/entities/`; każdą dodaj do tablicy `entities`.
- **Każda zmiana schematu = migracja** (`npm run db:migration:create`), commitowana razem z encją i zaktualizowanym `.snapshot-*.json`. Nie edytuj zastosowanych migracji; nie używaj `schema:update` poza eksperymentami lokalnymi.
- Seedy (`packages/db/src/seeders/`) muszą być idempotentne.
- Konfiguracja runtime: `packages/db/src/config.ts` (bez rozszerzeń CLI); konfiguracja CLI: `packages/db/mikro-orm.config.ts`. Połączenie z `DATABASE_URL`.
- Przy `cacheComponents` każdy dostęp do bazy jest danymi czasu żądania: `getRequestContainer()` wywołuje `connection()`, więc komponent czytający dane musi być w `<Suspense>` (albo trasa musi mieć `loading.tsx`). Cache treści (`'use cache'`) — tylko świadomie i opisane w specyfikacji.

### UI

- **Strony publiczne** (`packages/app/app/(site)/`): czysty Tailwind + lokalne komponenty z `packages/app/components/`. Bez komponentów shadcn/ui.
- **Panel administracyjny** (`packages/app/app/admin/`): komponenty shadcn/ui z `@devmentor/ui/components/*`.
- Nowe komponenty shadcn dodawaj z katalogu `packages/app`: `npx shadcn@latest add <nazwa>` — CLI zapisze je w `packages/ui/src/components/`.
- Kolory wyłącznie przez tokeny motywu (`bg-background`, `text-muted-foreground`, `bg-primary`, `border-border`, …) z `packages/ui/src/styles/globals.css`; bez zahardkodowanych hexów. Kolor marki = `--primary`.
- Interfejs jest po polsku.

### Coding standards (obowiązkowe)

Pełne uzasadnienie: `.ai/specs/2026-10-15-tech-stack-and-engineering-standards.md` (§4–6). Reguły oznaczone _(lint)_ egzekwuje ESLint (`eslint.shared.mjs`) — nie wyłączaj ich komentarzami, popraw kod.

- **TypeScript**: `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` (`tsconfig.base.json`). Zakaz `any` _(lint)_, non-null assertion `!` _(lint)_ i `@ts-ignore` _(lint)_ — używaj `unknown` + zawężania, jawnej obsługi braku wartości, `@ts-expect-error` z opisem. Importy typów przez `import type` / `type X` _(lint)_. `switch` po uniach musi być wyczerpujący _(lint)_.
- **Env**: `process.env` czytamy wyłącznie w walidowanych modułach `env.ts` (Zod) — `packages/db/src/env.ts`, `packages/app/lib/env.ts` _(lint)_. Nowa zmienna = pole w schemacie + wpis w `.env.example`. Jeden plik `.env` w roocie repo (wczytują go `next.config.ts` i `mikro-orm.config.ts`).
- **Logowanie**: bez `console.log` _(lint)_; dozwolone `console.info/warn/error` do czasu wdrożenia loggera (faza E).
- **Nazewnictwo**: pliki `kebab-case`; komponenty `PascalCase` z nazwanym eksportem (default tylko tam, gdzie wymaga go Next.js); serwisy `XService`, porty `XRepository`, adaptery `MikroXRepository`; encje w liczbie pojedynczej, tabele `snake_case`.
- **Język**: kod, identyfikatory, komentarze, commity i nazwy testów po angielsku; teksty UI po polsku; dokumentacja projektu po polsku.
- **Błędy**: oczekiwane błędy biznesowe jako wynik (`{ ok: false, error }`), wyjątki tylko dla błędów programistycznych/infrastruktury.
- **React/Next**: Server Components domyślnie, `'use client'` możliwie nisko; dane tylko przez serwisy (`resolve`), do klienta wyłącznie serializowalne DTO; komponenty z danymi i hooki URL w `<Suspense>`.
- **Baza**: indeks na każdym kluczu obcym, który nie jest pierwszą kolumną innego indeksu (`.index()` w encji); zmiany schematu wstecznie zgodne (expand → contract).
- **Formatowanie**: Prettier (`.prettierrc.json`, sortowanie klas Tailwind) — nie formatuj ręcznie, nie spieraj się z formatterem.
- **Commity**: Conventional Commits (`feat(db): …`, `fix(app): …`) — sprawdza commitlint w hooku `commit-msg`. Hooki (lefthook) instaluje `npm install`; pre-commit formatuje i lintuje. Nie uruchamiaj `lefthook run pre-commit --all-files` na drzewie z niezastage'owanymi zmianami.
- **Martwy kod**: knip musi być czysty — usuwaj nieużywane eksporty, pliki i zależności; zależność deklaruj w pakiecie, który jej faktycznie używa.

### Testy (obowiązkowe)

| Poziom     | Gdzie                              | Narzędzie               | Zasada                                                                                                                                                                     |
| ---------- | ---------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | `packages/core/src/**/*.test.ts`   | Vitest                  | Serwisy testujemy z fake'owymi portami (`packages/core/src/testing/fixtures.ts`), bez bazy i Next.js. Pokrycie `core` ≥ 90% (próg w `vitest.config.ts` — CI pada poniżej). |
| Integracja | `packages/db/src/**/*.int.test.ts` | Vitest + Testcontainers | Prawdziwy Postgres 17 z prawdziwymi migracjami i seedem (`src/testing/global-setup.ts`). Każda metoda repozytorium ma ≥ 1 test. Wymaga Dockera.                            |
| E2E + a11y | `packages/app/e2e/*.spec.ts`       | Playwright + axe        | Na buildzie produkcyjnym (`next start`), na zmigrowanej i zaseedowanej bazie. Każda nowa strona: test treści + `expectNoSeriousA11yViolations` (WCAG 2.2 A/AA).            |

- Naprawiony błąd = test regresyjny. Nazwy testów po angielsku, opisują zachowanie.
- Testy deterministyczne: bez zależności od kolejności, czasu i stanu z innych testów.
- **Nie umieszczaj testów ani helperów w `packages/db/src/migrations/` i `src/seeders/`** — MikroORM importuje każdy plik `.ts` z tych katalogów.
- Lokatory E2E po rolach i nazwach dostępnych (`getByRole`), nie po klasach CSS.

### Weryfikacja i Definition of Done

Przed zgłoszeniem zakończenia uruchom i potwierdź na zielono:

1. `npm run check` — format, lint, typecheck, knip;
2. `npm test` (unit) i `npm run test:integration` (Docker) — przy zmianach w `core`/`db`;
3. `npm run build`;
4. `npm run test:e2e` — przy zmianach w UI, routingu lub danych (wymaga `npm run db:up && npm run db:migrate && npm run db:seed`);
5. `npm run audit` — przy zmianach zależności.

Zmiana schematu: migracja + `migration:check` bez różnic. Nowa funkcjonalność bez testów na odpowiednim poziomie nie jest skończona. CI (`.github/workflows/ci.yml`) uruchamia te same kroki na każdym PR.

### Zależności

- `.npmrc` wymusza `min-release-age=14` (wersje opublikowane co najmniej 14 dni temu); wyjątek: `next`, `@next/*`, `eslint-config-next` (wymóg „najnowszego Next.js”). Nie obchodź tej polityki flagami.
- Nowe skrypty instalacyjne pakietów domyślnie blokujemy (`allowScripts` w root `package.json`); zezwalaj tylko z uzasadnieniem.
- Podatność bez dostępnej poprawki można dodać do allowlisty w `audit-ci.jsonc` wyłącznie z komentarzem: dlaczego nie dotyczy projektu i kiedy wrócić do tematu.

## Struktura `.ai/`

```
.ai/
├── specs/                  # specyfikacje do Specification-Driven Development
│   ├── implemented/        # specyfikacje, które zostały w pełni zaimplementowane
│   └── archive/            # specyfikacje nieaktualne, odrzucone lub zastąpione
├── runs/                   # logi autonomicznych przebiegów AI
└── lessons.md + lessons/   # wnioski, ustalenia, usprawnienia (pamięć długoterminowa)
```

### `.ai/specs/` — specyfikacje (SDD)

- Każda funkcjonalność/zmiana projektowana w podejściu Specification-Driven Development ma swoją specyfikację w `.ai/specs/`.
- Nazwa pliku: **`YYYY-MM-DD-slug.md`** (data utworzenia specyfikacji + krótki opis slugiem, np. `2026-10-15-user-auth-flow.md`).
- Specyfikacja powinna zawierać: cel, kontekst, zakres, decyzje projektowe, otwarte pytania, plan implementacji.
- Gdy specyfikacja jest w pełni zaimplementowana i wdrożona — przenieś plik do `.ai/specs/implemented/` (nazwa pliku bez zmian).
- Gdy specyfikacja jest nieaktualna, odrzucona albo zastąpiona inną — przenieś plik do `.ai/specs/archive/` (nazwa pliku bez zmian).
- Specyfikacje aktywne/w toku zostają w `.ai/specs/` (poziom główny).

### `.ai/runs/` — logi autonomicznych przebiegów

- Każdy autonomiczny przebieg agenta (np. `/loop`, zaplanowane zadanie, dłuższa sesja bez nadzoru) zapisuje log swojego przebiegu w `.ai/runs/`.
- Nazwa pliku: **`YYYY-MM-DD-slug.md`** (data przebiegu + krótki opis zadania).
- Log powinien zawierać: cel przebiegu, kluczowe decyzje, wykonane kroki, napotkane problemy, wynik końcowy.
- Logi nie są nadpisywane — jeśli przebieg jest kontynuacją wcześniejszego zadania tego samego dnia, dopisuj do istniejącego pliku; inny dzień/inne zadanie = nowy plik.

### `.ai/lessons.md` i `.ai/lessons/` — wnioski i usprawnienia

- `.ai/lessons.md` jest **indeksem** — zawiera tylko jednolinijkowe wpisy-wskaźniki do plików w `.ai/lessons/`, nie treść.
- `.ai/lessons/` zawiera szczegółowe wpisy: jeden plik per temat/ustalenie, nazwa pliku to opisowy slug (np. `lessons/flaky-auth-tests.md`).
- Wpis w `lessons/` powinien zawierać: co się stało / co odkryto, przyczynę (jeśli dotyczy naprawy błędu), wniosek, jak to zastosować w przyszłości.
- Dodaj wpis zawsze, gdy: naprawiasz nietrywialny błąd, odkrywasz coś zaskakującego o kodzie/narzędziach/procesie, lub chcesz zapisać coś w pamięci długoterminowej projektu, co nie wynika bezpośrednio z kodu.

## Obowiązkowe zasady dla agentów

1. **Na start pracy**: przeczytaj `.ai/lessons.md` (i powiązane wpisy w `.ai/lessons/`, jeśli temat zadania jest z nimi związany) oraz sprawdź `.ai/specs/`, jeśli zadanie dotyczy funkcjonalności, która może mieć istniejącą specyfikację.
2. **Przed implementacją nietrywialnej funkcjonalności**: jeśli nie istnieje jeszcze specyfikacja dla danej zmiany, napisz ją w `.ai/specs/` zgodnie z formatem nazwy `YYYY-MM-DD-slug.md`, zanim zaczniesz pisać kod. Drobne poprawki, literówki, czysto techniczne refaktory nie wymagają specyfikacji.
3. **Po zaimplementowaniu specyfikacji**: przenieś plik specyfikacji do `.ai/specs/implemented/`.
4. **Przy każdym autonomicznym przebiegu** (bez bieżącego nadzoru człowieka, np. `/loop`, zadanie zaplanowane, agent działający w tle): zapisuj log w `.ai/runs/` w formacie `YYYY-MM-DD-slug.md`.
5. **Po naprawieniu błędu lub ustaleniu czegoś nieoczywistego**: zapisz wniosek jako nowy plik w `.ai/lessons/` i dodaj do niego jednolinijkowy wpis w `.ai/lessons.md`.
6. Nie usuwaj i nie nadpisuj istniejących plików w `.ai/` bez wyraźnej potrzeby — to historia projektu. Przenoszenie między podkatalogami (`specs/` → `implemented/`/`archive/`) jest w porządku.
7. **Planowanie złożonych zadań**: zanim zaczniesz implementację zadania wieloetapowego, zaplanuj je (np. w trybie plan mode), zamiast pisać kod na bieżąco — dopracowany plan pozwala zaimplementować zadanie za jednym zamachem. Jeśli w trakcie coś pójdzie nie tak, wróć do planowania i zaplanuj ponownie, zamiast przepychać się przez problem.
8. **Weryfikacja zmian**: przed zgłoszeniem zadania jako zakończone uruchom dostępne testy/lint/build i potwierdź, że problem faktycznie został naprawiony — nie tylko że kod się kompiluje.
9. **Korekty dot. sposobu pracy agenta**: jeśli użytkownik poprawia nie kod, a Twój sposób działania (np. „nie robię tego więcej”, „zawsze pytaj przed X”) — zapisz to bezpośrednio w tym pliku (`AGENTS.md`), a nie w `.ai/lessons/`, które jest zarezerwowane dla wniosków dot. kodu/procesu projektu. Dzięki temu kolejna sesja nie powtórzy tego błędu.

To repozytorium używa tej struktury niezależnie od narzędzia AI, z którego korzystasz (Claude Code, Codex, inne). Plik [CLAUDE.md](CLAUDE.md) wczytuje ten plik przez `@AGENTS.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
