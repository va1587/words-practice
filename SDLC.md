# Proces dostarczania oprogramowania

## Cel

Ten plik opisuje, jak praca przechodzi od zgłoszenia do zmergowanego PR-a w tym repozytorium. Skille agentów skonfigurowane w `.ai/agentic.config.json` egzekwują ten proces; ludzie czytają go tutaj. PR-y celują w `main`; zgłoszenia i PR-y żyją na GitHubie (`va1587/words-practice`), a każda operacja trackera, którą wykonują skille, jest zdefiniowana w `.ai/trackers/github.md` (edytuj ten plik, aby rozszerzyć lub nadpisać zachowanie trackera).

Praca wchodzi dwiema drogami: jako swobodny opis zadania przekazany agentowi albo jako założone zgłoszenie (issue). Obie zbiegają się w tej samej pętli review, tej samej bramce walidacji i tych samych bramkach merge'a.

Przed przyjęciem praca jest kształtowana: `om-brainstorm` zamienia pojedynczy pomysł lub pytanie w decyzję o dalszej drodze i brief, a skille specyfikacji (`om-spec-writing`, `om-auto-write-spec`) zamieniają funkcjonalność w dokument projektowy w `.ai/specs/`, zanim cokolwiek zostanie zbudowane (zgodnie z zasadą SDD z `AGENTS.md`). Te kroki zasilają poniższą tabelę; nie są samym przepływem zgłoszenia.

## Role

- **Autor** — człowiek lub agent piszący zmianę. Odpowiada za zgłoszenie od przejęcia do PR-a gotowego do merge'a.
- **Recenzent** — czyta diff i zatwierdza albo prosi o zmiany. Może to być człowiek lub skill `om-auto-review-pr`; w obu przypadkach obowiązuje checklista `om-code-review` oraz `CODE_REVIEW.md`. Recenzent jest też drugą osobą wymaganą przy zmianie `risk-high` i zatwierdza specyfikację, gdy funkcjonalność jej wymaga.
- **Projektant** — odpowiada za przepływ i jego stany, zanim powstanie kod, oraz za kontrakt projektowy, który weryfikuje review UI. Może to być człowiek, `om-ux-shape` przy kształtowaniu, `om-ux-review-pr` przy przeglądzie ekranów PR-a.
- **Recenzent QA** — sprawdza zmiany widoczne dla użytkownika przed merge'em: `om-prepare-test-env` uruchamia aplikację, a `om-auto-qa-pr` przechodzi ją w prawdziwej przeglądarce (agent-browser). „Ręczne” oznacza, że człowiek ocenia wynik i odpowiada za `qa-approved`; nie oznacza pracy bez wsparcia. Zawsze wskazywany przez rolę, nigdy z imienia lub loginu.
- **Maintainer** — odpowiada za ochronę gałęzi, taksonomię etykiet, konfigurację, ten dokument oraz zainstalowane skille z ich lokalnymi nadpisaniami w `.ai/skills/`; rozstrzyga konflikty bramek. Pełni rolę release managera, o ile zespół nie wskaże innej osoby.

## Cykl życia zgłoszenia

| Etap                | Co się dzieje                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Kto prowadzi                                                                                                       | Gotowe, gdy                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Odkrywanie          | Pomysł, pytanie lub potrzeba jest omawiana, zanim powstanie jakikolwiek artefakt: problem jest kwestionowany, alternatywy (łącznie z niebudowaniem niczego) są ważone, a rozmowa kończy się decyzją — odpowiedzią, zgłoszeniem, briefem do specyfikacji lub bezpośrednią zmianą.                                                                                                                                                                                                                             | `om-brainstorm` lub człowiek                                                                                       | Rozmowa skierowana dalej; brief zapisany, gdy praca jest kontynuowana                                               |
| Przyjęcie           | Zgłoszenie lub brief trafia na GitHub z wystarczającymi szczegółami: co jest nie tak lub czego brakuje, dla kogo i jak wygląda „gotowe”. `om-prepare-issue` zakłada je z etykietami SDLC.                                                                                                                                                                                                                                                                                                                    | Każdy, `om-prepare-issue`                                                                                          | Zgłoszenie istnieje                                                                                                 |
| Triaż               | Potwierdzenie, że problem jest realny, wciąż nienaprawiony na `main` i nie jest już przejęty ani pokryty otwartym PR-em. Tylko do odczytu; czysto zatrzymuje łańcuch, gdy nie ma nic do zrobienia.                                                                                                                                                                                                                                                                                                           | `om-verify-in-repo` lub człowiek                                                                                   | Potwierdzone do realizacji albo zamknięte bez działań                                                               |
| Przejęcie           | Autor przejmuje zgłoszenie, by równoległe agenty się wycofały. Zob. protokół przejęcia poniżej.                                                                                                                                                                                                                                                                                                                                                                                                              | `om-fix` / `om-auto-create-pr` lub człowiek                                                                        | Przejęcie widoczne na zgłoszeniu                                                                                    |
| Projekt             | Dla zmiany widocznej dla użytkownika przepływ i stany są ustalone przed kodem: co ekran robi pusty, w trakcie ładowania, przy błędzie i bez uprawnień, oraz czego zmiana celowo nie robi. Zgłoszenie bez UI pomija ten etap.                                                                                                                                                                                                                                                                                 | `om-ux-shape` lub projektant                                                                                       | Przepływ i stany ustalone albo zgłoszenie nie dotyczy UI                                                            |
| Implementacja       | Wskazanie minimalnej powierzchni zmiany (`om-root-cause`, tylko odczyt), potem implementacja z testami regresyjnymi (100% pokrycia) i uruchomienie bramki walidacji. Briefy bez zgłoszenia przechodzą przez `om-auto-create-pr`, który planuje, implementuje fazami w izolowanym worktree i uruchamia tę samą bramkę.                                                                                                                                                                                        | `om-root-cause` + `om-fix`, `om-auto-create-pr` lub autor                                                          | Zmiana kompletna, bramka walidacji zielona                                                                          |
| PR                  | Commit, push i PR do `main` ze znormalizowanymi etykietami. Na ręcznie prowadzonej gałęzi `om-check-and-commit` uruchamia bramkę, poprawia oczywiste rozjazdy i pushuje po zielonym wyniku.                                                                                                                                                                                                                                                                                                                  | `om-open-pr`, `om-auto-create-pr` lub `om-check-and-commit`                                                        | Otwarty, oetykietowany PR                                                                                           |
| Pętla review        | Recenzent czyta diff według checklisty `om-code-review` i `CODE_REVIEW.md`, zatwierdza lub prosi o zmiany. Uwagi są adresowane (`om-auto-continue-pr` wznawia PR-y agentów z planu, a PR bez planu adoptuje, rekonstruując plan z kontekstu PR-a) i PR wraca do review aż do zatwierdzenia. Zmiana widoczna dla użytkownika dostaje też przegląd projektowy: `om-ux-review-pr` przechodzi zmienione ekrany i raportuje uwagi według wpływu na użytkownika. Ten przegląd jest doradczy — nie blokuje merge'a. | `om-auto-review-pr` (pojedynczy PR), `om-review-prs` (przegląd zbiorczy), `om-ux-review-pr` (projekt) lub człowiek | Zatwierdzające review wysłane                                                                                       |
| QA                  | PR z `needs-qa` czeka na QA. Recenzent uruchamia aplikację raz przez `om-prepare-test-env`, przechodzi zmianę w przeglądarce przez `om-auto-qa-pr` — który dołącza zrzuty ekranu i raport pass/fail, domyślnie nie dotykając etykiet — i zapisuje wynik. Przepływ wart utrzymania staje się testem w `packages/app/integration/` (`om-integration-tests`). Zob. bramkę QA poniżej.                                                                                                                           | Recenzent QA z `om-prepare-test-env`, `om-auto-qa-pr`, `om-integration-tests`                                      | `qa-approved` nadane przez recenzenta QA lub w ramach dozwolonego wyjątku self-QA; `qa-failed` odsyła PR z powrotem |
| Merge               | `om-merge-buddy` raportuje (tylko odczyt), które PR-y można zmergować teraz, a które są blisko, ale zablokowane. `om-approve-merge-pr` ponownie sprawdza wszystkie bramki, zatwierdza i robi squash-merge.                                                                                                                                                                                                                                                                                                   | `om-merge-buddy` + `om-approve-merge-pr` lub człowiek                                                              | PR zmergowany (squash) do `main`                                                                                    |
| Porządki po merge'u | Zamknięcie zgłoszeń naprawionych przez PR; komentarz na zgłoszeniach, których PR-y zamknięto bez merge'a; zamiana pozostałych próśb i uwag z review w zgłoszenia follow-up. Słowa zamykające po polsku (`zamyka`, `naprawia`, `rozwiązuje` + `#N`) są rozpoznawane obok angielskich.                                                                                                                                                                                                                         | `om-close-fixed-issues`, `om-followup-issue-from-pr`                                                               | Tracker uzgodniony, follow-upy założone                                                                             |

Po merge'u ten proces się kończy. Wdrożenie, testy smoke, monitoring i rollback należą do procesu wydawniczego repozytorium, nie do tego dokumentu: Maintainer — lub release manager, jeśli zespół go wskaże — przygotowuje changelog przez `om-auto-update-changelog` i uzgadnia tracker przez `om-close-fixed-issues`, a `om-pipeline-retro` analizuje zakończone przebiegi i szereguje koszt drugich podejść.

## Maszyna stanów etykiet

Etykiety pipeline'u wzajemnie się wykluczają: PR ma co najwyżej jedną i wskazuje ona, gdzie PR jest w przepływie.

- Gotowy PR (nie draft) ma `review`.
- Recenzent go przesuwa: prośba o zmiany → `changes-requested`; po poprawkach wraca do `review`; zatwierdzenie → `merge-queue`.
- `merge-queue` to routing, nie dowód QA: PR z `needs-qa` legalnie tam czeka, aż QA go zatwierdzi.
- Tylko recenzent QA ustawia etykietę pipeline'u `qa`. Przesuwa PR z `needs-qa` z `merge-queue` do `qa` na czas testów, potem z powrotem do `merge-queue` z `qa-approved` przy sukcesie albo do `qa-failed` przy porażce. Automatyczne skille proszą o QA przez `needs-qa`; nigdy nie ustawiają `qa`.
- `blocked` i `do-not-merge` ustawiają i zdejmują ludzie; zatrzymują przepływ w dowolnym miejscu.

| Grupa     | Etykiety                                                                                   | Wykluczanie                | Znaczenie             |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------- | --------------------- |
| Pipeline  | `review`, `changes-requested`, `qa`, `qa-failed`, `merge-queue`, `blocked`, `do-not-merge` | jedna naraz                | Stan przepływu        |
| Kategoria | `bug`, `feature`, `refactor`, `security`, `dependencies`, `documentation`                  | addytywne                  | Rodzaj zmiany         |
| Meta      | `needs-qa`, `skip-qa`, `qa-approved`, `qa-self-verified`, `in-progress`, `ci-monitoring`   | addytywne                  | Sygnały procesu       |
| Priorytet | `priority-low`, `priority-medium`, `priority-high`, `priority-extreme`                     | jedna naraz; brak = medium | Pilność pracy         |
| Ryzyko    | `risk-low`, `risk-medium`, `risk-high`                                                     | jedna naraz; brak = medium | Zasięg skutków zmiany |

Priorytet mówi, jak pilna jest praca; ryzyko — jak niebezpieczne jest wdrożenie zmiany. Jednolinijkowa poprawka awarii może mieć `priority-extreme` i `risk-low`; duży refaktor, który może poczekać — `priority-low` i `risk-high`. PR dziedziczy oba z powiązanego zgłoszenia, chyba że zakres wyraźnie się zmienił. Gdy automatyczny skill dodaje lub zmienia etykietę pipeline'u lub meta, zostawia krótki komentarz z uzasadnieniem.

Gdy priorytet nie jest ustawiony, wywnioskuj go:

- `priority-extreme` — awaria produkcji, utrata danych lub aktywny incydent bezpieczeństwa.
- `priority-high` — wzmocnienie bezpieczeństwa lub regresja blokująca wydanie.
- `priority-medium` — zwykłe poprawki błędów i nowe funkcjonalności (także domyślna interpretacja braku etykiety).
- `priority-low` — kosmetyka, sama dokumentacja, podbicia zależności, porządki po review.

Gdy ryzyko nie jest ustawione, wywnioskuj je:

- `risk-high` — uwierzytelnianie i sesje, zakres danych (np. postęp per użytkownik), pieniądze, migracje schematu (`packages/db/src/migrations/`), wspólne powierzchnie kontraktowe (porty w `packages/core`, eksporty pakietów — zob. `BACKWARD_COMPATIBILITY.md`) lub szerokie, przekrojowe zmiany.
- `risk-medium` — zwykła zmiana w jednym obszarze dostarczona z testami (także domyślna interpretacja braku etykiety).
- `risk-low` — sama dokumentacja, same testy, literówka lub izolowana zmiana kosmetyczna.

Gdy sygnały są sprzeczne, wybierz wyższą etykietę i uzasadnij to w komentarzu. PR `risk-high` nie tylko „zasługuje na więcej uwagi” — uruchamia bramki:

| Obszar za `risk-high`                | Co PR musi zawierać                                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uwierzytelnianie, sesje, uprawnienia | test integracyjny ścieżki odmowy i odczytu z niewłaściwego zakresu; review drugiej osoby                                                                              |
| Zakres danych                        | test izolacji udowadniający, że jeden zakres nie odczyta drugiego                                                                                                     |
| Pieniądze                            | testy ścieżek błędu, ponowienia i idempotencji; review drugiej osoby                                                                                                  |
| Migracje schematu                    | `migration:check` bez różnic, test migracji w górę i w dół (Testcontainers) oraz plan rollbacku w opisie PR-a                                                         |
| Wspólne powierzchnie kontraktowe     | sprawdzona strona konsumująca, zgodnie z `BACKWARD_COMPATIBILITY.md`                                                                                                  |
| Każde `risk-high`                    | `needs-qa`, gdy zmiana jest widoczna dla użytkownika; bez self-QA; `om-code-review` blokuje bez powyższych dowodów, chyba że maintainer jawnie z nich zwolni na PR-ze |

Jedna etykieta istnieje poza taksonomią: `do-not-close`, nadawana przez ludzi zgłoszeniom, których skille porządkowe nigdy nie mogą automatycznie zamknąć. Skille ją wyłącznie czytają.

## Bramka QA

Jedyna twarda reguła procesu: **PR z `needs-qa` nie może zostać zmergowany, dopóki nie ma też `qa-approved`, nawet gdy wszystkie inne checki są zielone.** `om-merge-buddy` klasyfikuje taki PR jako zablokowany; `om-approve-merge-pr` odmawia merge'a.

- Nadawaj `needs-qa` zmianom UI, nowym funkcjonalnościom i innym zachowaniom widocznym dla użytkownika, które wymagają ręcznego sprawdzenia.
- Dla zmiany UI QA obejmuje więcej niż „działa”: macierz stanów (domyślny, pusty, ładowanie/`<Suspense>`, błąd, brak uprawnień, długa treść, wąski viewport) jest częścią oceny, podobnie jak zgodność z kontraktem projektowym w `.uxproof/`, gdy repozytorium go ma, oraz brak poważnych naruszeń WCAG 2.2 A/AA. Brak stanu = QA nie przechodzi. `om-ux-review-pr` pozostaje doradczym przeglądem projektu; jego obiektywne sprawdzenia wykonuje QA.
- `skip-qa` to jawna rezygnacja dla zmian samej dokumentacji, samych zależności, samego CI, samych testów i podobnych zmian niskiego ryzyka niewidocznych dla użytkownika. Nigdy nie łącz z `needs-qa`.
- `qa-failed`, `do-not-merge` i `blocked` to twarde blokady niezależnie od innych sygnałów. Aktywna etykieta `qa` oznacza, że tester właśnie pracuje na PR-ze — nigdy nie merguj pod aktywnym testerem.
- Bramka jest spełniona, gdy recenzent QA przetestuje PR i nada `qa-approved`.
- **`qa-approved` jest przypięte do commita.** Komentarz nadający etykietę — notatka recenzenta QA lub komentarz z dowodami self-QA — zawiera linię `QA head: <sha>` testowanego commita. Push po tej linii zostawia etykietę, ale ją przedawnia: `om-merge-buddy` raportuje „dowody QA starsze niż head”, a `om-approve-merge-pr` prosi o potwierdzenie przed merge'em. Droga powrotu: ponowny test przez recenzenta QA albo stwierdzenie na PR-ze, że nowe commity nie dotykają testowanego zakresu, z nową linią `QA head:`.
- **Wyjątek self-QA**: gdy żaden recenzent QA nie ma na czas przepustowości, dowolny inżynier — lub `om-auto-qa-pr --self-qa-signoff` — może zatwierdzić zamiast niego, wyłącznie na PR-ze `risk-low` lub `risk-medium`. Dowody dołączone do PR-a wymieniają sprawdzony scenariusz, środowisko, dane testowe, zaobserwowany wynik, sprawdzone przypadki negatywne i linię `QA head:`. Wtedy nadaj zarówno `qa-approved` (by bramka przeszła), jak i `qa-self-verified` (by wyjątek był audytowalny). Bez dowodów nie ma `qa-approved`.
- **Bez self-QA przy `risk-high`.** PR z `risk-high` lub taki, którego diff dotyka uwierzytelniania, sesji, zakresu danych, pieniędzy, migracji schematu albo wspólnych kontraktów, wymaga recenzenta QA lub jawnego wyjątku maintainera na PR-ze; `om-auto-qa-pr` wstrzymuje wtedy zatwierdzenie i publikuje tylko dowody. Zmiana uwierzytelniania lub pieniędzy wymaga też review drugiej osoby niezależnie od ścieżki QA.

## Protokół przejęcia

Przed modyfikacją zgłoszenia lub PR-a agent przejmuje je trzema sygnałami: przypisuje siebie, dodaje etykietę `in-progress` i publikuje komentarz z opisem, co robi. Każdy agent, który znajdzie istniejące przejęcie, wycofuje się zamiast kolidować. PR z `in-progress` jest też pomijany przez narzędzia merge'a.

`in-progress` oznacza **aktywną pracę**. Gdy praca agenta jest zakończona i w pełni zaraportowana — etykiety nadane, review wysłane, komentarze opublikowane — zamienia `in-progress` na `ci-monitoring`, jeśli nadal zamierza zaraportować wynik CI. `ci-monitoring` **nie** jest przejęciem i nikogo nie blokuje: mówi tylko, że komentarz z wynikiem CI jest jeszcze winien, więc inny agent lub człowiek może swobodnie działać na PR-ze. Etykieta znika, gdy pojawi się komentarz z wynikiem albo gdy agent przestanie czekać po `ci.maxWaitMinutes` i to zakomunikuje.

Przejęcie jest zwalniane po zakończeniu pracy — zarówno przy sukcesie, jak i przy porażce. Przeterminowane `in-progress` bez ostatniej aktywności może zdjąć maintainer.

### Raportowanie niezależne od CI

Agenty nadają etykiety, wysyłają review i publikują komentarze **od razu po zakończeniu pracy**, bez czekania na zielone CI. Review wysłane, gdy checki jeszcze trwają, mówi o tym w treści: faktyczny merge trzymają ochrona gałęzi i bramka QA, a zatwierdzenie dotyczy kodu, nie zielonego przebiegu. Wynik CI przychodzi później jako komentarz uzupełniający, który koryguje też etykietę pipeline'u, jeśli wynik zmienia werdykt.

Czekanie na wynik jest ograniczone przez `ci.maxWaitMinutes` (40). Gdy czas minie, a checki wciąż trwają, agent przestaje czekać, uruchamia lokalną bramkę walidacji jako własny dowód, publikuje go razem z nazwami oczekujących checków i jawną informacją, że kolejnego komentarza nie będzie, zdejmuje `ci-monitoring` i kończy.

Czerwony sygnał też nie skraca review. Padający wymagany check lub konflikt na headzie jest zbierany jako **znalezisko blokujące** i raportowany razem z pełnym code review, nigdy zamiast niego: jeden cykl review daje autorowi padający check, konflikt i wszystkie uwagi do kodu naraz. Taki werdykt to nadal `changes-requested`.

Nic z tego nie dotyka bramek merge'a. Wczesne raportowanie jest bezpieczne; wczesny merge — nie. Wymagane checki CI (`build`, `lint`, `unit`, `integration`) nadal blokują każdy merge, a narzędzia merge'a odmawiają, dopóki nie są naprawdę zielone.

## Kontrakt automatyzacji

Skille `om-auto-*` prowadzą ten proces bez nadzoru i dają się łączyć w łańcuchy: każdy przyjmuje artefakt wytworzony przez poprzedni (id zgłoszenia, ścieżkę specyfikacji lub numer PR-a z linii `PR: #<number> (link: <url>)`, którą emituje każdy skill tworzący PR) i wykrywa już rozpoczętą pracę — otwarty PR odnoszący się do zgłoszenia lub planu — kontynuując ją zamiast tworzyć duplikat. Zakończony autonomiczny przebieg zostawia **gotowy** (nie draft), w pełni oetykietowany PR — jedna etykieta pipeline'u, kategoria, meta QA, jeden priorytet, jedno ryzyko — z komentarzem podsumowującym przebieg oraz, dla zmian widocznych dla użytkownika, zrzutami ekranu z działającej aplikacji. Plany przebiegów trafiają do `.ai/runs/` (zgodnie z `AGENTS.md`). Drafty są zarezerwowane dla jawnie niekompletnych stanów: PR-ów z samą specyfikacją, przerwanych przekazań lub autonomicznych domyślnych decyzji do potwierdzenia przez człowieka. Automatyzacja nadaje `qa-approved` wyłącznie w ramach wyjątku self-QA (`om-auto-qa-pr --self-qa-signoff`, zawsze razem z `qa-self-verified`, nigdy na PR-ze `risk-high`); żaden skill autorski, recenzujący ani mergujący jej nie nadaje.

## Bramka walidacji

Każdy PR przechodzi pełną bramkę walidacji przed zatwierdzeniem w review, w tej kolejności:

- `npm run ci:local`

`ci:local` (`scripts/ci-local.sh`) odtwarza wszystkie joby CI (`lint`, `build`, `unit` ze 100% pokrycia, `integration` z Testcontainers + agent-browser) na czystym worktree z `turbo --force` i sprawdza, że testy nie zmieniły śledzonych plików. Wymaga Dockera. Bierze tylko śledzone pliki — nowe pliki najpierw `git add`.

Każdy niezerowy kod wyjścia oblewa bramkę i blokuje PR. Skille implementujące uruchamiają bramkę przed otwarciem PR-a, a `om-check-and-commit` przed pushem ręcznie prowadzonej gałęzi. Lista poleceń żyje w `.ai/agentic.config.json`; gdy się zmienia, zaktualizuj ją tam i w tej sekcji jednocześnie.

## Zmiany tego procesu

Ten dokument i `.ai/agentic.config.json` opisują ten sam proces: zmieniaj je razem i uruchom ponownie skill `om-setup-agent-pipeline`, gdy zmienia się zestaw narzędzi lub taksonomia etykiet.

Kontrakt projektowy, który czytają etapy Projekt i Review, ustawia się raz: `om-ux-setup` wyodrębnia go z repozytorium i jest uruchamiany ponownie po zmianach design systemu.

Odstępstwa per skill — dodatkowe reguły review, inny szablon opisu PR-a, dodatkowy krok bramki — należą do lokalnego skilla o tej samej nazwie w `.ai/skills/<skill-name>/SKILL.md`, który ma pierwszeństwo przed zainstalowanym (i może go `@`-importować, by rozszerzyć zamiast zastąpić); reguły lokalne wygrywają, ale lokalny skill nie może przyznać tego, czego zabraniają reguły bezpieczeństwa zainstalowanego skilla.
