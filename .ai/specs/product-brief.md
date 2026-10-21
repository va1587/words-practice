# DevMentor — product brief

- Date: 2026-10-19 (refresh 2026-10-19: D05, D06, R06; logowanie dodane do Now)
- Mode: own; Owner: mkz (właściciel produktu); Pass: Quick pass
- Evidence basis: 7 rozmów z 7 różnymi osobami (4 deweloperów, z których jeden nie ma tego problemu, i 3 mentorów), eksport 109 wątków pomocy z jednego Discorda (14 dni), ankieta 54 osób z tego samego Discorda, 5 benchmarków sprawdzonych 2026-09-04, lista 50 kandydatów na mentorów. Tablica Miro to stanowiska założycieli, nie dowody. Najważniejsze niesprawdzone przekonanie: że deweloper faktycznie zapłaci obcemu mentorowi za sesję tekstową (A01) — w ankiecie zapłaciły kiedykolwiek 3 osoby z 54.
- Coverage: 39 claims — 36 sourced (interview 14, data 6, document 15, product 0, benchmark 1), 0 synthetic, 3 assumed; 1 entries on the collection plan
- Synthetic hypotheses outside Coverage: 0
- Definition of Ready signed by: mkz (2026-10-19) dla zakresu Now; A01–A03 niesprawdzone; ready for: implementation planning zakresu Now, testu A01 i zebrania materiału od mentorów
- Sources: `.ai/specs/research/` (wywiady 2026-08-20 – 2026-09-03, eksport i ankieta z Discorda 2026-09-04, benchmarki 2026-09-04, lista mentorów 2026-09-04, eksporty tablicy Miro 2026-09-02 – 2026-09-05, decyzje N01, N02, D02–D06, R02–R06), `packages/core/src/http/auth.ts`, `packages/` (szablon aplikacji)

## Decision summary

Decyzja tej sesji: od czego zacząć DevMentora. Zakres (D03, zatwierdzony przez mkz 2026-10-19; rekomendacja agenta oparta na materiale): płatna, jednorazowa sesja tekstowa z mentorem, który widocznie robił dokładnie ten problem; vault i MCP później.

Problem ma oparcie w materiale: deweloperzy bez seniora pod ręką tracą pół dnia do tygodnia na konkretnym blokerze, a darmowe społeczności odpowiadają wolno albo wcale (zob. Problems). Grupa docelowa to pracujący deweloperzy i freelancerzy bez seniora; deweloper w dużej firmie z wewnętrznym kanałem tego problemu nie ma (zob. Target group).

Wybrane: publiczny katalog mentorów (D02, mkz), do którego profil trafia po ręcznej akceptacji w panelu `/admin` (R06, D06), sesje tekstowe bez wideo i bez ocen (N01, N02), długość 25/50 min (D01). Pierwszym krokiem Now jest konto i logowanie dla obu ról (D05), bo wymagają ich D04, R06 i większość historii, a aplikacja nie ma dziś logowania. Vault odkładamy, bo żaden deweloper zapytany o zapisane odpowiedzi czy subskrypcję ich nie chciał, a poparcie vaulta pochodzi tylko od mentorów.

Najbardziej może zmienić decyzję: czy deweloperzy rzeczywiście zapłacą (A01), czy mentorzy wejdą do publicznego katalogu (A02 — dwoje z trojga rozmówców-mentorów stawiało warunki, które katalog utrudnia) i czy mentor odpowie w oknie, którego potrzebuje deweloper: od 20 minut do tego samego dnia (A03). Wymóg konta przed pytaniem (D04, D05) jest sprzeczny z „nie że zakładam konto, weryfikacja maila” z wywiadu 2026-09-01 i może spowolnić rezerwację (A01).

Następny krok: rozmowy z mentorami z „ciepłej” części listy o dostępności, stawce i katalogu (plan zbierania), ręczny test płatnych sesji (A01) i regulamin przed pierwszą płatnością (Q03). Właściciel: mkz; próg dla A01 mkz ustali w trakcie testu (Q02).

## Vision

Zamierzony kierunek założycieli, niewykazana korzyść: mentorzy zarabiają dwa razy — za godzinę i za każdym razem, gdy wiedza z tej godziny pomaga komuś innemu. `[DOCUMENT]` research/2026-09-02-miro-board-vision-target-needs.md

## Target group and stakeholders

- Customer (pays): deweloper, który płaci z własnej kieszeni — tak deklarowało 24 z 54 ankietowanych, a 13 wskazało pracodawcę „jeśli poproszę”. `[DATA]` research/2026-09-04-survey-discord-willingness-to-pay.md
- Customer (pays): freelancer płaci sam i nie mówi o tym klientowi („klient mi nie placi za odrabianie lekcji”). `[INTERVIEW]` research/2026-09-02-interview-freelancer-react.md
- User (uses): deweloper z konkretnym, pilnym blokerem i bez seniora pod ręką — przed releasem, wieczorem w piątek, przed wyceną. `[INTERVIEW]` research/2026-08-20-interview-working-dev.md, research/2026-09-01-interview-backend-dev-fintech.md, research/2026-09-02-interview-freelancer-react.md
- User (uses), wykluczony z grupy: deweloper platformowy w firmie na 200 osób rozwiązuje sam albo pyta na wewnętrznym kanale; zapłaciłby „raz w roku może”, tylko na firmę. `[INTERVIEW]` research/2026-09-02-interview-platform-dev-solves-alone.md
- User (mentor): senior, który już odpowiada za darmo na te same pytania z prywatnego dokumentu (2 z 3 rozmówców-mentorów). `[INTERVIEW]` research/2026-08-22-interview-mentor.md, research/2026-09-03-interview-senior-python-meetups.md
- Stakeholders: dwóch założycieli pełni wszystkie role wewnętrzne; dział prawny (regulamin) nie ma osoby. `[DOCUMENT]` research/2026-09-05-miro-board-raci-matrix.md
- Decider for scope decisions: mkz (właściciel produktu, potwierdzone w sesji 2026-10-19); wcześniejsze decyzje N01, N02, D01 podpisała founderka A.

## Problems, with evidence

- Deweloper przed releasem utknął na błędzie generyków TS, Discord dał dwie sprzeczne odpowiedzi, wypuścił obejście; koszt „half a day, and I still don't trust that code”. `[INTERVIEW]` research/2026-08-20-interview-working-dev.md
- Deweloper backendu w piątek wieczorem: godzina szukania, nikt na Slacku, zła odpowiedź na Discordzie w sobotę, rollback i przesunięty release. Jedno zdarzenie; częstotliwość nieznana. `[INTERVIEW]` research/2026-09-01-interview-backend-dev-fintech.md
- Freelancer zaniżył wycenę migracji o mniej więcej tydzień własnego czasu po „it depends” z Discorda. `[INTERVIEW]` research/2026-09-02-interview-freelancer-react.md
- W 14 dni na jednym Discordzie (~4000 osób) powstało 109 wątków pomocy; 23 nie dostały żadnej odpowiedzi, mediana czasu do pierwszej odpowiedzi wyniosła 68 minut. `[DATA]` research/2026-09-04-discord-help-requests.csv
- 31 wątków miało sygnał pilności („release tomorrow”, „prod is down”); 9 z nich zostało bez odpowiedzi. `[DATA]` research/2026-09-04-discord-help-requests.csv
- 35 ze 109 wątków skończyło się rozwiązaniem według autora, 20 częściowo (notatka do eksportu podaje 23; plik zawiera 20). `[DATA]` research/2026-09-04-discord-help-requests.csv
- 30 z 54 ankietowanych utknęło ostatnio „w tym tygodniu” lub „w tym miesiącu”; to deklaracja, nie pomiar. `[DATA]` research/2026-09-04-survey-discord-willingness-to-pay.md
- Mentorzy odpowiadają za darmo na powtarzające się pytania z prywatnego dokumentu; jeden mówi „two evenings a month, for free”. `[INTERVIEW]` research/2026-08-22-interview-mentor.md
- Potrzeba wywnioskowana, niezweryfikowana: że płatna odpowiedź od osoby, która robiła to samo, rozwiązuje te sytuacje szybciej niż darmowe kanały (A01, A03).

## Product and how it stands out

- What it is: rynek płatnych, krótkich sesji tekstowych z mentorami, których dorobek jest widoczny (szczegóły w Scope). `[DOCUMENT]` research/2026-09-02-miro-board-product-goals.md
- What makes it different (hipoteza): tekst zamiast calla i dorobek zamiast ocen — Codementor pokazuje 5.0 na każdej z 10 kart. `[BENCHMARK]` research/2026-09-04-benchmark-codementor.md
- Vault i MCP jako wyróżnik to stanowisko tablicy, bez poparcia od deweloperów; przeniesione do Later (D03).

| reference    | what it does well                                                                            | where it falls short for our users                               | checked on | link                                    |
| ------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------- | --------------------------------------- |
| Codementor   | ścieżka zgłoszenie → sesja; stawki widoczne na kartach ($15–80 / 15 min)                     | oceny bez informacji; rozmówca szukał mentora 40 min, potem call | 2026-09-04 | https://www.codementor.io/react-experts |
| MentorCruise | darmowa rozmowa wstępna, uczciwy opis modelu                                                 | miesięczna relacja, której nie chce ani mentorka, ani freelancer | 2026-09-04 | https://mentorcruise.com/               |
| Topmate      | ekspert ma własny link, cenę i odbiorców; prowizja 10% z własnego linku, 20% z marketplace'u | dowolna profesja; obcy deweloper nie znajdzie eksperta           | 2026-09-04 | https://topmate.io/pricing              |
| Preply       | anulowanie do 12 h przed, sesje 25/50 min                                                    | model cykliczny; oceny na każdej karcie                          | 2026-09-04 | https://preply.com/en/how-it-works      |

## Goals and success criteria

- Business goal: cele z tablicy (100 mentorów z vaultem w rok, 30% na subskrypcji) dotyczą vaulta i nie pasują do zakresu Now; cel dla Now nieustalony (Q02). `[DOCUMENT]` research/2026-09-02-miro-board-product-goals.md
- User outcome: deweloper z blokerem dostaje od osoby, która robiła to samo, odpowiedź tekstem tego samego dnia, za znaną z góry cenę. `[INTERVIEW]` research/2026-09-01-interview-backend-dev-fintech.md, research/2026-09-02-interview-freelancer-react.md
- Primary metric, baseline, threshold, date: punkt odniesienia z darmowego kanału — mediana 68 min do pierwszej odpowiedzi, 21% bez odpowiedzi. `[DATA]` research/2026-09-04-discord-help-requests.csv
- Próg ustali mkz w trakcie testu A01 (Q02).
- What must not get worse: nic nie jest publikowane bez zgody mentee (R01).

## Scope

- **Now (D03, D05):** najpierw konto i logowanie dla dewelopera i mentora, z rolą administratora dla akceptacji profili (D05, D06); potem deweloper znajduje mentora w katalogu (D02), widzi cenę i dorobek, wysyła pytanie z góry z własnego konta (D04), płaci przed sesją i dostaje 25/50-minutową sesję tekstową (D01, N01, N02, R02–R06).
- **Later:** vault wiedzy mentora, subskrypcja, MCP, asynchroniczne pytania z 24-godzinnym SLA (D03; pytanie Q01 o cytowanie notatek blokuje vault, nie Now).
- **Not doing:** see Non-goals

## Domain glossary

| Term    | Meaning                                                                                | Owned by | Visible to        |
| ------- | -------------------------------------------------------------------------------------- | -------- | ----------------- |
| Sesja   | 25- lub 50-minutowa wymiana tekstowa mentora z deweloperem, opłacona z góry (D01, N01) | mentor   | mentor, deweloper |
| Vault   | baza notatek mentora sprzedawana jako subskrypcja; poza Now                            | mentor   | subskrybenci      |
| Dorobek | link do publicznej pracy i opis tego, co mentor robił — zamiast ocen (N02)             | mentor   | wszyscy           |

## Key flows

- Current state: problem → szukanie w Google i dokumentacji → pytanie na Slacku/Discordzie → czekanie albo zła odpowiedź → obejście lub rollback. `[INTERVIEW]` research/2026-09-01-interview-backend-dev-fintech.md
- Future state (proposal): mentor zakłada konto i profil → akceptacja w `/admin` (R06, D06) → deweloper: katalog po technologii → profil z dorobkiem i ceną → konto/logowanie (D04) → pytanie z góry → płatność → mentor przyjmuje → sesja tekstowa → zwrot tego samego dnia, jeśli mentor nie przyjdzie (R02–R05). Kroki poza D01, D02, D04, D05, D06 i R06 to założenia.

## Business rules

| Id  | Rule                                                                                  | Applies to              | Source                                                                        | Status | Review by                                                                                      | Required path to change                        | Owner            | Supersedes |
| --- | ------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------- | ---------- |
| R01 | Nic z sesji nie jest publikowane bez zgody mentee                                     | sesje, przyszły vault   | `[DOCUMENT]` research/2026-08-26-workshop-export.md                           | active | unknown                                                                                        | nowy wiersz zatwierdzony przez obu założycieli | obaj założyciele | none       |
| R02 | Cena widoczna, zanim deweloper napisze pytanie                                        | katalog, profil         | `[INTERVIEW]` research/2026-09-02-interview-freelancer-react.md               | active | unknown                                                                                        | mkz                                            | mkz              | none       |
| R03 | Pytanie trafia do mentora z góry; mentor widzi je przed przyjęciem                    | rezerwacja              | `[INTERVIEW]` research/2026-09-03-interview-staff-engineer-declined-before.md | active | unknown                                                                                        | mkz                                            | mkz              | none       |
| R04 | Płatność przed sesją; gdy mentor nie przyjdzie, zwrot tego samego dnia bez zgłoszenia | płatności               | `[INTERVIEW]` research/2026-09-02-interview-freelancer-react.md               | active | unknown                                                                                        | mkz                                            | mkz              | none       |
| R05 | Mentor nie podaje danych do wypłat przed pierwszą rezerwacją                          | onboarding mentora      | `[INTERVIEW]` research/2026-09-03-interview-senior-python-meetups.md          | active | unknown                                                                                        | mkz                                            | mkz              | none       |
| R06 | Profil mentora trafia do publicznego katalogu dopiero po ręcznej akceptacji           | katalog, profil mentora | `[DOCUMENT]` research/decisions/R06-mentor-approval.md                        | active | jeśli akceptacja staje się wąskim gardłem albo mentorzy z pierwszej puli i tak odmawiają (A02) | mkz                                            | mkz              | none       |

## Non-goals

| Id  | We are not building                                    | Why                                            | Owner              | Status | Review by | Required path to change | Source                                            | Supersedes |
| --- | ------------------------------------------------------ | ---------------------------------------------- | ------------------ | ------ | --------- | ----------------------- | ------------------------------------------------- | ---------- |
| N01 | Rozmów wideo                                           | „text is fine, faster”; ograniczenie warsztatu | founder A (Oliwia) | active | unknown   | nowy wiersz founder A   | `[DOCUMENT]` research/decisions/N01-no-video.md   | none       |
| N02 | Ocen i recenzji; zamiast nich link do publicznej pracy | „my GitHub is my profile”                      | founder A (Oliwia) | active | unknown   | nowy wiersz founder A   | `[DOCUMENT]` research/decisions/N02-no-ratings.md | none       |

## Decisions

| Id  | Date       | Decision                                                                                                                                | Why                                                                                                                                                                                                                                              | Owner              | Status | Review by                                                      | Required path to change | Source                                                                                                                                                                                                                     | Supersedes |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------ | -------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| D01 | 2026-08-26 | Sesje trwają 25 lub 50 minut                                                                                                            | „bookable in a lunch break”                                                                                                                                                                                                                      | founder A (Oliwia) | active | unknown                                                        | nowy wiersz founder A   | `[DOCUMENT]` research/2026-08-26-workshop-export.md                                                                                                                                                                        | none       |
| D02 | 2026-10-19 | Deweloper znajduje mentora w publicznym katalogu                                                                                        | wybór właściciela spośród: tylko link mentora, katalog, mentor wybiera; materiał sprzeczny, agent nie rekomendował                                                                                                                               | mkz                | active | jeśli mentorzy odmówią wejścia do katalogu (A02)               | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D02-public-catalogue.md                                                                                                                                                                    | none       |
| D03 | 2026-10-19 | Najpierw płatne sesje tekstowe; vault, subskrypcja i MCP później                                                                        | rekomendacja agenta z materiału, zaakceptowana przez mkz: deweloperzy chcą odpowiedzi, nie subskrypcji; alternatywy: vault najpierw, oba w MVP                                                                                                   | mkz                | active | po teście A01                                                  | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D03-text-sessions-first.md; research/2026-08-20-interview-working-dev.md, research/2026-09-01-interview-backend-dev-fintech.md, research/2026-09-02-interview-platform-dev-solves-alone.md | none       |
| D04 | 2026-10-19 | Deweloper musi mieć konto przed wysłaniem pytania                                                                                       | wybór właściciela spośród: z kontem, bez konta; agent nie rekomendował; sprzeczne z „nie że zakładam konto, weryfikacja maila” (wywiad 2026-09-01)                                                                                               | mkz                | active | jeśli w teście A01 deweloperzy rezygnują przy zakładaniu konta | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D04-account-before-question.md                                                                                                                                                             | none       |
| D05 | 2026-10-19 | Zakres Now zaczyna się od konta i logowania dla dewelopera i mentora                                                                    | rekomendacja agenta zaakceptowana przez mkz: D04, R06 i większość historii wymagają sesji, a aplikacja jej nie ma (`packages/core/src/http/auth.ts`: `readSession` zawsze `null`); alternatywa: logowanie jako zależność techniczna poza briefem | mkz                | active | unknown                                                        | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D05-login-in-now.md                                                                                                                                                                        | none       |
| D06 | 2026-10-19 | Akceptacja profilu mentora przyciskiem w `/admin`, chronionym rolą administratora, od razu w zakresie Now (historia akceptacji profilu) | wybór mkz wbrew rekomendacji agenta (ręczny UPDATE na start, przycisk później); koszt: rola admin w specyfikacji logowania i większy E01                                                                                                         | mkz                | active | unknown                                                        | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D06-admin-approval-button.md                                                                                                                                                               | none       |
| D07 | 2026-10-19 | Logowanie przez e-mail i hasło                                                                                                          | wybór mkz spośród: GitHub (OAuth), link na e-mail, e-mail i hasło; agent nie rekomendował                                                                                                                                                        | mkz                | active | jeśli w teście A01 deweloperzy odpadają przy zakładaniu konta  | nowy wiersz mkz         | `[DOCUMENT]` research/decisions/D07-email-password-login.md                                                                                                                                                                | none       |

## Riskiest assumptions

| Id  | Assumption                                                                                                                           | Importance | Evidence today                                                                                                                                                                                       | If false                                          | Smallest test                                                                                                                                                                     | Owner | By when | Result   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------- | -------- |
| A01 | Deweloper z blokerem zapłaci obcemu mentorowi za sesję tekstową `[ASSUMPTION]` rekomendacja agenta z wywiadów i ankiety              | high       | 37 z 54 ankietowanych deklaruje, że zapłaciłoby coś; 3 z 54 kiedykolwiek komuś zapłaciły; w wywiadach ceny padały jako „nie wiem. pięćdziesiąt euro?” i „ponizej 200”                                | Now traci sens; wracamy do wyboru kierunku        | ręczna oferta płatnej pomocy tekstowej od kilku mentorów z listy na tym samym Discordzie (founder B jest moderatorem), płatność linkiem Stripe; liczy się zapłata, nie deklaracja | mkz   | unknown | untested |
| A02 | Mentorzy z pierwszej puli zgodzą się być w publicznym katalogu `[ASSUMPTION]` konsekwencja D02                                       | high       | staff engineer: „nie wsadzajcie mnie na listę obok ludzi, których nie znam”; senior Python wchodzi, „jak ludzie, których znam”                                                                       | D02 do rewizji, katalog bez podaży                | pytanie w rozmowach z mentorami (plan zbierania)                                                                                                                                  | mkz   | unknown | untested |
| A03 | Mentor odpowie w oknie dewelopera (20 min – ten sam dzień), także wieczorem `[ASSUMPTION]` wniosek agenta z rozbieżności w wywiadach | high       | deweloperzy: „w dwadzieścia minut”, „within the hour”, „tego samego dnia”; mentorzy: „jak mam humor”, „między spotkaniami”, „nie pisz do mnie w weekend”; na Discordzie najwięcej wątków 17:00–21:00 | sesja z rezerwacją nie rozwiązuje pilnego blokera | pytanie o dostępność w rozmowach z mentorami; w teście A01 mierzyć czas do odpowiedzi                                                                                             | mkz   | unknown | untested |

## Kill criteria

Decyduje mkz. Próg dla testu A01 mkz dopisze w trakcie testu (Q02); do tego czasu wynik testu nie może sam uzasadnić kontynuacji. Wynik rozmów z mentorami (A02, A03), który zatrzymuje Now, nieustalony.

## Hypotheses to test

Brak — w tej sesji nie było symulacji.

## Open questions

| Id  | Question                                                                                                                                              | Blocking                                    | Who can answer           | Status                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| Q01 | Czy odpowiedź vaulta cytuje mentora i notatkę?                                                                                                        | nie dla Now; blokuje vault (Later)          | founder B (wg warsztatu) | open                                                                    |
| Q02 | Jaki wynik A01–A03, w jakim terminie, oznacza kontynuację, a jaki stop?                                                                               | nie dla budowy Now; blokuje ocenę testu A01 | mkz                      | częściowo: próg mkz dopisze w trakcie testu (2026-10-19)                |
| Q03 | Kto odpowiada za regulamin dla obu ról, skoro dział prawny nie ma osoby?                                                                              | nie — warunek przed pierwszą płatnością     | mkz                      | closed: mkz przygotuje regulamin przed pierwszą płatnością (2026-10-19) |
| Q04 | Czy N01 obowiązuje też przy wycenach, gdzie freelancer chce rozmowy („do wyceny rozmowa”), i gdy tekst nie wystarcza („call jak tekst nie zadziała”)? | nie — Now zakłada tekst                     | founder A (Oliwia)       | open                                                                    |

## Definition of Ready addendum (own)

Problems i Target group mają oparcie w wywiadach (3 deweloperów z opisanym blokerem, 3 mentorów) i danych z jednego Discorda; to jedna społeczność i deklaracje w ankiecie. D03, D05, D06 i reguły R02–R06 zatwierdził mkz; to akceptacja kierunku, nie dowód popytu. Now obejmuje teraz logowanie z rolą administratora i zabezpieczony `/admin`, które wymagają osobnej specyfikacji (D05, D06). A01–A03 są niesprawdzone; akceptacja ryzyka nie zastąpi testu płatności. Gotowe na: test A01 i rozmowy z mentorami. Zakres Now jest gotowy do planowania implementacji; przyjmowanie płatności czeka na regulamin (Q03), a ocena testu A01 na próg (Q02).

## Collection plan

### Czy mentorzy z pierwszej puli wejdą do publicznego katalogu, ile czasu dadzą i w jakich godzinach, za jaką stawkę i czy pracodawca im pozwala?

- What decision or work needs it: A02 (rewizja D02), A03 (czy sesja odpowiada na pilny bloker), ceny w R02
- Who can answer it: mentorzy z listy z ciepłym kontaktem (29 z 50 osiągalnych jedną wiadomością od founder A lub B)
- How: krótkie rozmowy w trakcie zaproszeń; w obu dotychczasowych rozmowach z mentorami z listy nie udało się uzyskać stawki ani dostępności
- Owner and by when: unknown
- Template: `.ai/specs/research/templates/interview-note.md`
