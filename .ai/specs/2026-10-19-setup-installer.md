# Instalator środowiska deweloperskiego `npm run setup`

Zgłoszenie: [#1](https://github.com/va1587/words-practice/issues/1).

## 📝 TLDR

Osoba uruchamiająca DevMentora lokalnie wykonuje dziś ręcznie sześć kroków z sekcji „Uruchomienie lokalne” w `README.md`. Proponujemy jedno polecenie `npm run setup` (skrypt `scripts/setup.sh`), które sprawdza wymagania, instaluje zależności, tworzy `.env`, uruchamia Postgresa, stosuje migracje i seed — i przy ponownym uruchomieniu pomija to, co już jest zrobione. Ręczne kroki zostają w README jako alternatywa.

## Resolved assumptions (autonomous defaults)

Pytania otwarte rozstrzygnięte autonomicznie — każde można zmienić przed merge'em.

| #   | Pytanie                                                                    | Przyjęta odpowiedź                                                                                                                                                                                                              | Uzasadnienie                                                                                                                                                   | Potwierdzenie |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Q1  | Czy „Getting started” z #1 to sekcja „Uruchomienie lokalne” w `README.md`? | Tak.                                                                                                                                                                                                                            | README nie ma sekcji „Getting started”; „Uruchomienie lokalne” zawiera dokładnie kroki konfiguracji.                                                           | odwracalne    |
| Q2  | Czy `setup` ma na końcu uruchamiać `npm run dev`?                          | Nie — wypisuje podpowiedź `npm run dev`.                                                                                                                                                                                        | Instalator kończy się i daje kod wyjścia, więc łatwo go ponawiać i używać w automatyzacji; długotrwały serwer to osobna decyzja użytkownika.                   | odwracalne    |
| Q3  | Bash czy Node? Wsparcie Windows bez WSL/Git Bash?                          | Bash (`scripts/setup.sh`), jak `scripts/ci-local.sh`; Windows przez WSL lub Git Bash.                                                                                                                                           | Precedens w repo, zero zależności, działa przed `npm install`. Projekt już wymaga basha dla `ci:local`.                                                        | odwracalne    |
| Q4  | Jak pomijać wykonane kroki?                                                | Instalator sam pomija tylko `.env`, gdy istnieje; pozostałe kroki są idempotentne same w sobie (`npm install`, `docker compose up --wait`, `migration:up`, seeder) są zawsze wywoływane i same nic nie robią, gdy nie ma pracy. | Brak duplikowania logiki „czy już zrobione” w bashu; jedno źródło prawdy w narzędziach.                                                                        | odwracalne    |
| Q5  | Testy automatyczne skryptu?                                                | Bez testów jednostkowych; weryfikacja ręczna + `bash -n` w kroku implementacji.                                                                                                                                                 | Reguła 100% pokrycia dotyczy kodu pakietów; `scripts/` jest poza pomiarem (precedens `ci-local.sh`). Test w CI wymagałby Dockera-w-Dockerze dla kroku compose. | odwracalne    |

## 📝 Problem Statement

Konfiguracja lokalna to sekwencja `npm install` → `cp .env.example .env` → `npm run db:up` → `npm run db:migrate` → `npm run db:seed` → `npm run dev`. Typowe błędy:

- `cp .env.example .env` uruchomione ponownie nadpisuje lokalne zmiany w `.env`;
- `db:migrate` uruchomione zaraz po `db:up` trafia na Postgresa, który jeszcze nie przyjmuje połączeń (`docker compose up -d` nie czeka na healthcheck);
- brak Dockera albo zła wersja Node ujawnia się dopiero w połowie, z mało czytelnym błędem.

## 📝 Proposed Solution

Skrypt `scripts/setup.sh` uruchamiany przez `"setup": "bash scripts/setup.sh"` w root `package.json`. Kroki (każdy wypisuje nagłówek i wynik: wykonano / pominięto):

| #   | Krok         | Wykonanie                                                                                                                                         | Pominięcie / idempotencja                                                                                                                                                                                                                   |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Wymagania    | główna wersja `node -v` równa `.nvmrc` (`24`), `npm -v` ≥ 11 (`packageManager`: `npm@11`), `docker compose version`, `docker info` (demon działa) | Zawsze sprawdzane; błąd → komunikat po polsku + kod ≠ 0 **przed** jakąkolwiek zmianą                                                                                                                                                        |
| 2   | Zależności   | `npm install` (instaluje też hooki lefthook przez `prepare`)                                                                                      | Zawsze uruchamiane — przy aktualnym `node_modules` to szybki no-op; heurystyka „świeżości” (`node_modules/.package-lock.json`) jest zawodna po przerwanej instalacji                                                                        |
| 3   | `.env`       | `cp .env.example .env`                                                                                                                            | Pominięte, gdy `.env` istnieje — **nigdy nie nadpisujemy**; zawartość nie jest wypisywana. Gdy `DATABASE_URL` w `.env` różni się od `.env.example`, ostrzeżenie (bez wartości), że migracje i seed trafią na inną bazę niż kontener compose |
| 4   | PostgreSQL   | `docker compose up -d --wait postgres`                                                                                                            | Idempotentne; `--wait` czeka na healthcheck `pg_isready` z `docker-compose.yml`                                                                                                                                                             |
| 5   | Migracje     | `npm run db:migrate`                                                                                                                              | `migration:up` stosuje tylko oczekujące                                                                                                                                                                                                     |
| 6   | Seed         | `npm run db:seed`                                                                                                                                 | `DatabaseSeeder` pomija, gdy istnieją ścieżki nauki; zapis to jeden `em.flush()` (jedna transakcja), więc przerwany seed nie zostawia częściowych danych                                                                                    |
| 7   | Podsumowanie | Lista kroków z wynikiem + `Gotowe. Uruchom: npm run dev`                                                                                          | —                                                                                                                                                                                                                                           |

Skrypt używa `set -euo pipefail` i pułapki `ERR`, która wypisuje nazwę kroku, który padł. Nie zależy od `node_modules` (działa przed `npm install`).

Odrzucone alternatywy:

- **Skrypt Node/TS** (`scripts/setup.mjs`) — przenośny na Windows bez basha, ale wymaga własnej obsługi procesów potomnych i pierwszej w repo konwencji skryptów Node w roocie; bash jest już przyjęty (`ci-local.sh`).
- **`npm ci` zamiast `npm install`** — deterministyczne, ale zawsze usuwa `node_modules`, więc ponowne uruchomienie nie byłoby tanie; README używa `npm install`.
- **Własna pętla czekania na Postgresa** — zbędna, `docker compose up --wait` korzysta z istniejącego healthchecka.
- **Flagi (`--skip-db`, `--dev`)** — brak zgłoszonej potrzeby; można dodać później bez łamania kontraktu.

## 📝 Architecture

Brak zmian w pakietach `app`/`core`/`db`/`ui`. Skrypt jest orkiestratorem istniejących poleceń; kontrakty, na których polega:

- skrypty npm `db:migrate` i `db:seed` (nazwy chronione w `BACKWARD_COMPATIBILITY.md` §7 — nie zmieniamy ich); zamiast `db:up` skrypt woła bezpośrednio `docker compose up -d --wait postgres`, bo `db:up` nie czeka na healthcheck;
- serwis `postgres` i jego healthcheck w `docker-compose.yml`;
- `.nvmrc` (`24`) jako jedyne źródło wymaganej głównej wersji Node — skrypt działa przed `npm install`, bez `node`/`jq` do parsowania `package.json`, więc nie czyta `engines`;
- idempotentność `DatabaseSeeder` (`packages/db/src/seeders/DatabaseSeeder.ts`).

## 📝 Edge Cases & Failure Scenarios

| Sytuacja                                                  | Zachowanie                                                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Docker niezainstalowany / demon nie działa                | Krok 1: „Docker nie działa — uruchom Docker Desktop i spróbuj ponownie.”, kod 1, nic nie zmienione                                 |
| Node ≠ 24 lub npm < 11                                    | Krok 1: komunikat z wymaganą i wykrytą wersją oraz wskazówką `nvm use`, kod 1                                                      |
| Port 5432 zajęty przez inny Postgres                      | Krok 4 pada na `docker compose`; pułapka wypisuje krok i wskazówkę o zajętym porcie, kod ≠ 0                                       |
| `.env` istnieje z innym `DATABASE_URL`                    | `.env` nietknięty; ostrzeżenie (bez wartości), migracje i seed idą na skonfigurowaną bazę (kontener i tak startuje — nieszkodliwe) |
| Przerwanie w trakcie (Ctrl+C, błąd sieci w `npm install`) | Ponowne `npm run setup` dokańcza od pierwszego niewykonanego kroku dzięki idempotencji                                             |
| Drugie uruchomienie na gotowym środowisku                 | Kroki 2–3 „pominięto”, 4–6 kończą się bez zmian, kod 0                                                                             |

## 📝 Risks & Impact Review

- Tylko narzędzie deweloperskie: brak wpływu na runtime, schemat, CI. Rollback = usunięcie skryptu i wpisu w `package.json`.
- Nowy skrypt npm `setup` staje się częścią powierzchni z `BACKWARD_COMPATIBILITY.md` §7 (odwołania w README).
- Prettier formatuje tylko pliki, które obsługuje — `.sh` jest poza nim; knip nie analizuje basha, więc nie zgłosi nowego pliku.

## 📋 Phasing

Jedna faza — instalator + README; całość jest małą, niezależnie wdrażalną zmianą.

## 📋 Implementation Plan

1. **Skrypt instalatora** — dodaj `scripts/setup.sh` (wzorzec `step()` i `set -euo pipefail` z `scripts/ci-local.sh`, komunikaty po polsku, komentarze po angielsku) z krokami 1–7 powyżej oraz `"setup": "bash scripts/setup.sh"` w root `package.json`. Test: `bash -n scripts/setup.sh`; `npm run setup` na środowisku bez `.env` i z zatrzymanym kontenerem → kod 0, aplikacja (`npm run dev`) pokazuje dane z seeda.
2. **Idempotencja i błędy** — test ręczny: drugie `npm run setup` → kod 0, kroki 2–3 pominięte, `.env` niezmieniony (porównanie sumy kontrolnej); zatrzymany Docker → kod 1 z komunikatem przed jakąkolwiek zmianą.
3. **README** — w „Uruchomienie lokalne” dodaj `npm run setup` jako zalecaną ścieżkę, zachowując ręczne kroki jako „Alternatywa: krok po kroku”; dodaj wiersz `npm run setup` do tabeli „Skrypty”. Test: `npm run check` zielone.
4. **Bramka** — `npm run ci:local` zielone (nowy plik najpierw `git add`).
