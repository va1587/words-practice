# CI wołał skrypty, których zrzut kodu z lekcji już nie miał

- Data: 2026-10-21
- Objaw: w CI padały kroki `npm run test:coverage` i `npm run format:check` z `npm error Missing script`; `knip` i `audit` padłyby zaraz po nich.
- Przyczyna: commit `b75ce4c` („code status after lesson number 3”) podmienił root `package.json` i usunął `knip.jsonc`, `audit-ci.jsonc`, `lefthook.yml` i `turbo.json`. `.github/workflows/ci.yml` z siatki bezpieczeństwa (`62ce6a3`) został bez zmian i dalej wołał stare nazwy. `.prettierrc.json` wskazywał nieistniejący `packages/ui/src/styles/globals.css`, a upload artefaktu szukał raportu w `packages/*/coverage` zamiast w `coverage/unit` (`reportsDirectory` w `vitest.config.mts`).
- Poprawka (2026-10-21):
  - CI woła `test:unit:coverage` i wysyła `coverage/unit`.
  - Przywrócone `prettier` + `prettier-plugin-tailwindcss`, `knip` i `audit-ci` wraz ze skryptami `format`, `format:check`, `knip` i `audit`; repo sformatowane w całości.
  - Nowy `knip.jsonc` dla obecnego układu: wejście prototypu `main.tsx`, migracje w `packages/db/migrations`, `src/mikro-orm.config.ts`. Root deklaruje pakiety, które importuje z `prototypes/` i `scripts/`.
  - Audit wykrył krytyczną podatność (RCE) w `next@16.3.3`, więc `next` i `eslint-config-next` podbite do 16.4.2; podbite też `sharp` 0.35.5 i `source-map-js` 1.2.2.
  - Trzy testy integracyjne padały już na `HEAD`: `signInCookieHeader` przekazywał do `fetch()` względny `Location`. Adapter mocka zwraca go celowo, więc harness rozwiązuje go teraz względem `baseUrl`.
- Jak uniknąć: po wgraniu zrzutu kodu z lekcji puść lokalnie każdy skrypt wołany przez CI (`grep -n "npm run" .github/workflows/*.yml`) i sprawdź, że istnieje w `package.json`. Przy zmianie nazwy skryptu albo `reportsDirectory` popraw też workflow.
