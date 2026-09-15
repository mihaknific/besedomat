# Changelog

Vsi vnosi so v kronološkem vrstnem redu (najnovejši na vrhu).

## v2.2.2 — 2026-09-15

### Izboljšave in popravki uporabniške izkušnje
- **Poenotena pisava vnosnih in izhodnih polj**: vsa polja (`textarea`, `input`, predogledi) sedaj privzeto dedujejo enotno pisavo aplikacije (`font-family: inherit`), kar odpravlja zastarelo pisavo monospace/Courier New.
- **Opisi orodij v glavi strani**:
  - Velikost pisave kratkega in podrobnega opisa je poenotena na 14px.
  - Dodan je zložljiv način prikaza: privzeto se prikaže kratek opis z gumbom za razširitev (»Več o orodju« / »Manj«), kar ohranja glavo orodja pregledno in čisto.
- **Iskalnik orodij**: odstranjen je podvojeni plavajoči meni (dropdown) pod iskalno vrstico; iskalnik sedaj neposredno v živo filtrira kartice na strani.

## v2.2.1 — 2026-09-15

### Popravki
- **Združljivost z razvojnimi strežniki (Live Server)**: v funkciji za prenos primerjave besedila (`cmp-dl-html`) so zaključne HTML oznake v nizu razdeljene, kar preprečuje samodejno vbrizgavanje strežniških skript sredi JavaScript kode.
- **Web Worker sintaksa**: v delavcu v ozadju (`heavyWorker`) so predloge z ubežanimi narekovaji zamenjane z varnimi ubežnimi zapisi (`\\x60`), kar odpravlja sintaksno napako pri prevajanju.
- **CSP opozorilo**: iz meta oznake Content-Security-Policy odstranjena direktiva `frame-ancestors`, ki jo brskalniki sprejmejo le prek HTTP glave.
- **Čiščenje kode**: odstranjeni podvojeni deklaraciji funkcije `levenshtein` in orodja `color-converter`.

## v2.2.0 — 2026-08-26

Generator gesel: popolnoma prenovljen UI/UX + več-conski položaji znakov.

### UI/UX (prenova)
- **Rezultat na vrhu**: veliko označeno polje z geslom, vizualni jakostni meter
  (širina/barva glede na bite) in besedilna ocena; gumba Ustvari novo / Kopiraj
  v isti kartici.
- **Način generiranja** kot segmentni preklopnik (Naključni znaki / Besede EN /
  Besede SL) namesto selecta; odstranjena podvojena opcija "diceware".
- **Kartice vrst znakov**: vsaka vrsta (male, velike, števke, simboli) ima svojo
  kartico s stikalom, vzorčnim naborom, natančnim številom in čipi za položaj.
  Izklop kartice skrije možnosti in onemogoči pripadajoče kontrole.
- Prostornejša postavitev (kartice, večji razmiki), stiliziran drsnik dolžine z
  značko vrednosti in min/max oznakami, prilagojeno za mobilne ekrane.
- Hitri prednastavljeni gumb "± dvoumni" za izključitev zamenljivih znakov
  (i,I,l,L,1,|,o,O,0).
- Vsi stili prek CSS spremenljivk tem — deluje v vseh 12 temah.

### Funkcije: več-conski položaji
- Vsaka vrsta znakov lahko zdaj zasede **več con hkrati**: začetek, znotraj,
  konec (npr. števke na začetku IN na koncu; simboli samo znotraj). Brez izbire
  = naključno po celem geslu.
- API: `placement` sprejme polje (`{ digits: ['start','end'] }`) ali niz
  (združljivost s prejšnjim klicem); števci se med conami enakomerno razdelijo.

### Popravki
- Natančno število znakov se sedaj omeji (0–256) in spoštuje izklopljene vrste;
  negativni vnosi so obrezani.

### Testi
- `tests/run-tests.mjs`: novi testi za kombinirane cone (start+middle,
  start+end, middle+end, vse tri), string-kompatibilnost in obstoječe primere.
- End-to-end UI test v headless Chromeu: izris orodja, klikanje čipov,
  stabilnost položajev čez regeneracije, fraza-način, izključevanje.
- `sw.js` `CACHE_NAME` → `besedomat-v6`.

---

## v2.1.0 — 2026-08-26

Generator gesel: položaj znakov po tipih + varnostne popravke naključnosti.

### Nove funkcije
- **Položaj znakov (placement)** pri Generatorju varnih gesel: za vsako vrsto znakov
  (male, velike, števke, simboli) lahko izbereš, kje se pojavijo — **na začetku**,
  **znotraj**, **na koncu** ali **naključno razporejeno**. Položaji se med sabo
  kombinirajo (npr. števke na začetku + simboli na koncu). Deluje z običajnim
  načinom (enakomerna porazdelitev po dolžini) in skupaj z natančnim številom
  znakov po tipih. Nov API: `PURE.generatePassword({ placement: { digits: 'start',
  symbols: 'end', … } })`. Izbori za izklopljene tipe se onemogočijo.
- Hint ob izbranem položaju + posodobljeni opisi orodja (SL/EN/DE) in tags.

### Popravke
- **Pravi rejection sampling**: `pick()` je namesto `Math.floor(rand()*N)` (ki ima
  modulo bias — dokumentacija ga je trdila, koda ga ni imela) sedaj uporablja
  zavrnitveno vzorčenje nad `crypto.getRandomValues` (`rndInt`), enako Fisher-Yates
  mešanica.
- **Izklopljen tip znakov ne pride več v polnilo**: prej je filler črpal iz vseh
  naborov ne glede na kljukice (npr. simboli so se pojavili, čeprav odkljukani off).
- **Entropija**: ocena bazena zdaj odšteje dejansko izključene znake iz omogočenih
  naborov (prej je odštela le število vnosov, tudi če niso bila veljavna znaka).
- **Dolžina**: ob prekomernem `perType` skaliranju se rezultat zdaj vedno obreže na
  zahtevano dolžino (prej je lahko vrnil daljše geslo).
- `sw.js` `CACHE_NAME` → `besedomat-v5`.

### Testi
- `tests/run-tests.mjs`: novi testi za placement (start/middle/end/kombinacija,
  avtomatična porazdelitev, neznana vrednost, izklopljen tip, obrežanje dolžine).

---

## v2.0.0 — 2026-08-23

Velika posodobitev: kritična poprava zagona, nemščina, paleta, zgodovina, izvoz/uvoz in dostopnost.

### Kritična poprava
- **TDZ startup bug**: tri zanke za pripravo podatkov (`TOOLS.forEach(expandTags)`,
  avto-generacija `longDesc`, `LONGDESC_DE`) so tekle *pred* deklaracijo `const TOOLS` /
  `const CATEGORIES` → "Cannot access 'TOOLS' before initialization" je sesul celotno
  skripto (nič kartic, neodzivna navigacija). Prestavljeno v začetek `init()`.
  Potrjeno z Node harnessom + `node tests/run-tests.mjs`.

### Jezik in opisi
- Nemški (DE) UI (krom): `I18N.de`, `THEME_NAMES.de`, `CATEGORIES.de`.
- Vsem orodjem dodan `longDesc.de` (29 eksplicitnih hero-prevodov + avto-generacija za
  preostalih 68).

### Funkcije
- **Ukazna paleta** (Ctrl/Cmd+K): iskanje in skok na orodje.
- **Nedavno uporabljena** (recents): zadnjih 12 v `localStorage` (`besedomat-recents`),
  sekcija na domači strani.
- **Izvažanje/uvoz varnostne kopije** priljubljenih + nedavnih (`besedomat-backup.json`).

### Nova orodja (E4) — +14 (skupaj 111 takrat; trenutno 114)
- `base-converter` (bin/dec/hex/oct), `unicode-normalize` (NFC/NFD),
  `roman-numerals` (v/iz), `affine-cipher`, `baconian-cipher`, `playfair-cipher` (custom),
  `csv-json`, `yaml-json`, `isbn-validator`, `imei-validator`, `keyword-density`,
  `syllable-counter` (SL), `interleave-lines`, `repeat-lines`.

### Dostopnost (a11y)
- **F1**: tipkovna navigacija dropdownov teme/jezika (puščice, Home/End, Enter/Space, Esc;
  `role="listbox"`/`option`, `aria-expanded`/`aria-selected`, `MutationObserver` sinhronizacija).
- **F2**: `aria-live` regija za rezultate (`#a11y-result-status`); focus-management za
  drawer (open→fokus, Tab-trap, Esc→vrečanje fokusa, `aria-hidden` + `visibility:hidden`),
  orodje (fokus na vnos/back) in navigacijo (fokus na `#main-content`).

### Testi in infrastruktura
- `tests/run-tests.mjs`: dodani deterministični assertion-i za nova orodja (skupaj 63 PASS, 0 FAIL).
- `sw.js` `CACHE_NAME` → `besedomat-v3`.

---

## v1.0.0 — začetna različica

- Prvih ~97 orodij za besedilo in podatke.
- Teme, večjezikovni UI (SL/EN), priljubljena orodja, iskanje, PWA/offline (`sw.js` v1/v2).
- JSON-LD `WebApplication` za opisovanje.
- `escapeHtml` zaščita pred XSS.
