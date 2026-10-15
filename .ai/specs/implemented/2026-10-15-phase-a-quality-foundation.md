# Faza A — fundament jakości

Specyfikacja wykonawcza fazy A z [2026-10-15-tech-stack-and-engineering-standards](../2026-10-15-tech-stack-and-engineering-standards.md) (§7–8).

## Cel

Wprowadzić narzędzia i reguły, które automatycznie pilnują standardów kodu, zanim dojdą testy, CI i nowe funkcje.

## Zakres i kryteria ukończenia

| #   | Krok                                                                                                                                                  | Kryterium                                                                                                   | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| A1  | Node 24 LTS: `engines`, `.nvmrc`                                                                                                                      | `npm install` ostrzega przy innej wersji Node                                                               | ✅     |
| A2  | TypeScript 6.0 + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`                               | `npm run typecheck` zielone                                                                                 | ✅     |
| A3  | ESLint: type-aware `typescript-eslint` (`recommendedTypeChecked`) we wszystkich pakietach + zakazy `any`, `!`, `@ts-ignore`, wymuszenie `import type` | `npm run lint` zielone, reguły aktywne (sprawdzone plikiem próbnym)                                         | ✅     |
| A4  | Prettier 3 + `prettier-plugin-tailwindcss`, sformatowane repo                                                                                         | `npm run format:check` zielone                                                                              | ✅     |
| A5  | knip (martwy kod, nieużywane zależności)                                                                                                              | `npm run knip` bez zgłoszeń                                                                                 | ✅     |
| A6  | lefthook (pre-commit: Prettier + ESLint na zmienionych plikach; commit-msg: commitlint z Conventional Commits)                                        | zły komunikat commita odrzucony, poprawny przyjęty                                                          | ✅     |
| A7  | Walidacja env Zodem: `packages/db/src/env.ts`, `packages/app/lib/env.ts`                                                                              | błędny `DATABASE_URL` → czytelny błąd przy starcie                                                          | ✅     |
| A8  | Indeksy na kluczach obcych bez indeksu (`path_module.path_id`, `enrollment.path_id`, `lesson_completion.lesson_id`)                                   | migracja zastosowana, `migration:check` bez różnic                                                          | ✅     |
| A9  | `scope.dispose()` po odpowiedzi (`after()`), disposer `em.clear()`                                                                                    | strony działają, brak błędów w logu                                                                         | ✅     |
| A10 | Usunięcie `!` z `DatabaseSeeder.ts`                                                                                                                   | lint bez `no-non-null-assertion`                                                                            | ✅     |
| A11 | AGENTS.md: obowiązkowe coding standards (skrót §5–6 specu standardów); README: skrypty                                                                | dokumenty zaktualizowane                                                                                    | ✅     |
| A12 | Weryfikacja end-to-end                                                                                                                                | typecheck, lint, format:check, knip, build, migracje + `next start` na bazie: wszystkie strony 200 z danymi | ✅     |

## Odstępstwa od specu standardów

- **ESLint 10 → zostajemy na ESLint 9.39** (najnowszy 9.x). `eslint-config-next` 16.4.1 zależy od `eslint-plugin-react` 7.37, `eslint-plugin-jsx-a11y` 6.10 i `eslint-plugin-import` 2.32, które deklarują `peer eslint ≤ 9`. Powrót do tematu, gdy `eslint-config-next` zadeklaruje wsparcie ESLint 10.
- **`exactOptionalPropertyTypes`** — nie włączamy w tej fazie (spec standardów przewidywał tylko ocenę). Wymaga zmian w sygnaturach opcjonalnych propsów i bywa sprzeczny z typami bibliotek (MikroORM `Options`, Base UI); wrócić przy fazie D, gdy dojdą typy komend.

## Decyzje

- Prettier: `printWidth: 100`, domyślne cudzysłowy podwójne i średniki (zgodne z większością istniejącego kodu); komponenty shadcn też formatujemy (po `shadcn add` uruchamia się formatter w pre-commit).
- Typy w ESLint: `projectService: true` (typescript-eslint sam znajduje `tsconfig.json` pakietu).

## Postęp

- 2026-10-15 — spec utworzony.
- 2026-10-15 — faza A wdrożona:
  - A1 `.nvmrc` = 24, `engines` (`node >=24 <25`, `npm >=11`).
  - A2 TypeScript 6.0.3 + flagi; `noUncheckedIndexedAccess` wykrył 1 realny przypadek (`LearningPathService.getLesson`) — poprawiony. Dodano `types: ["node"]` w `tsconfig.base.json`.
  - A3 `eslint.boundaries.mjs` → `eslint.shared.mjs` (granice + `typeAwareStandards`), type-aware lint we wszystkich 4 pakietach; plik próbny potwierdził 6 reguł w `core` i `app` (any, `!`, ts-ignore, import type, exhaustive switch, console). Dodatkowo `process.env` dozwolone tylko w `env.ts`.
  - A4 Prettier 3.9 + plugin Tailwind 0.8; pominięte: migracje (generowane), historyczne specy/logi w `.ai/`.
  - A5 knip 6 — znalazł i poprawiono: nieużywany `lucide-react` w `ui`, `tailwindcss` zadeklarowany w `app` zamiast w `ui`, zbędny eksport `./hooks/*` w `ui`, 2 nieużywane eksporty w `container.ts`; `tsx` w `db` zignorowany (ładowany niejawnie przez MikroORM CLI).
  - A6 lefthook 2.2 (instalacja przez `prepare`, postinstall zablokowany w `allowScripts`), commitlint 21 — zły komunikat odrzucony, poprawny przyjęty.
  - A7 `packages/db/src/env.ts`, `packages/app/lib/env.ts` (Zod 4); `DATABASE_URL` wymagany w produkcji. Naprawiona przy okazji usterka: `.env` z roota nie był wczytywany (Next czyta z `packages/app`, MikroORM CLI wcale) — teraz `next.config.ts` (`@next/env`) i `mikro-orm.config.ts` (`process.loadEnvFile`) wczytują root `.env`.
  - A8 migracja `Migration20261015093931_foreign_key_indexes` (3 indeksy), `migration:check` bez różnic.
  - A9 `after(() => scope.dispose())` + disposer `em.clear()`.
  - A10 `!` w seederze zastąpione funkcją `required()` z czytelnym błędem.
  - A11 AGENTS.md: sekcja „Coding standards (obowiązkowe)” + `npm run check`; README: skrypty, `.env`, wymagania.
  - A12 `npm run check` (format, lint, typecheck, knip) ✅, `npm run build` ✅, `next start` bez `DATABASE_URL` → czytelny błąd walidacji, z `DATABASE_URL` → 7/7 stron 200 z danymi, 0 błędów w logu.
