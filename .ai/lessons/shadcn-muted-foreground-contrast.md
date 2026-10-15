# Domyślny `--muted-foreground` shadcn nie spełnia WCAG AA na `--muted`

## Co odkryto

axe (E2E) zgłosił `color-contrast` (serious) na tagach kart ścieżek i akapicie w hero: `--muted-foreground` = `oklch(0.556 0 0)` (#737373) na `--muted` = `oklch(0.97 0 0)` (#f5f5f5) daje 4,34:1, a WCAG 1.4.3 wymaga 4,5:1 dla zwykłego tekstu. Na białym tle (#fff) ten sam kolor przechodzi (4,74:1), więc problem widać dopiero na wyszarzonych tłach.

## Rozwiązanie

`--muted-foreground: oklch(0.52 0 0)` w `packages/ui/src/styles/globals.css` (≈ 5:1 na `--muted`). Tryb ciemny ma wystarczający kontrast.

## Jak stosować

- Przy zmianie tokenów kolorów albo po aktualizacji shadcn (`shadcn add`/`apply` może nadpisać tokeny) uruchom `npm run test:e2e` — skan axe to wyłapie.
- Unikaj `opacity-*` na tekście (obniża kontrast); linki w akapitach muszą mieć podkreślenie, nie tylko kolor (WCAG 1.4.1).
