import type { SupportedLang, Tool, Categories } from '@/types';

export const CATEGORIES: Categories = {
  analysis: { sl: 'Analiza in štetje', en: 'Analysis & Counting', de: 'Analyse & Zählen' },
  formatting: {
    sl: 'Oblikovanje črk',
    en: 'Formatting & Case',
    de: 'Formatierung & Groß/Kleinschreibung',
  },
  editing: { sl: 'Urejanje in čiščenje', en: 'Editing & Cleaning', de: 'Bearbeiten & Bereinigen' },
  findreplace: { sl: 'Iskanje in zamenjava', en: 'Find & Replace', de: 'Suchen & Ersetzen' },
  security: { sl: 'Varnost in kodiranje', en: 'Security & Encoding', de: 'Sicherheit & Kodierung' },
  generator: { sl: 'Izvoz in generatorji', en: 'Export & Generators', de: 'Export & Generatoren' },
  conversion: {
    sl: 'Pretvorbe in izvleček',
    en: 'Conversions & Extract',
    de: 'Konvertierung & Extrahieren',
  },
  textfun: { sl: 'Besedilne igre', en: 'Text Fun & Effects', de: 'Text-Spaß & Effekte' },
};

type Cache = {
  vowels?: Record<SupportedLang | string, RegExp>;
  cons?: Record<SupportedLang | string, RegExp>;
  letters?: Record<SupportedLang | string, RegExp>;
  stops?: Record<SupportedLang | string, string[]>;
};

export const TextUtils = {
  _cache: {} as Cache,

  getVowels(lang: SupportedLang): RegExp {
    this._cache.vowels ??= {
      sl: /[aeiouAEIOUáéíóúàèìòùâêîôûäëïöü]/g,
      en: /[aeiouAEIOU]/g,
    };
    return (this._cache.vowels?.[lang] ?? this._cache.vowels.en) as RegExp;
  },

  getConsonants(lang: SupportedLang): RegExp {
    this._cache.cons ??= {
      sl: /[^aeiouAEIOUáéíóúàèìòùâêîôûäëïöü\s\d\W_čšžČŠŽ]/g,
      en: /[^aeiouAEIOU\s\d\W_]/g,
    };
    return (this._cache.cons?.[lang] ?? this._cache.cons.en) as RegExp;
  },

  getLetters(lang: SupportedLang): RegExp {
    this._cache.letters ??= {
      sl: /[a-zA-ZčšžČŠŽ]/g,
      en: /[a-zA-Z]/g,
    };
    return (this._cache.letters?.[lang] ?? this._cache.letters.en) as RegExp;
  },

  getStopWords(lang: SupportedLang): string[] {
    this._cache.stops ??= {
      sl: [
        'in',
        'pa',
        'ter',
        'ali',
        'da',
        'ne',
        'se',
        'bo',
        'je',
        'so',
        'bi',
        'na',
        'v',
        'z',
        's',
        'k',
        'g',
        'za',
        'po',
        'od',
        'do',
        'pri',
        'ki',
        'ko',
        'kot',
        'tudi',
        'zato',
        'tako',
        'pač',
        'že',
        'še',
        'saj',
        'vendar',
        'ampak',
      ],
      en: [
        'and',
        'or',
        'the',
        'a',
        'an',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'is',
        'are',
        'was',
        'were',
        'be',
        'been',
        'being',
        'have',
        'has',
        'had',
        'do',
        'does',
        'did',
        'but',
        'if',
        'then',
        'else',
        'when',
        'where',
        'why',
        'how',
      ],
    };
    return this._cache.stops[lang] ?? this._cache.stops.en!;
  },

  stripSlovenianDiacritics(str: string): string {
    return str
      .replace(/č/g, 'c')
      .replace(/Č/g, 'C')
      .replace(/š/g, 's')
      .replace(/Š/g, 'S')
      .replace(/ž/g, 'z')
      .replace(/Ž/g, 'Z');
  },
};

export const SYNONYM_MAP: Record<string, string[]> = {
  števec: [
    'counter',
    'count',
    'stevec',
    'count words',
    'count characters',
    'word count',
    'character count',
  ],
  preštej: ['count', 'counting', 'calculate', 'izracunaj'],
  besede: ['words', 'word', 'beseda', 'keywords', 'text'],
  znake: ['characters', 'chars', 'character', 'znak', 'symbols'],
  'velike črke': ['uppercase', 'upper case', 'capital letters', 'capitalize', 'velike', 'velika'],
  'male črke': ['lowercase', 'lower case', 'small letters', 'male', 'mala'],
  base64: ['encode', 'decode', 'encoding', 'decoding', 'base 64', 'b64'],
  geslo: ['password', 'passphrase', 'pwd', 'pass', 'generate password', 'strong password'],
  generator: ['generate', 'creator', 'maker', 'builder', 'generiranje'],
  odstrani: ['remove', 'delete', 'strip', 'clean', 'clear', 'izbrisi', 'pocisti'],
  dvojnike: ['duplicates', 'duplicate', 'deduplicate', 'unique', 'unikatne', 'remove duplicates'],
  presledke: ['spaces', 'whitespace', 'space', 'presledek', 'trim'],
  prelome: ['line breaks', 'newlines', 'new lines', 'line break', 'prelom', 'join lines'],
  najdi: ['find', 'search', 'locate', 'poisc', 'search for'],
  zamenjaj: ['replace', 'substitute', 'change', 'swap', 'zamenjava', 'replace all'],
  slug: ['url slug', 'permalink', 'seo url', 'url friendly', 'clean url'],
  črkovanje: ['spelling', 'spell', 'nato', 'phonetic', 'radio alphabet'],
  morze: ['morse', 'morse code', 'dots dashes', 'sos'],
  json: ['javascript object notation', 'json format', 'json validator', 'json formatter'],
  html: ['hypertext markup', 'strip html', 'remove tags', 'html to text'],
  url: ['link', 'uri', 'extract url', 'url parser', 'parse url'],
  email: ['e-mail', 'mail', 'extract email', 'email finder', 'contact'],
  csv: ['comma separated', 'tsv', 'excel', 'spreadsheet', 'table'],
  markdown: ['md', 'markdown to html', 'md preview', 'render markdown'],
  regex: ['regular expression', 'regexp', 'pattern matching', 'regex tester'],
  hash: ['sha256', 'sha1', 'sha512', 'md5', 'checksum', 'digest', 'fingerprint'],
  uuid: ['guid', 'unique id', 'identifier', 'random id'],
  entropija: ['entropy', 'shannon', 'randomness', 'password strength'],
  levenshtein: ['edit distance', 'fuzzy matching', 'string distance', 'similarity'],
  palindrom: ['palindrome', 'mirror text', 'reverse'],
  braille: ['braille', 'tactile writing', 'accessibility', 'dots'],
  jwt: ['json web token', 'token', 'auth', 'authentication', 'bearer'],
  barve: ['colors', 'color', 'hex', 'rgb', 'hsl', 'cmyk', 'palette', 'color picker'],
  datum: ['date', 'time', 'timestamp', 'epoch', 'unix time', 'iso 8601'],
  tabela: ['table', 'markdown table', 'html table', 'excel to markdown'],
  frekvenca: ['frequency', 'word frequency', 'letter frequency', 'statistics', 'analiza'],
  lorem: ['lorem ipsum', 'placeholder', 'dummy text', 'filler text', 'mock content'],
  oblak: ['word cloud', 'tag cloud', 'wordcloud', 'keywords', 'visualization'],
  slika: ['image', 'text to image', 'png', 'quote image', 'social media'],
  govor: ['speech', 'tts', 'text to speech', 'read aloud', 'voice'],
  naključni: ['random', 'random string', 'token', 'generator'],
  pretvori: ['convert', 'converter', 'transform', 'pretvorba', 'pretvornik'],
  uredi: ['edit', 'editing', 'clean', 'format', 'formatting'],
  primerjaj: ['compare', 'diff', 'difference', 'text diff', 'comparison'],
  razvrsti: ['sort', 'sorting', 'order', 'alphabetical', 'urejanje'],
  pomešaj: ['shuffle', 'randomize', 'mix', 'permute', 'scramble'],
  obrni: ['reverse', 'flip', 'invert', 'backwards', 'mirror'],
  narekovaji: ['quotes', 'quotation marks', 'smart quotes', 'curly quotes'],
  tabulatorji: ['tabs', 'tabs to spaces', 'spaces to tabs', 'indentation'],
  naglasi: ['accents', 'diacritics', 'remove accents', 'normalize', 'ascii'],
  'prazne vrstice': ['empty lines', 'blank lines', 'remove blank lines'],
  oštevilči: ['line numbers', 'numbering', 'enumerate', 'linenums'],
  'prelomi besedilo': ['wrap text', 'word wrap', 'line width', 'column width'],
  ločila: ['punctuation', 'delimiter', 'separator', 'csv delimiter'],
  izlušči: ['extract', 'extractor', 'find', 'pull out', 'scrape'],
  kodiraj: ['encode', 'encoding', 'encrypt', 'obfuscate'],
  dekodiraj: ['decode', 'decoding', 'decrypt', 'deobfuscate'],
  šifriranje: ['encryption', 'cipher', 'crypto', 'rot13', 'caesar'],
  'url encoding': ['percent encoding', 'url encode', 'url decode'],
  hex: ['hexadecimal', 'base16', 'binary', 'octal', 'ascii'],
  binarno: ['binary', 'base2', 'bits', 'hex to binary'],
  qr: ['qr code', 'qrcode', 'quick response'],
  barcode: ['bar code', 'ean', 'upc', 'code128'],
  emoji: ['emojis', 'emoticons', 'remove emoji', 'strip emoji'],
  številke: ['numbers', 'digits', 'numeric', 'extract numbers'],
  'številke v besede': ['number to words', 'spell out numbers', 'currency words'],
  'črkovalne napake': ['spell check', 'typos', 'typo finder', 'proofreading'],
  zaporedne: ['consecutive', 'repeated', 'duplicate words'],
  podvoji: ['duplicate', 'double', 'repeat each', 'word doubler'],
  'zamenjaj presledke': [
    'replace spaces',
    'space to dash',
    'space to underscore',
    'slugify spaces',
  ],
  'zamenjaj prelome': ['replace line breaks', 'newline to comma', 'join lines', 'flatten'],
  'odstrani oštevilčenje': ['remove numbering', 'strip numbers', 'remove bullets', 'clean list'],
  'dodaj narekovaje': ['add quotes', 'quote lines', 'wrap in quotes', 'csv quotes'],
  'presledki v vrstice': ['space to newline', 'split by space', 'word per line', 'text to column'],
  'vrstice v presledke': ['newline to space', 'join lines', 'flatten lines', 'single line'],
  'vejice v vrstice': ['comma to newline', 'split by comma', 'csv to list', 'razdeli po vejicah'],
  'vrstice v vejice': ['newline to comma', 'join with comma', 'lines to csv', 'list to csv'],
};

// senior: pred-kompiliran seznam ključev za hitro iskanje (ne Object.entries vsak klic)
const SYNONYM_ENTRIES = Object.entries(SYNONYM_MAP) as Array<[string, string[]]>;

/**
 * Čista funkcija: vrne novo polje tagov brez mutacije vhoda.
 * Uporabi jo v novi kodi; `expandTags` ostaja kot compat wrapper za legacy.
 */
export function getExpandedTags(
  tool: Pick<Tool, 'tags' | 'name' | 'desc' | 'id' | 'category'>,
  lang: SupportedLang
): string[] {
  const existing = new Set((tool.tags || []).map(t => t.toLowerCase()));
  const sourceText = [tool.name.sl, tool.name.en, tool.desc.sl, tool.desc.en, tool.id]
    .join(' ')
    .toLowerCase();
  const words = sourceText.split(/[\s\-_]+/).filter(w => w.length > 2);

  for (const word of words) {
    const direct = SYNONYM_MAP[word];
    if (direct) direct.forEach(syn => existing.add(syn.toLowerCase()));
    // samo substring iskanje — prej je bilo O(n*m) z includes v obe smeri; zdaj en prehod
    for (const [key, syns] of SYNONYM_ENTRIES) {
      if (key === word) continue; // že obdelano
      if (key.includes(word) || word.includes(key)) {
        syns.forEach(syn => existing.add(syn.toLowerCase()));
      }
    }
  }

  const cat = CATEGORIES[tool.category];
  if (cat) Object.values(cat).forEach(v => existing.add(String(v).toLowerCase()));

  existing.add(lang === 'sl' ? 'slovenian' : 'english');
  existing.add(lang === 'sl' ? 'slovenščina' : 'angleščina');

  return [...existing].filter(t => t.length > 1);
}

/** @deprecated uporabi `getExpandedTags` (čista). Ohranjena za legacy renderje. */
export function expandTags(tool: Tool, lang: SupportedLang): void {
  tool.tags = getExpandedTags(tool, lang);
}

export const LONGDESC_DE: Record<string, string> = {
  'word-counter':
    'Vollständige Echtzeit-Textanalyse. Zählt: alle Wörter (inklusive Zahlen), nur Wörter, Zeichen mit/ohne Leerzeichen, Leerzeichen, Sätze, Absätze und Zeilen. Berechnet: Lesezeit (200 WpM Slowenisch, 238 WpM Englisch), Sprechzeit (150 WpM), eindeutige Wörter, durchschnittliche Wortlänge, lexikalische Dichte (Verhältnis eindeutiger zu allen Wörtern) und das längste Wort. Nützlich für Schriftsteller, Übersetzer, Studierende, SEO-Optimierung und alle, die Texte mit Längenbegrenzung verfassen.',
  'word-cloud':
    'Interaktiver Wordcloud-Generator in Echtzeit. Funktionen: (1) Extrahiert automatisch Schlüsselwörter und berechnet deren Häufigkeit. (2) Filtert Stoppwörter (häufige bedeutungsarme Wörter) für Slowenisch und Englisch. (3) Klick auf ein Wort blendet es ein/aus – aktualisiert die Visualisierung dynamisch. (4) Anpassbare Farbthemen (Violett, Ozean, Bernstein, Smaragd, Synth, Monochrom). (5) Konfigurierbare Maximalzahl an Wörtern (10–200) und Mindestwortlänge. (6) Hochauflösender PNG-Export (geeignet für Druck, Präsentationen, Web). (7) Responsives Design – passt sich der Containergröße an. Nutzen für: Inhaltsanalyse, SEO-Keywords, Feedback-Visualisierung, Präsentationen, Social-Media-Grafiken.',
  'case-converter':
    '10 Groß-/Kleinschreibung-Modi in einem Werkzeug: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, iNvErSe, SaRcAsM. Behält Nicht-Buchstaben (Zahlen, Satzzeichen, Emojis) bei. Nützlich für: Programmierung (Variablen, Funktionen, Klassen umbenennen), Schreiben (Titel, Überschriften), SEO (Slug-Vorverarbeitung), Textbearbeitung. Funktioniert auf gesamtem Text oder Auswahl.',
  'encoder-decoder':
    'Drei Kodierungsmodi in einem Werkzeug: (1) Base64 – Standard-Binär-zu-ASCII-Kodierung (RFC 4648), genutzt zum Einbetten von Bildern in CSS/HTML, Übergeben von JSON in URLs, Basic-Auth-Header. (2) URL (Prozentkodierung) – ersetzt alle reservierten und nicht reservierten Zeichen durch die %XX-Form, nötig für Query-Parameter, Formulardaten, Weiterleitungen. (3) ROT13 – Caesar-Verschlüsselung mit Verschiebung 13, symmetrisch (Kodieren = Dekodieren), zum Verbergen von Spoilern, Witzpointern – NICHT für Sicherheit! Alles läuft lokal mit den Browser-Funktionen für Base64, URL-Kodierung und einfacher Zeichenabbildung. Unterstützt mehrzeiligen Text, behält Leerzeichen und Zeilenumbrüche bei.',
  'password-gen':
    'Kryptografisch sicherer Passwort-Generator mit Web Crypto API. Erzeugt Passwörter mit konfigurierbarer Länge (4–128) und Zeichensätzen: Großbuchstaben (A-Z), Kleinbuchstaben (a-z), Zahlen (0-9), Symbole (!@#$%^&*()-_=+[]{};:,.?). Nutzt die Web-Crypto-API mit Rückweisungs-Stichproben, um Modulo-Bias zu eliminieren – jedes Zeichen gleich wahrscheinlich. Optionale exakte Anzahl pro Zeichentyp und Platzierung pro Typ: am Anfang, in der Mitte, am Ende oder zufällig verteilt – verschiedene Platzierungen kombinierbar (z. B. Zahlen am Anfang, Symbole am Ende). Zeigt Entropie in Bit und Sicherheitsbewertung (niedrig/mittel/hoch). Passwörter werden niemals an Server gesendet, nie in localStorage gespeichert. Nutzen für: Kontoregistrierung, API-Schlüssel, Tokens, WLAN-Passwörter.',
  'find-replace':
    'Erweiterte Suche & Ersetzen mit zwei Ansichten: (1) Ersetzter Text – sofortiges Ergebnis mit allen Ersetzungen. (2) Hervorgehobene Treffer – Originaltext mit markierten Treffern (gelb), ohne Ersetzung, zur Vorschau. Optionen: Groß-/Kleinschreibung (A=a), nur ganze Wörter, reguläre Ausdrücke (RegEx) für komplexe Muster. Live-Trefferstatistik (grün = gefunden, rot = keine Treffer). Felder tauschen (⇄) tauscht Such-/Ersatzstrings schnell. Nutzen für: Code-Refactoring (Variablen umbenennen), Datenbereinigung (Daten normalisieren), Übersetzung (Massen-Terminologie-Tausch), Schreiben (wiederkehrende Tippfehler korrigieren).',
  frequency:
    'Häufigkeitsanalyse mit zwei Modi: (1) Wörter – zerlegt Text in Wörter (Trennzeichen: Leerzeichen, Satzzeichen), zählt Vorkommen, sortiert absteigend. Optionen: Groß-/Kleinschreibung, Satzzeichen ignorieren. (2) Zeichen/Buchstaben – zählt jedes Zeichen einzeln (ohne Leerzeichen, optional ohne Satzzeichen). Zeigt pro Eintrag: Anzahl, Prozentanteil, visuelles Balkendiagramm (violett). Ergebnisse als Text exportieren (Tabelle kopieren). Nutzen für: linguistische Analyse, SEO (Keyword-Dichte), Stilistik (Wiederholungsprüfung), Kryptografie (Häufigkeitsangriff), Sprachenlernen (häufigste Wörter).',
  'duplicate-words':
    'Korrektur-Werkzeug zum Erkennen aufeinanderfolgender doppelter Wörter (z. B. "the the", "and and", "in in"). Funktionen: (1) Hebt alle aufeinanderfolgenden Doppelungen im Originaltext hervor (gelber Hintergrund). (2) Listet alle gefundenen Paare mit Wiederholungszähler. (3) Erzeugt bereinigten Text ohne Doppelungen. (4) Nebeneinander-Ansicht: Original links, bereinigt rechts – synchronisiertes Scrollen. (5) Zählt entfernte Wörter gesamt. Sprachunabhängig, keine Grammatikabhängigkeit. Nutzen für: Korrektur von Artikeln, Thesen, Übersetzungen, Webcontent, E-Mails – überall, wo Tippfehler einfließen.',
  slugify:
    'Erstellt SEO-freundliche URL-Slugs aus Titeln, Dateinamen oder beliebigem Text. Umwandlung: (1) Kleinbuchstaben, (2) Diakritika → ASCII (č→c, š→s, ž→z, đ→dj), (3) "&" → "und" (en) / "in" (sl), (4) Entfernen alles außer Buchstaben, Zahlen, Leerzeichen, Bindestrichen, (5) aufeinanderfolgende Trennzeichen zu einem Bindestrich zusammenfassen, (6) führende/abschließende Bindestriche kürzen. Ergebnis: "My Article: 10 Tips!" → "my-article-10-tips". Nutzen für: CMS (WordPress, Ghost), E-Commerce-Produkte, Blogposts, API-Endpunkte, Cloud-Dateinamen. Funktioniert mehrzeilig – jede Zeile separat.',
  'remove-duplicates':
    'Entfernt doppelte Zeilen unter Beibehaltung der Reihenfolge der ersten Erwähnung. Algorithmus: liest alle Zeilen, speichert in Set (automatisch dedupliziert), Ausgabe in ursprünglicher Reihenfolge der Erst erwähnten. Sortiert NICHT – bewahrt Originalsequenz. Nutzen für: Bereinigung von E-Mail-Listen, URLs, IDs, Befehlen, Log-Dateien, CSV-Daten, kopierten Tabellen. Beispiel: aus 1000 Zeilen mit 300 eindeutigen werden 300 saubere Zeilen. Entfernt keine leeren Zeilen (dafür "Leere Zeilen entfernen" nutzen).',
  'caesar-cipher':
    'Klassischer Caesar-Chiffre (Verschiebechiffre) – eine der ältesten bekannten Chiffren. Jeder Buchstabe wird um eine feste Anzahl Positionen im Alphabet verschoben. Schlüssel = Verschiebung (1–25). Kodieren und Dekodieren sind dieselbe Operation (nur Verschiebung umkehren). Behält Groß-/Kleinschreibung bei, übergeht Zahlen, Satzzeichen, Leerzeichen und Sonderzeichen. Nutzen für: Geheimsrache von Kindern, Geocaching, Escape-Room-Rätsel, Krypto-Einführung, einfaches Verbergen von Nachrichten.',
  'atbash-cipher':
    'Atbash ist eine der ältesten bekannten Chiffren, ursprünglich aus dem hebräischen Alphabet. Bildet einfach jeden Buchstaben auf sein Gegenstück ab: A→Z, B→Y, C→X usw. Da die Abbildung symmetrisch ist, kodiert und dekodiert dasselbe Werkzeug – kein Schlüssel nötig. Behält Groß-/Kleinschreibung bei, übergeht Nicht-Buchstaben. Historisch interessant, heute nützlich zum schnellen Verbergen von Text ohne Passwort.',
  'rot47-cipher':
    'ROT47 erweitert ROT13 auf alle druckbaren ASCII-Zeichen (Codes 33–126). Im Gegensatz zu ROT13, das nur Buchstaben behandelt, rotiert ROT47 alles: Groß-/Kleinschreibung, Ziffern, Satzzeichen, mathematische Symbole. Kodieren = Dekodieren (symmetrisch). Nutzen für: Verbergen von Foren-Spoilern, Maskieren von Passwörtern (NICHT sicher!), einfache Konfigurationsdatei-Verschleierung. NICHT für Sicherheitszwecke!',
  'vigenere-cipher':
    'Vigenère ist eine polyalphabetische Substitutionschiffre, die ein Schlüsselwort zur Bestimmung der pro-Buchstaben-Verschiebung nutzt. Schlüssel "SECRET" bedeutet: 1. Buchstabe um S(18), 2. um E(4), 3. um C(2), 4. um R(17), 5. um E(4), 6. um T(19), dann wiederholen. Das besiegt einfache Häufigkeitsanalyse. Lange Zeit "die unknackbare Chiffre" genannt. Heute knackbar über Kasiski-Examination und Friedman-Test, bleibt aber hervorragend zum Lehren von Krypto-Konzepten. Werkzeug zeigt Tabula Recta und unterstützt Kodieren/Dekodieren. Behält Groß-/Kleinschreibung bei, übergeht Nicht-Buchstaben.',
  'pigpen-cipher':
    'Pigpen- (Freimaurer-)Chiffre bildet Buchstaben auf geometrische Symbole ab, basierend auf zwei Gittern. Jeder Buchstabe erhält ein einzigartiges Symbol aus Gitterfragmenten und Punkten. Historisch von Freimaurern für geheime Aufzeichnungen genutzt. Heute beliebt für Geheimschrift von Kindern, Escape Rooms und Geocaching. Werkzeug rendert SVG-Symbole, die man kopieren oder als Bild herunterladen kann. Unterstützt slowenisches Alphabet (Č, Š, Ž → C, S, Z) und bewahrt Leerzeichen/Satzzeichen.',
  'platform-counter':
    'Ein Blick auf alle wichtigen Plattformlimits: Twitter/X 280, LinkedIn 3000, Instagram 2200, SMS 160, Meta-Beschreibung 160, YouTube-Titel 100. Zeigt: Zeichen (mit/ohne Leerzeichen), Wörter, verbleibend/über Limit, farbcodiert (grün = ok, gelb = nah dran, rot = drüber). Nutzen für: Content-Ersteller, Social-Media-Manager, Texter, SEO-Strategen, alle, die in Social Media posten. Funktioniert in Echtzeit beim Tippen.',
  'readability-analyzer':
    'Vollständige Lesbarkeitsanalyse für Slowenisch und Englisch. Berechnet: (1) Flesch Reading Ease (0–100, höher = leichter), (2) Flesch-Kincaid Grade Level (US-Schulnote), (3) Gunning-Fog-Index, (4) SMOG-Index, (5) Ø Wörter pro Satz, (6) Ø Silben pro Wort, (7) Lesezeit (200 WpM SL / 238 WpM EN), (8) Sprechzeit (150 WpM). Hebt Sätze >25 Wörter (rot) und 20–25 (gelb) hervor. Nutzen für: Texter, Blogger, Studierende, Übersetzer, alle, die für ein Publikum schreiben. An Sprache angepasste Formeln für SL/EN.',
  'qrcode-generator':
    'All-in-one-QR-Generator mit 5 Inhaltstypen: (1) Klartext/URL, (2) E-Mail (mailto:), (3) Telefon (tel:), (4) WLAN-Konfiguration (WIFI:T:WPA;S:name;P:pass;;), (5) vCard-Kontakt. Optionen: Größe (128–512px), Fehlerkorrektur (L/M/Q/H), Vorder-/Hintergrundfarbe. Export: PNG (Raster) oder SVG (Vektor, unendlich skalierbar). Codes sind vollständige QR (Reed-Solomon, echte Finder-Muster) und von allen Smartphones scannbar. Alles lokal im Browser – keine Daten gesendet. Nutzen für: WLAN teilen ohne Passwort-Eingabe, Visitenkarten, Webseiten, Drucksachen, Events.',
  'leetspeak-converter':
    'Leetspeak (1337) ist Internet-Slang, der Buchstaben durch visuell ähnliche Zahlen/Symbole ersetzt. Basis-Map: A=4, B=8, E=3, G=6, I=1, L=1, O=0, S=5, T=7, Z=2. Erweitert: B=|3, C=(, D=|), F|=, K=|<, M=|V|, P=|2, R=|2, U=|_ , X=><, Z=2. Werkzeug unterstützt: (1) Kodieren: Text → Leet, (2) Dekodieren: Leet → Text (bestmöglich), (3) konfigurierbare Aggressivität (basic/advanced/extreme). Behält Groß-/Kleinschreibung bei. Nutzen für: Nicknames, Passwörter, Spaß, Retro-Internet-Nostalgie.',
  'text-to-emoji':
    'Text-zu-Emoji-Konverter mit eingebauten Wörterbüchern für Slowenisch und Englisch. Funktionsweise: (1) Text in Wörter zerlegen, (2) jedes Wort mit Wörterbuch abgleichen (z. B. "love" → ❤️, "coffee" → ☕, "sun" → ☀️, "money" → 💰, "time" → ⏰, "home" → 🏠, "car" → 🚗, "food" → 🍔, "happy" → 😊, "sad" → 😢, "angry" → 😡, "fear" → 😱, "surprise" → 😲). (3) Nicht zugeordnete Wörter bleiben als Text. (4) Modi: nur Emoji, Emoji+Wort oder Emoji über Wort. Wörterbuch deckt 200+ gängige Wörter in SL/EN. Nutzen für: Social-Media-Posts, Spaß, barrierearme Texte, visuelle Kommunikation.',
  'ascii-art':
    'ASCII-Kunst-Generator mit eingebauten FIGlet-Fonts. Unterstützte Fonts: Standard (klassisch), Slant (kursiv), Shadow (mit Schatten), Big (groß), Small (klein), Banner (breit). Funktionen: (1) Breitensteuerung (Zeilenumbruch), (2) Ausrichtung (links, zentriert, rechts), (3) Füllzeichen-Auswahl, (4) Download als Text oder Kopieren in Zwischenablage. Nutzen für: Terminal-Banner, README-Dateien, E-Mail-Signaturen, Retro-Ästhetik, Dev-Witze, Dokumentation. Alles lokal, keine externen Abhängigkeiten.',
  'acrostic-generator':
    'Akrostich-Generator (Gedichte, bei denen die ersten Buchstaben jedes Wortes ein Wort ergeben). Zielwort eingeben (z. B. "LOVE"), Werkzeug schlägt Wörter pro Buchstabe vor und lässt den Satz aufbauen. Funktionen: (1) Auto-Vorschläge pro Buchstabe (Wörterbuch SL/EN), (2) manuelle Bearbeitung jeder Zeile, (3) Optionen: jeder Buchstabe = neue Zeile oder ein Satz, (4) Export als Text. Nutzen für: Poesie, Liebesbriefe, Gedenkbotschaften, Lernen (Eselsbrücken), kreatives Schreiben, Geschenke. Wörterbuch deckt 100+ Wörter pro Buchstabe für SL/EN.',
  'fake-chat-generator':
    'Fake-Chat-Generator zum Erstellen von Screenshots im Stil beliebter Apps: WhatsApp (grün), Messenger (blau), iMessage (blau/grün), Android SMS (dunkel). Funktionen: (1) Nachrichten hinzufügen/bearbeiten/löschen, (2) Absender-Auswahl (Name, Avatar – Emoji oder Initial), (3) Zeitstempel, (4) Nachrichtenstatus (gesendet, zugestellt, gelesen – Doppelhaken), (5) Theme-Einstellungen (hell/dunkel), (6) Download als PNG (hochauflösend). Alles im Browser-Canvas gerendert. Nutzen für: Memes, Social Media, Witze, UI-Demos, Content-Vorbereitung. NICHT für Missbrauch (Betrug, gefälschte Beweise).',
  'json-formatter':
    'Umfangreiches JSON-Werkzeug: (1) Validiert Syntax – markiert Fehler mit Zeile/Spalte, beschreibt Problem (fehlendes Komma, falsches Anführungszeichen usw.). (2) Schönt – formatiert mit konfigurierbarem Einzug (2/4/8 Leerzeichen, Tabs), Syntax-Hervorhebung (Schlüssel, Strings, Zahlen, Boolean, null). (3) Minify – entfernt allen Whitespace für minimale Größe (API-Übertragung). (4) Kopiert formatiertes/minifiziertes JSON in Zwischenablage. (5) Download als .json-Datei. Alles lokal, kein Server. Nutzen für: API-Entwickler, Konfigurationsdateien, Debuggen von Server-Antworten, Erlernen von JSON-Struktur.',
  'markdown-preview':
    'Split-Pane-Markdown-Editor: Markdown links schreiben (mit Spickzettel: Überschriften #, Listen -, 1., Code ```, Tabellen, Links, Bilder, Zitat, Trennlinie), HTML rechts sofort gerendert sehen. Unterstützt: GitHub Flavored Markdown (Tabellen, Aufgabenlisten - [ ]), Auto-Linking von URLs, sicheres Rendering (kein XSS). Buttons: HTML-Code kopieren, .html-Datei herunterladen, Eingabe leeren. Nutzen für: Schreiben von README.md, Blogposts, Dokumentation, GitHub-Issues, Stack-Overflow-Antworten, statische Seiten. Funktioniert offline – Markdown-Parser (marked.js) läuft im Browser.',
  'url-parser':
    'Zerlegt eine URL in ihre Bestandteile: Protokoll, Domain, Pfad, Query-String und Fragment. Zeigt eine interaktive Tabelle der Query-Parameter mit Kopier-Buttons. Nützlich zum Analysieren von Weblinks, Debuggen von API-Aufrufen und Verstehen der URL-Struktur.',
  'datetime-converter':
    'Universeller Konverter zwischen allen gängigen Zeitformaten: Unix-Epoch (Sekunden seit 1970-01-01), Unix ms, ISO 8601 (2024-01-15T14:30:00Z), RFC 2822, Browser-Locale, UTC und relative Zeit (vor 5 Min, gestern usw.). Wert in einem Feld eingeben – andere aktualisieren sofort. Unterstützt: Zeitzonen (lokal, UTC, benutzerdefiniert), Millisekunden-Genauigkeit, bidirektionale Konvertierung. Nutzen für: Entwicklung (Logs, Datenbanken, APIs), Ereignis-Analyse, Planung (Datumsdifferenzen), Debuggen (wie alt ist dieser Zeitstempel?). Läuft auf dem Browser-Date-Objekt – kein Server.',
  'color-converter':
    'All-in-one-Farbkonverter mit: (1) Bidirektionaler Konvertierung zwischen HEX (#ff6b35), RGB (255,107,53), RGBA, HSL (15°,100%,60%), CMYK (0,58,79,0) – eines eingeben, andere aktualisieren. (2) Interaktiver Farbwähler (HTML5 `<input type=color>`). (3) Kontrastprüfer (WCAG 2.1 AA/AAA) für Text/Hintergrund – zeigt Verhältnis und bestanden/nicht bestanden. (4) Schattierungs- und Farbton-Palette – je 10 Schritte. (5) Ein-Klick-Werte kopieren. (6) Export von CSS-Custom-Properties (--color-primary: #ff6b35;). Nutzen für: UI/UX-Design, CSS-Entwicklung, Barrierefreiheit (WCAG), Marken-Styleguides, schnelle Kontrastprüfung. Alles im Browser, kein Server.',
  'table-to-markdown':
    'Konvertiert Tabellendaten aus Excel, Google Sheets, CSV oder TSV in saubere Markdown-Tabellen oder HTML-Tabellen. Erkennt Trennzeichen automatisch, behandelt leere Zellen und bewahrt Kopfzeilen. Ideal für Dokumentation, README-Dateien und Web-Publishing.',
};
