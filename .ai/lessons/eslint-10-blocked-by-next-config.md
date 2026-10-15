# ESLint 10 zablokowany przez `eslint-config-next`

## Co odkryto (2026-10-15)

npm oznacza ESLint 9 jako nieobsługiwany, a aktualny jest ESLint 10.12. `eslint-config-next` 16.4.1 deklaruje `peer eslint >=9`, ale zależy od `eslint-plugin-react` 7.37, `eslint-plugin-jsx-a11y` 6.10 i `eslint-plugin-import` 2.32, które deklarują peer `eslint ≤ 9`. Wymuszenie ESLint 10 oznaczałoby niespójne zależności peer i ryzyko błędów w regułach React/a11y.

## Wniosek / jak stosować

Zostajemy na najnowszym ESLint 9.x (`^9.39.5`). Przed podbiciem sprawdź: `npm view eslint-plugin-react peerDependencies.eslint` (i pozostałe dwie wtyczki) — gdy obejmą `^10`, zaktualizuj ESLint razem z `eslint-config-next`.
