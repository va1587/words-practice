# agent-browser w testach integracyjnych

## Ustalenia (agent-browser 0.38.1)

- Natywne binarki są w paczce npm; `postinstall` tylko je dociąga, gdy brak — zablokowany w `allowScripts` bez skutków. Chrome: `npx agent-browser install` (Linux/CI: `--with-deps`).
- Każde polecenie z `--json` zwraca `{ success, data, error }`; przy błędzie exit code 1, ale JSON nadal jest na stdout (wrapper `integration/browser.ts` to obsługuje).
- `get attr <selektor> <atrybut>` — najpierw selektor (odwrotnie niż sugeruje pomoc `attr <name>`).
- `a11y --json` uruchamia axe-core; zwraca `violations` z `impact` — zastąpił `@axe-core/playwright`.
- Dane w PPR dochodzą strumieniowo — przed asercjami `wait --text "<treść>"`.
- Audyt wykonany zanim dane się załadują skanuje szkielety ładowania: wykrył `aria-label` na `<div>` bez roli (`aria-prohibited-attr`) — szkielety mają `role="status"`.

## Jak stosować

Nowy test integracyjny: `new Browser("<unikalna-sesja>")`, `afterAll(() => browser.close())`, `open` → `waitForText` → asercje → `seriousA11yViolations()`.
