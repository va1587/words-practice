# `lefthook run pre-commit --all-files` na brudnym drzewie

## Co się stało

Ręczne uruchomienie hooka pre-commit z `--all-files` przy dużej liczbie niezastage'owanych zmian zakończyło się błędem „conflict while merging unstaged changes”. Lefthook przed uruchomieniem jobów z `stage_fixed: true` ukrywa niezastage'owane zmiany, a potem nie potrafił ich nałożyć z powrotem. Drzewo ostatecznie zostało nienaruszone (sprawdzone: `git stash list` pusty, treść plików kompletna), ale ryzyko utraty pracy jest realne.

## Wniosek

- Do sprawdzenia całego repo używaj `npm run check`, nie `lefthook run pre-commit --all-files`.
- Konfigurację hooków testuj na czystym drzewie albo przez `lefthook run commit-msg <plik>` (bez stash).
