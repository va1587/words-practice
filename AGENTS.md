# AGENTS.md

Ten plik opisuje, jak agenci AI (Claude, Codex, inne) mają pracować w tym repozytorium. Katalog `.ai/` jest jedynym miejscem, w którym przechowujemy specyfikacje (SDD), logi autonomicznych przebiegów i wnioski/lekcje wyniesione z pracy. Te zasady są obowiązkowe dla każdej sesji agenta pracującej w tym repo.

## Struktura `.ai/`

```
.ai/
├── specs/                  # specyfikacje do Specification-Driven Development
│   ├── implemented/        # specyfikacje, które zostały w pełni zaimplementowane
│   └── archive/            # specyfikacje nieaktualne, odrzucone lub zastąpione
├── runs/                   # logi autonomicznych przebiegów AI
└── lessons.md + lessons/   # wnioski, ustalenia, usprawnienia (pamięć długoterminowa)
```

### `.ai/specs/` — specyfikacje (SDD)

- Każda funkcjonalność/zmiana projektowana w podejściu Specification-Driven Development ma swoją specyfikację w `.ai/specs/`.
- Nazwa pliku: **`YYYY-MM-DD-slug.md`** (data utworzenia specyfikacji + krótki opis slugiem, np. `2026-10-15-user-auth-flow.md`).
- Specyfikacja powinna zawierać: cel, kontekst, zakres, decyzje projektowe, otwarte pytania, plan implementacji.
- Gdy specyfikacja jest w pełni zaimplementowana i wdrożona — przenieś plik do `.ai/specs/implemented/` (nazwa pliku bez zmian).
- Gdy specyfikacja jest nieaktualna, odrzucona albo zastąpiona inną — przenieś plik do `.ai/specs/archive/` (nazwa pliku bez zmian).
- Specyfikacje aktywne/w toku zostają w `.ai/specs/` (poziom główny).

### `.ai/runs/` — logi autonomicznych przebiegów

- Każdy autonomiczny przebieg agenta (np. `/loop`, zaplanowane zadanie, dłuższa sesja bez nadzoru) zapisuje log swojego przebiegu w `.ai/runs/`.
- Nazwa pliku: **`YYYY-MM-DD-slug.md`** (data przebiegu + krótki opis zadania).
- Log powinien zawierać: cel przebiegu, kluczowe decyzje, wykonane kroki, napotkane problemy, wynik końcowy.
- Logi nie są nadpisywane — jeśli przebieg jest kontynuacją wcześniejszego zadania tego samego dnia, dopisuj do istniejącego pliku; inny dzień/inne zadanie = nowy plik.

### `.ai/lessons.md` i `.ai/lessons/` — wnioski i usprawnienia

- `.ai/lessons.md` jest **indeksem** — zawiera tylko jednolinijkowe wpisy-wskaźniki do plików w `.ai/lessons/`, nie treść.
- `.ai/lessons/` zawiera szczegółowe wpisy: jeden plik per temat/ustalenie, nazwa pliku to opisowy slug (np. `lessons/flaky-auth-tests.md`).
- Wpis w `lessons/` powinien zawierać: co się stało / co odkryto, przyczynę (jeśli dotyczy naprawy błędu), wniosek, jak to zastosować w przyszłości.
- Dodaj wpis zawsze, gdy: naprawiasz nietrywialny błąd, odkrywasz coś zaskakującego o kodzie/narzędziach/procesie, lub chcesz zapisać coś w pamięci długoterminowej projektu, co nie wynika bezpośrednio z kodu.

## Obowiązkowe zasady dla agentów

1. **Na start pracy**: przeczytaj `.ai/lessons.md` (i powiązane wpisy w `.ai/lessons/`, jeśli temat zadania jest z nimi związany) oraz sprawdź `.ai/specs/`, jeśli zadanie dotyczy funkcjonalności, która może mieć istniejącą specyfikację.
2. **Przed implementacją nietrywialnej funkcjonalności**: jeśli nie istnieje jeszcze specyfikacja dla danej zmiany, napisz ją w `.ai/specs/` zgodnie z formatem nazwy `YYYY-MM-DD-slug.md`, zanim zaczniesz pisać kod. Drobne poprawki, literówki, czysto techniczne refaktory nie wymagają specyfikacji.
3. **Po zaimplementowaniu specyfikacji**: przenieś plik specyfikacji do `.ai/specs/implemented/`.
4. **Przy każdym autonomicznym przebiegu** (bez bieżącego nadzoru człowieka, np. `/loop`, zadanie zaplanowane, agent działający w tle): zapisuj log w `.ai/runs/` w formacie `YYYY-MM-DD-slug.md`.
5. **Po naprawieniu błędu lub ustaleniu czegoś nieoczywistego**: zapisz wniosek jako nowy plik w `.ai/lessons/` i dodaj do niego jednolinijkowy wpis w `.ai/lessons.md`.
6. Nie usuwaj i nie nadpisuj istniejących plików w `.ai/` bez wyraźnej potrzeby — to historia projektu. Przenoszenie między podkatalogami (`specs/` → `implemented/`/`archive/`) jest w porządku.
7. **Planowanie złożonych zadań**: zanim zaczniesz implementację zadania wieloetapowego, zaplanuj je (np. w trybie plan mode), zamiast pisać kod na bieżąco — dopracowany plan pozwala zaimplementować zadanie za jednym zamachem. Jeśli w trakcie coś pójdzie nie tak, wróć do planowania i zaplanuj ponownie, zamiast przepychać się przez problem.
8. **Weryfikacja zmian**: przed zgłoszeniem zadania jako zakończone uruchom dostępne testy/lint/build i potwierdź, że problem faktycznie został naprawiony — nie tylko że kod się kompiluje.
9. **Korekty dot. sposobu pracy agenta**: jeśli użytkownik poprawia nie kod, a Twój sposób działania (np. „nie robię tego więcej”, „zawsze pytaj przed X”) — zapisz to bezpośrednio w tym pliku (`AGENTS.md`), a nie w `.ai/lessons/`, które jest zarezerwowane dla wniosków dot. kodu/procesu projektu. Dzięki temu kolejna sesja nie powtórzy tego błędu.

To repozytorium używa tej struktury niezależnie od narzędzia AI, z którego korzystasz (Claude Code, Codex, inne). Plik [CLAUDE.md](CLAUDE.md) wczytuje ten plik przez `@AGENTS.md`.
