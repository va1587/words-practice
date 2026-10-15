# Lint padał tylko na CI: typy Next.js generowane lokalnie + cache Turborepo

## Co się stało (2026-10-15)

Job `lint` na GitHubie zgłaszał `no-unsafe-assignment`/`no-unsafe-argument` w `app/(site)/paths/[slug]/page.tsx` i `[lesson]/page.tsx`, a lokalnie (i w moim „replayu CI”) lint przechodził.

## Przyczyna

1. `PageProps<"/paths/[slug]">` to globalny typ generowany przez `next typegen` do gitignorowanego `.next/types`. Skrypt `typecheck` w `packages/app` go generował, `lint` nie. Na świeżym checkoucie CI `PageProps` = typ błędu → type-aware ESLint traktuje `params` jako `error`.
2. Lokalnie `.next/types` istniał z wcześniejszych buildów, więc problem był niewidoczny.
3. Pierwsza próba odtworzenia w czystym `git worktree` też „przeszła”: Turborepo zwrócił wynik z cache współdzielonego z głównym katalogiem repo (klucz cache nie obejmuje gitignorowanych typów). Dopiero `turbo --force` pokazał błąd.
4. Dodatkowo w ręcznych replayach `| tail` bez `pipefail` maskował kody wyjścia.

## Rozwiązanie

- `packages/app`: `"lint": "next typegen && eslint"` — skrypt sam generuje potrzebne typy.
- `npm run ci:local` (`scripts/ci-local.sh`): wszystkie joby CI na czystym worktree, `--force`, `pipefail`, kontrola czystego drzewa po testach.
- Runnery przypięte do `ubuntu-24.04` (ostrzeżenie GitHub o migracji `ubuntu-latest` → Ubuntu 26 od 19.10.2026).

## Jak stosować

Zmiany w CI/narzędziach weryfikuj wyłącznie przez `npm run ci:local`. Skrypty pakietów nie mogą zależeć od artefaktów, których nie generują same. Przejście na Ubuntu 26 — osobny PR ze zmianą `runs-on`.
