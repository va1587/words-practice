# Dostęp do bazy przy Cache Components wymaga `connection()`

## Co się stało

Po przepięciu stron na MikroORM `next start` logował `Route "/paths/[slug]": Next.js encountered the unstable value Date.now() while prerendering` — mimo że trasa nie ma `generateStaticParams`, a strony renderowały się poprawnie.

## Przyczyna

Przy `cacheComponents: true` Next.js prerenderuje w tle trasy z dynamicznymi parametrami już ze znanymi wartościami (upgrade App Shella). `await params` przestaje wtedy „wisieć”, więc render dochodzi do zapytania do bazy, a MikroORM/pg używają `Date.now()` — wartości niedozwolonej w prerenderze. Na trasach bez parametrów ten sam problem pojawiłby się podczas `next build` (i build wymagałby bazy).

## Wniosek / jak stosować

- `getRequestContainer()` w `packages/app/lib/container.ts` wywołuje `await connection()` — każdy `resolve(...)` jest więc z definicji request-time. Nie omijaj kontenera, łącząc się z bazą bezpośrednio.
- Komponent czytający dane musi być w `<Suspense>` albo trasa musi mieć `loading.tsx`, inaczej build zgłosi „uncached data outside of Suspense”.
- Jeśli kiedyś chcesz prerenderować treść z bazy — użyj świadomie `'use cache'` (i zapewnij bazę w czasie buildu), opisz to w specyfikacji.
