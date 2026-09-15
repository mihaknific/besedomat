# Besedomat

Zbirka **114 orodij za obdelavo besedila in podatkov** — popolnoma lokalna, brezplačna in brez povezave.
Besedomat teče v brskalniku kot progresivna spletna aplikacija (PWA) in **ne pošilja ničesar na strežnike**:
vse se izvaja na tvoji napravi.

Podpira jezike **slovenščina (SL)**, **english (EN)** in **deutsch (DE)** ter 12 tem.

---

## Vsebina

- [Funkcije](#funkcije)
- [Zasebnost](#zasebnost)
- [Tehnologija](#tehnologija)
- [Zagon in razvoj](#zagon-in-razvoj)
- [Dodajanje novega orodja](#dodajanje-novega-orodja)
- [Tipkovne bližnjice](#tipkovne-bliznjice)
- [Dostopnost](#dostopnost)
- [Konvencije](#konvencije)
- [Licenca in avtor](#licenca-in-avtor)

---

## Funkcije

- **Opisovanje za iskalnike** (JSON-LD `WebApplication` z `featureList`).

### Primeri orodij (od 114)
### Primeri orodij (od 114)

Pretvorba baz (bin/dec/hex/oct), Unicode normalizacija (NFC/NFD), rimske številke,
afini / Playfair / Baconov šifrator, YAML↔JSON, CSV↔JSON, ISBN / IMEI validatorji,
keyword density, syllable counter (SL), interleave / repeat lines, base64, URL/HTML
kodiranje, generator gesel, word counter, case converter, itd.

---

## Zasebnost

> **Nič ne zapušča tvoje naprave.**

- Aplikacija nima strežniške komponente in ne pošilja podatkov nikamor.
- Vse obdelave besedila se dogajajo v brskalniku (JavaScript v `index.html`).
- Lokalno shranjevanje (`localStorage`): priljubljena, nedavna, tema, jezik.
- Edina runtime odvisnost je `qrcode.min.js` (56kb, lokalno, za `file://` brez npm). `package.json` vsebuje še `qrcode` npm (za Vite `import` v `src/` — ne naloži se v monolit, samo za prihodnji `src/tools` import).
- Pigpen orodje uporablja lokalno vgrajena fonta `PigpenCipher` in `Wizpen`; njuni licenci sta v `public/fonts/`.

---

## Tehnologija

- **Vanilla JavaScript**, HTML5, CSS3 — **brez obvezne gradnje** (deluje kot en `index.html`), opcijsko **Vite + TypeScript** za razvoj.
- Monolit `index.html` (vsebina + slog + skript) — deluje neposredno na `file://` in na GitHub Pages (relativni `base: './'`, `scope: './'`).
- PWA: `manifest.json` (`start_url: "./"`), `sw.js` (cache-first, interval `besedomat-v6`, relative `ASSETS`).
- Testi: `tests/run-tests.mjs` (Node, nič odvisnosti).
- Opcijsko orodjarna: `vite.config.ts` (`base: './'` za GH Pages + custom domeno + lokalno), `src/` moduli (i18n, teme, PURE, store, ToolComponent).

---

## Zagon in razvoj

Aplikacijo lahko odpreš **neposredno** (`index.html` → dvojni klik) — zaradi relativnih poti (`./manifest.json`, `./sw.js`, `qrcode.min.js`) in SW guarda (`file://` preskoči registracijo) deluje brez strežnika. Za PWA/offline in teste uporabi strežnik:

```bash
# 1) Brez gradnje — samo statični strežnik (priporočeno za PWA)
python -m http.server 8000
# nato odpri http://localhost:8000  (ali npx serve .)

# 2) Z Vite (opcijsko, za src/ module + HMR)
npm ci
npm run dev      # http://localhost:3000
npm run build    # zgradi dist/ z base './' (deluje na GH Pages + file://)
npm run preview  # predogled dist/

# Zagon testov (smoke + deterministični assertion-i za orodja)
node tests/run-tests.mjs
```

### Objava na GitHub Pages

1. Push na `main` → `.github/workflows/deploy.yml` namesti odvisnosti, zgradi in preveri aplikacijo, nato objavi preverjeni `dist/` artefakt. Ob napaki se objava ustavi.
2. V repo nastavitvah: **Settings → Pages → Source: GitHub Actions**.
3. Ne pozabi: `.nojekyll` (že dodan) prepreči Jekyll, `404.html` (kopija `index.html`) pokrije hash rute, `base: './'` in `scope: "./"` zagotavljata delovanje na `https://<user>.github.io/<repo>/` **in** na `https://besedomat.si/` (custom domena).
4. Za custom domeno dodaj `CNAME` in v `sitemap.xml`/`robots.txt` pusti `https://besedomat.si/`; za čisti GH Pages brez domene posodobi `canonical`/`og:url` in `sitemap.xml` na `https://<user>.github.io/<repo>/`.

### Prenos kot ZIP (lokalno pri uporabniku)

Uporabnik prenese **Code → Download ZIP**, razširi in odpre `index.html` — vse deluje offline (ikone, manifest, qrcode in fonti so lokalni). Service worker se na `file://` samodejno izklopi, ostalo (114 orodij, teme, jeziki) deluje. Za polni PWA naj raje zažene `python -m http.server` v mapi.
Uporabnik prenese **Code → Download ZIP**, razširi in odpre `index.html` — vse deluje offline (ikone, manifest, qrcode in fonti so lokalni). Service worker se na `file://` samodejno izklopi, ostalo (114 orodij, teme, jeziki) deluje. Za polni PWA naj raje zažene `python -m http.server` v mapi.

### Konzola za hitre preverbe

V brskalniku je na voljo `runToolTests()` (preveri vsa `transform`/`stats` orodja).

---

## Dodajanje novega orodja

Podrobna specifikacija je v [`PLAN.md`](./PLAN.md). Povzetek treh tipov:

1. **`text-transform`** — `transform(val, opts) => string`.
   Optioni so `select` ali `checkbox` (brez prostih vnosov v splošnem UI-ju).
2. **`text-stats`** — `stats(val, lang) => { ključ: število, ... }`.
3. **`custom`** — `render(container)` z lastnim UI-jem (npr. `playfair-cipher`).

Primer (`text-transform`):

```js
{
  id: "moje-orodje",
  name: { sl: "Moje orodje", en: "My tool", de: "Mein Werkzeug" },
  desc: { sl: "Kratek opis.", en: "Short desc.", de: "Kurze Besch." },
  icon: SVG_ICONS.some_icon,
  category: "other",
  type: "text-transform",
  transform: (val, opts) => val, // obvezno
  options: [
    { id: "mode", label: { sl: "Način", en: "Mode", de: "Modus" },
      type: "select", default: "a",
      choices: [{ value: "a", label: { sl: "A", en: "A", de: "A" } }] }
  ]
}
```

Potem:
- Zaženi `node tests/run-tests.mjs` in (po potrebi) dodaj `assertTransform(...)`.
- **Povečaj `CACHE_NAME` v `sw.js`** (npr. `besedomat-v3` → `besedomat-v4`), sicer
  bodo uporabniki ostali na stari (predpomnjeni) različici.
- Besedilo naj bo v `sl` + `en` (in po želji `de`); za `longDesc.de` poskrbi
  avto-generacija v `init()`, če ni eksplicitno nastavljen.

---

## Tipkovne bližnjice

| Bližnjica | Dejanje |
|-----------|---------|
| `Ctrl` / `Cmd` + `K` | Ukazna paleta (iskanje orodij) |
| `Esc` | Zapre drawer / paleto; na strani orodja se vrne nazaj |
| `↑` / `↓` / `Home` / `End` | Krmarjenje po dropdownih teme/jezika (ko so odprti) |
| `Enter` / `Space` | Izbira v dropdownu / paleti |
| `Tab` | Znotraj odprtega drawerja ujet (focus-trap) |

---

## Dostopnost

- Dropdowna za **temo in jezik** sta tipkovno popolnoma dostopna (`role="listbox"`/`option`,
  `aria-expanded`, `aria-selected`, puščice, `Esc`).
- **Rezultati** se oznanjajo prek skrite `aria-live` regije (`#a11y-result-status`).
- **Drawer** (mobilonavigacija): ob odprtju fokus skoči vanj, `Tab` ostane ujet znotraj,
  ob zapiranju se fokus vrne na gumb; zunanjim je skrit (`aria-hidden` + `visibility:hidden`).
- **Orodje**: fokus se ob odprtju premakne na vnosno polje; "Nazaj" vrne fokus na glavno vsebino.
- Uporabniško besedilo je escapirano (`escapeHtml`); Markdown predogled dodatno omeji URL-je na varne protokole in lokalne poti.

---

## Konvencije

- Vanilla JS, **brez zunanjih odvisnosti** (razen `qrcode.min.js`).
- Uporabljaj CSS `var(--...)`; nizi v `sl` + `en` (+ `de` za UI).
- Ikone: 18×18, `viewBox="0 0 24 24"`, `class="svg-stroke"` (glej `SVG_ICONS`).
- Vsaka sprememba `index.html` → povečaj `CACHE_NAME` v `sw.js`.

---

## Licenca in avtor

Avtor: Miha Knific.
Aplikacija je namenjena lokalni, zasebni uporabi. 
Podpora: Buy Me a Coffee / Ko-fi / Patreon.
