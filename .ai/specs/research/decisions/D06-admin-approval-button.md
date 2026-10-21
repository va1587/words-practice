# D06 — Akceptacja profilu mentora przyciskiem w /admin, od razu

- Data, właściciel: 2026-10-19, mkz (właściciel produktu; potwierdzone w om-discover --refresh 2026-10-19)
- Kontekst i rozważane opcje: (a) ręczny UPDATE w bazie na start i przycisk w osobnej historii później — rekomendacja agenta; (b) tylko ręcznie w bazie; (c) przycisk w /admin od razu. Aplikacja nie ma roli administratora, a /admin nie jest zabezpieczony.
- Decyzja i dlaczego: (c), wybór mkz wbrew rekomendacji agenta; uzasadnienia nie podano.
- Konsekwencje i kiedy wrócić: specyfikacja logowania musi dodać rolę administratora i zabezpieczyć /admin; E01 rośnie o historię akceptacji. Realizuje R06.
- Status: active
