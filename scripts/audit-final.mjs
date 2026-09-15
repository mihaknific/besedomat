import { readFileSync } from 'node:fs';

console.log('=== LOGIKA: robni primeri ===');
// 1. PURE text-stats: ali je avgWordLen/lexDensity tip Number ali string?
const ts = readFileSync('src/tools/pure/text-stats.ts','utf8');
console.log(`text-stats avgWordLen Number: ${ts.includes('Number((charsNoSpace') ? 'OK' : 'string (tip mismatch)'}`);
// 2. formatJson: ali ima Result wrapper?
const tf = readFileSync('src/tools/pure/text-transform.ts','utf8');
console.log(`formatJson Result: ${tf.includes('tryFormatJson') ? 'OK' : 'manjka'}`);
console.log(`filterLines g-flag: ${tf.includes("RegExp(pat, 'giu')") ? 'ŠE VEDNO HROŠČ' : tf.includes("RegExp(pat, 'iu'") ? 'OK popravljen' : 'neznano'}`);
// 3. password: ali je unionPool prazen edge case pokrit?
const pwd = readFileSync('src/tools/pure/password.ts','utf8');
console.log(`password unionPool prazen: ${pwd.includes("if (!unionPool) return") ? 'OK' : 'manjka guard'}`);
// 4. store batch: ali je gnezdenje varno?
const store = readFileSync('src/store/index.ts','utf8');
console.log(`store batchDepth: ${store.includes('batchDepth') ? 'OK' : 'manjka'}`);
console.log(`store validacija lang: ${store.includes('VALID_LANGS') ? 'OK' : 'manjka'}`);
// 5. search: ali je cache LRU?
const search = readFileSync('src/utils/search.ts','utf8');
console.log(`search LRU: ${search.includes('CACHE_LIMIT') ? 'OK' : 'manjka'}`);
console.log(`search early-exit: ${search.includes('maxDist') ? 'OK' : 'manjka'}`);
// 6. crypto fallback
const crypto = readFileSync('src/utils/crypto.ts','utf8');
console.log(`crypto fallback Math.random: ${crypto.includes('Math.random') ? 'IMA (opozorilo: fallback na Math.random v testih)' : 'nima'}`);

console.log('\n=== VARNOST ===');
const dom = readFileSync('src/utils/dom.ts','utf8');
console.log(`escapeHtml 5 znakov: ${dom.includes('&quot;') ? 'OK' : 'manjka'}`);
console.log(`html tag: ${dom.includes('export function html') ? 'OK' : 'manjka'}`);
const html = readFileSync('index.html','utf8');
console.log(`CSP meta: ${html.includes('Content-Security-Policy') ? 'OK' : 'MANJKA'}`);
console.log(`innerHTML v src/app/grid.ts varno: ${readFileSync('src/app/grid.ts','utf8').includes('html`') ? 'OK' : 'preveri'}`);
console.log(`JSON.parse guard: ${tf.includes('try {') && tf.includes('JSON.parse') ? 'OK tryFormatJson' : 'manjka'}`);
console.log(`localStorage guard: ${store.includes('try {') && store.includes('localStorage.getItem') ? 'OK' : 'manjka'}`);
console.log(`lookbehind (?<= : ${readFileSync('src/tools/pure/encoding.ts','utf8').includes('(?<=') ? 'DA (Safari 16.4+)' : 'NE'}`);

console.log('\n=== DELOVANJE ===');
console.log(`manifest scope: ${JSON.parse(readFileSync('manifest.json','utf8')).scope}`);
console.log(`sw.js skipWaiting: ${readFileSync('sw.js','utf8').includes('skipWaiting') ? 'OK' : 'manjka'}`);
console.log(`vite base: ${readFileSync('vite.config.ts','utf8').match(/base:.*/)?.[0]}`);
console.log(`.nojekyll: ${(() => { try { readFileSync('.nojekyll','utf8'); return 'OK'; } catch { return 'MANJKA'; }})()}`);
console.log(`404.html SPA redirect: ${readFileSync('404.html','utf8').includes('targetUrl') ? 'OK' : 'manjka'}`);
