# DevMentor — szablon aplikacji (szkielet UI)

## Cel

Zastąpić domyślną stronę `create-next-app` szkieletem aplikacji **DevMentor** — platformy ścieżek nauki dla programistów (roadmapy, moduły, lekcje, śledzenie postępów). Szablon ma dać spójny layout, nawigację i komplet stron-zaślepek na mockowych danych, na których da się później budować realną logikę.

## Kontekst

- Repo: świeży Next.js 16.4 (App Router) + React 19.3 + Tailwind 4, `cacheComponents: true` w `next.config.ts`.
- Brak backendu, bazy, auth — i tak ma zostać w tym etapie.
- Decyzja użytkownika (2026-10-15): koncepcja = „platforma ścieżek nauki” (bez czatu na żywo, bez marketplace mentorów); zakres = „spec + szkielet UI”.

## Zakres

W zakresie:

1. Model danych i mockowe dane (`lib/types.ts`, `lib/data.ts`): ścieżki → moduły → lekcje, postęp przykładowego użytkownika.
2. Wspólny layout: nagłówek z nawigacją, stopka, polski interfejs (`lang="pl"`), metadane „DevMentor”.
3. Strony:
   - `/` — landing: hero, korzyści, wyróżnione ścieżki, CTA.
   - `/paths` — katalog ścieżek (karty: tytuł, poziom, czas, liczba lekcji, tagi).
   - `/paths/[slug]` — szczegóły ścieżki: opis, moduły z listą lekcji, pasek postępu.
   - `/paths/[slug]/[lesson]` — widok lekcji: treść (mock), zadanie praktyczne, nawigacja poprzednia/następna.
   - `/dashboard` — panel użytkownika: statystyki (ukończone lekcje, seria dni), aktywne ścieżki z postępem, „kontynuuj naukę”.
   - `not-found` — własna strona 404.
4. Komponenty UI wielokrotnego użytku: `PathCard`, `ProgressBar`, `LevelBadge`, `SiteHeader`, `SiteFooter`.

Poza zakresem: logowanie, zapis postępu (persistencja), edytor treści, wyszukiwarka/filtry, testy E2E.

## Decyzje projektowe

- **Dane statyczne w module TS**, funkcje dostępowe (`getPaths`, `getPath`, `getLesson`, `getUserProgress`) — przyszła warstwa API/DB podmieni ich implementację bez zmian w stronach.
- **Dynamiczne trasy z `generateStaticParams`** — przy `cacheComponents` wymagane co najmniej jedno param; wszystkie ścieżki/lekcje prerenderowane; nieznany slug → `notFound()`.
- **Server Components wszędzie**; jedyny komponent kliencki to aktywny link w nawigacji (`usePathname`).
- **Postęp użytkownika** jako mock (zbiór ukończonych ID lekcji) — bez localStorage, żeby uniknąć problemów z hydratacją i niespójnością z przyszłym backendem.
- **Stylowanie**: Tailwind 4, tokeny kolorów w `globals.css` (`--background`, `--foreground`, `--accent`, `--muted`, `--border`), tryb jasny/ciemny przez `prefers-color-scheme`.
- **Język UI**: polski.

## Otwarte pytania

- Auth (NextAuth/Clerk/własny?) i źródło danych (Postgres/CMS/MDX) — do decyzji w kolejnym specu.
- Czy treść lekcji ma być w MDX w repo, czy w CMS?
- Czy potrzebny jest mentor (człowiek/AI) w kolejnym etapie?

## Plan implementacji

1. `lib/types.ts`, `lib/data.ts` — model + mock (3–4 ścieżki, 2–3 moduły, 2–4 lekcje).
2. `globals.css` — tokeny; `app/layout.tsx` — metadane, header/footer.
3. Komponenty w `components/`.
4. Strony: `/`, `/paths`, `/paths/[slug]`, `/paths/[slug]/[lesson]`, `/dashboard`, `not-found`.
5. Weryfikacja: `npm run lint`, `npm run build`, sprawdzenie stron na `next start` (HTTP 200 / 404).
6. Przeniesienie specu do `.ai/specs/implemented/`.
