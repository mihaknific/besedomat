// @ts-nocheck
// AUTO-MIGRATED from index.html (TOOLS array). Refactor tools incrementally
// into ToolComponent subclasses and remove from here.
import { SVG_ICONS } from '../icons';
import { PURE } from '../PURE';
// currentLang je potreben za transform() ki berejo currentLang (npr. slugify)
import { currentLang } from './globals';

export const TOOLS_LEGACY = [
      {
        id: "word-counter", icon: SVG_ICONS.hash, category: "analysis", featured: true,
        tags: ["števec besed", "števec znakov", "preštej besede", "word count", "character count", "dolžina besedila", "čas branja", "štetje stavkov", "odstavki", "text statistics", "preštej znake", "count characters", "unique words", "edinstvene besede", "lexical density", "leksična gostota", "reading time", "speaking time", "govorni čas", "analiza besedila", "text analysis", "word counter tool"],
        name: { sl: "Števec besed in znakov", en: "Word & Character Counter" },
        desc: { sl: "Preštej besede, znake, stavke, odstavke in vrstice. Prikaži čas branja, edinstvene besede in leksično gostoto besedila.", en: "Count words, characters (with/without spaces), sentences, paragraphs, and lines. Shows reading time, unique words, and lexical density." },
        longDesc: { sl: "Popolna analiza besedila v realnem času. Prešteje: vse besede (vključno s številkami), samo besede, znake s presledki in brez, presledke, stavke, odstavke in vrstice. Izračuna: čas branja (povprečje 200 besed/min v slovenščini, 238 v angleščini), govorni čas (150 besed/min), edinstvene besede, povprečno dolžino besede, leksično gostoto (razmerje edinstvenih do vseh besed) in najdaljšo besedo. Uporabno za pisatelje, prevajalce, študente, SEO optimizacijo in vse, ki pišejo besedila z omejitvami dolžine.", en: "Complete real-time text analysis. Counts: all words (including numbers), words only, characters with/without spaces, spaces, sentences, paragraphs, lines. Calculates: reading time (200 wpm Slovenian, 238 wpm English), speaking time (150 wpm), unique words, average word length, lexical density (unique/total ratio), and longest word. Useful for writers, translators, students, SEO optimization, and anyone writing with length constraints." },
        type: "custom", render: 'renderUnifiedCounter'
      },
      {
        id: "word-cloud", icon: SVG_ICONS.cloud, category: "analysis", featured: true,
        name: { sl: "Oblak besed (Word Cloud)", en: "Word Cloud & Keyword Visualizer" },
        tags: ["wordcloud", "word cloud", "besedni oblak", "oblak besed", "tag cloud", "ključne besede", "analiza besedila", "frekvenca besed", "pogoste besede", "mašila", "stop words", "vizualizacija", "keywords", "keyword cloud", "text visualization", "word frequency chart", "besedni grafikon", "oblak ključnih besed", "pogostost besed", "seo keywords", "content analysis"],
        desc: { sl: "Ustvari vizualni oblak besed (word cloud, besedni oblak, besedna grafika, tag cloud, ključne besede). Analizira frekvenco besed, izloča pogoste besede (stop words), omogoča interaktivno vklapljanje/izklapljanje besed ter izvoz v PNG.", en: "Generate an interactive visual word cloud with real-time keyword frequency analysis. Filter stop words, toggle individual words on/off, customize color themes, and export high-res PNG." },
        longDesc: { sl: "Interaktivni generator oblakov besed v realnem času. Funkcionalnosti: (1) Avtomatsko izlušči ključne besede iz besedila in izračuna njihovo frekvenco. (2) Filtrirane 'stop words' (pogoste besede brez pomena: in, v, z, the, and, itd.) za slovenščino in angleščino. (3) Klik na besedo v oblaku jo vklopi/izklopi — dinamično posodobi vizualizacijo. (4) Prilagodljive teme barv (violet, ocean, amber, emerald, synth, monochrome). (5) Nastavljiva največja število besed (10–200) in minimalna dolžina besede. (6) Izvoz v visoko ločljivost PNG (primerno za tisk, презентации, spletne strani). (7) Responsive oblikovanje — prilagodi se širini kontejnerja. Uporabno za: analizo vsebine, SEO ključne besede, vizualizacijo povratnih informacij, prezentacije, social media grafikone.", en: "Real-time interactive word cloud generator. Features: (1) Auto-extracts keywords and calculates frequencies. (2) Filters stop words (common meaningless words) for Slovenian and English. (3) Click words in cloud to toggle inclusion — updates visualization dynamically. (4) Customizable color themes (violet, ocean, amber, emerald, synth, monochrome). (5) Configurable max words (10–200) and minimum word length. (6) High-res PNG export (suitable for print, presentations, web). (7) Responsive design — adapts to container width. Use for: content analysis, SEO keywords, feedback visualization, presentations, social media graphics." },
        type: "custom", render: 'renderWordCloud'
      },
{
        id: "case-converter", icon: SVG_ICONS.upper, category: "formatting", featured: true,
        tags: ["velike črke", "male črke", "velika začetnica", "uppercase", "lowercase", "title case", "camelCase", "snake_case", "kebab-case", "spremeni velikost črk", "kapitaliziraj", "capitalize", "change case", "letter case converter", "text case", "pascalCase", "sentence case", "inverse case", "sarcasm case", "programerji", "developers", "formatting text", "oblikovanje besedila"],
        name: { sl: "Pretvornik črk", en: "Case Converter" },
        desc: { sl: "Spremeni velikost črk: VELIKE, male, Title Case, Sentence case, iNvErSe, SaRcAsM, camelCase, PascalCase, snake_case, kebab-case. Za programerje, pisce in oblikovanje besedila.", en: "Change letter case: UPPERCASE, lowercase, Title Case, Sentence case, iNvErSe, SaRcAsM, camelCase, PascalCase, snake_case, kebab-case. For developers, writers, and text formatting." },
        longDesc: { sl: "10 načinov pretvorbe velikosti črk v enem orodju: UPPERCASE (vse velikе), lowercase (vse male), Title Case (Prva Črka Vsaké Besede), Sentence case (Prva črke prvega stavka), camelCase (prvaBesedaMalaOstaleVelike), PascalCase (VseBesedeZVeliko), snake_case (besede_povezane_z_podčrtaji), kebab-case (besede-povezane-z-črticami), iNvErSe (NaMeReNo MeŠaNо), SaRcAsM (NaMeReNo MeŠaNo). Ohranja ne-črkovne znake (številke, ločila, emoji). Uporabno za: programiranje (spreminjanje imen spremenljivih, funkcij, klas), pisanje (naslovi, glave), SEO (slugify predobdelava), urejanje besedil. Deluje na celotnem besedilu ali izbranem delu.", en: "10 case conversion modes in one tool: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, iNvErSe, SaRcAsM. Preserves non-letter characters (numbers, punctuation, emoji). Useful for: programming (renaming variables, functions, classes), writing (titles, headings), SEO (slug preprocessing), text editing. Works on entire text or selection." },
        type: "custom", render: 'renderCaseConverter'
      },
      {
        id: "encoder-decoder", icon: SVG_ICONS.lock, category: "security", featured: true,
        tags: ["base64", "kodiraj", "dekodiraj", "encode decode", "url encoding", "rot13", "šifriraj besedilo", "pretvori v base64", "base64 encode", "base64 decode", "url encode", "url decode", "hex encode", "hex decode", "binary encode", "binary decode", "text encoding", "text decoding", "data encoding", "api encoding", "json encoding", "varnostno kodiranje", "obfuskacija"],
        name: { sl: "Kodiranje besedila", en: "Text Encoder & Decoder" },
        desc: { sl: "Base64: pretvori besedilo v varno obliko za pošiljanje podatkov med sistemi (email, API, JSON). URL: zamenja posebne znake v URL-jih (presledek → %20). ROT13: preprosta zamenjava črk za skrivanje spoilerjev — ni varnostno orodje!", en: "Base64: convert text to a safe format for sending data between systems (email, API, JSON). URL: replace special characters in URLs (space → %20). ROT13: simple letter shift for hiding spoilers — not a security tool!" },
        longDesc: { sl: "Tri kodirni načini v enem orodju: (1) Base64 — standardno kodiranje binarnih podatkov v ASCII niz (RFC 4648), uporabno za vgradnjo slik v CSS/HTML, prenašanje JSON v URL, Basic Auth glave. (2) URL (percent-encoding) — zamenja vse rezervirane in nereservirane znake s %XX obliko, nujno za query parametre, form data, preusmeritve. (3) ROT13 — Caesar šifra s pomikom 13, simetrična (kodiranje = dekodiranje), za skrivanje spoilerjev, šaljivih odgovorov, ne za varnost! Vse se izvaja lokalno z `btoa`/`atob`, `encodeURIComponent`/`decodeURIComponent` in preprosto preslikavo znakov. Podpira večvrstična besedila, ohranja presledke in prelome.", en: "Three encoding modes in one tool: (1) Base64 — standard binary-to-ASCII encoding (RFC 4648), used for embedding images in CSS/HTML, passing JSON in URLs, Basic Auth headers. (2) URL (percent-encoding) — replaces all reserved and unreserved chars with %XX form, required for query params, form data, redirects. (3) ROT13 — Caesar cipher with shift 13, symmetric (encode = decode), for hiding spoilers, joke punchlines, NOT for security! All runs locally with `btoa`/`atob`, `encodeURIComponent`/`decodeURIComponent`, and simple char mapping. Supports multi-line text, preserves whitespace and line breaks." },
        type: "custom", render: 'renderEncoderDecoder'
      },
      {
        id: "password-gen", icon: SVG_ICONS.key, category: "security", featured: true,
        tags: ["geslo", "naključno geslo", "varno geslo", "password generator", "ustvari geslo", "močno geslo", "strong password", "secure password", "random password", "generate password", "password creator", "passphrase", "geslo z simboli", "dolžina gesla", "entropy", "varnost gesla", "password strength", "crypto secure", "geslo za spletno stran", "položaj znakov", "številke na začetku", "simboli na koncu", "character placement"],
        name: { sl: "Generator varnih gesel", en: "Secure Password Generator" },
        desc: { sl: "Ustvari varno geslo po meri: naključni znaki (dolžina, natančno število velikih/malih/števk/simbolov, izključeni znaki, položaj posamezne vrste lahko v več conah hkrati: začetek/znotraj/konec) ali besedne fraze v slovenščini ali angleščini.", en: "Create a custom secure password: random characters (length, exact counts of upper/lower/digits/symbols, excluded chars, per-type placement across multiple zones at once: start/middle/end) or word-based phrases in Slovenian or English." },
        longDesc: { sl: "Kriptografsko varen generator gesel z Web Crypto API. Generira gesla z nastavljivo dolžino (4–128 znakov) in izborom naborov znakov: velike črke (A-Z), male črke (a-z), številke (0-9), simboli (!@#$%^&*()-_=+[]{};:,.?). Uporablja `crypto.getRandomValues()` z rejection sampling, ki preprečuje modulo bias — vsak znak je enako verjeten. Natančno število znakov po tipih ter položaj posamezne vrste znakov — vsaka vrsta lahko zasede več con hkrati: na začetku, znotraj, na koncu ali naključno razporejeno (npr. števke na začetku IN na koncu, simboli samo znotraj). Prikaže entropijo v bitih in oceno jakosti (nizka/srednja/visoka). Gesla se ne pošiljajo na strežnik, ne shranjujejo v localStorage. Uporabno za registracije, varnostne ključe, API žetone, Wi-Fi gesla.", en: "Cryptographically secure password generator using Web Crypto API. Generates passwords with configurable length (4–128) and character sets: uppercase (A-Z), lowercase (a-z), numbers (0-9), symbols (!@#$%^&*()-_=+[]{};:,.?). Uses `crypto.getRandomValues()` with rejection sampling to eliminate modulo bias — every character equally probable. Exact per-type counts plus per-type placement — each type can occupy multiple zones at once: start, middle, end, or randomly spread (e.g. digits at the start AND the end, symbols only in the middle). Shows entropy in bits and strength rating (low/medium/high). Passwords never sent to server, never stored in localStorage. Use for account registration, API keys, tokens, Wi-Fi passwords." },
        type: "custom", render: 'renderPasswordGen'
      },
{
        id: "remove-spaces", icon: SVG_ICONS.trim, category: "editing", featured: true,
        tags: ["odstrani presledke", "podvojeni presledki", "počisti presledke", "remove spaces", "trim", "obiši presledke", "čisto besedilo", "remove extra spaces", "collapse spaces", "whitespace cleanup", "trim whitespace", "clean text", "počisti besedilo", "normalize spaces", "remove double spaces", "multiple spaces", "leading trailing spaces"],
        name: { sl: "Odstrani odvečne presledke", en: "Remove Extra Spaces" },
        desc: { sl: "Združi podvojene presledke v enega in obreže robne presledke. Koristno pri čiščenju kopiranega besedila iz spleta ali dokumentov.", en: "Collapse multiple spaces into one and trim edge whitespace. Useful for cleaning copied text from the web or documents." },
        type: "text-transform", transform: (t) => t.split(/\r?\n/).map(l => l.replace(/\s+/g, " ").trim()).join("\n")
      },
      {
        id: "find-replace", icon: SVG_ICONS.replace, category: "findreplace", featured: true,
        tags: ["najdi in zamenjaj", "zamenjaj besedilo", "iskanje", "find and replace", "search replace", "zamenjaj vse", "find replace", "search and replace", "replace all", "text replacement", "string replace", "regex replace", "regular expression replace", "zamenjaj z regex", "najdi z regex", "bulk replace", "masovno zamenjaj", "text editor", "urednik besedila"],
        name: { sl: "Najdi in zamenjaj", en: "Find and Replace" },
        desc: { sl: "Iskanje in zamenjava besedila — najdi določeno besedo ali frazo in jo zamenjaj z novo. Podpira regularne izraze za napredno iskanje.", en: "Search and replace text — find a specific word or phrase and replace it with a new one. Supports regular expressions for advanced search patterns." },
        longDesc: { sl: "Napredno orodje za iskanje in zamenjavo z dvema pogledoma: (1) Zamenjano besedilo — takojšnji rezultat z vsemi zamenjavami. (2) Označena mesta — izvirno besedilo z označenimi ujemanji (rumena ozadja), brez zamenjave, za pregled pred izvedbo. Možnosti: čutljivost na velike/male črke (A=a), cele besede (ne delno ujemanje), regularni izrazi (RegEx) za vzorce kot `\\d+`, `\\b\\w{4,}\\b`, `[A-Z]{2,}`. Statistika ujemanj v realnem času (zelena = najdeno, rdeča = ni ujemanj). Zamenjavo polj (⇄) hitro preklopi iskalni in zamenjalni niz. Uporabno za: prepisovanje kodo (preimenovanje spremenljivk), čiščenje podatkov (enotni format datuma, telefonskih številk), prevajanje (masovna zamenjava terminov), pisanje (popravljanje ponavljajočih se napak).", en: "Advanced find & replace with dual views: (1) Replaced text — instant result with all substitutions. (2) Highlighted matches — original text with matches marked (yellow), no replacement, for preview. Options: case sensitivity (A=a), whole words only, regular expressions (RegEx) for patterns like `\\d+`, `\\b\\w{4,}\\b`, `[A-Z]{2,}`. Live match count statistics (green = found, red = no matches). Swap fields (⇄) quickly exchanges search/replace strings. Use for: code refactoring (rename variables), data cleaning (normalize dates, phones), translation (bulk terminology swap), writing (fix recurring typos)." },
        type: "custom", render: 'renderFindReplace'
      },
      {
        id: "frequency", icon: SVG_ICONS.chart, category: "analysis",
        tags: ["pogostost besed", "frekvenca črk", "najbolj pogoste besede", "word frequency", "letter frequency", "analiza besedila", "grafikon", "word count frequency", "character frequency", "letter count", "text statistics", "frequency analysis", "statistika besedila", "pogostost znakov", "rank besed", "word ranking", "zipf law", "zipfov zakon", "text analysis", "analiza frekvence"],
        name: { sl: "Frekvenca besed", en: "Word Frequency Analysis" },
        desc: { sl: "Prikaži pogostost besed, črk ali znakov v besedilu. Vključuje tekstovni seznam in vizualni grafikon porazdelitve črk z odstotki.", en: "Show frequency of words, letters, or characters in text. Includes text list and visual letter distribution chart with percentages." },
        longDesc: { sl: "Frekvenčna analiza besedila z dvema načina: (1) Besede — razčleni besedilo na posamezne besede (ločilo: presledki, ločila), prešteje pojavitve, razvrsti padajoče. Možnosti: čutljivost na velikost črk, ignoriraj ločila. (2) Znaki/črke — prešteje vsak znak posebej (brez presledkov, opcijsko brez ločil). Za vsak vnos prikaže: število pojavljani, odstotek od skupnega števila, in vizualni trakovni grafikon (barva: vijolična). Izvoz rezultata v besedilo (kopiraj tabelo). Uporabno za: lingvistično analizo, SEO (pogostost ključnih besed), stilistiko (preverjanje ponavljanja), kriptografijo (frekvenčni napad), učenje tujih jezikov (najpogostejše besede).", en: "Frequency analysis with two modes: (1) Words — tokenizes text into words (delimiters: spaces, punctuation), counts occurrences, sorts descending. Options: case sensitivity, ignore punctuation. (2) Characters/letters — counts each character individually (excludes spaces, optionally punctuation). Shows for each entry: count, percentage of total, visual bar chart (violet). Export results as text (copy table). Use for: linguistic analysis, SEO (keyword density), stylistics (repetition check), cryptography (frequency attack), language learning (most common words)." },
        type: "custom", render: 'renderFrequency'
      },
      {
        id: "duplicate-words", icon: SVG_ICONS.copy_files, category: "analysis",
        tags: ["podvojene besede", "dvojniki besed", "lektorske napake", "ponovljene besede", "duplicate words", "repeated words", "najdi napake", "consecutive duplicates", "zapovedni dvojniki", "typo finder", "proofreading", "lektoriranje", "find duplicate words", "repeated word finder", "text cleanup", "počisti besedilo", "writing aid", "pomoč pri pisanju"],
        name: { sl: "Poišči podvojene besede", en: "Find Duplicate Words" },
        desc: { sl: "Označi zaporedne podvojene besede v besedilu (lektorske napake), jih izpiše s številom ponovitev in ustvari popravljeno besedilo brez njih. Bočni prikaz izvirnika in končnega besedila.", en: "Highlight consecutive duplicate words, list them with repetition counts, and generate a cleaned version of your text. Side-by-side view of original and fixed text." },
        longDesc: { sl: "Lektorsko orodje za odkrivanje zaporednih podvojenih besed (npr. 'the the', 'in in', 'in in'). Funkcionalnosti: (1) Označi vse zaporedne dvojnike v izvirnem besedilu (rumeno ozadje). (2) Seznam vseh najdenih parov s številom ponovitev. (3) Generira popravljeno besedilo brez dvojnikov. (4) Bočni pogled: levo izvirno, desno popravljeno — sinhrono skrolanje. (5) Prešteje skupno število odstanjenih besed. Deluje na vsakem jeziku, ne odvisno od slovnice. Uporabno za: lektoriranje člankov, diploma, prevodov, spletne vsebine, e-pošte — kjerkoli, kjer so se pri hitrem tipkanju vnesle napake.", en: "Proofreading tool for detecting consecutive duplicate words (e.g. 'the the', 'and and', 'in in'). Features: (1) Highlights all consecutive duplicates in original text (yellow background). (2) Lists all found pairs with repetition counts. (3) Generates cleaned text without duplicates. (4) Side-by-side view: original left, cleaned right — synchronized scrolling. (5) Counts total removed words. Language-agnostic, no grammar dependency. Use for: proofreading articles, theses, translations, web content, emails — anywhere typing errors slip in." },
        type: "custom", render: 'renderDuplicateWords'
      },
      {
        id: "count-occurrences", icon: SVG_ICONS.search, category: "findreplace",
        tags: ["kolikokrat se pojavi", "preštej pojavitve", "poišči besedo", "occurrences", "števec iskanj", "koliko krat", "count occurrences", "word count specific", "phrase count", "character count specific", "search count", "najdi in preštej", "count matches", "regex count", "pattern count", "text analysis", "analiza besedila"],
        name: { sl: "Števec pojavitev", en: "Occurrence Counter" },
        desc: { sl: "Preštej, kolikokrat se v besedilu pojavi določena beseda, fraza ali znak.", en: "Count how often a word, phrase, or character appears in the text." },
        type: "custom", render: 'renderCountOccurrences'
      },
      {
        id: "slugify", icon: SVG_ICONS.link, category: "formatting",
        tags: ["slug", "url prijazno", "seo povezava", "poenostavi naslov", "permalink", "črtna oblika", "url slug", "slug generator", "generate slug", "url friendly", "seo url", "clean url", "slugify text", "text to slug", "permalink generator", "url slugify", "seo optimization", "optimizacija url", "povezava brez šumnikov", "remove diacritics url"],
        name: { sl: "Generator Slug-ov", en: "Slug Generator" },
        desc: { sl: "Pretvori besedilo v URL-ju prijazen format za spletne strani (npr. 'Moja objava' -> 'moja-objava').", en: "Convert text into a URL-friendly slug for websites (e.g. 'My Post' -> 'my-post')." },
        longDesc: { sl: "Ustvari SEO-prijazne URL slug-ove iz naslovov, imen datotek ali poljubnega besedila. Pretvorba: (1) mala črke, (2) šumniki → ASCII (č→c, š→s, ž→z, đ→dj), (3) '&' → 'in' (sl) / 'and' (en), (4) odstrani vse razen črk, številk, presledkov in pomišljajev, (5) združi zaporedne ločila v eno črtico, (6) odstrani vodeče/zaključne črtice. Rezultat: 'Moj Članek: 10 Nasvetov!' → 'moj-clanek-10-nasvetov'. Uporabno za: CMS (WordPress, Ghost), spletne trgovine (izdelki), blog objave, API endpoint-ove, ime datotek v oblaku. Deluje na več vrsticah — vsako vrstico pretvori ločeno.", en: "Create SEO-friendly URL slugs from titles, filenames, or any text. Conversion: (1) lowercase, (2) diacritics → ASCII (č→c, š→s, ž→z, đ→dj), (3) '&' → 'in' (sl) / 'and' (en), (4) remove all except letters, numbers, spaces, hyphens, (5) collapse consecutive separators to single hyphen, (6) trim leading/trailing hyphens. Result: 'My Article: 10 Tips!' → 'my-article-10-tips'. Use for: CMS (WordPress, Ghost), e-commerce products, blog posts, API endpoints, cloud filenames. Works on multiple lines — each line converted separately." },
        type: "text-transform", transform: (t) => { const lang = currentLang === 'sl' ? 'in' : 'and'; return t.toLowerCase().trim().replace(/đ/g, 'dj').replace(/Đ/g, 'Dj').replace(/&/g, ' ' + lang + ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, ""); }
      },
      {
        id: "remove-duplicates", icon: SVG_ICONS.trash, category: "editing",
        tags: ["odstrani dvojnike", "podvojene vrstice", "unikatne vrstice", "duplicate lines", "unique lines", "počisti seznam", "remove duplicate lines", "deduplicate lines", "unique lines only", "filter duplicates", "distinct lines", "remove repeated lines", "list deduplication", "csv deduplicate", "clean list", "počisti duplikate", "ohrani unikatne", "first occurrence only"],
        name: { sl: "Odstrani dvojnike vrstic", en: "Remove Duplicate Lines" },
        desc: { sl: "Odstrani ponavljajoče se vrstice in ohrani prvo pojavitev. Čisti sezname, kopirane podatke ali besedila z dvojniki.", en: "Remove duplicate lines and keep the first occurrence. Cleans lists, copied data, or texts with duplicates." },
        longDesc: { sl: "Odstrani duplicirane vrstice iz besedila ohranjajoč prvo pojavitev vsake unikatne vrstice. Algoritem: prebere vse vrstice, shrani v Set (ki avtomatsko odstrani podvojene), nato izpiše v istem vrstnem redu kot prvo pojavitev. Ne razvršča — ohranja originalni zaporedni red. Uporabno za: čiščenje seznamov e-poštnih naslovov, URL-jev, ID-jev, ukazov, log datotek, CSV podatkov, kopiranih tabel. Primer: iz 1000 vrstic z 300 unikatnimi dobite čist seznam 300 vrstic. Ne odstrani praznih vrstic (za to uporabite 'Odstrani prazne vrstice').", en: "Remove duplicate lines while preserving first occurrence order. Algorithm: reads all lines, stores in Set (auto-deduplicates), outputs in original first-occurrence order. Does NOT sort — preserves original sequence. Use for: cleaning email lists, URLs, IDs, commands, log files, CSV data, copied tables. Example: from 1000 lines with 300 unique get clean 300-line list. Does not remove empty lines (use 'Remove Empty Lines' for that)." },
        type: "text-transform", transform: (t) => { const seen = new Set(); const out = []; t.split("\n").forEach(l => { if (!seen.has(l)) { seen.add(l); out.push(l); } }); return out.join("\n"); }
      },
      {
        id: "add-prefix", icon: SVG_ICONS.plus, category: "editing",
        tags: ["dodaj predpono", "dodaj pripono", "prefix suffix", "začetek vrstice", "konec vrstice", "označi vsako vrstico", "add prefix", "add suffix", "prefix lines", "suffix lines", "line prefix", "line suffix", "prepend text", "append text", "add to each line", "prefix every line", "suffix every line", "text prefix", "text suffix", "line numbering prefix", "bullet prefix", "format lines"],
        name: { sl: "Dodaj predpono in pripono", en: "Add Prefix & Suffix" },
        desc: { sl: "Dodaj poljubno besedilo na začetek in/ali konec vsake vrstice. Podpira obe polji hkrati.", en: "Add custom text to the start and/or end of every line. Supports both fields simultaneously." },
        type: "custom", render: 'renderAddPrefix'
      },
      {
        id: "filter-lines", icon: SVG_ICONS.filter, category: "editing",
        tags: ["filtriraj vrstice", "obdrži vrstice", "izloči vrstice", "filter lines", "vsebuje besedo", "grepper", "filter text lines", "keep lines containing", "remove lines containing", "grep lines", "text filter", "line filter", "filter by keyword", "search lines", "extract lines", "log filter", "csv filter", "code filter", "obdrži ki vsebuje", "izloči ki vsebuje", "inverse filter", "inverzni filter"],
        name: { sl: "Filtriraj vrstice", en: "Filter Text Lines" },
        desc: { sl: "Ohrani ali izloči vrstice, ki vsebujejo iskano besedo. Izbriši nepotrebne vrstice iz dnevnikov, CSV-jev ali kod.", en: "Keep or remove lines containing a keyword. Delete unwanted lines from logs, CSVs, or code." },
        type: "custom", render: 'renderFilterLines'
      },
      {
        id: "line-numbers", icon: SVG_ICONS.list_num, category: "formatting",
        tags: ["oštevilči vrstice", "številke vrstic", "numbering", "številčenje seznamov", "predpona vrstic", "line numbers", "add line numbers", "number lines", "enumerate lines", "line counter", "code line numbers", "source code lines", "text line numbers", "prefix line numbers", "linenums", "show line numbers", "format code lines", "oštevilčenje kode", "razvoj programske opreme"],
        name: { sl: "Oštevilči vrstice", en: "Line Numbering" },
        desc: { sl: "Dodaj številko pred vsako vrstico besedila. Koristno za pregled števila vrstic ali pripravo seznamov.", en: "Prefix every line with its line number. Useful for line counting or preparing formatted lists." },
        type: "custom", render: 'renderLineNumbers'
      },
      {
        id: "wrap-text", icon: SVG_ICONS.wrap, category: "formatting",
        tags: ["prelomi vrstice", "oblika stolpca", "širina besedila", "word wrap", "line break", "prelom besedila", "wrap text", "text wrapping", "line width", "character limit", "column width", "format text width", "hard wrap", "soft wrap", "text formatter", "column formatter", "prelom na širino", "širina stolpca", "ozki stolpec", "mobile text", "readable width"],
        name: { sl: "Prelomi besedilo", en: "Wrap Text" },
        desc: { sl: "Prelomi besedilo na določeno širino znakov. Koristno za prilagajanje besedila na ozke stolpce ali mobilne naprave.", en: "Wrap text to a fixed width in characters. Useful for fitting text into narrow columns or mobile screens." },
        type: "custom", render: 'renderWrapText'
      },
      {
        id: "strip-markdown", icon: SVG_ICONS.file_text, category: "editing",
        tags: ["odstrani markdown", "počisti markdown", "markdown to text", "plain text", "gol tekst", "brez oblikovanja", "strip markdown", "remove markdown", "markdown cleaner", "markdown to plain text", "convert markdown", "md to txt", "remove formatting", "clean markdown", "extract text from markdown", "markdown parser", "github markdown", "readme cleaner"],
        name: { sl: "Odstrani Markdown", en: "Strip Markdown" },
        desc: { sl: "Odstrani Markdown sintakso in pusti čist tekst.", en: "Remove Markdown syntax and keep plain text." },
        type: "custom", render: 'renderMarkdownStripper'
      },
      {
        id: "strip-html", icon: SVG_ICONS.html_tag, category: "editing",
        tags: ["odstrani html", "html to text", "brez oznak", "počisti oznake", "html tags remover", "kopiraj iz spletne strani", "strip html", "remove html tags", "html to plain text", "clean html", "extract text from html", "web page to text", "html cleaner", "remove markup", "strip tags", "sanitize html", "copy from website", "web scraping text", "html parser", "remove formatting"],
        name: { sl: "Odstrani HTML", en: "Strip HTML Tags", de: "HTML-Tags entfernen" },
        desc: { sl: "Pretvori HTML vsebino v čist tekst brez oznak. Koristno za čiščenje kopiranega besedila iz spletnih strani.", en: "Convert HTML content to plain text without tags. Useful for cleaning text copied from web pages.", de: "Konvertiert HTML-Inhalte in reinen Text ohne Tags. Nützlich zum Bereinigen von Texten aus Webseiten." },
        longDesc: {
          sl: "Varno in zanesljivo orodje za odstranjevanje vseh vrst HTML značk in pretvorbo spletnih vsebin v popolnoma čist, berljiv tekst. Ob kopiranju besedil s spletnih strani, e-pošte ali urejevalnikov vsebine (npr. WordPress) se v ozadju pogosto prenesejo nevidne ali odvečne oblikovne kode (kot so <div>, <span>, slogi in skripte). Orodje uporablja varen brskalniški parser za natančno ekstrakcijo besedila: (1) Združi odvečne presledke — prepreči nastanek velikih praznih vrzeli med besedami; (2) Ohrani prelome vrstic — ohrani pomenske odstavke (<p>, <div>) in eksplicitne prelome (<br>), da besedilo ostane strukturirano; (3) Odstrani <script> in <style> — v celoti izloči kodo JavaScript in CSS stilov, da se koda ne pomeša z vsebino; (4) Oblikuj sezname (•) — točke seznamov (<li>) opremi z urejenimi kroglicami ali številkami; (5) Prikaži URL povezav — poleg besedila povezave v oklepaju izpiše ciljni spletni naslov. Namig: Za popravilo prelomljenih vrstic pri kopiranju iz PDF dokumentov ali stolpcev revij uporabite orodje »Popravi besedilo iz PDF«.",
          en: "Fast and safe tool to strip all HTML tags and convert web markup into clean, readable plain text. When copying content from websites, rich emails, or CMS platforms, hidden tags (<div>, <span>, styles, and scripts) often clutter your clipboard. Using a secure browser DOM parser, this tool precisely extracts text: (1) Collapse multiple spaces — eliminates awkward spacing and tabs; (2) Preserve line breaks — retains meaningful paragraph spacing (<p>, <div>) and line breaks (<br>) to preserve readability; (3) Remove <script> & <style> — strips raw JavaScript and CSS blocks completely so no code leaks into the output; (4) Format lists (•) — converts list items (<li>) into clean bulleted or numbered lines; (5) Include link URLs — extracts destination URLs next to anchor text in parentheses. Tip: To fix broken line wraps from PDF documents or magazine columns, use the 'Fix PDF Copied Text' tool.",
          de: "Schnelles und sicheres Werkzeug zum Entfernen aller HTML-Tags und Umwandeln von Webinhalten in reinen, sauberen Text. Beim Kopieren aus Webseiten, E-Mails oder CMS-Systemen werden oft unsichtbare Formatierungen (<div>, <span>, Styles und Skripte) mitkopiert. Dieses Tool nutzt einen sicheren Browser-Parser für präzise Textextraktion: (1) Mehrfache Leerzeichen zusammenfassen — verhindert unschöne Lücken; (2) Zeilenumbrüche beibehalten — bewahrt Absätze (<p>, <div>) und Umbrüche (<br>); (3) <script> & <style> entfernen — schließt Skripte und CSS-Code vollständig aus; (4) Listen formatieren (•) — wandelt Listenelemente in saubere Aufzählungspunkte um; (5) Link-URLs anzeigen — fügt Ziel-URLs in Klammern neben den Linktext ein. Tipp: Um unerwünschte Zeilenumbrüche aus PDF-Dateien zu reparieren, nutzen Sie das Werkzeug 'PDF-Text korrigieren'."
        },
        type: "custom", render: 'renderHtmlStripper'
      },
      {
        id: "fix-pdf-text", icon: SVG_ICONS.file_text, category: "editing",
        tags: ["popravi besedilo iz pdf", "popravi pdf", "pdf v word", "pdf prelomi", "pdf stolpci", "lažni prelomi", "kopiranje iz pdf", "odstrani prelome pdf", "odpravi prelome vrstic", "deljenje besed", "spoji besede", "združi vrstice pdf", "pdf to word", "fix pdf text", "pdf line breaks", "pdf column wrap", "broken lines", "rejoin hyphenated words", "clean pdf copy", "pdf text formatter", "format pdf text", "unbreak lines"],
        name: { sl: "Popravi besedilo iz PDF", en: "Fix PDF Copied Text", de: "PDF-Text korrigieren" },
        desc: { sl: "Popravi neželene prelome vrstic in deljene besede pri kopiranju besedila iz PDF dokumentov ali stolpcev v Word. Ohrani prave odstavke, alineje seznamov ter počisti odvečne presledke.", en: "Fix broken line wraps and hyphenated words when copying text from PDF documents or columns into Word. Preserves real paragraphs, list bullets, and collapses extra spaces.", de: "Repariert unerwünschte Zeilenumbrüche und Silbentrennungen beim Kopieren von Text aus PDF-Dokumenten oder Spalten in Word. Behält Absätze und Aufzählungszeichen bei." },
        longDesc: {
          sl: "Orodje za odpravljanje poškodb besedila, ki nastanejo ob kopiranju iz PDF dokumentov ali stolpčnih postavitev v Word in druge urejevalnike. PDF datoteke besedilo shranjujejo kot vizualne koordinate na strani, zato kopiranje pogosto ustvari prisilne prelome vrstic (trde prelomnice na vsakih nekaj besed) ter razpolovljene besede z vezajem na koncih vrstic (npr. 'av- tor'). To orodje inteligentno popravi besedilo: (1) Ohrani odstavke — obdrži prazne vrstice med dejanskimi odstavki, znotraj odstavkov pa vrstice zlije v tekoče branje; (2) Spoji deljene besede z vezajem — odstrani vezaje na prelomih vrstic in spoji besede v celoto; (3) Ohrani alineje seznamov — zazna oznake (•, -, *, številke) in prepreči neželeno spajanje točk seznama; (4) Počisti odvečne presledke — združi večkratne presledke v enega; (5) Vse v eno samo vrstico — neobvezna možnost, kadar potrebujete celotno vsebino v enovitem nizu. Namig: Za besedilo z oznakami spletnih strani (<p>, <br>, <div>) uporabite orodje »Odstrani HTML«.",
          en: "Intelligent tool for fixing broken text formatting caused by copying from PDF documents or multi-column layouts into Word and other text editors. PDFs store text by page coordinates, which results in unwanted hard line breaks at the end of each visual line and words awkwardly split across lines with hyphens (e.g. 'infor- mation'). This tool restores natural flow: (1) Preserve paragraphs — keeps blank lines between real paragraphs while merging interrupted lines within each paragraph; (2) Rejoin hyphenated words — strips end-of-line hyphens and joins split words cleanly; (3) Preserve list items — recognizes bullet points (•, -, *) and numbered lists, keeping each item on its own line; (4) Collapse extra spaces — normalizes multiple consecutive spaces into a single space; (5) Everything in a single line — optional mode for merging entire text into one continuous line. Tip: For web pages containing markup tags (<p>, <br>, <div>), use the 'Strip HTML Tags' tool.",
          de: "Intelligentes Werkzeug zur Bereinigung von Texten, die aus PDF-Dokumenten oder mehrspaltigen Layouts in Word kopiert wurden. Da PDFs Text anhand fester visueller Koordinaten speichern, führt das Kopieren oft zu harten Zeilenumbrüchen mitten im Satz und getrennten Wörtern mit Bindestrich (z. B. 'Bei- spiel'). Dieses Tool stellt den natürlichen Lesefluss wieder her: (1) Absätze beibehalten — bewahrt echte Leerzeilen zwischen Absätzen und fügt gebrochene Zeilen innerhalb eines Absatzes zusammen; (2) Getrennte Wörter verbinden — entfernt Trennstriche am Zeilenende und fügt Silben zusammen; (3) Listenpunkte beibehalten — erkennt Aufzählungszeichen (•, -, *) und Nummerierungen; (4) Mehrfache Leerzeichen entfernen — fasst doppelte Leerzeichen zusammen; (5) Alles in eine einzige Zeile — optionale Funktion für zusammenhängenden Fließtext. Tipp: Für Webinhalte mit HTML-Tags (<p>, <br>, <div>) nutzen Sie das Werkzeug 'HTML entfernen'."
        },
        type: "text-transform",
        options: [
          { id: "paragraphs", type: "checkbox", default: true, label: { sl: "Ohrani odstavke (prazne vrstice)", en: "Preserve paragraphs (blank lines)", de: "Absätze beibehalten (Leerzeilen)" } },
          { id: "hyphens", type: "checkbox", default: true, label: { sl: "Spoji deljene besede z vezajem (npr. av- tor → avtor)", en: "Rejoin hyphenated words (e.g. self- evident → selfevident)", de: "Getrennte Wörter verbinden (z. B. Bei- spiel → Beispiel)" } },
          { id: "lists", type: "checkbox", default: true, label: { sl: "Ohrani alineje seznamov (•, -, 1.)", en: "Preserve list items (•, -, 1.)", de: "Listenpunkte beibehalten (•, -, 1.)" } },
          { id: "spaces", type: "checkbox", default: true, label: { sl: "Počisti odvečne presledke", en: "Collapse extra spaces", de: "Mehrfache Leerzeichen entfernen" } },
          { id: "single", type: "checkbox", default: false, label: { sl: "Vse v eno samo vrstico", en: "Everything in a single line", de: "Alles in eine einzige Zeile" } }
        ],
        transform(t, opts) {
          if (!t) return "";
          const preserveParagraphs = opts ? (opts.paragraphs !== false) : true;
          const joinHyphenated = opts ? (opts.hyphens !== false) : true;
          const preserveLists = opts ? (opts.lists !== false) : true;
          const collapseSpaces = opts ? (opts.spaces !== false) : true;
          const singleLine = opts ? Boolean(opts.single) : false;

          let res = t;
          if (joinHyphenated) {
            res = res.replace(/([\p{L}\d])-[\t ]*[\r\n]+[\t ]*([\p{L}\d])/gu, '$1$2');
          }
          if (singleLine) {
            res = res.replace(/[\r\n]+/g, ' ');
          } else if (preserveParagraphs) {
            res = res.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const paragraphs = res.split(/\n\s*\n+/);
            res = paragraphs.map(p => {
              const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
              let joined = '';
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isBullet = preserveLists && /^([•\-\*\u2022\u2023\u25E6]|\d+[\.\)])\s+/.test(line);
                if (i === 0) joined += line;
                else if (isBullet) joined += '\n' + line;
                else joined += ' ' + line;
              }
              return joined;
            }).filter(Boolean).join('\n\n');
          } else {
            res = res.replace(/[\r\n]+/g, ' ');
          }
          if (collapseSpaces) {
            res = res.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n');
          }
          return res.trim();
        }
      },
      {
        id: "remove-linebreaks", icon: SVG_ICONS.arrow_right, category: "editing",
        tags: ["odstrani prelome", "eno vrstico", "združi vrstice", "remove line breaks", "join lines", "brez novih vrstic", "remove newlines", "flatten text", "single line", "join all lines", "merge lines", "concatenate lines", "text to one line", "line break remover", "newline remover", "remove paragraph breaks", "join paragraphs", "flatten multiline", "csv to single line", "json to single line", "pdf kopiranje", "kopiraj iz pdf", "copy from pdf", "pdf text cleanup", "pdf stolpci", "pdf columns", "pdf v word", "pdf to word text", "pdf line breaks", "prelomi iz pdf", "počisti pdf besedilo", "clean pdf text", "pdf paste fix", "fix pdf copy"],
        name: { sl: "Odstrani prelomnice", en: "Remove Line Breaks" },
        desc: { sl: "Združi vse vrstice v eno samo vrstico ali pa vrstice razdruži. Idealno za čiščenje besedila, kopiranega iz PDF datotek — kjer se besedilo v stolpcih prelomi v nove vrstice — da dobite tekoč, neprekinjen odstavek za Word ali drug urejevalnik.", en: "Merge all lines into a single line, or split lines. Ideal for cleaning text copied from PDF files — where column text wraps into unwanted line breaks — producing a smooth, continuous paragraph for Word or any editor." },
        type: "text-transform", transform: (t) => t.replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim()
      },
      {
        id: "show-invisible", icon: SVG_ICONS.eye, category: "editing",
        tags: ["nevidni znaki", "skriti znaki", "tabulator", "whitespace", "show invisible characters", "preveri presledke", "show whitespace", "visible whitespace", "show tabs", "show line breaks", "invisible characters", "hidden characters", "control characters", "display whitespace", "reveal hidden", "debug text", "text debugging", "whitespace visualization", "tabulatorji vidni", "presledki vidni", "prelomi vidni", "special characters"],
        name: { sl: "Pokaži nevidne znake", en: "Show Invisible Characters" },
        desc: { sl: "Vizualno označi tabulatorje, večkratne presledke in prelome vrstic.", en: "Highlight tabs, multiple spaces, and line breaks." },
        type: "custom", render: 'renderInvisibleChars'
      },
      {
        id: "delimiter-convert", icon: SVG_ICONS.swap, category: "editing",
        tags: ["ločila", "vejice v podpičja", "separator", "delimiter", "spremeni ločilo", "razdeli po znaku", "delimiter converter", "convert delimiter", "csv delimiter", "change separator", "comma to semicolon", "tab to comma", "field separator", "csv converter", "tsv to csv", "excel delimiter", "data delimiter", "text delimiter", "replace delimiter", "split by delimiter", "join with delimiter", "ločilo v csv", "vejica podpičje", "tabulator vejica"],
        name: { sl: "Pretvornik ločil", en: "Delimiter Converter" },
        desc: { sl: "Zamenjaj ločilo med vejico, tabulatorjem ali podpičjem.", en: "Convert delimiters between comma, tab, and semicolon." },
        type: "custom", render: 'renderDelimiterConverter'
      },
      {
        id: "uuid-generator", icon: SVG_ICONS.id_badge, category: "security",
        tags: ["uuid", "guid", "edinstveni identifikator", "id generator", "uuid v4", "naključni id", "uuid generator", "generate uuid", "unique identifier", "random uuid", "v4 uuid", "uuid v1", "guid generator", "globally unique", "universally unique", "database id", "api key", "session id", "transaction id", "distributed id", "uuid online", "create uuid"],
        name: { sl: "Generator UUID", en: "UUID Generator" },
        desc: { sl: "Ustvari naključni UUID (v4) ali prilagojen naključni niz. Za identifikacijo virov, baz podatkov ali aplikacij.", en: "Generate a random UUID (v4) or custom string. For identifying resources, databases, or applications." },
        type: "custom", render: 'renderUuidGenerator'
      },
      {
        id: "hex-converter", icon: SVG_ICONS.hex, category: "security",
        tags: ["šestnajstiško", "heksadecimalno", "hex to text", "binarno", "pretvori v hex", "ascii", "hex converter", "hex to string", "text to hex", "hex decode", "hex encode", "binary converter", "binary to text", "text to binary", "octal converter", "octal to text", "number system converter", "base converter", "ascii to hex", "hex to ascii", "hex editor", "hex viewer", "programerji", "developers", "debugging", "encoding conversion", "pretvorba sistemov", "šestnajstiski sistem", "binarni sistem", "oktalni sistem"],
        name: { sl: "Pretvornik številskih sistemov", en: "Number System Converter" },
        desc: { sl: "Pretvori besedilo med heksadecimalno (hex), binarno (0 in 1), oktalno in besedilno obliko. Uporabno za programerje, razvoj programov in razumevanje kako računalnik shranjuje podatke.", en: "Convert text between hexadecimal, binary, octal, and text formats. Useful for programmers, debugging, and understanding how computers store data." },
        type: "custom", render: 'renderHexConverter'
      },
      {
        id: "morse-binary", icon: SVG_ICONS.terminal, category: "conversion",
        tags: ["morzejeva abeceda", "morse", "binarno", "binary", "sos signal", "pretvori v morse", "morse code", "text to morse", "morse to text", "morse decoder", "morse encoder", "sos morse", "radio morse", "telegraph", "cw morse", "ham radio", "morse translator", "international morse", "morse alphabet", "dots and dashes", "dit dah", "binary code", "text to binary", "binary to text", "ascii binary", "morzejev kodo", "morzejeva koda"],
        name: { sl: "Morsejeva abeceda", en: "Morse Code Converter" },
        desc: { sl: "Pretvori besedilo v Morsejevo abecedo (klici v sili, radio) ali binarno kodo. Podpira črke A-Z, številke 0-9 in presledke med besedami.", en: "Convert text to Morse code (emergency calls, radio) or binary. Supports letters A-Z, numbers 0-9, and spaces between words." },
        type: "custom", render: 'renderMorseBinary'
      },
      {
        id: "text-to-image", icon: SVG_ICONS.image, category: "generator",
        tags: ["besedilo v sliko", "ustvari sliko", "png", "text to image", "naredi sliko iz besedila", "prenesi kot png", "text to png", "quote image", "quote generator", "social media image", "text image generator", "canvas text", "text on image", "typography image", "quote card", "instagram quote", "twitter image", "facebook post", "text visualization", "text as image", "download png", "text renderer", "besedilo v png", "citati v sliko", "družbena omrežja"],
        name: { sl: "Besedilo v sliko", en: "Text to Image" },
        desc: { sl: "Nariše besedilo na platno in prenese kot PNG datoteko. Za ustvarjanje citatov, slik z besedilom ali družbenih objav.", en: "Render your text on a canvas and download as PNG. For creating quotes, text images, or social media posts." },
        type: "custom", render: 'renderTextToImage'
      },
      {
        id: "lorem-ipsum", icon: SVG_ICONS.edit_pen, category: "generator",
        tags: ["lorem ipsum", "slep tekst", "vzorčno besedilo", "placeholder text", "naključno besedilo", "testno besedilo", "lorem ipsum generator", "dummy text", "placeholder generator", "filler text", "lorem generator", "ipsum generator", "blind text", "greeking text", "design placeholder", "mock content", "test content", "sample text", "random paragraphs", "lorem paragraphs", "cat ipsum", "dog ipsum", "hipster ipsum", "bacon ipsum", "cupcake ipsum", "zombie ipsum", "placeholder loremp", "vzorčno besedilo slovenščina"],
        name: { sl: "Generator Lorem ipsum", en: "Lorem Ipsum Generator" },
        desc: { sl: "Ustvari polnilno besedilo z različnimi viri (klasično, mačji ali pasji ipsum) ter nastavitvami dolžine in formata.", en: "Generate filler text with source, length, and format options." },
        type: "custom", render: 'renderLoremIpsum'
      },
      {
        id: "extract-numbers", icon: SVG_ICONS.extract, category: "analysis",
        tags: ["izlušči številke", "izvleček številk", "poišči številke", "number extractor", "extract numbers", "številke iz besedila", "extract numbers from text", "find numbers", "number finder", "regex numbers", "extract digits", "pull numbers", "scrape numbers", "text mining numbers", "data extraction numbers", "financial numbers", "phone numbers extract", "izlušči števila", "poišči števila", "številke v besedilu", "numeric extraction"],
        name: { sl: "Izluščevalnik številk", en: "Number Extractor" },
        desc: { sl: "Izvleče vse številke iz besedila in jih izpiše vsako v novo vrstico. Priročno za izločanje podatkov iz mešanega besedila.", en: "Extract all numbers from text, each on a new line. Handy for pulling data out of mixed text." },
        type: "text-transform", transform: (t) => { const m = t.match(/-?\d+(?:[.,]\d+)?/g); return m ? [...new Set(m.map(n => n.replace(/,$/, '')))].join("\n") : (currentLang === 'sl' ? "Ni najdenih številk" : "No numbers found"); }
      },
      {
        id: "json-stringify", icon: SVG_ICONS.json_file, category: "conversion",
        tags: ["json", "stringify", "escape narekovaji", "api podatki", "besedilo v json", "json stringify", "json escape", "escape json", "text to json", "string to json", "json encoder", "json serializer", "api json", "json for api", "escape quotes", "json format", "validate json", "json online", "developer tools", "programerji", "json parser", "json utility"],
        name: { sl: "JSON niz", en: "JSON Stringify" },
        desc: { sl: "Pretvori tekst ali strukturo v veljaven JSON niz. Koristno za programerje in pripravo podatkov za API.", en: "Convert text or objects into a valid JSON string. Useful for developers and preparing data for APIs." },
        type: "custom", render: 'renderJsonStringify'
      },
      /* ===== PHASE 1 NEW TOOLS ===== */
      /* ===== CIPHER TOOLS (Skupina A: Tajne šifre) ===== */
      {
        id: "caesar-cipher", icon: SVG_ICONS.caesar, category: "security", featured: true,
        tags: ["caesar", "shift cipher", "cesar", "zamik črk", "caesar cipher", "shift cipher", "rot", "rot1-25", "klasična šifra", "tajni jezik", "geocaching", "escape room", "učitev kriptografije", "substitution cipher", "monoalphabetic"],
        name: { sl: "Caesar / Shift Cipher", en: "Caesar / Shift Cipher" },
        desc: { sl: "Zamakne črke za n mest (A→B, B→C... Z→A). Konfigurabilni zamik 1–25. Ohranja velikost črk, preskoči ne-črke.", en: "Shift letters by n positions (A→B, B→C... Z→A). Configurable shift 1–25. Preserves case, skips non-letters." },
        longDesc: { sl: "Klasična Caesarjeva šifra (tudi Shift Cipher) — ena najstarejših znaniš šifer. Vsaka črka v besedilu se zamakne za fiksno število mest v abecedi. Ključ = zamik (1–25). Enkripcija in dekripcija sta enaka operacija (samo obratni zamik). Ohranja velike/male črke, preskoči številke, ločila, presledke in posebnike. Uporabno za: otroke (tajni jezik), geocaching, escape room naloge, uvod v kriptografijo, preprosto skrivanje sporočil.", en: "Classic Caesar cipher (Shift Cipher) — one of the oldest known ciphers. Each letter shifts by a fixed number of positions in the alphabet. Key = shift (1–25). Encode and decode are the same operation (just reverse shift). Preserves upper/lower case, skips numbers, punctuation, spaces, and special chars. Use for: kids' secret language, geocaching, escape room puzzles, crypto intro, simple message hiding." },
        type: "custom", render: 'renderCaesarCipher'
      },
      {
        id: "atbash-cipher", icon: SVG_ICONS.atbash, category: "security",
        tags: ["atbash", "obratna abeceda", "atbash cipher", "hebrejska šifra", "simetrična šifra", "enkript=dekript", "mirror alphabet", "azby", "starodavna šifra", "no key needed"],
        name: { sl: "Atbash Cipher", en: "Atbash Cipher" },
        desc: { sl: "A↔Z, B↔Y, C↔X... (obratna abeceda). Simetrična – enkripcija = dekripcija. Hebrejska starodavna šifra, hitra skrivnost brez ključa.", en: "A↔Z, B↔Y, C↔X... (reverse alphabet). Symmetric – encode = decode. Ancient Hebrew cipher, instant secrecy without a key." },
        longDesc: { sl: "Atbash je ena najstarejših znaniš šifer, ki izhaja iz hebrejske abecede. Preprosto zamenja vsako črko s tisto, ki je simetrično nasproti v abecedi: A postane Z, B postane Y, C postane X, itd. Ker je preslikava simetrična, je enako orodje za enkripcijo in dekripcijo – ni potreben ključ. Ohranja velikost črk, preskoči vse ne-črkovne znake. Zgodovinsko zanimivo, danes uporabno za hitro 'skrivanje' besedil brez gesla.", en: "Atbash is one of the oldest known ciphers, originating from the Hebrew alphabet. Simply maps each letter to its reverse counterpart: A→Z, B→Y, C→X, etc. Since the mapping is symmetric, the same tool encodes and decodes — no key needed. Preserves case, skips non-letters. Historically interesting, today useful for quick 'hiding' of text without a password." },
        type: "text-transform", transform: (t) => t.replace(/[A-Za-z]/g, c => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
        })
      },
      {
        id: "rot47-cipher", icon: SVG_ICONS.rot47, category: "security",
        tags: ["rot47", "ascii rotacija", "rot 47", "spoiler tag", "kejširanje gesel", "neberljiv text", "ascii 33-126", "rot47 cipher", "all ascii rotation"],
        name: { sl: "ROT47 Cipher", en: "ROT47 Cipher" },
        desc: { sl: "Rotira vse ASCII znake 33–126 (črke, številke, znaki). 'Neberljiv' text za spoilere, kejševanje gesel v očeh.", en: "Rotates all ASCII chars 33–126 (letters, numbers, symbols). 'Unreadable' text for spoilers, password masking in plain sight." },
        longDesc: { sl: "ROT47 je razširitev ROT13 na celoten nabor tiskljivih ASCII znakov (kode 33–126). Medtem ko ROB13 obravnava samo črke, ROT47 zamakne vse: velike in male črke, številke, ločila, matematične znake, itd. Enkripcija = dekripcija (simetrična). Uporabno za: skrivanje spoilerjev na forumu, kejševanje gesel v očeh (ne varnostno!), preprosto obfuskacijo konfiguracijskih datotek. Ne za varnostne namene!", en: "ROT47 extends ROT13 to all printable ASCII (codes 33–126). Unlike ROT13 which only handles letters, ROT47 rotates everything: upper/lowercase, digits, punctuation, math symbols. Encode = decode (symmetric). Use for: hiding forum spoilers, masking passwords in plain sight (NOT secure!), simple config file obfuscation. NOT for security purposes!" },
        type: "text-transform", transform: (t) => t.replace(/[\x21-\x7E]/g, c => {
          const cc = c.charCodeAt(0);
          return String.fromCharCode(33 + ((cc - 33 + 47) % 94));
        })
      },
      {
        id: "vigenere-cipher", icon: SVG_ICONS.vigenere, category: "security", featured: true,
        tags: ["vigenere", "vigenère", "polialfabetična", "polyalphabetic", "ključna beseda", "keyword cipher", "tabula recta", "neprelomljiva šifra", "kriptografija", "klasična šifra", "vigenere square"],
        name: { sl: "Vigenère Cipher", en: "Vigenère Cipher" },
        desc: { sl: "Polialfabetična šifra s ključno besedo (npr. 'TAJNA' → vsaka črka določi zamik). Zgodovinsko 'neprelomljiva', zdaj laha za razlago konceptov.", en: "Polyalphabetic cipher with keyword (e.g. 'SECRET' → each letter sets shift). Historically 'unbreakable', now great for teaching concepts." },
        longDesc: { sl: "Vigenère je polialfabetična zamenjalna šifra, ki uporabi ključno besedo za določitev zamika vsake črke. Ključ 'TAJNA' pomeni: 1. črka zamakni za T(19), 2. za A(0), 3. za J(9), 4. za N(13), 5. za A(0), 6. znova T(19)... To preprečuje enkratno frekvenčno analizo. Dolgo časa je bila imenovana 'neprelomljiva šifra' (le chiffre indéchiffrable). Danes je laho zlomljiva z Kasiski testem in Friedmanovim testom, a ostaja odličen primer za učenje kriptografije. Orodje prikaže Tabula Recto (Vigenèreovo tabelo) in omogoča enkripcijo/dekripcijo. Ohranja velikost črk, preskoči ne-črke.", en: "Vigenère is a polyalphabetic substitution cipher using a keyword to determine per-letter shifts. Key 'SECRET' means: 1st letter shift by S(18), 2nd by E(4), 3rd by C(2), 4th by R(17), 5th by E(4), 6th by T(19), then repeat. This defeats simple frequency analysis. Long called 'the unbreakable cipher' (le chiffre indéchiffrable). Now breakable via Kasiski examination and Friedman test, but remains excellent for teaching crypto concepts. Tool shows Tabula Recta and supports encode/decode. Preserves case, skips non-letters." },
        type: "custom", render: 'renderVigenereCipher'
      },
      {
        id: "pigpen-cipher", icon: SVG_ICONS.pigpen, category: "textfun", featured: true,
        tags: ["pigpen", "masonična šifra", "masonic cipher", "geometrični simboli", "kotice pike", "tajna pisava", "vizualna šifra", "otroci", "escape room", "freemason", "pigpen cipher", "symbol cipher"],
        name: { sl: "Pigpen / Masonična šifra", en: "Pigpen / Masonic Cipher" },
        desc: { sl: "Črke → geometrični simboli (kotice, pike). Izriše SVG. Vizualna 'tajna pisava' za otroke, escape room.", en: "Letters → geometric symbols (grids, dots). Renders SVG. Visual 'secret writing' for kids, escape rooms." },
        longDesc: { sl: "Pigpen (Masonična) šifra zamenja črke s geometričnimi simboli, ki temelji na dveh mrežah (pogosto imenovani 'pigpen' in 'pigpen z pikami'). Vsaka črka dobi svoj unikaten simbol sestavljen iz delov mreže in pike. Zgodovinsko uporabljena pri svobodnem zidarstvu (freemasonry) za skrivanje zapisov. Danes priljubljena pri otrocih (tajna pisava), escape room-ih in geocaching-u. Orodje izriše SVG simbole, ki jih lahko kopirate ali prenesete kot sliko. Podpira slovensko abecedo (Č, Š, Ž → C, S, Z) in ohranja presledke/ločila.", en: "Pigpen (Masonic) cipher maps letters to geometric symbols based on two grids (often called 'pigpen' and 'pigpen with dots'). Each letter gets a unique symbol made from grid fragments and dots. Historically used by Freemasons for secret records. Popular today for kids' secret writing, escape rooms, and geocaching. Tool renders SVG symbols you can copy or download as image. Supports Slovenian alphabet (Č, Š, Ž → C, S, Z) and preserves spaces/punctuation." },
        type: "custom", render: 'renderPigpenCipher'
      },

      /* ===== PHASE 2: CONTENT/SEO TOOLS (Skupina B: Content/SEO triki) ===== */
      {
        id: "platform-counter", icon: SVG_ICONS.platform_counter, category: "analysis", featured: true,
        tags: ["števec znakov", "platform counter", "twitter 280", "linkedin 3000", "instagram 2200", "sms 160", "meta 160", "youtube 100", "seo", "content creator", "character limits", "social media limits", "števec besed", "word count", "platform limits", "dolžina prispevka"],
        name: { sl: "Števec znakov za platforme", en: "Platform Character Counter" },
        desc: { sl: "Preštej znake in besede za Twitter (280), LinkedIn (3000), Instagram (2200), SMS (160), Meta (160), YouTube (100) – vse na enem mestu.", en: "Count chars & words for Twitter (280), LinkedIn (3000), Instagram (2200), SMS (160), Meta (160), YouTube (100) – all in one view." },
        longDesc: { sl: "En pogled na omejitve vseh glavnih platform: Twitter/X 280 znakov, LinkedIn 3000, Instagram 2200, SMS 160, Meta description 160, YouTube naslov 100. Prikaže: število znakov (s/brez presledkov), besede, preostanke do limita, barvno kodiranje (zelena = ok, rumena = blizu, rdeča = preseženo). Uporabno za: content creatorje, social media managerje, copywriterje, SEO stratege, vse, ki objavljajo na družbenih omrežjih. Deluje v realnem času med tipkanjem.", en: "Single view of all major platform limits: Twitter/X 280, LinkedIn 3000, Instagram 2200, SMS 160, Meta description 160, YouTube title 100. Shows: chars (with/without spaces), words, remaining/over limit, color-coded (green = ok, yellow = close, red = over). Use for: content creators, social media managers, copywriters, SEO strategists, anyone posting to social media. Works in real-time as you type." },
        type: "custom", render: 'renderPlatformCounter'
      },
      {
        id: "readability-analyzer", icon: SVG_ICONS.readability, category: "analysis", featured: true,
        tags: ["berljivost", "readability", "flesch-kincaid", "gunning fog", "smog", "šolska stopnja", "čas branja", "grade level", "reading ease", "text difficulty", "analiza besedila", "preveč dolgi stavki", "copywriting", "seo content", "blog writing"],
        name: { sl: "Analizator berljivosti", en: "Readability Analyzer" },
        desc: { sl: "Izračunaj Flesch-Kincaid, Gunning Fog, SMOG, šolsko stopnjo, čas branja in označuje preveč dolge stavke.", en: "Calculate Flesch-Kincaid, Gunning Fog, SMOG, grade level, reading time, and highlight overly long sentences." },
        longDesc: { sl: "Popolna analiza berljivosti besedila za slovensko in angleščino. Izračuna: (1) Flesch Reading Ease (0–100, višje = lažje), (2) Flesch-Kincaid Grade Level (am. šolska stopnja), (3) Gunning Fog Index, (4) SMOG Index, (5) Povprečno število besed na stavek, (6) Povprečno število slagov na besedo, (7) Čas branja (200 wpm SL / 238 wpm EN), (8) Čas govora (150 wpm). Označi stavke daljše od 25 besed (rdeče) in med 20–25 (rumene). Uporabno za: copywriterje, blogerje, študente, prevajalce, vse, ki pišejo za javnost. Prilagodljive formule za SL/EN.", en: "Complete readability analysis for Slovenian and English. Calculates: (1) Flesch Reading Ease (0–100, higher = easier), (2) Flesch-Kincaid Grade Level (US school grade), (3) Gunning Fog Index, (4) SMOG Index, (5) Avg words per sentence, (6) Avg syllables per word, (7) Reading time (200 wpm SL / 238 wpm EN), (8) Speaking time (150 wpm). Highlights sentences >25 words (red) and 20–25 (yellow). Use for: copywriters, bloggers, students, translators, anyone writing for an audience. Language-adapted formulas for SL/EN." },
        type: "custom", render: 'renderReadabilityAnalyzer'
      },
      {
        id: "qrcode-generator", icon: SVG_ICONS.qrcode, category: "generator", featured: true,
        tags: ["qr koda", "qr code", "generator", "wifi qr", "email qr", "phone qr", "url qr", "vcard qr", "png", "svg", "deljenje wifi", "kontakt qr", "spletna povezava", "qr code generator", "quick response"],
        name: { sl: "Generator QR kod", en: "QR Code Generator" },
        desc: { sl: "Ustvari QR kodo za besedilo, URL, e-pošto, telefon, Wi-Fi, vCard. Prenesi kot PNG ali SVG.", en: "Generate QR codes for text, URL, email, phone, Wi-Fi, vCard. Download as PNG or SVG." },
        longDesc: { sl: "Vsevsebovati QR koda generator z 5 tipi vsebine: (1) Navadno besedilo/URL, (2) E-poštni naslov (mailto:), (3) Telefonska številka (tel:), (4) Wi-Fi konfiguracija (WIFI:T:WPA;S:ime;P:geslo;;), (5) vCard kontakt. Možnosti: velikost (128–512px), napakovna toleranca (L/M/Q/H), barva ozadja in prednjega plana. Izvoz: PNG (raster) ali SVG (vektorska, neomejeno razširjivo). Kode so polne QR (Reed-Solomon, pravi finder vzorci) in berljive z vsemi pametnimi telefoni. Vse lokalno v brskalniku – ni pošiljanja podatkov. Uporabno za: deljenje Wi-Fi brez tipkanja gesla, vizitke, spletne strani, tiskovne materiale, dogodke.", en: "All-in-one QR generator with 5 content types: (1) Plain text/URL, (2) Email (mailto:), (3) Phone (tel:), (4) Wi-Fi config (WIFI:T:WPA;S:name;P:pass;;), (5) vCard contact. Options: size (128–512px), error correction (L/M/Q/H), foreground/background colors. Export: PNG (raster) or SVG (vector, infinitely scalable). Codes are full QR (Reed-Solomon, real finder patterns) and scannable by all smartphones. All local in browser – no data sent. Use for: sharing Wi-Fi without typing password, business cards, web pages, print materials, events." },
        type: "custom", render: 'renderQRCodeGenerator'
      },
      {
        id: "leetspeak-converter", icon: SVG_ICONS.leetspeak, category: "textfun",
        tags: ["leetspeak", "1337", "leet", "haker", "narekovaji", "slovar", "a=4", "e=3", "i=1", "o=0", "t=7", "s=5", "internet kultura", "gesla", "nikan", "obrnjeno", "pretvori v leet", "leet converter", "1337 speak", "hacker speak"],
        name: { sl: "Leetspeak (1337) Pretvornik", en: "Leetspeak (1337) Converter" },
        desc: { sl: "Dvostranska pretvorba: normalno ↔ 1337 (A→4, E→3, I→1, O→0, T→7, S→5...). Internet kultura, niki, gesla.", en: "Bidirectional: normal ↔ 1337 (A→4, E→3, I→1, O→0, T→7, S→5...). Internet culture, nicknames, passwords." },
        longDesc: { sl: "Leetspeak (1337) je internet slang, ki zamenjuje črke z vizualno podobnimi številkami in simboli. Osnovna preslikava: A=4, B=8, E=3, G=6, I=1, L=1, O=0, S=5, T=7, Z=2. Napredna: B=|3, C=(, D=|), F|=, H=|-|, K=|<, M=|\\/|, N=|\\|, P=|2, Q=9, R=|2, U=|_|, V=\\/, W=\\/\\/, X=><, Y=`/, Z=2. Orodje omogoča: (1) Encode: besedilo → leet, (2) Decode: leet → besedilo ( najboljše poskusi), (3) Prilagodljiva 'agresivnost' (osnovna/napredna/ekstremna). Ohranja velikost črk. Uporabno za: niki, gesla, zabava, retro internet nostalgijo.", en: "Leetspeak (1337) is internet slang replacing letters with visually similar numbers/symbols. Basic map: A=4, B=8, E=3, G=6, I=1, L=1, O=0, S=5, T=7, Z=2. Advanced: B=|3, C=(, D=|), F|=, H=|-|, K=|<, M=|\\/|, N=|\\|, P=|2, Q=9, R=|2, U=|_|, V=\\/, W=\\/\\/, X=><, Y=`/, Z=2. Tool supports: (1) Encode: text → leet, (2) Decode: leet → text (best effort), (3) Configurable 'aggressiveness' (basic/advanced/extreme). Preserves case. Use for: nicknames, passwords, fun, retro internet nostalgia." },
        type: "custom", render: 'renderLeetspeakConverter'
      },
      {
        id: "text-to-emoji", icon: SVG_ICONS.text_emoji, category: "textfun",
        tags: ["emoji", "besede v emoji", "text to emoji", "emoji pretvornik", "slovar emoji", "ključne besede v emoji", "text emoji converter", "slovenian emoji", "english emoji", "visualizacija besedil", "zabavna pretvorba"],
        name: { sl: "Besedilo v Emoji", en: "Text to Emoji Converter" },
        desc: { sl: "Pretvori besede v ustrezne emoji simbole (npr. 'ljubezen kava sonce' → '❤️ ☕ ☀️'). Slovar za SL in EN.", en: "Convert words to matching emoji symbols (e.g. 'love coffee sun' → '❤️ ☕ ☀️'). Dictionary for SL and EN." },
        longDesc: { sl: "Pretvornik besedil v emoji z vgrajenim slovarjem za slovenščino in angleščino. Deluje: (1) Razčleni besedilo na besede, (2) Za vsako besedo poišči ujemanje v slovarju (npr. 'ljubezen'→❤️, 'kava'→☕, 'sonce'→☀️, 'denar'→💰, 'čas'→⏰, 'dom'→🏠, 'avto'→🚗, 'hrana'→🍔, 'veselje'→😊, 'žalost'→😢, 'gnev'→😡, 'strah'→😱, 'presenečenje'→😲). (3) Ne-prepoznane besede ohranji kot besedilo. (4) Možnost: samo emoji, emoji+beseda, ali emoji nad besedo. Slovar pokriva 200+ pogostih besed v SL in EN. Uporabno za: social media objave, zabava, dostopnejše besedile, vizualno komunikacijo.", en: "Text-to-emoji converter with built-in dictionaries for Slovenian and English. Works by: (1) Tokenizing text into words, (2) Matching each word against dictionary (e.g. 'love'→❤️, 'coffee'→☕, 'sun'→☀️, 'money'→💰, 'time'→⏰, 'home'→🏠, 'car'→🚗, 'food'→🍔, 'happy'→😊, 'sad'→😢, 'angry'→😡, 'fear'→😱, 'surprise'→😲). (3) Unmatched words kept as text. (4) Modes: emoji-only, emoji+word, or emoji above word. Dictionary covers 200+ common words in SL/EN. Use for: social media posts, fun, accessible text, visual communication." },
        type: "custom", render: 'renderTextToEmoji'
      },

      /* ===== PHASE 3: VISUAL FUN TOOLS (Skupina C: Zabavne visualizacije) ===== */
      {
        id: "ascii-art", icon: SVG_ICONS.ascii_art, category: "textfun", featured: true,
        tags: ["ascii art", "figlet", "banner", "velike črke", "znakovi", "text art", "ascii generator", "figlet fonts", "standard", "slant", "shadow", "big", "small", "banner font", "digital art", "retro", "terminal art", "console art", "ascii banner", "text to ascii"],
        name: { sl: "ASCII Art Generator (FIGlet)", en: "ASCII Art Generator (FIGlet)" },
        desc: { sl: "Ustvari ASCII umetnost iz besedila z FIGlet fonti: Standard, Slant, Shadow, Big, Small, Banner.", en: "Generate ASCII art from text with FIGlet fonts: Standard, Slant, Shadow, Big, Small, Banner." },
        longDesc: { sl: "Generator ASCII umetnosti (ASCII art) z vgrajenimi FIGlet fonti. Podprti fonti: Standard (klasičen), Slant (nagnjen), Shadow (s senco), Big (velik), Small (majhen), Banner (široki). Omogoča: (1) Nadzor širine (prelom vrstic), (2) Poravnavo (levo, desno, sredina), (3) Izbor znaka za ispunu, (4) Prenos kot besedilo ali kopiranje v odložišče. Uporabno za: terminal bannerje, README datoteke, e-poštne podpise, retro estetiko, programerske šale, dokumentacijo. Vse lokalno, brez zunanjih odvisnosti.", en: "ASCII art generator with built-in FIGlet fonts. Supported fonts: Standard (classic), Slant (italic), Shadow (with shadow), Big (large), Small (small), Banner (wide). Features: (1) Width control (line wrapping), (2) Alignment (left, center, right), (3) Fill character selection, (4) Download as text or copy to clipboard. Use for: terminal banners, README files, email signatures, retro aesthetics, dev jokes, documentation. All local, no external dependencies." },
        type: "custom", render: 'renderAsciiArt'
      },
      {
        id: "acrostic-generator", icon: SVG_ICONS.acrostic, category: "textfun", featured: true,
        tags: ["akrostih", "acrostic", "pesem", "poem", "prve črke", "first letters", "skrito sporočilo", "hidden message", "ustvarjanje pesmi", "creative writing", "pesnitev", "acrostic poem", "generator", "besedilo v pesem", "text to poem", "skrivnost", "secret message"],
        name: { sl: "Generator akrostihov", en: "Acrostic Generator" },
        desc: { sl: "Vnesi besedo (npr. 'SONCE') → ustvari stavek, kjer so prve črke besed S-O-N-C-E. Za pesmi, poslanice, skrivna sporočila.", en: "Enter a word (e.g. 'SUN') → generates a sentence where first letters spell S-U-N. For poems, messages, hidden meanings." },
        longDesc: { sl: "Generator akrostihov (pesmi, kjer prve črke vsake besede tvore besedo). Vnesete ciljno besedo (npr. 'LJUBEZEN'), orodje pa predlaga besede za vsako črko in vam omogoča, da sestavite stavek. Funkcionalnosti: (1) Avtomatski predlogi besed za vsako črko (slovar za SL/EN), (2) Ročno urejanje vsake vrstice, (3) Možnost: vsaka črka = nova vrstica ali en stavek, (4) Izvoz kot besedilo. Uporabno za: pesnitev, ljubimske poslanice, spominska sporočila, učni namen (spominjanje), kreativno pisanje, darila. Slovar pokriva 100+ besed na črko za SL in EN.", en: "Acrostic generator (poems where first letters of each word spell a word). Enter target word (e.g. 'LOVE'), tool suggests words for each letter and lets you build the sentence. Features: (1) Auto-suggestions per letter (dictionary for SL/EN), (2) Manual editing of each line, (3) Options: each letter = new line or single sentence, (4) Export as text. Use for: poetry, love letters, memorial messages, learning (mnemonics), creative writing, gifts. Dictionary covers 100+ words per letter for SL/EN." },
        type: "custom", render: 'renderAcrosticGenerator'
      },
      {
        id: "fake-chat-generator", icon: SVG_ICONS.fake_chat, category: "generator", featured: true,
        tags: ["fake chat", "sms generator", "lažni klepet", "generator klepeta", "chat simulator", "sms simulator", "meme generator", "screenshot", "whatsapp", "messenger", "iMessage", "android sms", "fake messages", "chat mockup", "conversation generator", "lažna pogovor", "zaslonska slika"],
        name: { sl: "Generator lažnega klepeta / SMS", en: "Fake Chat / SMS Generator" },
        desc: { sl: "Ustvari vizualno lažen klepet (WhatsApp, Messenger, iMessage, SMS) in prenesi kot sliko (PNG). Za meme, posnetke zaslona, šale.", en: "Create fake chat conversations (WhatsApp, Messenger, iMessage, SMS) and download as image (PNG). For memes, screenshots, jokes." },
        longDesc: { sl: "Generator lažnih klepetov za ustvarjanje posnetkov zaslona (screenshots) v stilu znani aplikacije: WhatsApp (zeleno), Messenger (modro), iMessage (modro/zelena), Android SMS (temno). Funkcionalnosti: (1) Dodajanje/uerejanje/brisanje sporočil, (2) Izbira pošiljalca (ime, avatar - emoji ali začetnica), (3) Časovni žigi, (4) Status sporočila (poslano, dostavljeno, prebrano - dvojni kljukici), (5) Nastavitve teme (svetla/temna), (6) Prenos kot PNG (visoka ločljivost). Vse se izvaja v Canvas-u v brskalniku. Uporabno za: meme, družabne omrežja, šale, demonstracije UI, priprava vsebin. NI namenjen zlorabi (prevaranje, lažna dokaza).", en: "Fake chat generator for creating screenshots in styles of popular apps: WhatsApp (green), Messenger (blue), iMessage (blue/green), Android SMS (dark). Features: (1) Add/edit/delete messages, (2) Sender selection (name, avatar - emoji or initial), (3) Timestamps, (4) Message status (sent, delivered, read - double check), (5) Theme settings (light/dark), (6) Download as PNG (high-res). All rendered in browser Canvas. Use for: memes, social media, jokes, UI demos, content prep. NOT for misuse (fraud, fake evidence)." },
        type: "custom", render: 'renderFakeChatGenerator'
      },
      {
        id: "remove-empty-lines", icon: SVG_ICONS.empty_lines, category: "editing",
        tags: ["prazne vrstice", "odstrani prazne", "blank lines", "počisti vrstice", "brez presledkov vrstic", "remove empty lines", "delete blank lines", "remove whitespace lines", "clean empty lines", "strip empty lines", "filter empty lines", "remove blank rows", "empty line remover", "text cleanup", "počisti prazne vrstice", "izbrisi prazne vrstice", "odstrani prazne vrstice besedila"],
        name: { sl: "Odstrani prazne vrstice", en: "Remove Empty Lines" },
        desc: { sl: "Odstrani prazne vrstice in vrstice, ki vsebujejo samo presledke. Uporabno za čiščenje besedil ali pripravo seznamov.", en: "Remove all blank or whitespace-only lines from text. Useful for cleaning up messy documents or preparing lists." },
        type: "text-transform", transform: (t) => t.split("\n").filter(l => l.trim() !== "").join("\n")
      },
      {
        id: "remove-accents", icon: SVG_ICONS.accent, category: "editing",
        tags: ["brez šumnikov", "čšž", "odstrani naglase", "diakritika", "remove accents", "bez diakritike", "poenostavi znake", "remove diacritics", "strip accents", "normalize text", "ascii only", "remove unicode accents", "slugify accents", "url friendly accents", "čšž v csz", "slovenian accents", "slovenski šumniki", "odstrani čšž", "pretvori šumnike", "normalize unicode", "diacritics removal", "accent removal", "unicode normalization"],
        name: { sl: "Odstrani naglase", en: "Remove Accents/Diacritics" },
        desc: { sl: "Odstrani diakritiko (č→c, š→s, ž→z, ü→u) in vse druge naglašene znake. Koristno za poimenovanje datotek ali iskanje po besedilih brez naglasov.", en: "Remove diacritics: č→c, š→s, ž→z, ü→u and all accented characters. Useful for file naming or searching text without accents." },
        type: "text-transform", transform: (t) => t.replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/ø/g, 'o').replace(/Ø/g, 'O').replace(/æ/g, 'ae').replace(/Æ/g, 'AE').replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/ß/g, 'ss').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      },
      {
        id: "tabs-spaces", icon: SVG_ICONS.tab, category: "formatting",
        tags: ["tabulatorji", "presledki", "indentacija", "zamik", "tabs to spaces", "formatiranje kode", "tabs to spaces", "spaces to tabs", "tab converter", "indentation converter", "code formatter", "indent converter", "4 spaces tab", "2 spaces tab", "tab width", "spaces per tab", "convert tabs", "replace tabs", "whitespace conversion", "code style", "prettier tabs", "editor config", "tabulator v presledek", "presledek v tabulator", "zamik v presledke"],
        name: { sl: "Tabulatorji ↔ Presledki", en: "Tabs ↔ Spaces Converter" },
        desc: { sl: "Pretvori tabulatorje v presledke ali obratno. Pomaga pri usklajevanju formata med različnimi urejevalniki.", en: "Convert tabs to spaces or spaces to tabs. Helps align formatting across different text editors." },
        type: "custom", render: 'renderTabsSpaces'
      },
      {
        id: "smart-quotes", icon: SVG_ICONS.quotes, category: "formatting",
        tags: ["narekovaji", "citatni znaki", "typographic quotes", "smart quotes", "slovenski narekovaji", "popravi narekovaje", "smart quotes", "straight quotes", "curly quotes", "typographic quotes", "quote conversion", "smart punctuation", "quotes converter", "fix quotes", "replace quotes", "typography quotes", "slovenian quotes", "angle quotes", "guillemets", "curly to straight", "straight to curly", "narekovaji v besedilu", "popravi citate", "tipografski narekovaji"],
        name: { sl: "Pametni narekovaji", en: "Smart / Straight Quotes" },
        desc: { sl: "Zamenjaj ravne narekovaje s tipografskimi in obratno. Poskrbi za pravilen zapis narekovajev v besedilu.", en: "Convert straight quotes to curly typographic quotes or vice versa. Ensures proper quote formatting in your text." },
        type: "custom", render: 'renderSmartQuotes'
      },
      {
        id: "split-join", icon: SVG_ICONS.split_join, category: "editing",
        tags: ["razdeli besedilo", "združi besedilo", "split join", "razbij na stolpce", "spoji vrstice", "razdeli po ločilu", "split text", "join text", "split by delimiter", "join with delimiter", "text splitter", "text joiner", "split lines", "join lines", "csv split", "csv join", "column split", "column join", "delimiter split", "delimiter join", "razdeli po znaku", "spoji s znakom", "text to columns", "columns to text", "split join text"],
        name: { sl: "Razdeli / Združi", en: "Split & Join Text" },
        desc: { sl: "Razdeli besedilo po ločilu ali regex vzorcu na vrstice, ali združi vrstice z ločilom. Pretvori CSV v seznam, združi vrstice v eno vrstico.", en: "Split text by delimiter or regex into lines, or join lines with a delimiter. Convert CSV to list, merge lines into single line." },
        type: "custom", render: 'renderSplitJoin'
      },
      {
        id: "shuffle-lines", icon: SVG_ICONS.shuffle, category: "editing",
        tags: ["pomešaj vrstice", "naključni vrstni red", "randomize", "shuffle lines", "razvrsti naključno", "shuffle text lines", "randomize lines", "random order lines", "line shuffler", "shuffle list", "random permutation", "fisher yates shuffle", "random line order", "mix lines", "permute lines", "pomešaj seznam", "naključno razvrsti", "igre s seznamom", "randomiziraj vrstice"],
        name: { sl: "Premešaj vrstice", en: "Shuffle Lines" },
        desc: { sl: "Naključno premešaj vrstni red vrstic v besedilu. Za ustvarjanje naključnih seznamov ali iger.", en: "Randomly shuffle the order of lines in your text. For creating random lists or games." },
        type: "text-transform", transform: (t) => { const a = t.split("\n"); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a.join("\n"); }
      },
      {
        id: "compare-text", icon: SVG_ICONS.diff, category: "analysis",
        tags: ["primerjava besedil", "primerjaj besedili", "razlike med besedili", "diff", "text compare", "spremembe v besedilu", "text diff", "compare texts", "diff tool", "text comparison", "diff checker", "compare two texts", "side by side diff", "inline diff", "unified diff", "version comparison", "text changes", "track changes", "git diff", "code diff", "document comparison", "primerjava verzij", "razlike v besedilu", "spremembe v kodi", "različice besedila"],
        name: { sl: "Primerjava besedil", en: "Text Diff / Compare" },
        desc: { sl: "Primerjaj dve besedili in označi razlike med njima. Podobno kot 'diff' pri programiranju — prikaže dodane, odstranjene in spremenjene vrstice.", en: "Compare two texts side by side and highlight differences. Similar to 'diff' in programming — shows added, removed, and changed lines." },
        type: "custom", render: 'renderCompareText'
      },
      
      {
        id: "email-extractor", icon: SVG_ICONS.mail, category: "analysis",
        tags: ["izvleček e-naslovov", "e-poštni naslovi", "poišči e-naslove", "email extractor", "extract emails", "kontakti iz besedila", "email finder", "find emails", "extract email addresses", "email scraper", "contact extractor", "email harvester", "mail extractor", "email parser", "regex email", "validate emails", "unique emails", "email list", "contact list", "izlusci emaile", "poisci emaile", "e-naslovi iz besedila", "zbiranje kontaktov"],
        name: { sl: "Izvleček e-naslovov", en: "Email Extractor" },
        desc: { sl: "Izlušči vse e-poštne naslove iz besedila. Priročno za zbiranje kontaktov iz sporočil ali dokumentov.", en: "Extract all email addresses found in text. Handy for collecting contacts from messages or documents." },
        type: "text-transform", transform: (t) => { const m = t.match(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g); return m ? [...new Set(m)].join("\n") : (currentLang === 'sl' ? "Ni najdenih e-naslovov." : "No emails found."); }
      },
      {
        id: "url-extractor", icon: SVG_ICONS.link_extract, category: "analysis",
        tags: ["izvleček url", "spletne povezave", "poišči povezave", "url extractor", "extract links", "hiperpovezave", "url finder", "find urls", "extract urls", "link extractor", "url scraper", "web link extractor", "hyperlink extractor", "url parser", "extract links from text", "link finder", "website links", "url list", "link list", "izlusci urle", "poisci povezave", "url ji iz besedila", "zbiranje povezav", "spletni naslovi"],
        name: { sl: "Izvleček URL-jev", en: "URL Extractor" },
        desc: { sl: "Izlušči vse spletne naslove (URL) iz besedila. Priročno za zbiranje povezav iz besedil ali dokumentov.", en: "Extract all web addresses (URLs) found in text. Handy for collecting links from messages or documents." },
        type: "text-transform", transform: (t) => { const m = t.match(/(?:https?|ftp):\/\/[^\s<>"'()]+/gi); return m ? [...new Set(m.map(u => u.replace(/[.,;:!?]+$/, '')))].join("\n") : (currentLang === 'sl' ? "Ni najdenih URL-jev." : "No URLs found."); }
      },
      {
        id: "csv-converter", icon: SVG_ICONS.csv, category: "conversion",
        tags: ["csv", "vejice", "stolpci", "tabela", "excel podatki", "razdeli po vejicah", "csv converter", "csv to text", "text to csv", "csv formatter", "csv parser", "csv viewer", "csv editor", "excel to csv", "tsv converter", "delimited text", "column converter", "spreadsheet converter", "data converter", "csv align", "pretty csv", "csv beautify", "csv to columns", "columns to csv", "vejice v stolpce", "stolpci v vejice", "excel v csv", "tabela v csv", "csv orodje"],
        name: { sl: "CSV pretvornik", en: "CSV ↔ Text Columns" },
        desc: { sl: "Pretvori med CSV in besedilnimi stolpci — pretvori vejice ločene podatke v poravnane stolpce ali obratno. Koristno za urejanje podatkov.", en: "Convert between CSV and aligned text columns — transform comma-separated data into formatted columns or vice versa." },
        type: "custom", render: 'renderCsvConverter'
      },
      {
        id: "text-to-speech", icon: SVG_ICONS.speaker, category: "conversion",
        tags: ["branje na glas", "govor", "sintetizator govora", "text to speech", "tts", "poslušaj besedilo", "speech synthesis", "read aloud", "voice reader", "text reader", "tts engine", "browser tts", "accessibility speech", "screen reader", "listen to text", "voice over", "narration", "audio from text", "speech generator", "text to audio", "branje besedila", "govorni sintetizator", "poslusaljanje besedila", "dostopnost govor", "učenje s poslusnanjem"],
        name: { sl: "Besedilo v govor", en: "Text to Speech" },
        desc: { sl: "Predvajaj besedilo z glasovnim sintetizatorjem brskalnika. Poslušaj besedilo namesto branja — za dostopnost ali učenje.", en: "Read text aloud using your browser's speech engine. Listen to text instead of reading — for accessibility or learning." },
        type: "custom", render: 'renderTextToSpeech'
      },
      {
        id: "random-string", icon: SVG_ICONS.random, category: "generator",
        tags: ["naključni niz", "naključne črke", "random string", "žetoni", "token generator", "naključna koda", "random string generator", "generate random string", "random token", "api token", "session token", "csrf token", "random characters", "random alphanumeric", "custom charset", "string generator", "random key", "random id", "test data generator", "mock data", "nakljucni niz generator", "token generator", "varnostni zeton", "testni podatki generator"],
        name: { sl: "Naključni niz", en: "Random String Generator" },
        desc: { sl: "Generiraj naključne nize z nastavljivo dolžino in naborom znakov. Za ustvarjanje varnih gesel, žetonov ali testnih podatkov.", en: "Generate random strings with configurable length and character set. For creating secure passwords, tokens, or test data." },
        type: "custom", render: 'renderRandomString'
      },
      {
        id: "regex-tester", icon: SVG_ICONS.regex, category: "findreplace",
        tags: ["regex", "regularni izrazi", "regexp", "testiraj vzorec", "pattern matching", "regular expressions", "regex tester", "regex tester online", "test regex", "regex validator", "regex debugger", "pattern test", "regex match", "regex replace", "regular expression tester", "pccre regex", "javascript regex", "regex builder", "regex cheat sheet", "regex examples", "regex syntax", "regularni izraz tester", "vzorec tester", "regex orodje", "programerji regex"],
        name: { sl: "Tester regularnih izrazov", en: "Regex Tester" },
        desc: { sl: "Preveri regularni izraz (regex) nad besedilom in označi ujemanja. Za programerje in napredne uporabnike, ki želijo preizkusiti iskalne vzorce.", en: "Test a regular expression against text and highlight matches. For developers and power users testing search patterns." },
        type: "custom", render: 'renderRegexTester'
      },
      {
        id: "censor-words", icon: SVG_ICONS.censor, category: "findreplace",
        tags: ["cenzuriraj", "skrij besede", "zamaši besede", "word filter", "prekrij besedilo", "bad words filter", "censor words", "word censor", "profanity filter", "bad word filter", "mask words", "hide words", "replace words", "filter profanity", "content filter", "text censor", "obscure words", "bleep words", "cenzura besedil", "skrivanje besed", "zamenjaj z zvezdicami", "neprimerno besedilo", "filter neprimerno", "varnost besedila", "moderacija besedila"],
        name: { sl: "Cenzura besed", en: "Censor Words" },
        desc: { sl: "Zamenjaj izbrane besede z zvezdicami za cenzuro (npr. 'beseda' -> '******'). Priročno za skrivanje občutljivih besed.", en: "Replace specified words with asterisks for censoring (e.g. 'word' -> '******'). Useful for hiding sensitive words." },
        type: "custom", render: 'renderCensorWords'
      },
      /* ===== PHASE 2 NEW TOOLS ===== */
      {
        id: "reverse-advanced", icon: SVG_ICONS.reverse_adv, category: "editing",
        tags: ["obrni besedilo", "nazaj", "obratno vrstni red", "reverse text", "obrni črke", "obrni besede", "advanced reverse", "reverse words", "reverse letters", "reverse sentences", "reverse paragraphs", "text reverser", "flip text", "mirror text", "backwards text", "reverse string", "obrni stavek", "obrni odstavek", "obrni vrstni red besed", "obratno besedilo", "text inverter", "invert text"],
        name: { sl: "Napredno obračanje", en: "Advanced Reverse" },
        desc: { sl: "Obrni vrstni red besed, črk, stavkov ali odstavkov. Podrobna kontrola nad tem, kaj in kako obrniti.", en: "Reverse text by words, letters, sentences, or paragraphs. Fine-grained control over what and how to reverse." },
        type: "custom", render: 'renderReverseAdvanced'
      },
      {
        id: "sort-advanced", icon: SVG_ICONS.sort_adv, category: "editing",
        tags: ["razvrsti vrstice", "abecedni red", "urejeno", "sort lines", "razvrsti po dolžini", "AŽ uredi", "advanced sort", "sort text", "sort lines alphabetically", "sort by length", "random sort", "sort words", "sort sentences", "sort paragraphs", "text sorter", "line sorter", "alphabetical sort", "natural sort", "custom sort", "razvrsti besede", "razvrsti stavke", "razvrsti odstavke", "abecedno razvrščanje", "dolžina vrstic", "naključno razvrščanje", "urejanje besedila", "sortiranje"],
        name: { sl: "Napredno razvrščanje", en: "Advanced Sort" },
        desc: { sl: "Razvrsti besede, stavke ali odstavke po abecedi, dolžini ali naključno. Prilagoditevrstni red besedila.", en: "Sort words, sentences, or paragraphs alphabetically, by length, or randomly. Customize the order of your text." },
        type: "custom", render: 'renderSortAdvanced'
      },
      {
        id: "duplicate-remover-words", icon: SVG_ICONS.dup_word, category: "editing",
        tags: ["odstrani dvojnike besed", "unikatne besede", "unique words", "počisti ponovitve", "brez ponavljanja", "remove duplicate words", "deduplicate words", "unique words only", "remove repeated words", "word deduplication", "distinct words", "filter duplicate words", "clean repeated words", "typo fix duplicate", "accidental duplicate", "double word remover", "odstrani ponovljene besede", "unikatne besede samo", "počisti besedilo od ponovitev"],
        name: { sl: "Odstrani podvojene besede", en: "Remove Duplicate Words" },
        desc: { sl: "Izbriši ponovljene besede v vsaki vrstici ali celotnem besedilu. Popravi morebitne tipkarske napake, ko se beseda pojavi dvakrat zaporedoma.", en: "Delete repeated words in each line or entire text. Fixes accidental typing errors where a word appears twice in a row." },
        type: "custom", render: 'renderDuplicateRemoverWords'
      },
      {
        id: "pad-text", icon: SVG_ICONS.pad, category: "formatting",
        tags: ["poravnaj besedilo", "oblji vrstice", "dopolni znake", "padding", "align text", "enaka dolžina vrstic", "pad text", "text padding", "align columns", "fixed width text", "left pad", "right pad", "center text", "justify text", "column alignment", "text align", "monospace align", "code alignment", "table alignment", "poravnaj stolpce", "enaka širina", "dopolni s presledki", "zamik besedila", "formatiranje stolpcev"],
        name: { sl: "Poravnaj besedilo", en: "Pad / Align Text" },
        desc: { sl: "Poravnaj vrstice na določeno širino z dodajanjem znakov. Koristno za oblikovanje besedila v stolpce.", en: "Pad lines to a fixed width with a chosen character. Useful for formatting text into aligned columns." },
        type: "custom", render: 'renderPadText'
      },
      {
        id: "hash-generator", icon: SVG_ICONS.hash_icon, category: "security",
        tags: ["hash", "md5", "sha256", "sha1", "kontrolna vsota", "checksum", "prstni odtis besedila", "hash generator", "generate hash", "sha256 hash", "sha512 hash", "sha1 hash", "md5 hash", "cryptographic hash", "hash function", "digest", "message digest", "file integrity", "data integrity", "digital fingerprint", "hash calculator", "checksum calculator", "verify integrity", "password hash", "hash text", "string hash", "zgoščena vrednost", "izračunaj hash", "preveri celovitost", "digitalni prstni odtis"],
        name: { sl: "Generator zgoščenk", en: "Hash Generator" },
        desc: { sl: "Izračunaj SHA-256, SHA-1 ali SHA-512 zgoščenko besedila. Za preverjanje celovitosti podatkov ali ustvarjanje digitalnih prstnih odtisov.", en: "Compute SHA-256, SHA-1, or SHA-512 hash of text. For data integrity verification or creating digital fingerprints." },
        type: "custom", render: 'renderHashGenerator'
      },
      {
        id: "unicode-info", icon: SVG_ICONS.unicode, category: "analysis",
        tags: ["unicode znaki", "kodne točke", "posebni znaki", "code point", "znak preveri", "nabor znakov", "unicode inspector", "unicode code points", "character info", "unicode lookup", "character details", "code point lookup", "unicode name", "unicode block", "character encoding", "utf-8 code points", "unicode database", "char info", "glyph info", "unicode character", "codepoint", "unicode analyzer", "znak unicode", "kodna točka znak", "unicode raziskovanje", "znak info", "nabori znakov"],
        name: { sl: "Unicode inšpektor", en: "Unicode Inspector" },
        desc: { sl: "Prikaži Unicode kodno točko, ime in blok za vsak znak. Za raziskovanje in učenje o znakovnih naborih.", en: "Show Unicode code point, name, and block for each character. For exploring and learning about character sets." },
        type: "custom", render: 'renderUnicodeInfo'
      },
      {
        id: "palindrome-check", icon: SVG_ICONS.palindrome, category: "textfun",
        tags: ["palindrom", "perokridrom", "preveri palindrom", "nazaj enako", "palindrome check", "palindrome checker", "is palindrome", "palindrome generator", "create palindrome", "palindrome text", "mirror text", "reverse palindrome", "word palindrome", "sentence palindrome", "number palindrome", "palindrome finder", "palindrome detector", "palindrom preverjanje", "ali je palindrom", "palindrom generator", "ustvari palindrom", "beseda nazaj", "stavek nazaj"],
        name: { sl: "Preverjanje palindroma", en: "Palindrome Checker" },
        desc: { sl: "Preveri, ali je besedilo palindrom (se bere enako nazaj), in ustvari palindrom iz vnesenega besedila.", en: "Check if text is a palindrome (reads the same backwards), and generate a palindrome from your text." },
        type: "custom", render: 'renderPalindromeCheck'
      },
      {
        id: "upside-down", icon: SVG_ICONS.flip, category: "textfun",
        tags: ["obrnjeno besedilo", "na glavo", "flip text", "obrni pisavo", "fancy obrnjeno", "upside down text", "flip text upside down", "inverted text", "upside down generator", "flip text online", "mirror text", "upside down letters", "flip characters", "text flipper", "upside down font", "flip text for fun", "social media flip", "obrnjeno besedilo generator", "besedilo na glavo", "flipanje besedila", "zabavna pisava", "dramatičen učinek"],
        name: { sl: "Obrnjeno besedilo", en: "Upside Down Text" },
        desc: { sl: "Pretvori besedilo v obrnjeno pisavo za zabavo ali dramatičen učinek v objavah na družbenih omrežjih.", en: "Flip text upside down for fun or dramatic effect in social media posts and messages." },
        type: "text-transform", transform: (t) => { const map = { 'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ɓ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': '⋊', 'L': '⅂', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ᔭ', '5': 'ϛ', '6': '9', '7': 'Ɫ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", "'": ',', '"': '„', '!': '¡', '?': '¿', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾' }; return [...t].map(c => map[c] || c).reverse().join(''); }
      },
      /* ===== PHASE 3 NEW TOOLS ===== */
      {
        id: "zalgo-text", icon: SVG_ICONS.zalgo_icon, category: "textfun",
        tags: ["zalgo", "grozljivo besedilo", "pokvarjena pisava", "creepy text", "halloween besedilo", "zalgo text", "glitch text", "corrupted text", "creepy font", "halloween text", "scary text", "zalgo generator", "glitch generator", "text corruption", "unicode glitch", "combining characters", "diacritic stacking", "zalgo font", "creepypasta text", "horror font", "grozljiv tekst", "pokvarjen tekst", "zalgo besedilo generator"],
        name: { sl: "Zalgo besedilo", en: "Zalgo Text Generator" },
        desc: { sl: "Dodaj grozljive Unicode kombinirajoče znake besedilu za dramatičen ali grozljiv učinek.", en: "Add creepy combining Unicode characters to text for a dramatic or horror effect." },
        type: "custom", render: 'renderZalgoText'
      },
      {
        id: "fancy-text", icon: SVG_ICONS.fancy, category: "textfun",
        tags: ["fancy pisave", "krepko", "ležeče", "instagram pisave", "font styles", "posebne pisave", "stylized text", "fancy text", "unicode fonts", "text styles", "font generator", "cool fonts", "instagram fonts", "fancy font generator", "stylish text", "unicode text styles", "bold text", "italic text", "script font", "fraktur font", "monospace font", "double struck", "sans serif", "underlined text", "krepka pisava", "ležača pisava", "poševna pisava", "fraktur pisava", "pisava za instagram", "lepe pisave", "specijalne pisave"],
        name: { sl: "Unicode pisave", en: "Unicode Text Styles" },
        desc: { sl: "Pretvori besedilo v 11 različnih Unicode slogov: krepko, ležeče, poševno, fraktur, pisava, monospace in drugo. Vključuje tudi podčrtane znake.", en: "Convert text to 11 different Unicode styles: bold, italic, script, fraktur, monospace, double-struck, sans-serif and more. Also includes underline styles." },
        type: "custom", render: 'renderFancyText'
      },
      {
        id: "strikethrough", icon: SVG_ICONS.strikethrough, category: "textfun",
        tags: ["prečrtano", "preklicano", "strikethrough", "črtano besedilo", "pređi čez", "strikethrough text", "cross out text", "strike through", "line through text", "cancelled text", "deleted text", "mark as done", "todo strikethrough", "text decoration", "unicode strikethrough", "prečrtano besedilo", "preklicano besedilo", "črta skozi besedilo", "oznaci kot opravljeno", "zapisi s prečrto"],
        name: { sl: "Prečrtano besedilo", en: "Strikethrough Text" },
        desc: { sl: "Dodaj Unicode prečrtanje vsakemu znaku za zabavo ali označevanje besedila kot preklicanega.", en: "Add Unicode strikethrough to every character for fun or marking text as cancelled." },
        type: "text-transform", transform: (t) => [...t].map(c => c === '\n' ? c : c + '\u0336').join('')
      },
      {
        id: "tiny-text", icon: SVG_ICONS.tiny, category: "textfun",
        tags: ["mala pisava", "majhno besedilo", "superscript", "subscript", "small text", "nadpisano", "tiny text", "superscript text", "small caps", "tiny font", "small letters", "superscript generator", "tiny text generator", "unicode superscript", "small text converter", "footnote text", "annotation text", "tiny letters", "mini text", "mala črka", "nadpisana besedila", "opombe v besedilu", "majhne črke", "superscript znaki"],
        name: { sl: "Drobno besedilo", en: "Tiny Superscript Text" },
        desc: { sl: "Pretvori besedilo v drobne nadpisane Unicode znake za zabavo ali opombe.", en: "Convert text to tiny superscript Unicode characters for fun or annotations." },
        type: "text-transform", transform: (t) => { const m = { 'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }; return [...t.toLowerCase()].map(c => m[c] || c).join(''); }
      },
      {
        id: "remove-punctuation", icon: SVG_ICONS.remove_punct, category: "editing",
        tags: ["odstrani ločila", "brez vejic", "brez pik", "remove punctuation", "samo črke", "čisto besedilo", "strip punctuation", "remove punctuation marks", "clean punctuation", "text without punctuation", "punctuation remover", "only letters numbers", "alphanumeric only", "remove special chars", "clean text punctuation", "odstrani vse ločila", "brez ločil", "samo crke stevilke", "počisti ločila", "text cleaner punctuation"],
        name: { sl: "Odstrani ločila", en: "Remove Punctuation" },
        desc: { sl: "Odstrani vsa ločila in posebne znake iz besedila. Uporabno za čiščenje besedila pred nadaljnjo obdelavo.", en: "Remove all punctuation and special characters from text. Useful for cleaning text before further processing." },
        type: "text-transform", transform: (t) => t.replace(/[^\p{L}\p{N}\s'-]/gu, '')
      },
      {
        id: "text-repeater", icon: SVG_ICONS.repeat, category: "generator",
        tags: ["ponovi besedilo", "podvoji", "repeat text", "večkrat ponovi", "kopiraj vrstico", "text repeater", "repeat string", "duplicate text", "multiply text", "copy text multiple", "repeat lines", "text multiplier", "generate repeated", "pattern repeat", "test data repeat", "ponovi vrstice", "ponavljaj besedilo", "večkrat kopiraj", "besedilo ponovitelj", "generator ponovitev", "testni vzorci ponovitev"],
        name: { sl: "Ponavljalec besedila", en: "Text Repeater" },
        desc: { sl: "Ponovi besedilo ali vrstice določeno številokrat. Za ustvarjanje testnih vzorcev ali ponavljajočih se vsebin.", en: "Repeat text or lines a specified number of times. For creating test patterns or repetitive content." },
        type: "custom", render: 'renderTextRepeater'
      },
      {
        id: "highlight-patterns", icon: SVG_ICONS.highlight, category: "findreplace",
        tags: ["označi besedilo", "poudari", "highlight", "obarvaj vzorce", "označi vse", "highlight patterns", "text highlighter", "mark text", "highlight words", "color text", "pattern highlight", "regex highlight", "search highlight", "visual highlight", "text marking", "označi vzorec", "poudari besede", "obarvaj besede", "vizuialno označi", "isci in oznaci", "highlight matches", "oznaci ujemanja"],
        name: { sl: "Označi vzorce", en: "Highlight Patterns" },
        desc: { sl: "Označi besede, črke ali vzorce v besedilu z barvami. Za vizualno analizo ali poudarjanje ključnih besed.", en: "Highlight words, letters, or patterns in text with colors. For visual analysis or emphasizing keywords." },
        type: "custom", render: 'renderHighlightPatterns'
      },
      /* ===== PHASE 4 NEW TOOLS ===== */
      {
        id: "nato-alphabet", icon: SVG_ICONS.nato, category: "conversion",
        tags: ["nato abeceda", "črkovanje", "spell", "alfa bravo charlie", "telefonsko črkovanje", "nato phonetic", "phonetic alphabet", "spelling alphabet", "radio alphabet", "aviation alphabet", "military alphabet", "alpha bravo charlie", "icao alphabet", "nato spelling", "letter spelling", "phonetic spelling", "radio communication", "spell out letters", "nato abeceda generator", "fonetična abeceda", "črkovanje po nato", "telefoniranje črk", "radio črkovanje", "letalsko črkovanje"],
        name: { sl: "NATO abeceda", en: "NATO Phonetic Alphabet" },
        desc: { sl: "Pretvori črke v NATO fonetično abecedo (Alpha, Bravo, Charlie...). Za jasno sporočanje črk po radiu ali telefonu.", en: "Convert letters to NATO phonetic alphabet (Alpha, Bravo, Charlie...). For clear letter communication over radio or phone." },
        type: "text-transform", transform: (t) => { const m = { A: 'Alpha', B: 'Bravo', C: 'Charlie', Č: 'Charlie-Č', Ć: 'Charlie-Ć', D: 'Delta', Đ: 'Delta-Đ', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', Š: 'Sierra-Š', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu', Ž: 'Zulu-Ž', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner' }; return t.split('\n').map(line => line.split(/\s+/).map(word => [...word].map(c => m[c.toUpperCase()] || c).join(' ')).join('   ')).join('\n'); }
      },
      {
        id: "text-entropy", icon: SVG_ICONS.entropy, category: "analysis",
        tags: ["entropija", "naključnost besedila", "shannon", "entropy", "moč gesla", "predvidljivost", "text entropy", "shannon entropy", "information entropy", "randomness measure", "password strength", "entropy calculator", "bits of entropy", "text randomness", "predictability", "information theory", "shannonova entropija", "informacijska entropija", "naključnost merjenje", "geslo entropija", "varnost entropija", "analiza entropije"],
        name: { sl: "Entropija besedila", en: "Text Entropy Calculator" },
        desc: { sl: "Izračunaj Shannonovo informacijsko entropijo besedila — merilo naključnosti in predvidljivosti. Višja entropija pomeni bolj naključno besedilo.", en: "Calculate Shannon information entropy of text — a measure of randomness and predictability. Higher entropy means more random text." },
        type: "custom", render: 'renderTextEntropy'
      },
      {
        id: "levenshtein", icon: SVG_ICONS.levenshtein, category: "analysis",
        tags: ["podobnost besed", "razdalja med besedama", "črkovalne napake", "levenshtein distance", "fuzzy matching", "primerjava besed", "levenshtein", "edit distance", "string distance", "fuzzy search", "approximate matching", "spell check distance", "text similarity", "string similarity", "word distance", "damerau levenshtein", "fuzzy compare", "razdalja levenshtein", "uredniški razdalja", "popravki besed", "spell checker", "auto correct", "besede podobnost", "razlika med besedama"],
        name: { sl: "Levenshteinova razdalja", en: "Levenshtein Distance" },
        desc: { sl: "Izmeri, koliko popravkov potrebujete, da pretvorite eno besedilo v drugo. Koristno za preverjanje črkovalnih napak in iskanje podobnih besed.", en: "Measure how many single-character edits are needed to change one text into another. Useful for spell-checking and fuzzy text matching." },
        type: "custom", render: 'renderLevenshtein'
      },
      {
        id: "obfuscate", icon: SVG_ICONS.obfuscate, category: "textfun",
        tags: ["skrij besedilo", "neberljivo", "obfuscate", "zaščiti besedilo", "zmeda znakov", "obfuscate text", "text obfuscator", "hide text", "unreadable text", "cyrillic lookalikes", "homoglyph attack", "visual obfuscation", "text disguise", "anti bot text", "captcha text", "obfuscator", "text scrambler", "unicode obfuscation", "character substitution", "look alike characters", "skrij besedilo unicode", "neberljivo besedilo", "zamenjaj znake", "vizualna zmeda", "zaščita besedila", "obfuskacija besedila"],
        name: { sl: "Zakrij besedilo", en: "Text Obfuscator" },
        desc: { sl: "Zakrij besedilo z zamenjavo črk s podobnimi Unicode znaki (npr. latinke v cirilico). Ustvari vizualno podobno, a strojno neberno besedilo.", en: "Obfuscate text by swapping letters with visually similar Unicode characters (e.g. Latin to Cyrillic lookalikes). Creates visually similar but machine-unreadable text." },
        type: "text-transform", transform: (t) => { const m = { 'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'x': 'х', 's': 'ѕ', 'i': 'і', 'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'K': 'К', 'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х' }; return [...t].map(c => m[c] || c).join(''); }
      },
      {
        id: "number-to-words", icon: SVG_ICONS.num_word, category: "conversion",
        tags: ["številke v besede", "izpiši z besedo", "znesek z besedami", "number to words", "račun z besedami", "number to words converter", "convert numbers to words", "spell out numbers", "numbers in words", "currency to words", "check writing", "cheque amount words", "financial numbers words", "english number words", "number spelling", "write numbers out", "znesek v besedah", "štvilka v besedi", "pretvori številko", "besede za števila", "denarno z besedami", "izpis znaska", "štvilke angleško"],
        name: { sl: "Številke v besede", en: "Numbers to Words" },
        desc: { sl: "Pretvori številke v angleške besede (npr. 42 → forty-two). Koristno za pisanje čekov ali formalnih dokumentov.", en: "Convert numbers to English words (e.g. 42 → forty-two). Useful for writing checks or formal documents." },
        type: "custom", render: 'renderNumberToWords'
      },
      {
        id: "braille", icon: SVG_ICONS.braille_icon, category: "conversion",
        tags: ["brajeva pisava", "slepiška pisava", "braille", "točkovna pisava", "pretvori v brajico", "braille encoder", "braille translator", "text to braille", "braille converter", "unicode braille", "braille unicode", "accessibility braille", "visual impairment", "blind text", "braille generator", "dots text", "braille alphabet", "braille cells", "brajica prevajalnik", "brajica generator", "slepi pisava", "točke pisava", "dostopnost brajica", "pretvori v točke"],
        name: { sl: "Braillova pisava", en: "Braille Encoder" },
        desc: { sl: "Pretvori besedilo v Braillove Unicode znake in obratno. Za ustvarjanje besedil v pisavi za slabovidne.", en: "Convert text to Braille Unicode characters and back. For creating accessible text for visually impaired readers." },
        type: "custom", render: 'renderBraille'
      },

      {
        id: "json-formatter",
        tags: ["json oblika", "beautify", "minify", "validator", "preveri json", "oblikuj json", "razporedi", "json formatter", "json beautify", "json minify", "json validator", "json prettify", "format json", "validate json", "json syntax check", "json tree view", "json editor", "json viewer", "json lint", "json parse", "json stringify", "pretty json", "compact json", "json online", "json tool", "developer json", "json formatiranje", "json preverjanje", "json uredi", "json stisni", "json razporedi"],
        name: { sl: "JSON oblikovalnik in validator", en: "JSON Formatter & Validator" },
        desc: { sl: "Oblikuj (beautify), preveri veljavnost in zgosti (minify) JSON podatke z nastavljivim zamikom.", en: "Format (beautify), validate, and minify JSON data with custom indentation." },
        longDesc: { sl: "Polnoorodno orodje za JSON: (1) Preveri sintakso — označi napako z vrstico in stolpcem, opiše težavo (manjkajoč vejica, napačen narekovaj, itd.). (2) Beautify — razporedi z nastavljivim zamikom (2/4/8 presledkov, tabulator), barva sintakse (ključi, nizi, števila, boolean, null). (3) Minify — odstrani vse nepotrebne presledke in prelome za minimalno velikost (API prenašanje). (4) Kopiraj oblikovan/minimalni JSON v odložišče. (5) Prenesi kot .json datoteko. Vse lokalno, brez strežnika. Uporabno za: розробнике API-jev, konfiguracijske datoteke, depuriranje odzivov strežnika, učenje JSON strukture.", en: "Full-featured JSON tool: (1) Validates syntax — marks error with line/column, describes issue (missing comma, bad quote, etc.). (2) Beautify — formats with configurable indent (2/4/8 spaces, tabs), syntax highlighting (keys, strings, numbers, boolean, null). (3) Minify — strips all whitespace for minimal size (API transfer). (4) Copy formatted/minified JSON to clipboard. (5) Download as .json file. All local, no server. Use for: API developers, config files, debugging server responses, learning JSON structure." },
        category: "formatting",
        icon: SVG_ICONS.json_fmt,
        type: "custom",
        featured: true,
        render: 'renderJsonFormatter'
      },
{
        id: "html-entities",
        tags: ["entitete", "&", "posebni znaki v html", "entities", "escape znake", "šumniki v html", "html entities", "html entity encoder", "html entity decoder", "encode html entities", "decode html entities", "special characters html", "html escape", "html unescape", "named entities", "numeric entities", "character references", "html special chars", "ampersand encoding", "lt gt encoding", "euro symbol html", "html entity converter", "entitete kodiranje", "html entitete dekodiranje", "posebni znaki html", "kodiraj html", "dekodiraj html"],
        name: { sl: "HTML entitete", en: "HTML Entities Encoder / Decoder" },
        desc: { sl: "Pretvori posebne znake v imenske ali numerične HTML entitete (&, <, &euro;) in obratno.", en: "Convert special characters to named or numeric HTML entities (&, <, &euro;) and vice versa." },
        category: "conversion",
        icon: SVG_ICONS.html_entity,
        type: "custom",
        render: 'renderHtmlEntities'
      },
      {
        id: "markdown-preview",
        tags: ["markdown", "md to html", "predogled", "oblikuj markdown", "pretvori v html", "živi predogled", "markdown preview", "markdown to html", "markdown viewer", "markdown renderer", "live markdown", "markdown editor", "md preview", "markdown converter", "github markdown", "commonmark", "markdown parser", "markdown live preview", "markdown online", "markdown tool", "md html converter", "markdown v html", "predogled markdowna", "živi markdown", "pretvori md", "markdown orodje"],
        name: { sl: "Markdown v HTML & Predogled", en: "Markdown to HTML & Live Preview" },
        desc: { sl: "Pretvori Markdown kodo v HTML z živim vizualnim predogledom in kopiranjem kode.", en: "Convert Markdown syntax to clean HTML with live visual rendering and code copying." },
        longDesc: { sl: "Dvopogledni Markdown urejevalnik: levo pišete Markdown (z ogrodjem: naslovi #, seznami -, 1., kode ` ``` `, tabele, povezavе, slike,blockquote, horizontal rule), desno takoj vidite HTML rezultat. Podpira: GitHub Flavored Markdown (tabele, task lists - [ ]), avtomatsko povezovanje URL-jev, varno renderiranje (brez XSS). Gumbi: kopiraj HTML kodo, prenesi .html datoteko, počisti vnos. Uporabno za: pisanje README.md, blog objav, dokumentacijo, GitHub issues, Stack Overflow odzive, statične strani. Deluje brez povezave — Markdown parser (marked.js) teče v brskalniku.", en: "Split-pane Markdown editor: write Markdown left (with cheatsheet: headings #, lists -, 1., code ```, tables, links, images, blockquote, hr), see HTML rendered right instantly. Supports: GitHub Flavored Markdown (tables, task lists - [ ]), auto-linking URLs, safe rendering (no XSS). Buttons: copy HTML code, download .html file, clear input. Use for: writing README.md, blog posts, documentation, GitHub issues, Stack Overflow answers, static pages. Works offline — Markdown parser (marked.js) runs in browser." },
        category: "formatting",
        icon: SVG_ICONS.md_preview,
        type: "custom",
        featured: true,
        render: 'renderMarkdownPreview'
      },
      {
        id: "pattern-extractor",
        tags: ["telefonske številke", "hashtagi", "omembe", "ip naslovi", "extract phone", "poišči hashtage", "pattern extractor", "extract patterns", "phone number extractor", "hashtag extractor", "mention extractor", "ip address extractor", "regex extractor", "extract hashtags", "extract mentions", "extract ips", "social media extractor", "contact extractor", "data extraction", "text mining", "telefonske stevilke", "hashtagi iz besedila", "omembe iz besedila", "ip naslovi iz besedila", "regex ekstrakcija", "poišči vzorce", "izlušči vzorce"],
        name: { sl: "Izvleček telefonov in hashtagov", en: "Phone, Hashtag & Mention Extractor" },
        desc: { sl: "Poišči in izvozi telefonske številke, hashtage (#oznake), omembe (@uporabniki) ter IP naslove.", en: "Extract phone numbers, hashtags (#tags), mentions (@users), and IP addresses from text." },
        category: "analysis",
        icon: SVG_ICONS.patterns_icon,
        type: "custom",
        render: 'renderPatternExtractor'
      },
      {
        id: "text-diff",
        tags: ["diff", "razlika", "primerjava besedil", "text diff", "compare text", "razlike v besedilu", "line diff", "spremembe", "compare", "primerjaj", "razlikuj", "diff tool", "text comparison", "verzije", "compare versions"],
        name: { sl: "Primerjava besedil (Diff)", en: "Text Diff" },
        desc: { sl: "Primerjaj dve besedili po vrsticah in pokaži dodane, odstranjene in nespremenjene vrstice.", en: "Compare two texts line by line and show added, removed, and unchanged lines." },
        category: "analysis",
        icon: SVG_ICONS.patterns_icon,
        type: "custom",
        render: 'renderDiff'
      },
      {
        id: "checksum",
        tags: ["sha256", "sha1", "sha512", "crc32", "hash", "zgoščevanje", "checksum", "preverba celovitosti", "file hash", "sha-256", "text hash", "varnost", "integriteta", "hash generator", "izračun hash", "kriptografski hash", "sha256 online", "crc32 calculator", "preveri hash"],
        name: { sl: "Zgoščevanje (SHA / CRC32)" },
        desc: { sl: "Izračunaj kriptografski hash (SHA-1, SHA-256, SHA-512) ali CRC32 za preverjanje celovitosti besedila." },
        category: "generators",
        icon: SVG_ICONS.patterns_icon,
        type: "custom",
        render: 'renderChecksum'
      },
      {
        id: "url-parser",
        tags: ["razčleni url", "query parametri", "domena", "parse url", "razbij povezavo", "get parametri", "url parser", "parse url online", "url components", "query string parser", "url analyzer", "url breakdown", "parse query parameters", "url decomposition", "protocol domain path", "url query params", "get parameters", "url structure", "url parser tool", "razcleni url", "url parametri", "query string", "url deli", "analiza url", "parse povezavo"],
        name: { sl: "Razčlenjevalnik URL & parametrov", en: "URL & Query String Parser" },
        desc: { sl: "Razčleni URL naslov na protokol, domeno, pot in pregledno tabelo query parametrov.", en: "Parse URL into protocol, domain, path, and interactive table of query parameters." },
        category: "analysis",
        icon: SVG_ICONS.url_parse,
        type: "custom",
        render: 'renderUrlParser',
        longDesc: { sl: "Razčleni URL naslov na sestavine: protokol (https), domena, pot, poizvedbeni niz (query string) in fragment. Prikaže pregledno tabelo parametrov z možnostjo kopiranja posameznih vrednosti. Uporabno za analizo spletnih povezav, odpravljanje napak API klicev in razumevanje strukture URL-jev.", en: "Parse a URL into its components: protocol, domain, path, query string, and fragment. Shows an interactive table of query parameters with copy buttons. Useful for analyzing web links, debugging API calls, and understanding URL structure." }
      },
      {
        id: "jwt-decoder",
        tags: ["jwt", "žeton", "token", "dekodiraj jwt", "avtentikacija", "preveri žeton", "jwt decoder", "decode jwt", "jwt token", "jwt parser", "jwt viewer", "jwt validator", "json web token", "jwt header", "jwt payload", "jwt signature", "jwt expiry", "authentication token", "bearer token", "api authentication", "token decoder", "verify jwt", "jwt debug", "jwt analizator", "dekodiraj zeton", "preveri jwt", "avtentikacija jwt", "varnostni zeton", "jwt orodje"],
        name: { sl: "JWT dekodirnik", en: "JWT Token Decoder" },
        desc: { sl: "Varno in lokalno dekodiraj JWT žeton (glavo, vsebino in čas poteka veljavnosti) brez pošiljanja na strežnik.", en: "Securely and locally decode JWT tokens (header, payload, expiry date) without sending to server." },
        category: "security",
        icon: SVG_ICONS.jwt_icon,
        type: "custom",
        render: 'renderJwtDecoder'
      },
      {
        id: "code-points", icon: SVG_ICONS.code_pt, category: "conversion",
        tags: ["kodne točke", "u+", "unicode pretvorba", "code points", "znaki v številke", "code points converter", "unicode code points", "character code points", "text to code points", "code points to text", "unicode scalar value", "utf-16 code units", "utf-8 bytes", "code point lookup", "u+ notation", "unicode escape", "javascript escape", "codepoints", "kodne tocke", "unicode kodne tocke", "pretvori v kodne tocke", "znaki v code points", "unicode numbers", "char codes"],
        name: { sl: "Kodne točke", en: "Unicode Code Points" },
        desc: { sl: "Pretvori besedilo v Unicode kodne točke (npr. A → U+0041) in obratno. Koristno za razvijalce in raziskovalce znakov.", en: "Convert text to Unicode code points (e.g. A → U+0041) and back. Useful for developers and character encoding research." },
        type: "custom", render: 'renderCodePoints'
      },
      {
        id: "text-scrambler", icon: SVG_ICONS.shuffle, category: "textfun",
        tags: ["pomešaj črke", "premešaj besede", "scramble", "anagram generator", "naključne črke", "text scrambler", "scramble letters", "word scramble", "anagram maker", "letter mixer", "scramble text", "randomize letters", "word jumble", "anagram solver", "typoglycemia", "reading test", "scramble words", "pomešaj besedo", "premešaj črke v besedi", "anagram generator", "črke mešalnik", "beseda mešalnik", "branje test", "berljivost test"],
        name: { sl: "Premešaj črke", en: "Letter Scrambler" },
        desc: { sl: "Naključno premešaj črke znotraj vsake besede. Za zabavo ali testiranje branja besedil.", en: "Randomly scramble letters inside each word. For fun or testing text readability." },
        type: "text-transform", transform: (t) => t.replace(/([\p{L}\p{N}])([\p{L}\p{N}]{2,})([\p{L}\p{N}])/gu, (m, f, mid, l) => { const a = [...mid]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return f + a.join('') + l; })
      },
      {
        id: "datetime-converter",
        tags: ["unix čas", "timestamp", "iso 8601", "pretvori datum", "časovni žig", "epoch converter", "datetime converter", "unix timestamp", "epoch time", "iso date", "date converter", "time converter", "timestamp to date", "date to timestamp", "milliseconds to date", "seconds to date", "utc converter", "local time converter", "relative time", "time ago", "unix epoch", "pretvornik časa", "časovni žig pretvornik", "datum v timestamp", "timestamp v datum", "iso 8601 pretvornik", "epoch pretvornik", "relativni čas", "časovno razliko"],
        name: { sl: "Pretvornik datuma in časa", en: "Date & Timestamp Converter" },
        desc: { sl: "Pretvori med Unix časovnimi žigi (sekunde/ms), ISO 8601, UTC ter lokalnimi formati datuma in časa z relativnim časom.", en: "Convert between Unix timestamps (seconds/ms), ISO 8601, UTC, and local date/time formats with relative time." },
        longDesc: { sl: "Univerzalni pretvornik med vsemi pogostimi formati časa: Unix epoch (sekunde od 1.1.1970), Unix ms (milisekunde), ISO 8601 (2024-01-15T14:30:00Z), RFC 2822, lokalni format brskalnika, UTC, in relativni čas (pred 5 minutami, včeraj, itd.). Vnesite vrednost v poljubno polje — ostala se takoj izračunata. Podpira: časovne cone (lokalno, UTC, nastavljiva), milisekundno natančnost, dvo-smerno pretvorbo. Uporabno za: razvoj (logi, bazo podatkov, API), analizo dogodkov, načrtovanje (razlika med datumoma), depuriranje (kako star je ta timestamp?). Deluje z `Date` objektom brskalnika — brez strežnika.", en: "Universal converter between all common time formats: Unix epoch (seconds since 1970-01-01), Unix ms, ISO 8601 (2024-01-15T14:30:00Z), RFC 2822, browser locale, UTC, and relative time (5 min ago, yesterday, etc.). Enter value in any field — others update instantly. Supports: timezones (local, UTC, custom), millisecond precision, bidirectional conversion. Use for: development (logs, databases, APIs), event analysis, planning (date differences), debugging (how old is this timestamp?). Runs on browser `Date` object — no server." },
        category: "conversion",
        icon: SVG_ICONS.calendar,
        type: "custom",
        featured: true,
        render: 'renderDateTimeConverter'
      },
      {
        id: "color-converter",
        tags: ["barve", "hex v rgb", "hsl", "cmyk", "barvna koda", "paleta", "color picker", "color converter", "hex to rgb", "rgb to hex", "hsl to rgb", "cmyk to rgb", "color format converter", "color palette", "shades generator", "tints generator", "color contrast", "accessibility colors", "wcag contrast", "color picker tool", "hex color", "rgb color", "hsl color", "cmyk color", "color codes", "barvni pretvornik", "hex rgb pretvornik", "barvna paleta", "odtenki barv", "kontrast barv", "dostopnost barv", "izbirnik barv", "kode barv"],
        name: { sl: "Pretvornik barv & Paleta", en: "Color Code Converter & Palette" },
        desc: { sl: "Pretvori barvne kode med HEX, RGB, RGBA, HSL in CMYK z interaktivnim barvnim izbirnikom, predogledom kontrasta ter paleto odtenkov.", en: "Convert color codes between HEX, RGB, RGBA, HSL, and CMYK with interactive color picker, contrast check, and shade palette." },
        longDesc: { sl: "Vsevsebovati pretvornik barv z: (1) Dvosmerno pretvorbo med HEX (#ff6b35), RGB (255,107,53), RGBA, HSL (15°,100%,60%), CMYK (0,58,79,0) — vnesite v poljubno, ostala se posodobijo. (2) Interaktivnim color picker (HTML5 `<input type=color>`). (3) Preverjanjem kontrasta (WCAG 2.1 AA/AAA) za besedilo/ozadje — prikaže razmerje in status. (4) Paleto odtenkov (shades) in svetlin (tints) — 10 stopenj vsak. (5) Kopiranje vrednosti v en klik. (6) Prenos CSS promenljivih (`--color-primary: #ff6b35;`). Uporabno za: UI/UX design, CSS razvoj, dostopnost (WCAG), brand style guide, hitro preverjanje kontrasta. Vse v brskalniku, brez strežnika.", en: "All-in-one color converter with: (1) Bidirectional conversion between HEX (#ff6b35), RGB (255,107,53), RGBA, HSL (15°,100%,60%), CMYK (0,58,79,0) — enter any, others update. (2) Interactive color picker (HTML5 `<input type=color>`). (3) Contrast checker (WCAG 2.1 AA/AAA) for text/background — shows ratio and pass/fail. (4) Shades and tints palette — 10 steps each. (5) One-click copy values. (6) Export CSS custom properties (`--color-primary: #ff6b35;`). Use for: UI/UX design, CSS development, accessibility (WCAG), brand style guides, quick contrast checks. All in browser, no server." },
        category: "conversion",
        icon: SVG_ICONS.palette,
        type: "custom",
        render: 'renderColorConverter'
      },
      {
        id: "table-to-markdown",
        tags: ["tabela", "excel v markdown", "google sheets", "csv tabela", "html tabela", "prilepi iz excela", "table to markdown", "excel to markdown", "csv to markdown", "html to markdown", "markdown table generator", "table converter", "spreadsheet to markdown", "tsv to markdown", "data to markdown", "markdown table", "table formatter", "excel markdown", "sheets markdown", "tabela v md", "excel v md", "csv v markdown", "html v markdown", "markdown tabela generator", "pretvori tabelo", "izvoz v markdown", "tabela orodje"],
        name: { sl: "Tabela v Markdown & HTML", en: "Table to Markdown & HTML" },
        desc: { sl: "Pretvori podatke iz Excela, Googlovih tabel, CSV ali TSV v lepo poravnano Markdown tabelo ali čisto HTML tabelo.", en: "Convert data from Excel, Google Sheets, CSV, or TSV into a clean Markdown table or HTML table." },
        category: "formatting",
        icon: SVG_ICONS.table_icon,
        type: "custom",
        render: 'renderTableConverter',
        longDesc: { sl: "Pretvori tabelarne podatke (iz Excel, Google Sheets, CSV, TSV) v lepo poravnane Markdown tabele ali čiste HTML tabele. Samodejno zazna ločila, obravnava prazne celice in ohrani zaglavja. Idealno za dokumentacijo, README datoteke in spletno objavljanje podatkov.", en: "Convert tabular data from Excel, Google Sheets, CSV, or TSV into clean Markdown tables or HTML tables. Auto-detects delimiters, handles empty cells, and preserves headers. Ideal for documentation, README files, and web publishing." }
      },


      // Generated compressed tools to save space
      ...[
        ['duplicate-words-in-text', SVG_ICONS.repeat, 'textfun', 'Podvoji vsako besedo', 'Duplicate Each Word', 'Podvoji vsako posamezno besedo v besedilu z izbranim ločilom.', 'Duplicates every single word with a selected separator.', [{ id: 'sep', type: 'select', label: { en: 'Separator', sl: 'Ločilo' }, choices: [{ value: ' ', label: { en: 'Space', sl: 'Presledek' } }, { value: ',', label: { en: 'Comma', sl: 'Vejica' } }, { value: '-', label: { en: 'Dash', sl: 'Crtica' } }], default: ' ' }], (t, opts) => t.split(/(\s+)/).map(w => /\s+/.test(w) ? w : w + opts.sep + w).join('')],
        ['replace-spaces-in-text', SVG_ICONS.flip, 'conversion', 'Zamenjaj presledke', 'Replace Spaces', 'Zamenja vse presledke in tabulatorje z izbranim ločilom (npr. vejico ali črtico).', 'Replaces all spaces and tabs in text with a chosen character.', [{ id: 'sep', type: 'select', label: { en: 'Replacement', sl: 'Zamenjava' }, choices: [{ value: '-', label: { en: 'Dash (-)', sl: 'Črtica (-)' } }, { value: '_', label: { en: 'Underscore (_)', sl: 'Podčrtaj (_)' } }, { value: ',', label: { en: 'Comma (,)', sl: 'Vejica (,)' } }, { value: '', label: { en: 'None (Remove)', sl: 'Brez (Odstrani)' } }], default: '-' }], (t, opts) => t.replace(/[ \t]/g, opts.sep)],
        ['replace-line-breaks-in-text', SVG_ICONS.hash_icon, 'conversion', 'Zamenjaj prelome vrstic', 'Replace Line Breaks', 'Zamenja vse prelome vrstic z izbranim ločilom.', 'Replaces newline characters with a specified separator.', [{ id: 'sep', type: 'select', label: { en: 'Separator', sl: 'Ločilo' }, choices: [{ value: ' ', label: { en: 'Space', sl: 'Presledek' } }, { value: ', ', label: { en: 'Comma + Space', sl: 'Vejica in presledek' } }, { value: '; ', label: { en: 'Semicolon', sl: 'Podpičje' } }], default: ' ' }], (t, opts) => t.replace(/\r?\n/g, opts.sep)],
        ['remove-emojis', SVG_ICONS.remove_punct, 'editing', 'Odstrani emojije', 'Remove Emojis', 'Odstrani vse emotikone in emoji simbole iz besedila.', 'Removes all emoji characters and symbols from the text.', [], (t, opts) => t.replace(/\p{Extended_Pictographic}/gu, '')],
        ['remove-line-numbers', SVG_ICONS.tiny, 'formatting', 'Odstrani oštevilčenje in alineje', 'Remove Line Numbers & Bullets', 'Odstrani vodilne številke (1.), alineje (-, *, •) ali črke (a)) na začetku vrstic.', 'Removes leading numbers, bullets, or letters at the start of lines.', [
          { id: 'mode', type: 'select', label: { en: 'Remove', sl: 'Odstrani' }, choices: [
            { value: 'all', label: { en: 'Numbers & Bullets', sl: 'Številke in alineje' } },
            { value: 'numbers', label: { en: 'Numbers Only (1., 1))', sl: 'Samo številke (1., 1))' } },
            { value: 'bullets', label: { en: 'Bullets Only (-, *, •)', sl: 'Samo alineje (-, *, •)' } },
            { value: 'letters', label: { en: 'Letters Only (a), A.)', sl: 'Samo črke (a), A.)' } }
          ], default: 'all' }
        ], (t, opts) => {
          const m = (opts && opts.mode) || 'all';
          let res = t;
          if (m === 'all' || m === 'numbers') res = res.replace(/^\s*\d+[\.\)]\s*/gm, '');
          if (m === 'all' || m === 'bullets') res = res.replace(/^\s*[-*•–—]\s+/gm, '');
          if (m === 'all' || m === 'letters') res = res.replace(/^\s*[a-zA-Z][\.\)]\s*/gm, '');
          return res;
        }],
        ['add-quotes-to-lines', SVG_ICONS.unicode, 'formatting', 'Dodaj narekovaje vrsticam', 'Add Quotes to Lines', 'Obdaja vsako vrstico z izbranimi narekovaji ali oklepaji.', 'Encloses each line in selected quotation marks or brackets.', [
          {
            id: 'style', type: 'select', label: { en: 'Quote Style', sl: 'Slog narekovajev' }, choices: [
              { value: '"', label: { en: 'Double Quotes (") ', sl: 'Dvojni narekovaji (")' } },
              { value: "'", label: { en: "Single Quotes (')", sl: "Enojni narekovaji (')" } },
              { value: '„"', label: { en: 'Slovenian („")', sl: 'Slovenski („")' } },
              { value: '[]', label: { en: 'Square Brackets ([])', sl: 'Oglati oklepaji ([])' } }
            ], default: '"'
          }
        ], (t, opts) => t.split('\n').map(l => {
          if (!l) return l;
          if (opts.style === '„"') return '„' + l + '"';
          if (opts.style === '[]') return '[' + l + ']';
          return opts.style + l + opts.style;
        }).join('\n')],
        ['spaces-to-newlines', SVG_ICONS.wrap, 'conversion', 'Presledki v nove vrstice', 'Convert Spaces to Newlines', 'Zamenja vse presledke s prelomom vrstice (vsaka beseda v svojo vrstico).', 'Replaces all spaces with newlines (each word on a new line).', [], (t, opts) => t.replace(/[ \t]+/g, '\n')],
        ['newlines-to-spaces', SVG_ICONS.tiny, 'conversion', 'Nove vrstice v presledke', 'Convert Newlines to Spaces', 'Združi vse vrstice v eno samo z presledki med njimi.', 'Joins all lines into a single line separated by spaces.', [], (t, opts) => t.replace(/\r?\n/g, ' ')],
        ['comma-to-newline', SVG_ICONS.swap, 'conversion', 'Vejice v nove vrstice', 'Convert Commas to Newlines', 'Zamenja vse vejice s prelomom vrstice.', 'Replaces all commas with newlines.', [], (t, opts) => t.replace(/,/g, '\n')],
        ['newline-to-comma', SVG_ICONS.swap, 'conversion', 'Nove vrstice v vejice', 'Convert Newlines to Commas', 'Združi vrstice v seznam ločen z vejicami.', 'Joins lines into a comma-separated list.', [], (t, opts) => t.split(/\r?\n/).filter(Boolean).join(', ')]
      ].map(t => ({
        id: t[0], icon: t[1], category: t[2],
        name: { sl: t[3], en: t[4] }, desc: { sl: t[5], en: t[6] },
        ...(COMPACT_TAGS[t[0]] ? { tags: COMPACT_TAGS[t[0]] } : {}),
        type: 'text-transform', options: t[7], transform: t[8]
      })),

      {
        id: "base-converter", icon: SVG_ICONS.hex, category: "conversion",
        tags: ["številski sistemi", "binarni", "hex", "oktalni", "decimalni", "base converter", "binary", "hexadecimal", "octal", "number base", "pretvornik števil", "pretvori število"],
        name: { sl: "Pretvornik številskih sistemov", en: "Number Base Converter" },
        desc: { sl: "Pretvori število med binarnim, oktalnim, decimalnim in heksadecimalnim zapisom. Vnesite število in izberite vhodno bazo.", en: "Convert a number between binary, octal, decimal and hexadecimal. Enter a number and pick the input base." },
        type: "text-transform",
        options: [ { id: "base", type: "select", label: { sl: "Vhodna baza", en: "Input base" }, choices: [ { value: "2", label: { sl: "Binarno (2)", en: "Binary (2)" } }, { value: "8", label: { sl: "Oktalno (8)", en: "Octal (8)" } }, { value: "10", label: { sl: "Decimalno (10)", en: "Decimal (10)" } }, { value: "16", label: { sl: "Heks (16)", en: "Hex (16)" } } ], default: "10" } ],
        transform(t, opts) {
          const base = parseInt(opts && opts.base, 10) || 10;
          const tok = (t || "").trim().split(/\s+/)[0];
          if (!tok) return (currentLang === 'sl' ? "Vnesite število." : "Enter a number.");
          let n; try { n = parseInt(tok, base); } catch (e) { n = NaN; }
          if (isNaN(n)) return (currentLang === 'sl' ? "Ni veljavnega števila v izbrani bazi." : "Not a valid number in the selected base.");
          return `DEC: ${n}\nBIN: ${n.toString(2)}\nOCT: ${n.toString(8)}\nHEX: ${n.toString(16).toUpperCase()}`;
        }
      },
      {
        id: "unicode-normalize", icon: SVG_ICONS.unicode, category: "formatting",
        tags: ["unicode", "normalizacija", "NFC", "NFD", "NFKC", "NFKD", "normalize text", "diakritika", "združi naglase", "razcepi naglase"],
        name: { sl: "Unicode normalizacija", en: "Unicode Normalization" },
        desc: { sl: "Normaliziraj besedilo v obliko NFC, NFD, NFKC ali NFKD (sestavi/razcepi naglasne znake).", en: "Normalize text to NFC, NFD, NFKC or NFKD (compose/decompose diacritics)." },
        type: "text-transform",
        options: [ { id: "form", type: "select", label: { sl: "Oblika", en: "Form" }, choices: [ { value: "NFC", label: { sl: "NFC (sestavljeno)", en: "NFC (composed)" } }, { value: "NFD", label: { sl: "NFD (razcepljeno)", en: "NFD (decomposed)" } }, { value: "NFKC", label: { sl: "NFKC", en: "NFKC" } }, { value: "NFKD", label: { sl: "NFKD", en: "NFKD" } } ], default: "NFC" } ],
        transform(t, opts) {
          try { return (t || "").normalize((opts && opts.form) || "NFC"); }
          catch (e) { return (currentLang === 'sl' ? "Napaka normalizacije." : "Normalization error."); }
        }
      },
      {
        id: "roman-numerals", icon: SVG_ICONS.num_word, category: "conversion",
        tags: ["rimske številke", "roman numerals", "rimska števila", "convert roman", "števila v rimske", "rimske v števila"],
        name: { sl: "Rimske številke", en: "Roman Numerals" },
        desc: { sl: "Pretvori arabsko število v rimske številke ali obratno.", en: "Convert an Arabic number to Roman numerals or vice versa." },
        type: "text-transform",
        options: [ { id: "dir", type: "select", label: { sl: "Smer", en: "Direction" }, choices: [ { value: "to", label: { sl: "V rimske", en: "To Roman" } }, { value: "from", label: { sl: "Iz rimskih", en: "From Roman" } } ], default: "to" } ],
        transform(t, opts) {
          const dir = (opts && opts.dir) || "to";
          if (dir === "from") {
            const s = (t || "").trim().toUpperCase().replace(/[^IVXLCDM]/g, "");
            if (!s) return (currentLang === 'sl' ? "Vnesite rimsko število." : "Enter a Roman numeral.");
            const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
            let n = 0;
            for (let i = 0; i < s.length; i++) { const cur = map[s[i]], nxt = map[s[i+1]]; if (nxt > cur) n -= cur; else n += cur; }
            return String(n);
          }
          const num = parseInt((t || "").replace(/[^\d]/g, ""), 10);
          if (isNaN(num) || num <= 0 || num > 3999) return (currentLang === 'sl' ? "Vnesite število (1–3999)." : "Enter a number (1–3999).");
          const vals = [ [1000,"M"], [900,"CM"], [500,"D"], [400,"CD"], [100,"C"], [90,"XC"], [50,"L"], [40,"XL"], [10,"X"], [9,"IX"], [5,"V"], [4,"IV"], [1,"I"] ];
          let r = "", n = num;
          for (const [v, sym] of vals) { while (n >= v) { r += sym; n -= v; } }
          return r;
        }
      },
      {
        id: "affine-cipher", icon: SVG_ICONS.key, category: "security",
        tags: ["afina šifra", "affine cipher", "šifriranje", "encrypt", "kriptografija", "caesar variation", "substitucija"],
        name: { sl: "Afina šifra", en: "Affine Cipher" },
        desc: { sl: "Šifriraj besedilo z afino šifro E(x) = (a·x + b) mod 26. Izberi a (tuj s 26) in b.", en: "Encrypt text with the affine cipher E(x) = (a·x + b) mod 26. Pick a (coprime with 26) and b." },
        type: "text-transform",
        options: [
          { id: "a", type: "select", label: { sl: "a (ključ)", en: "a (key)" }, choices: [1,3,5,7,9,11,15,17,19,21,23,25].map(v => ({ value: String(v), label: { sl: String(v), en: String(v) } })), default: "5" },
          { id: "b", type: "select", label: { sl: "b (premik)", en: "b (shift)" }, choices: Array.from({length:26},(_,i)=>i).map(v => ({ value: String(v), label: { sl: String(v), en: String(v) } })), default: "8" }
        ],
        transform(t, opts) {
          const a = parseInt((opts && opts.a) || "5", 10), b = parseInt((opts && opts.b) || "8", 10);
          const A = ((a % 26) + 26) % 26, B = ((b % 26) + 26) % 26;
          return (t || "").replace(/[a-zA-Z]/g, c => {
            const code = c.charCodeAt(0);
            const isUp = code >= 65 && code <= 90;
            const x = code - (isUp ? 65 : 97);
            const y = (((A * x + B) % 26) + 26) % 26;
            return String.fromCharCode(y + (isUp ? 65 : 97));
          });
        }
      },
      {
        id: "baconian-cipher", icon: SVG_ICONS.key, category: "security",
        tags: ["bacon", "baconova šifra", "baconian cipher", "steganografija", "šifra", "a/b koda"],
        name: { sl: "Baconova šifra", en: "Baconian Cipher" },
        desc: { sl: "Kodiraj črke v 5-bitni Baconov zapis (a/b). Podpira kodiranje in dekodiranje.", en: "Encode letters into 5-bit Bacon code (a/b). Supports encode and decode." },
        type: "text-transform",
        options: [ { id: "dir", type: "select", label: { sl: "Smer", en: "Direction" }, choices: [ { value: "enc", label: { sl: "Kodiraj", en: "Encode" } }, { value: "dec", label: { sl: "Dekodiraj", en: "Decode" } } ], default: "enc" } ],
        transform(t, opts) {
          const order = "ABCDEFGHIKLMNOPQRSTUWXYZ";
          const bacon = {};
          order.split('').forEach((ch, i) => { bacon[ch] = i.toString(2).padStart(5,'0').replace(/0/g,'a').replace(/1/g,'b'); });
          bacon['J'] = bacon['I']; bacon['V'] = bacon['U'];
          const dir = (opts && opts.dir) || "enc";
          if (dir === "enc") {
            const letters = (t || "").toUpperCase().replace(/[^A-Z]/g, "");
            if (!letters) return (currentLang === 'sl' ? "Vnesite besedilo." : "Enter text.");
            return letters.split('').map(c => bacon[c] || '').join(' ');
          }
          const clean = (t || "").toLowerCase().replace(/[^ab]/g, "");
          if (clean.length % 5 !== 0) return (currentLang === 'sl' ? "Vnos mora biti večkratnik 5 znakov (a/b)." : "Input must be a multiple of 5 a/b chars.");
          let out = "";
          for (let i = 0; i < clean.length; i += 5) {
            const bits = clean.substr(i,5).replace(/a/g,'0').replace(/b/g,'1');
            const idx = parseInt(bits, 2);
            out += order[idx] || "";
          }
          return out;
        }
      },
      {
        id: "csv-json", icon: SVG_ICONS.csv, category: "conversion",
        tags: ["csv", "json", "csv v json", "csv to json", "pretvori csv", "data convert", "podatki"],
        name: { sl: "CSV ↔ JSON", en: "CSV ↔ JSON" },
        desc: { sl: "Pretvori CSV (s glavo) v JSON ali JSON v CSV.", en: "Convert CSV (with header) to JSON, or JSON to CSV." },
        type: "text-transform",
        options: [ { id: "dir", type: "select", label: { sl: "Smer", en: "Direction" }, choices: [ { value: "c2j", label: { sl: "CSV → JSON", en: "CSV → JSON" } }, { value: "j2c", label: { sl: "JSON → CSV", en: "JSON → CSV" } } ], default: "c2j" } ],
        transform(t, opts) {
          const dir = (opts && opts.dir) || "c2j";
          if (dir === "c2j") {
            try {
              const lines = (t || "").split(/\r?\n/).filter(l => l.length > 0);
              if (!lines.length) return (currentLang === 'sl' ? "Vnesite CSV." : "Enter CSV.");
              const parse = (s) => {
                const out = []; let cur = "", q = false;
                for (let i = 0; i < s.length; i++) {
                  const c = s[i];
                  if (q) { if (c === '"') { if (s[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
                  else { if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ""; } else cur += c; }
                }
                out.push(cur); return out;
              };
              const headers = parse(lines[0]).map(h => h.trim());
              const rows = lines.slice(1).map(l => parse(l));
              const arr = rows.map(r => { const o = {}; headers.forEach((h,i) => o[h] = r[i] !== undefined ? r[i] : ""); return o; });
              return JSON.stringify(arr, null, 2);
            } catch (e) { return (currentLang === 'sl' ? "Napaka pri razčlenjevanju CSV." : "CSV parse error."); }
          }
          try {
            const data = JSON.parse(t);
            if (!Array.isArray(data) || !data.length) return (currentLang === 'sl' ? "JSON mora biti seznam objektov." : "JSON must be an array of objects.");
            const headers = Object.keys(data[0]);
            const esc = (v) => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; };
            return [headers.join(",")].concat(data.map(o => headers.map(h => esc(o[h])).join(","))).join("\n");
          } catch (e) { return (currentLang === 'sl' ? "Napaka pri razčlenjevanju JSON." : "JSON parse error."); }
        }
      },
      {
        id: "yaml-json", icon: SVG_ICONS.json_file, category: "conversion",
        tags: ["yaml", "json", "yaml v json", "yaml to json", "pretvori yaml", "podatki", "konfiguracija"],
        name: { sl: "YAML ↔ JSON", en: "YAML ↔ JSON" },
        desc: { sl: "Pretvori YAML v JSON ali JSON v YAML (osnovna podpora za ugnezdene mape in sezname).", en: "Convert YAML to JSON or JSON to YAML (basic support for nested maps and lists)." },
        type: "text-transform",
        options: [ { id: "dir", type: "select", label: { sl: "Smer", en: "Direction" }, choices: [ { value: "y2j", label: { sl: "YAML → JSON", en: "YAML → JSON" } }, { value: "j2y", label: { sl: "JSON → YAML", en: "JSON → YAML" } } ], default: "y2j" } ],
        transform(t, opts) {
          const dir = (opts && opts.dir) || "y2j";
          const scalarYaml = (v) => {
            if (v === null || v === undefined) return 'null';
            if (typeof v === 'boolean') return v ? 'true' : 'false';
            if (typeof v === 'number') return String(v);
            const s = String(v);
            return /[:#\-?\[\]{}&*!|>'"%@`,\n]/.test(s) || s === '' ? '"' + s.replace(/"/g,'\\"') + '"' : s;
          };
          const toYaml = (val, indent) => {
            indent = indent || 0; const pad = '  '.repeat(indent);
            if (Array.isArray(val)) {
              if (!val.length) return '[]';
              return val.map(v => v && typeof v === 'object' ? pad + '- ' + toYaml(v, indent+1).trimStart() : pad + '- ' + scalarYaml(v)).join('\n');
            }
            if (val && typeof val === 'object') {
              const keys = Object.keys(val);
              if (!keys.length) return '{}';
              return keys.map(k => { const v = val[k]; if (v && typeof v === 'object') return pad + k + ':\n' + toYaml(v, indent+1); return pad + k + ': ' + scalarYaml(v); }).join('\n');
            }
            return scalarYaml(val);
          };
          if (dir === "j2y") {
            try { const data = JSON.parse(t); return toYaml(data, 0); }
            catch (e) { return (currentLang === 'sl' ? "Napaka pri razčlenjevanju JSON." : "JSON parse error."); }
          }
          try {
            const raw = (t || "").split(/\r?\n/).map(l => l.replace(/\t/g,'  '));
            const items = [];
            for (const line of raw) {
              if (!line.trim() || line.trim().startsWith('#')) continue;
              const indent = line.length - line.trimStart().length;
              let content = line.trim().replace(/ #.*$/, '');
              items.push({ indent, content });
            }
            const scalar = (s) => {
              s = s.trim();
              if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1,-1);
              if (s === 'true') return true; if (s === 'false') return false;
              if (s === 'null' || s === '~') return null;
              if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
              return s;
            };
            let pos = 0;
            const parseBlock = (indent) => {
              if (!items[pos]) return null;
              if (items[pos].content.startsWith('- ')) {
                const arr = [];
                while (pos < items.length && items[pos].indent === indent && items[pos].content.startsWith('- ')) {
                  let val = items[pos].content.slice(2).trim(); pos++;
                  if (val === '') { arr.push(parseBlock(items[pos].indent)); }
                  else if (val.includes(':') && !/^["'\d[{]/.test(val)) { items.splice(pos,0,{indent: indent+2, content: val}); arr.push(parseBlock(indent+2)); }
                  else arr.push(scalar(val));
                }
                return arr;
              }
              const obj = {};
              while (pos < items.length && items[pos].indent === indent && !items[pos].content.startsWith('- ')) {
                const kv = items[pos].content; const idx = kv.indexOf(':');
                if (idx === -1) { pos++; continue; }
                const key = kv.slice(0, idx).trim().replace(/^["']|["']$/g,'');
                let rest = kv.slice(idx+1).trim(); pos++;
                if (rest === '') {
                  if (pos < items.length && items[pos].indent > indent) obj[key] = parseBlock(items[pos].indent);
                  else obj[key] = null;
                } else if (rest.startsWith('- ')) {
                  const arr = [scalar(rest.slice(2).trim())];
                  while (pos < items.length && items[pos].indent === indent && items[pos].content.startsWith('- ')) {
                    let v2 = items[pos].content.slice(2).trim(); pos++; arr.push(scalar(v2));
                  }
                  obj[key] = arr;
                } else obj[key] = scalar(rest);
              }
              return obj;
            };
            const result = parseBlock(0);
            return JSON.stringify(result, null, 2);
          } catch (e) { return (currentLang === 'sl' ? "Napaka pri razčlenjevanju YAML." : "YAML parse error."); }
        }
      },
      {
        id: "isbn-validator", icon: SVG_ICONS.id_badge, category: "analysis",
        tags: ["isbn", "validator", "potrdi isbn", "isbn check", "knjižna številka", "kontrolna števka"],
        name: { sl: "Preverjanje ISBN", en: "ISBN Validator" },
        desc: { sl: "Preveri veljavnost ISBN-10 ali ISBN-13 (kontrolna števka).", en: "Validate an ISBN-10 or ISBN-13 (check digit)." },
        type: "text-transform",
        transform(t) {
          const clean = (t || "").toUpperCase().replace(/[\s-]/g, "");
          const L = currentLang === 'sl';
          if (!clean) return L ? "Vnesite ISBN." : "Enter an ISBN.";
          if (/^\d{9}[\dX]$/.test(clean)) {
            let sum = 0;
            for (let i = 0; i < 10; i++) { const d = clean[i] === 'X' ? 10 : parseInt(clean[i], 10); sum += d * (10 - i); }
            const ok = sum % 11 === 0;
            return (L ? "ISBN-10 — " : "ISBN-10 — ") + (ok ? (L ? "veljaven ✓" : "valid ✓") : (L ? "neveljaven ✗ (kontrolna števka)" : "invalid ✗ (check digit)")) + "\n" + clean;
          } else if (/^\d{13}$/.test(clean)) {
            let sum = 0;
            for (let i = 0; i < 13; i++) sum += parseInt(clean[i],10) * (i % 2 === 0 ? 1 : 3);
            const ok = sum % 10 === 0;
            return (L ? "ISBN-13 — " : "ISBN-13 — ") + (ok ? (L ? "veljaven ✓" : "valid ✓") : (L ? "neveljaven ✗ (kontrolna števka)" : "invalid ✗ (check digit)")) + "\n" + clean;
          }
          return L ? "Ni prepoznavne ISBN-10/ISBN-13 številke." : "Not a recognizable ISBN-10/ISBN-13.";
        }
      },
      {
        id: "imei-validator", icon: SVG_ICONS.id_badge, category: "analysis",
        tags: ["imei", "validator", "preveri imei", "imei check", "luhn", "serijska številka"],
        name: { sl: "Preverjanje IMEI", en: "IMEI Validator" },
        desc: { sl: "Preveri veljavnost IMEI (15 števk, Luhnova kontrola).", en: "Validate an IMEI (15 digits, Luhn check)." },
        type: "text-transform",
        transform(t) {
          const clean = (t || "").replace(/[\s-]/g, "");
          const L = currentLang === 'sl';
          if (!/^\d{14,16}$/.test(clean)) return L ? "Vnesite 14–16-mestni IMEI." : "Enter a 14–16 digit IMEI.";
          if (clean.length === 15) {
            let sum = 0;
            for (let i = 0; i < 15; i++) { let d = parseInt(clean[i],10); if ((15 - i) % 2 === 0) { d *= 2; if (d > 9) d -= 9; } sum += d; }
            const ok = sum % 10 === 0;
            return (L ? "IMEI — " : "IMEI — ") + (ok ? (L ? "veljaven ✓" : "valid ✓") : (L ? "neveljaven ✗ (kontrolna števka)" : "invalid ✗ (check digit)")) + "\n" + clean;
          }
          return (L ? "IMEISV (16 mest) — ni kontrolne števke." : "IMEISV (16 digits) — no check digit.") + "\n" + clean;
        }
      },
      {
        id: "keyword-density", icon: SVG_ICONS.letter_freq, category: "analysis",
        tags: ["gostota ključnih besed", "keyword density", "pogostost besed", "seo", "frekvenca", "analiza"],
        name: { sl: "Gostota ključnih besed", en: "Keyword Density" },
        desc: { sl: "Preštej pojavitve besed in prikaži najpogostejše s deležem.", en: "Count word occurrences and show the most frequent with percentage." },
        type: "text-transform",
        options: [
          { id: "minlen", type: "select", label: { sl: "Min. dolžina", en: "Min length" }, choices: [1,2,3,4,5].map(v=>({value:String(v),label:{sl:String(v),en:String(v)}})), default: "3" },
          { id: "limit", type: "select", label: { sl: "Omejitev", en: "Limit" }, choices: [10,25,50,100].map(v=>({value:String(v),label:{sl:String(v),en:String(v)}})), default: "25" },
          { id: "sort", type: "select", label: { sl: "Razvrsti", en: "Sort" }, choices: [ {value:"freq",label:{sl:"Po pogostosti",en:"By frequency"}}, {value:"alpha",label:{sl:"Abecedno",en:"Alphabetical"}} ], default: "freq" }
        ],
        transform(t, opts) {
          const minlen = parseInt((opts&&opts.minlen)||"3",10);
          const limit = parseInt((opts&&opts.limit)||"25",10);
          const sort = (opts&&opts.sort)||"freq";
          const words = (t||"").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
          if (!words.length) return (currentLang==='sl' ? "Ni besed." : "No words.");
          const freq = {};
          for (const w of words) { if (w.length >= minlen) freq[w] = (freq[w]||0)+1; }
          const total = words.length;
          let entries = Object.entries(freq);
          entries.sort(sort === "alpha" ? (a,b)=>a[0].localeCompare(b[0]) : (a,b)=>b[1]-a[1]);
          entries = entries.slice(0, limit);
          return entries.map(([w,c]) => `${w}: ${c} (${((c/total)*100).toFixed(1)}%)`).join("\n");
        }
      },
      {
        id: "syllable-counter", icon: SVG_ICONS.stats, category: "analysis",
        tags: ["zlogi", "syllables", "štetje zlogov", "slovenščina", "syllable counter", "besedila", "slovenski"],
        name: { sl: "Štetje zlogov (SL)", en: "Syllable Counter (SL)" },
        desc: { sl: "Prešteje zloge v slovenskem besedilu (približek po samoglasniških skupinah).", en: "Count syllables in Slovenian text (vowel-group approximation)." },
        type: "text-transform",
        transform(t) {
          const words = (t||"").toLowerCase().match(/[a-zčšžćđ]+/g) || [];
          if (!words.length) return (currentLang==='sl' ? "Ni besed." : "No words.");
          const count = (w) => {
            let n = 0; const chars = w.split('');
            for (let i = 0; i < chars.length; i++) {
              const c = chars[i];
              if ("aeiou".includes(c)) { if (i===0 || !"aeiou".includes(chars[i-1])) n++; }
              else if (c === 'r') { const pv = chars[i-1] && "aeiou".includes(chars[i-1]); const nx = chars[i+1] && "aeiou".includes(chars[i+1]); if (!pv && !nx) n++; }
            }
            return n || 1;
          };
          let total = 0;
          const lines = words.map(w => { const n = count(w); total += n; return `${w}: ${n}`; });
          return (currentLang==='sl' ? `Skupaj zlogov: ${total}\nBesed: ${words.length}\n\n` : `Total syllables: ${total}\nWords: ${words.length}\n\n`) + lines.join("\n");
        }
      },
      {
        id: "interleave-lines", icon: SVG_ICONS.shuffle, category: "editing",
        tags: ["prepletanje vrstic", "interleave lines", "združi sezname", "prepleti", "merge lists", "dva seznama"],
        name: { sl: "Prepletanje vrstic", en: "Interleave Lines" },
        desc: { sl: "Prepleta dve skupini vrstic (ločeni s prazno vrstico) drug z drugim: A1, B1, A2, B2 …", en: "Interleaves two groups of lines (separated by a blank line): A1, B1, A2, B2 …" },
        type: "text-transform",
        transform(t) {
          const lines = (t||"").split(/\r?\n/);
          const blank = lines.findIndex(l => l.trim() === "");
          if (blank === -1) return (currentLang==='sl' ? "Loči dve skupini vrstic s prazno vrstico." : "Separate the two line groups with a blank line.");
          const a = lines.slice(0, blank).map(l=>l.trim());
          const b = lines.slice(blank+1).map(l=>l.trim());
          const out = []; const max = Math.max(a.length, b.length);
          for (let i = 0; i < max; i++) { if (i < a.length) out.push(a[i]); if (i < b.length) out.push(b[i]); }
          return out.join("\n");
        }
      },
      {
        id: "repeat-lines", icon: SVG_ICONS.repeat, category: "editing",
        tags: ["ponovi vrstice", "repeat lines", "podvoji vrstice", "duplicate lines", "N-krat", "razmnoži"],
        name: { sl: "Ponovi vrstice N×", en: "Repeat Lines N×" },
        desc: { sl: "Vsako vrstico ponovi izbrano število krat.", en: "Repeat each line the selected number of times." },
        type: "text-transform",
        options: [ { id: "times", type: "select", label: { sl: "Ponovitve", en: "Repeats" }, choices: [2,3,4,5,6,7,8,9,10].map(v=>({value:String(v),label:{sl:String(v)+"×",en:String(v)+"×"}})), default: "2" } ],
        transform(t, opts) {
          const n = Math.max(1, parseInt((opts&&opts.times)||"2",10));
          const lines = (t||"").split(/\r?\n/);
          const out = [];
          for (const l of lines) { for (let i=0;i<n;i++) out.push(l); }
          return out.join("\n");
        }
      },
      {
        id: "playfair-cipher", icon: SVG_ICONS.lock, category: "security",
        tags: ["playfair", "šifra", "playfairjeva šifra", "grid cipher", "kriptografija", "ključna beseda"],
        name: { sl: "Playfairova šifra", en: "Playfair Cipher" },
        desc: { sl: "Šifriraj/odšifriraj z Playfairovo šifro (5×5 mreža iz ključne besede).", en: "Encrypt/decrypt with the Playfair cipher (5×5 grid from keyword)." },
        type: "custom", render: 'renderPlayfair'
      }
    ];
