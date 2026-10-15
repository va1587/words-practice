# Nieznane parametry trasy zwracają HTTP 200 przy Cache Components

## Co odkryto

Przy `cacheComponents: true` (`next.config.ts`) wejście na dynamiczną trasę z parametrem spoza `generateStaticParams` (np. `/paths/nope`) renderuje `app/not-found.tsx`, ale **status HTTP to 200**, a nie 404. Sprawdzone 2026-10-15 na Next.js 16.4.1 (`next start` + `curl`).

## Przyczyna

Nieznane parametry dostają prerenderowany App Shell (Partial Prerendering) — nagłówki i status wysyłane są przed wykonaniem `notFound()` w strumieniowanej części. `export const dynamicParams = false` nie jest dostępne przy Cache Components (zob. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/dynamicParams.md`).

## Wniosek / jak stosować

- Testując 404 nie polegaj na statusie HTTP — sprawdzaj treść strony.
- Jeśli prawdziwy status 404 będzie potrzebny (SEO), rozważ walidację slugów w `proxy.ts` zanim żądanie dotrze do renderowania.
