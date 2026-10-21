# D07 — Logowanie przez e-mail i hasło

- Data, właściciel: 2026-10-19, mkz (właściciel produktu; potwierdzone w om-backlog 2026-10-19)
- Kontekst i rozważane opcje: GitHub (OAuth), link na e-mail (magic link), e-mail i hasło. Agent nie rekomendował — materiał nie przesądza.
- Decyzja i dlaczego: e-mail i hasło; uzasadnienia nie podano.
- Konsekwencje i kiedy wrócić: wymaga bezpiecznego hashowania haseł (wolny, solony hash) i obsługi resetu hasła; zakładanie konta to dodatkowy krok dla dewelopera (A01, D04). Wrócić, jeśli w teście A01 deweloperzy odpadają przy zakładaniu konta.
- Status: active
