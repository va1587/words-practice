# DevMentor — architektura monorepo (Next.js + PostgreSQL/MikroORM + Awilix + Tailwind/shadcn)

## Cel

Przebudować repo z pojedynczej aplikacji Next.js na monorepo z pakietami `app`, `core`, `db`, `ui` i podłączyć docelowy stos: PostgreSQL przez MikroORM (migracje, pula połączeń, seed), kontener DI Awilix, Tailwind na stronach publicznych i shadcn/ui w panelu administracyjnym. Strony z [2026-10-15-devmentor-app-template](implemented/2026-10-15-devmentor-app-template.md) mają czytać dane z bazy zamiast z mocków.

## Kontekst

- Wymagania użytkownika (2026-10-15): najnowszy Next.js + TypeScript + React; PostgreSQL + MikroORM; Awilix jako DI; Tailwind dla frontendu, shadcn-ui dla stron backendowych (panel admina); monorepo z `packages/{app,core,db,ui}`; zasady zapisane w AGENTS.md; opis architektury w README.
- Stan wyjściowy: Next.js 16.4.1, React 19.3, Tailwind 4, `cacheComponents: true`, npm (jest `package-lock.json`).
- Wersje na dziś: MikroORM 7.2.x, Awilix 13.x, shadcn CLI 4.x.

## Zakres

1. **Monorepo na npm workspaces** (`"workspaces": ["packages/*"]`), wspólny `tsconfig.base.json`, skrypty w roocie delegujące do pakietów.
2. **`@devmentor/core`** — model domenowy (typy), interfejsy repozytoriów (porty), serwisy domenowe (`LearningPathService`, `ProgressService`), rejestracja serwisów w Awilix. Brak zależności od Next.js, React i MikroORM.
3. **`@devmentor/db`** — encje MikroORM (`defineEntity`, bez dekoratorów), konfiguracja, migracje, seeder z dotychczasowymi danymi mockowymi, repozytoria implementujące porty z `core`, rejestracja w Awilix (ORM singleton, `EntityManager` per scope).
4. **`@devmentor/ui`** — shadcn/ui (components.json, `cn`, komponenty: button, card, table, badge), globalny arkusz Tailwind z tokenami motywu wspólnymi dla całej aplikacji.
5. **`@devmentor/app`** — aplikacja Next.js: kompozycja kontenera DI, strony publiczne (Tailwind) czytające dane przez serwisy, panel `/admin` (shadcn/ui) z przeglądem i listą ścieżek.
6. `docker-compose.yml` z PostgreSQL do pracy lokalnej, `.env.example`.
7. AGENTS.md — sekcja z zasadami architektury; README — opis architektury i uruchomienia.

Poza zakresem: auth (bieżący użytkownik = konto demo), edycja treści w adminie, cache danych (`'use cache'`), testy jednostkowe/E2E.

## Decyzje projektowe

- **Kierunek zależności**: `app → {core, db, ui}`, `db → core`, `core` i `ui` bez wewnętrznych zależności. Warstwa domenowa nie zna ORM-a; `db` dostarcza adaptery do portów z `core`.
- **Pakiety źródłowe bez kroku build**: każdy pakiet eksportuje pliki `.ts/.tsx` przez pole `exports`; Next transpiluje je przez `transpilePackages`. Prościej i szybciej niż osobny build każdego pakietu.
- **MikroORM `defineEntity`** zamiast dekoratorów — brak `reflect-metadata`/`emitDecoratorMetadata`, działa z Turbopackiem i pełną inferencją typów.
- **Pula połączeń**: jedna instancja `MikroORM` na proces (singleton na `globalThis`, przetrwa HMR), pula skonfigurowana w `pool` configu; każde żądanie dostaje własny `em.fork()`.
- **Awilix**: `InjectionMode.PROXY`, kontener root (singletony: config, orm) + scope per żądanie (tworzony raz na render dzięki `React.cache`), w nim `em`, repozytoria i serwisy (`scoped`). Każdy pakiet eksportuje funkcję `register…(container)`; kompozycja dzieje się wyłącznie w `packages/app/lib/container.ts`.
- **Renderowanie przy `cacheComponents`**: dane z bazy czytane w czasie żądania (`await connection()` + `<Suspense>`/`loading.tsx`), żeby `next build` nie wymagał bazy. Cache treści — osobny spec.
- **Tokeny motywu**: przejście na konwencję shadcn (`--background`, `--foreground`, `--primary`, `--muted`, `--muted-foreground`, `--border`, …) w jednym arkuszu w `@devmentor/ui`; strony publiczne używają tych samych tokenów przez klasy Tailwind, ale bez komponentów shadcn.
- **Bieżący użytkownik**: konto demo z seeda (email z `DEMO_USER_EMAIL`), do zastąpienia auth.

## Otwarte pytania

- Auth i role (kto ma dostęp do `/admin`)?
- Czy treść lekcji przenieść do MDX/Markdown w bazie?
- Turborepo/Nx do cache'owania zadań — gdy pakietów przybędzie.

## Plan implementacji

1. Przenieść aplikację do `packages/app`, ustawić workspaces, `tsconfig.base.json`, root scripts.
2. `packages/core`: typy, porty, serwisy, `registerCore`.
3. `packages/db`: config, encje, repozytoria, seeder, `registerDb`, skrypty CLI.
4. `packages/ui`: shadcn init + komponenty, wspólny `globals.css`.
5. `packages/app`: kontener DI, strony na serwisach, `/admin` na shadcn, migracja tokenów.
6. Postgres (docker compose): wygenerować migrację początkową, uruchomić migracje i seed.
7. Weryfikacja: typecheck, lint, build, `next start` + curl wszystkich stron.
8. AGENTS.md, README.md; lessons; spec → `implemented/`.
