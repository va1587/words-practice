# Lessons

Indeks najważniejszych ustaleń i wniosków zebranych podczas pracy AI nad tym projektem. To pamięć długoterminowa projektu — czytaj ją na początku pracy, aktualizuj na końcu.

Szczegółowe wpisy trzymamy w `.ai/lessons/<slug>.md`, a tutaj zostaje tylko jednolinijkowy wpis-wskaźnik do każdego z nich (analogicznie do indeksu, nie treści).

Format wpisu:

```
- [Krótki tytuł](lessons/<slug>.md) — jedno zdanie, czego dotyczy i kiedy to sprawdzić
```

## Wpisy

- [Nieznane parametry → HTTP 200 przy Cache Components](lessons/cache-components-unknown-params-404.md) — `notFound()` na dynamicznej trasie nie daje statusu 404; sprawdź przy testach 404/SEO
- [Dostęp do bazy przy Cache Components](lessons/cache-components-db-access.md) — dlaczego `getRequestContainer()` woła `connection()` i dane muszą być w `<Suspense>`; sprawdź przy błędach prerenderu z `Date.now()`
- [`usePathname()` w layoucie a Suspense](lessons/cache-components-usepathname-suspense.md) — błąd buildu „URL data outside of Suspense” w nawigacji na trasach dynamicznych
- [Monorepo npm + shadcn/ui](lessons/monorepo-npm-shadcn-setup.md) — peer `react-dom` w `ui`, konfiguracja shadcn dla monorepo, `--` w skryptach delegujących
