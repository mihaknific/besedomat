import { readFileSync } from 'node:fs';
const html = readFileSync('index.html','utf8');
const legacy = readFileSync('src/tools/legacy/renderers.ts','utf8');
const dom = readFileSync('src/utils/dom.ts','utf8');

// 1. XSS: ali je kje innerHTML z uporabniškim vnosom brez escapeHtml/html``?
console.log('--- XSS audit ---');
const innerHTMLHits = [...legacy.matchAll(/\.innerHTML\s*=\s*`([^`]*\$\{[^}]+\}[^`]*`)/g)].slice(0,5);
console.log(`legacy innerHTML z interpolacijo: ${innerHTMLHits.length} (od 113 renderjev)`);
for (const m of innerHTMLHits.slice(0,2)) console.log('  primer:', m[0].slice(0,120).replace(/\n/g,' '));
console.log(`escapeHtml pokritost: ${dom.includes('escapeHtml') ? 'OK' : 'manjka'}`);
console.log(`html tag varna predloga: ${dom.includes('export function html') ? 'OK' : 'manjka'}`);

// 2. CSP
console.log('\n--- CSP ---');
console.log(`index.html CSP meta: ${html.includes('Content-Security-Policy') ? 'IMA' : 'NIMA (priporočeno za GH Pages)'}`);
console.log(`vite.config CSP header: ${readFileSync('vite.config.ts','utf8').includes('Content-Security') ? 'IMA' : 'NIMA (odstranjeno za dev)'}`);

// 3. Crypto bias
console.log('\n--- Crypto ---');
const cryptoSrc = readFileSync('src/utils/crypto.ts','utf8');
console.log(`secureRandomInt rejection sampling: ${cryptoSrc.includes('limit = Math.floor(0x100000000') ? 'OK 32-bit' : 'dvomljivo'}`);
console.log(`secureShuffle uporablja crypto: ${cryptoSrc.includes('secureRandomInt') ? 'OK' : 'manjka'}`);
const pwd = readFileSync('src/tools/pure/password.ts','utf8');
console.log(`password.ts uporablja crypto.ts: ${pwd.includes("from '@/utils/crypto'") ? 'OK en vir' : 'duplikat'}`);

// 4. SW scope
console.log('\n--- PWA ---');
const sw = readFileSync('sw.js','utf8');
console.log(`sw.js ASSETS relativno: ${sw.includes('"./"') ? 'OK' : 'absolutno!'}`);
console.log(`sw.js skipWaiting: ${sw.includes('skipWaiting') ? 'OK' : 'manjka'}`);
const manifest = JSON.parse(readFileSync('manifest.json','utf8'));
console.log(`manifest scope/start_url: ${manifest.scope} / ${manifest.start_url} ${manifest.scope==='./'?'OK':'NAPAČNO'}`);

// 5. GH Pages poti
console.log('\n--- GH Pages ---');
console.log(`index.html absolutni href="/": ${ (html.match(/href="\//g)||[]).length } (mora biti 0)`);
console.log(`vite base: ${readFileSync('vite.config.ts','utf8').match(/base:.*/)?.[0]}`);
console.log(`.nojekyll: ${readFileSync('.nojekyll','utf8')!==undefined ? 'OK' : 'manjka'}`);
