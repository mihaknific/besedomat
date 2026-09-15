// Besedomat — zero-dependency test runner for TOOLS transforms/stats.
// Extracts the data-only parts of index.html (SVG_ICONS, COMPACT_TAGS, TOOLS,
// PURE) and evaluates them in a sandboxed VM where any undefined identifier
// (e.g. render* functions) resolves to a no-op, so we can unit-test the
// pure transform()/stats()/PURE logic without a DOM.

import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

function extract(re, label) {
  const m = html.match(re);
  if (!m) throw new Error(`Izvleka ni uspelo za: ${label}`);
  return m[0];
}

const svgSrc = extract(/const SVG_ICONS = \{[\s\S]*?\n    \};/, "SVG_ICONS");
const compactSrc = extract(/const COMPACT_TAGS = \{[\s\S]*?\n    \};/, "COMPACT_TAGS");
const toolsSrc = extract(/const TOOLS = \[[\s\S]*?\n    \];/, "TOOLS");
const pureSrc = extract(/const PURE = \{[\s\S]*?\n    \};/, "PURE");

// Sandbox: real built-ins, console; everything unknown -> no-op function.
const sandbox = {};
const handler = {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (prop === "globalThis" || prop === "window" || prop === "self") return proxy;
    if (prop === "console") return console;
    if (["Math", "JSON", "Object", "Array", "String", "RegExp", "Number",
         "Boolean", "Symbol", "Map", "Set", "Date", "Proxy", "Promise",
         "parseInt", "parseFloat", "isNaN", "decodeURIComponent", "encodeURIComponent",
         "btoa", "atob", "TextEncoder", "TextDecoder", "Uint8Array", "Uint16Array",
         "Uint32Array", "Int8Array", "Int32Array", "DataView", "Blob",
         "Error", "TypeError", "RangeError", "SyntaxError", "URIError"]
        .includes(prop)) return globalThis[prop];
    // Any other identifier (renderXxx, document, navigator, ...) -> no-op fn.
    return function () { return undefined; };
  },
  set(target, prop, value) { target[prop] = value; return true; },
  has() { return true; },
};
const proxy = new Proxy(sandbox, handler);
vm.createContext(proxy);

const code = `${svgSrc}\n${compactSrc}\n${toolsSrc}\n${pureSrc}\n;globalThis.__TOOLS = TOOLS; globalThis.__PURE = PURE;`;
vm.runInContext(code, proxy, { filename: "besedomat-tools-extracted.js" });

const TOOLS = sandbox.__TOOLS;
if (!Array.isArray(TOOLS)) throw new Error("TOOLS ni bil izluščen.");
const PURE = sandbox.__PURE;
if (!PURE || typeof PURE !== "object") throw new Error("PURE ni bil izluščen.");

// ---- Assertions ----
let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = "") {
  if (cond) { passed++; }
  else { failed++; failures.push(`${name}${detail ? " — " + detail : ""}`); }
}

// Generic smoke test: every transform/stats runs without throwing.
for (const t of TOOLS) {
  const label = `${t.id} (${t.type})`;
  if (t.type === "text-transform") {
    try {
      const empty = t.transform("", {});
      const sample = t.transform("Test ABC 123 !? čšž", {});
      check(`${label} transform vrne string`, typeof empty === "string" && typeof sample === "string",
        `empty=${typeof empty}, sample=${typeof sample}`);
    } catch (e) {
      check(`${label} transform ne vrže`, false, e.message);
    }
  } else if (t.type === "text-stats") {
    try {
      const s = t.stats("test vzorec besedilo", "sl");
      check(`${label} stats vrne objekt`, s && typeof s === "object" && Object.keys(s).length > 0,
        `keys=${s ? Object.keys(s).length : 0}`);
    } catch (e) {
      check(`${label} stats ne vrže`, false, e.message);
    }
  }
}

// Deterministic, known-answer tests for selected transforms.
function find(id) { return TOOLS.find(t => t.id === id); }

function assertTransform(id, input, expected, opts = {}) {
  const t = find(id);
  if (!t) { check(`oranje ${id}`, false, "orodje ne obstaja"); return; }
  let out;
  try { out = t.transform(input, opts); }
  catch (e) { check(`transform ${id}`, false, e.message); return; }
  check(`transform ${id}: ${JSON.stringify(input)}`, out === expected,
    `pričakovano ${JSON.stringify(expected)}, dobil ${JSON.stringify(out)}`);
}

assertTransform("remove-emojis", "a😀b", "ab");
assertTransform("spaces-to-newlines", "a b", "a\nb");
assertTransform("newlines-to-spaces", "a\nb", "a b");
assertTransform("comma-to-newline", "a,b", "a\nb");
assertTransform("newline-to-comma", "a\nb", "a, b");
assertTransform("replace-spaces-in-text", "a b", "a-b", { sep: "-" });
assertTransform("replace-line-breaks-in-text", "a\nb", "a b", { sep: " " });
assertTransform("duplicate-words-in-text", "a b", "a a b b", { sep: " " });
assertTransform("remove-line-numbers", "1. foo\n2. bar", "foo\nbar", { mode: "numbers" });
assertTransform("add-quotes-to-lines", "a\nb", '"a"\n"b"', { style: '"' });

// ---- E4 nova orodja: deterministični testi ----
assertTransform("base-converter", "255", "DEC: 255\nBIN: 11111111\nOCT: 377\nHEX: FF", { base: "10" });
assertTransform("roman-numerals", "2024", "MMXXIV", { dir: "to" });
assertTransform("roman-numerals", "MMXXIV", "2024", { dir: "from" });
assertTransform("affine-cipher", "A", "I", { a: "5", b: "8" });
assertTransform("baconian-cipher", "A", "aaaaa", { dir: "enc" });
assertTransform("repeat-lines", "a\nb", "a\na\nb\nb", { times: "2" });
assertTransform("isbn-validator", "9783161484100", "ISBN-13 — valid ✓\n9783161484100");
assertTransform("imei-validator", "490154203237518", "IMEI — valid ✓\n490154203237518");
const yj = find("yaml-json").transform("name: Test\nage: 30", { dir: "y2j" });
check("yaml-json basic", /"name": "Test"/.test(yj) && /"age": 30/.test(yj), yj);
const cj = find("csv-json").transform("a,b\n1,2", { dir: "c2j" });
check("csv-json basic", /"a": "1"/.test(cj) && /"b": "2"/.test(cj), cj);
const jy = find("yaml-json").transform('[{"a":1}]', { dir: "j2y" });
check("json-yaml basic", /- a: 1/.test(jy), jy);

// ---- Dodatni deterministični testi za text-transform orodja ----
assertTransform("atbash-cipher", "ABC", "ZYX");
assertTransform("rot47-cipher", "A", "p");
check("rot47-cipher roundtrip", find("rot47-cipher").transform(find("rot47-cipher").transform("Test 123! @#", {}), {}) === "Test 123! @#");
assertTransform("remove-duplicates", "a\na\nb", "a\nb");
assertTransform("remove-empty-lines", "a\n\n\nb", "a\nb");
assertTransform("remove-linebreaks", "a\nb", "a b");
assertTransform("fix-pdf-text", "del-\njeno besedilo\nv vrsticah.\n\nNov odstavek.", "deljeno besedilo v vrsticah.\n\nNov odstavek.");
assertTransform("fix-pdf-text", "vrstica 1\nvrstica 2", "vrstica 1 vrstica 2", { single: true });
assertTransform("remove-accents", "Čšž", "Csz");
assertTransform("remove-punctuation", "a, b!", "a b");
assertTransform("slugify", "Hello World", "hello-world");
assertTransform("remove-emojis", "a😀b", "ab");

// Dodatni deterministični text-transform testi (odkriti prek node).
assertTransform("upside-down", "a", "ɐ");
assertTransform("strikethrough", "a", "a̶");
assertTransform("tiny-text", "a", "ᵃ");
assertTransform("nato-alphabet", "A", "Alpha");
assertTransform("nato-alphabet", "ABC", "Alpha Bravo Charlie");
assertTransform("email-extractor", "piši a@b.com in c@d.si", "a@b.com\nc@d.si");
assertTransform("url-extractor", "ob https://x.com/y in http://e.org", "https://x.com/y\nhttp://e.org");
assertTransform("extract-numbers", "x12 y34 z", "12\n34");
assertTransform("remove-spaces", "a  b   c", "a b c");
assertTransform("slugify", "ČŠŽ ABC 123", "csz-abc-123");
assertTransform("remove-accents", "Çéñ", "Cen");
assertTransform("unicode-normalize", "c\u030c", "č", { form: "NFC" });
const syll = find("syllable-counter").transform("beseda", {});
check("syllable-counter basic", /Total syllables: 3/.test(syll) && /beseda: 3/.test(syll), syll);

// ---- PURE: known-answer testi za refaktorirana custom orodja ----
function eqPure(name, got, exp) {
  check(`PURE ${name}`, got === exp, `pričakovano ${JSON.stringify(exp)}, dobil ${JSON.stringify(got)}`);
}
eqPure("caesarCipher encode", PURE.caesarCipher("ABC", 1, true, false), "bcd");
eqPure("caesarCipher encode upper", PURE.caesarCipher("HELLO", 3, true, true), "KHOOR");
eqPure("caesarCipher decode upper", PURE.caesarCipher("KHOOR", 3, false, true), "HELLO");
eqPure("caesarCipher wrap Z", PURE.caesarCipher("Z", 1, true, false), "a");
eqPure("caesarCipher non-alpha", PURE.caesarCipher("A-B!", 1, true, false), "b-c!");
eqPure("utf8ToBase64 'A'", PURE.utf8ToBase64("A"), "QQ==");
eqPure("base64 roundtrip unicode", PURE.base64ToUtf8(PURE.utf8ToBase64("Živjo svet! 🌍")), "Živjo svet! 🌍");
eqPure("formatJson indent", PURE.formatJson('{"b":2,"a":1}', { indent: 2, sort: false }), '{\n  "b": 2,\n  "a": 1\n}');
eqPure("formatJson sort", PURE.formatJson('{"b":2,"a":1}', { indent: 2, sort: true }), '{\n  "a": 1,\n  "b": 2\n}');
eqPure("formatJson compact", PURE.formatJson('{"b":2,"a":1}', { indent: 0, sort: true }), '{"a":1,"b":2}');
const stats = PURE.computeTextStats("Besedomat je odlično orodje za urejanje besedil.", "sl");
eqPure("computeTextStats totalWords", stats.totalWords, 7);
eqPure("computeTextStats wordsOnly", stats.wordsOnly, 7);
eqPure("computeTextStats charsNoSpace", stats.charsNoSpace, 42);
eqPure("computeTextStats longestWord", stats.longestWord, "Besedomat");

// ---- PURE.applyCase (Case converter) ----
eqPure("applyCase upper", PURE.applyCase("abc", "upper"), "ABC");
eqPure("applyCase lower", PURE.applyCase("ABC", "lower"), "abc");
eqPure("applyCase title", PURE.applyCase("zdravo svet", "title"), "Zdravo Svet");
eqPure("applyCase sentence", PURE.applyCase("zdravo svet. kako si?", "sentence"), "Zdravo svet. Kako si?");
eqPure("applyCase inverse", PURE.applyCase("AbC", "inverse"), "aBc");
eqPure("applyCase sarcasm", PURE.applyCase("zdravo svet", "sarcasm"), "zDrAvO SvEt");
eqPure("applyCase camel", PURE.applyCase("my variable name", "camel"), "myVariableName");
eqPure("applyCase pascal", PURE.applyCase("my variable name", "pascal"), "MyVariableName");
eqPure("applyCase snake", PURE.applyCase("my variable name", "snake"), "my_variable_name");
eqPure("applyCase kebab", PURE.applyCase("my variable name", "kebab"), "my-variable-name");
eqPure("applyCase camel roundtrip", PURE.applyCase("myVariableName", "snake"), "my_variable_name");

// ---- PURE.findReplace (Find & Replace) ----
const fr1 = PURE.findReplace("abc abc", { query: "abc", repl: "x" });
eqPure("findReplace basic replaced", fr1.replaced, "x x");
eqPure("findReplace basic count", fr1.count, 2);
const fr2 = PURE.findReplace("Abc", { query: "abc", repl: "x", ignoreCase: true });
eqPure("findReplace ignoreCase", fr2.replaced, "x");
const fr3 = PURE.findReplace("abcd abcd", { query: "abc", wholeWord: true });
eqPure("findReplace wholeWord no match", fr3.count, 0);
eqPure("findReplace wholeWord kept", fr3.replaced, "abcd abcd");
const fr4 = PURE.findReplace("a1 b2", { query: "\\d+", repl: "#", regex: true });
eqPure("findReplace regex", fr4.replaced, "a# b#");
let frThrew = false;
try { PURE.findReplace("x", { query: "(", regex: true }); } catch (e) { frThrew = true; }
check("PURE findReplace invalid regex vrže", frThrew);

// ---- PURE.countOccurrences / htmlEntities / parseMarkdown / frequencyCounts ----
eqPure("countOccurrences basic", PURE.countOccurrences("a b a c", "a"), 2);
eqPure("countOccurrences ignoreCase", PURE.countOccurrences("A a", "a", { ignoreCase: true }), 2);
eqPure("countOccurrences wholeWord", PURE.countOccurrences("abcd abc", "abc", { wholeWord: true }), 1);
eqPure("countOccurrences wholeWord none", PURE.countOccurrences("abcd abcd", "abc", { wholeWord: true }), 0);
eqPure("htmlEntities encode", PURE.htmlEntities("a<b>&", { mode: "encode" }), "a&lt;b&gt;&amp;");
eqPure("htmlEntities encodeAll unicode", PURE.htmlEntities("č", { mode: "encode", encodeAll: true }), "&#269;");
eqPure("parseMarkdown h1", PURE.parseMarkdown("# Naslov"), "<h1>Naslov</h1>");
eqPure("parseMarkdown bold", PURE.parseMarkdown("**bold**"), "<strong>bold</strong>");
eqPure("parseMarkdown li", PURE.parseMarkdown("- item"), "<li>item</li>");
const freq = PURE.frequencyCounts("a a b", { mode: "words" });
eqPure("frequencyCounts top", freq.entries[0][0] + ":" + freq.entries[0][1], "a:2");
eqPure("frequencyCounts total", freq.total, 3);
const freqC = PURE.frequencyCounts("a b!", { mode: "chars", ignorePunct: true });
eqPure("frequencyCounts chars ignorePunct total", freqC.total, 2);

// ---- PURE.numberLines / addPrefixLines / filterLines / extractPatterns ----
eqPure("numberLines basic", PURE.numberLines("a\nb\nc", {}), "1 | a\n2 | b\n3 | c");
eqPure("numberLines startZero", PURE.numberLines("a\nb", { startZero: true }), "0 | a\n1 | b");
eqPure("addPrefixLines prefix", PURE.addPrefixLines("a\nb", { prefix: "> " }), "> a\n> b");
eqPure("addPrefixLines skipEmpty", PURE.addPrefixLines("a\n\nb", { prefix: "> ", skipEmpty: true }), "> a\n\n> b");
eqPure("filterLines contains", PURE.filterLines("apple\nbanana\napricot", { keyword: "ap" }), "apple\napricot");
eqPure("filterLines invert", PURE.filterLines("apple\nbanana", { keyword: "ap", invert: true }), "banana");
eqPure("filterLines wholeWord none", PURE.filterLines("apple\napex", { keyword: "ap", wholeWord: true }), "");
eqPure("extractPatterns email", PURE.extractPatterns("a info@x.com b y@z.org", { mode: "email" }), "info@x.com\ny@z.org");
eqPure("extractPatterns url", PURE.extractPatterns("see https://x.com/y and http://z.org", { mode: "url" }), "https://x.com/y\nhttp://z.org");
eqPure("extractPatterns number", PURE.extractPatterns("a12 b34", { mode: "number" }), "12\n34");
const d = PURE.diffLines("a\nb\nc", "a\nx\nc");
eqPure("diffLines types", d.map(x => x.t).join(''), " -+ ");
eqPure("diffLines removed", d[1].v, "b");
eqPure("diffLines added", d[2].v, "x");

// ---- PURE color conversions ----
eqPure("hexToRgb #ff0000", JSON.stringify(PURE.hexToRgb("#ff0000")), JSON.stringify({ r: 255, g: 0, b: 0 }));
eqPure("hexToRgb #fff", JSON.stringify(PURE.hexToRgb("#fff")), JSON.stringify({ r: 255, g: 255, b: 255 }));
eqPure("rgbToHex", PURE.rgbToHex(255, 0, 0), "#ff0000");
eqPure("rgbToHsl red", JSON.stringify(PURE.rgbToHsl(255, 0, 0)), JSON.stringify({ h: 0, s: 100, l: 50 }));
eqPure("hslToRgb red", JSON.stringify(PURE.hslToRgb(0, 100, 50)), JSON.stringify({ r: 255, g: 0, b: 0 }));
eqPure("colorInfo #fff hex", PURE.colorInfo("#fff").hex, "#ffffff");
eqPure("colorInfo rgb()", PURE.colorInfo("rgb(255, 0, 0)").hex, "#ff0000");
eqPure("colorInfo hsl()", PURE.colorInfo("hsl(0, 100%, 50%)").hex, "#ff0000");
// ---- PURE uuid / password ----
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
eqPure("generateUUID format", uuidRe.test(PURE.generateUUID()), true);
const pw = PURE.generatePassword({ length: 20, upper: true, digits: true, symbols: true, lower: true });
eqPure("generatePassword length", pw.length === 20, true);
eqPure("generatePassword charset", /^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{};:,.?]+$/.test(pw), true);

// ---- Enhanced password generator tests ----
// perType exact counts
const pw2 = PURE.generatePassword({ length: 12, perType: { lower: 4, upper: 3, digits: 3, symbols: 2 } });
eqPure("generatePassword perType length", pw2.length === 12, true);
const lowerCount2 = (pw2.match(/[a-z]/g) || []).length;
const upperCount2 = (pw2.match(/[A-Z]/g) || []).length;
const digitCount2 = (pw2.match(/[0-9]/g) || []).length;
const symbolCount2 = (pw2.match(/[!@#$%^&*()\-_=+\[\]{};:,.?]/g) || []).length;
eqPure("generatePassword perType lower", lowerCount2, 4);
eqPure("generatePassword perType upper", upperCount2, 3);
eqPure("generatePassword perType digits", digitCount2, 3);
eqPure("generatePassword perType symbols", symbolCount2, 2);

// excludeChars
const pw3 = PURE.generatePassword({ length: 50, excludeChars: ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', '0', '1'] });
eqPure("generatePassword excludeChars no vowels", /[aeiouAEIOU01]/.test(pw3), false);
eqPure("generatePassword excludeChars length", pw3.length === 50, true);

// passphrase mode
const phrase = PURE.generatePasswordOptions("", { mode: 'passphrase', words: 4, separator: '-', capitalize: false, includeNumber: false, includeSymbol: false });
const phraseParts = phrase.split('-');
eqPure("generatePassphrase word count", phraseParts.length, 4);
eqPure("generatePassphrase lowercase", phrase === phrase.toLowerCase(), true);

const phrase2 = PURE.generatePasswordOptions("", { mode: 'passphrase', words: 3, separator: '.', capitalize: true, includeNumber: true, includeSymbol: true });
eqPure("generatePassphrase capitalize", /^[A-Z]/.test(phrase2.split('.')[0]), true);
eqPure("generatePassphrase has number", /\d{4}/.test(phrase2), true);
eqPure("generatePassphrase has symbol", /[!@#$%^&*]/.test(phrase2), true);

// perType skaliranje (zahtevano več kot dolžina) — ne sme vreči napake
const pwScaled = PURE.generatePassword({ length: 5, perType: { lower: 10 } });
eqPure("generatePassword scaled length", pwScaled.length === 5, true);

// izklopljen tip ne sme priciti v polnilo (filler)
const symRe = /[!@#$%^&*()\-_=+\[\]{};:,.?]/;
const pwNoSym = PURE.generatePassword({ length: 40, lower: true, upper: true, digits: true, symbols: false });
eqPure("generatePassword disabled type excluded", symRe.test(pwNoSym), false);

// obrežanje: zahtevane števce več kot dolžina → dolžina se spoštuje
const pwTrim = PURE.generatePassword({ length: 3, perType: { lower: 2, upper: 2 } });
eqPure("generatePassword trim length", pwTrim.length === 3, true);

// ---- Položaj znakov (placement: start/middle/end/any) ----
// števke na začetku
const pwStart = PURE.generatePassword({ length: 10, perType: { digits: 3 }, placement: { digits: 'start' } });
eqPure("generatePassword placement start length", pwStart.length === 10, true);
eqPure("generatePassword placement start digits", /^\d{3}/.test(pwStart), true);
// simboli na koncu
const pwEnd = PURE.generatePassword({ length: 10, perType: { symbols: 2 }, placement: { symbols: 'end' } });
eqPure("generatePassword placement end length", pwEnd.length === 10, true);
eqPure("generatePassword placement end symbols", new RegExp(symRe.source + "{2}$").test(pwEnd), true);
// števke znotraj
const pwMid = PURE.generatePassword({ length: 9, perType: { digits: 3 }, placement: { digits: 'middle' } });
eqPure("generatePassword placement mid length", pwMid.length === 9, true);
eqPure("generatePassword placement mid digits", /^\d{3}$/.test(pwMid.slice(3, 6)), true);
// kombinacija: števke na začetku + simboli na koncu hkrati
const pwCombo = PURE.generatePassword({ length: 12, perType: { digits: 2, symbols: 2 }, placement: { digits: 'start', symbols: 'end' } });
eqPure("generatePassword combo length", pwCombo.length === 12, true);
eqPure("generatePassword combo start digits", /^\d{2}/.test(pwCombo), true);
eqPure("generatePassword combo end symbols", new RegExp(symRe.source + "{2}$").test(pwCombo), true);
// strukturirani položaj brez perType → enakomerna porazdelitev po tipih
const pwAuto = PURE.generatePassword({ length: 12, lower: true, upper: true, digits: true, placement: { digits: 'start' } });
eqPure("generatePlacement auto length", pwAuto.length === 12, true);
eqPure("generatePlacement auto leading digits", /^\d{4}/.test(pwAuto), true);
// neznana vrednost položaja → naključno (vseeno veljavno geslo)
const pwBadPos = PURE.generatePassword({ length: 8, perType: { digits: 2 }, placement: { digits: 'bogus' } });
eqPure("generatePassword bogus placement length", pwBadPos.length === 8, true);

// ---- Kombinirani položaji (več con za isto vrsto znakov) ----
// števke: začetek + znotraj (2+2)
const pwSM = PURE.generatePassword({ length: 12, perType: { digits: 4 }, placement: { digits: ['start', 'middle'] } });
eqPure("placement start+mid length", pwSM.length === 12, true);
eqPure("placement start+mid leading", /^\d{2}/.test(pwSM), true);
eqPure("placement start+mid middle block", /^\d{2}$/.test(pwSM.slice(6, 8)), true);
// simboli: začetek + konec (2+2)
const pwSE = PURE.generatePassword({ length: 10, perType: { symbols: 4 }, placement: { symbols: ['start', 'end'] } });
eqPure("placement start+end length", pwSE.length === 10, true);
eqPure("placement start+end leading", new RegExp("^" + symRe.source + "{2}").test(pwSE), true);
eqPure("placement start+end trailing", new RegExp(symRe.source + "{2}$").test(pwSE), true);
// velike: znotraj + konec
const pwME = PURE.generatePassword({ length: 12, lower: true, upper: true, digits: true, placement: { upper: ['middle', 'end'] } });
eqPure("placement mid+end length", pwME.length === 12, true);
// vse tri cone za en tip (avto-porazdelitev: 6/3 = 2+2+2)
const pwAll3 = PURE.generatePassword({ length: 12, perType: { digits: 6 }, placement: { digits: ['start', 'middle', 'end'] } });
eqPure("placement all3 length", pwAll3.length === 12, true);
eqPure("placement all3 leading", /^\d{2}/.test(pwAll3), true);
eqPure("placement all3 middle", /^\d{2}$/.test(pwAll3.slice(5, 7)), true);
eqPure("placement all3 trailing", /\d{2}$/.test(pwAll3), true);
// niz kot vrednost (združljivost s prejšnjim API-jem) se pretvori v enoelementno polje
const pwStrCompat = PURE.generatePassword({ length: 9, perType: { digits: 3 }, placement: { digits: 'start' } });
eqPure("placement string compat", /^\d{3}/.test(pwStrCompat), true);

// besedni listi (sl / en)
const slList = PURE.PASSPHRASE_WORDLISTS.sl;
const enList = PURE.PASSPHRASE_WORDLISTS.en;
eqPure("wordlist sl size", slList.length >= 60, true);
const phraseSl = PURE.generatePassphrase({ words: 4, wordlist: 'sl' }).split('-');
eqPure("passphrase sl membership", phraseSl.every(w => slList.includes(w)), true);
const phraseEn2 = PURE.generatePassphrase({ words: 4, wordlist: 'en' }).split('-');
eqPure("passphrase en membership", phraseEn2.every(w => enList.includes(w)), true);
const phraseSlCap = PURE.generatePassphrase({ words: 2, wordlist: 'sl', capitalize: true });
eqPure("passphrase sl capitalize", /^[A-ZČŠŽ]/.test(phraseSlCap), true);

// ---- PURE checksum ----
eqPure("bufferToHex", PURE.bufferToHex(new Uint8Array([0xba, 0x78, 0x16, 0xbf])), "ba7816bf");
eqPure("crc32 abc", PURE.crc32("abc"), "352441c2");
eqPure("sha256 abc (pure)", PURE.sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
eqPure("sha256 empty (pure)", PURE.sha256(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc'));
  eqPure("sha256 abc (crypto)", PURE.bufferToHex(h), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  const h1 = await crypto.subtle.digest('SHA-1', new TextEncoder().encode('abc'));
  eqPure("sha1 abc", PURE.bufferToHex(h1), "a9993e364706816aba3e25717850c26c9cd0d89d");
} else {
  console.log("(Preskočeno: crypto.subtle ni na voljo v tem okolju)");
}

// ---- Report ----
console.log(`\nBesedomat testi — ${TOOLS.length} orodij preverjenih.`);
console.log(`PASS: ${passed}   FAIL: ${failed}`);
if (failed > 0) {
  console.log("\nNeuspešni testi:");
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
} else {
  console.log("Vsi testi uspešni. ✓");
}
