# `usePathname()` w layoucie wymaga `<Suspense>` na trasach dynamicznych

## Co się stało

`next build` padał: `Route "/paths/[slug]": Next.js encountered URL data usePathname() in a Client Component outside of <Suspense>` — źródłem był `NavLink` w nagłówku (layout), nie sama strona.

## Przyczyna

Przy `cacheComponents` pathname trasy z parametrem bez `generateStaticParams` to dane czasu żądania; prerenderowany shell nie może go znać.

## Wniosek / jak stosować

Komponent kliencki używający `usePathname()`/`useParams()`/`useSearchParams()` w layoucie opakuj w `<Suspense>` z sensownym fallbackiem (wzorzec: `packages/app/components/nav-link.tsx` — fallback renderuje link bez stanu aktywnego).
