# Contributing — Besedomat

## Načela
- **SRP**: en modul = en razlog za spremembo. `pure/*` nima DOM, `app/*` nima poslovne logike.
- **DRY**: nov `case` v `CASE_REGISTRY`, ne nov `switch`. Nov tool deduje `ToolComponent`, ne kopira `innerHTML`.
- **KISS**: funkcija <25 vrstic ali razbij na helperje (`tokenize`/`classify`).
- **Immutability**: `getExpandedTags` čista, `store.batch` en emit.

## Dodajanje orodja
1. Čista logika v `src/tools/pure/` (testiraj z `node tests/run-tests.mjs`).
2. UI v `src/tools/custom/moj-tool.ts extends ToolComponent` — samo `compute()` + `mount()` s `scaffold()`.
3. Registracija v `src/tools/registry.ts` preko `defineTool()` (validira `id`, `tags` lower/dedup).
4. `npm run lint && npm run build:check && npm test` — CI zahteva zeleno.

## CSS
`src/styles/tokens.css` → `base.css` → `components.css` → `tool-shell.css`. Nikoli inline `style="..."`.

## Iskanje
Uporabi `getSearchSuggestionsIndexed` z `searchIndex` (O(k)), ne direkt `getSearchSuggestions` za 1 token.

## Commit
`feat:`, `fix:`, `refactor:` + kratek opis. Povečaj `CACHE_NAME` v `sw.js` ob spremembi `index.html`.
