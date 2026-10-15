# Monorepo na npm workspaces: shadcn/ui i przekazywanie argumentów

## Co odkryto

1. `npm i -w @devmentor/ui @base-ui/react` kończył się `ERESOLVE` (konflikt `react@19.3.1` vs `19.3.0`): pakiet `ui` nie deklarował `react-dom`, więc npm próbował dociągnąć najnowszy `react-dom` jako peer Base UI. Rozwiązanie: `peerDependencies` w `packages/ui` zawiera i `react`, i `react-dom`.
2. Konfigurację shadcn dla monorepo (dwa `components.json`, aliasy `@devmentor/ui/...`, `exports` w `ui`) najpewniej skopiować z wzorca: `npx shadcn@latest init -t next --monorepo -d` w katalogu tymczasowym. Komponenty dodaje się z `packages/app` (`npx shadcn@latest add …`) — CLI zapisuje je do `packages/ui`.
3. Skrypt roota `npm run x -w pkg` gubi argumenty (`npm run db:migration:create --initial` → „Unknown cli config”). Skrypty delegujące w roocie kończą się `--` (`"npm run migrate -w @devmentor/db --"`), a wywołanie to `npm run db:migration:create -- --name foo`.

## Jak stosować

Przy dodawaniu pakietów UI/peerów sprawdzaj `npm ls react react-dom` — ma być jedna wersja (deduped). Nowe skrypty delegujące z argumentami pisz z `--` na końcu.
