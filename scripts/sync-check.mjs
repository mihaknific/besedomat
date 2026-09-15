// Besedomat — Sinhronizacijski pregledovalnik (Sync Checker)
// Preveri usklajenost med monolitnim index.html in src/ strukturo,
// vključno s številom orodij, ID-ji, PWA nastavitvami in CACHE_NAME v sw.js.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(`  ✓ ${msg}`);
}
function logFail(msg) {
  console.error(`  ✗ NAPAKA: ${msg}`);
  errors++;
}
function logWarn(msg) {
  console.warn(`  ⚠ OPOZORILO: ${msg}`);
  warnings++;
}

console.log('=== Besedomat: Preverjanje sinhronizacije in integritete ===\n');

// 1. Izvleček TOOLS iz index.html
const htmlPath = path.resolve(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractBlock(content, regex, label) {
  const m = content.match(regex);
  if (!m) {
    logFail(`Ni mogoče najti bloka: ${label}`);
    return null;
  }
  return m[0];
}

const svgSrc = extractBlock(html, /const SVG_ICONS = \{[\s\S]*?\n    \};/, 'SVG_ICONS');
const compactSrc = extractBlock(html, /const COMPACT_TAGS = \{[\s\S]*?\n    \};/, 'COMPACT_TAGS');
const toolsSrc = extractBlock(html, /const TOOLS = \[[\s\S]*?\n    \];/, 'TOOLS');
const pureSrc = extractBlock(html, /const PURE = \{[\s\S]*?\n    \};/, 'PURE');

let htmlTools = [];
if (toolsSrc && svgSrc && compactSrc && pureSrc) {
  const sandbox = {};
  const handler = {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'globalThis' || prop === 'window' || prop === 'self') return proxy;
      if (prop === 'console') return console;
      if ([
        'Math', 'JSON', 'Object', 'Array', 'String', 'RegExp', 'Number',
        'Boolean', 'Symbol', 'Map', 'Set', 'Date', 'Proxy', 'Promise',
        'parseInt', 'parseFloat', 'isNaN', 'decodeURIComponent', 'encodeURIComponent',
        'btoa', 'atob', 'TextEncoder', 'TextDecoder', 'Uint8Array', 'Uint16Array',
        'Uint32Array', 'Int8Array', 'Int32Array', 'DataView', 'Blob',
        'Error', 'TypeError', 'RangeError', 'SyntaxError', 'URIError'
      ].includes(prop)) return globalThis[prop];
      return function () { return undefined; };
    },
    set(target, prop, value) { target[prop] = value; return true; },
    has() { return true; },
  };
  const proxy = new Proxy(sandbox, handler);
  vm.createContext(proxy);
  const code = `${svgSrc}\n${compactSrc}\n${toolsSrc}\n${pureSrc}\n;globalThis.__TOOLS = TOOLS;`;
  try {
    vm.runInContext(code, proxy);
    htmlTools = sandbox.__TOOLS || [];
    logPass(`index.html vsebuje ${htmlTools.length} orodij`);
  } catch (err) {
    logFail(`Napaka pri razčlenjevanju TOOLS iz index.html: ${err.message}`);
  }
}

// 2. Preverjanje orodij v src/tools/legacy/catalog.ts
const catalogPath = path.resolve(root, 'src', 'tools', 'legacy', 'catalog.ts');
let catalogTools = [];
if (fs.existsSync(catalogPath)) {
  let catalogContent = fs.readFileSync(catalogPath, 'utf8');
  // Odstrani import vrstice in spremeni export const TOOLS_LEGACY v lokalno spremenljivko
  catalogContent = catalogContent.replace(/^import\s+[\s\S]*?;\s*$/gm, '');
  catalogContent = catalogContent.replace(/export\s+const\s+TOOLS_LEGACY\s*=/, 'const TOOLS_LEGACY =');

  const catalogSandbox = {};
  const catalogHandler = {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'globalThis' || prop === 'window' || prop === 'self') return catalogProxy;
      if (prop === 'console') return console;
      if ([
        'Math', 'JSON', 'Object', 'Array', 'String', 'RegExp', 'Number',
        'Boolean', 'Symbol', 'Map', 'Set', 'Date', 'Proxy', 'Promise',
        'parseInt', 'parseFloat', 'isNaN', 'decodeURIComponent', 'encodeURIComponent',
        'btoa', 'atob', 'TextEncoder', 'TextDecoder', 'Uint8Array', 'Uint16Array',
        'Uint32Array', 'Int8Array', 'Int32Array', 'DataView', 'Blob',
        'Error', 'TypeError', 'RangeError', 'SyntaxError', 'URIError'
      ].includes(prop)) return globalThis[prop];
      return function () { return undefined; };
    },
    set(target, prop, value) { target[prop] = value; return true; },
    has() { return true; },
  };
  const catalogProxy = new Proxy(catalogSandbox, catalogHandler);
  vm.createContext(catalogProxy);

  const catalogCode = `${svgSrc}\n${compactSrc}\n${pureSrc}\n${catalogContent}\n;globalThis.__TOOLS_LEGACY = TOOLS_LEGACY;`;
  try {
    vm.runInContext(catalogCode, catalogProxy);
    catalogTools = catalogSandbox.__TOOLS_LEGACY || [];
    logPass(`catalog.ts uspešno razčlenjen: vsebuje ${catalogTools.length} orodij`);

    if (htmlTools.length === catalogTools.length) {
      logPass(`Število orodij se popolnoma ujema (${htmlTools.length})`);
    } else {
      logFail(`Razhajanje v številu orodij: index.html (${htmlTools.length}) vs catalog.ts (${catalogTools.length})`);
    }

    const catalogIdSet = new Set(catalogTools.map(t => t.id));
    const missingInCatalog = htmlTools.filter(t => !catalogIdSet.has(t.id)).map(t => t.id);
    if (missingInCatalog.length > 0) {
      logFail(`Naslednja orodja manjkajo v catalog.ts: ${missingInCatalog.join(', ')}`);
    } else {
      logPass('Vsi ID-ji orodij iz index.html obstajajo v catalog.ts');
    }

    const htmlIdSet = new Set(htmlTools.map(t => t.id));
    const extraInCatalog = catalogTools.filter(t => !htmlIdSet.has(t.id)).map(t => t.id);
    if (extraInCatalog.length > 0) {
      logFail(`Naslednja orodja so odveč v catalog.ts: ${extraInCatalog.join(', ')}`);
    } else {
      logPass('V catalog.ts ni odvečnih orodij');
    }
  } catch (err) {
    logFail(`Napaka pri razčlenjevanju catalog.ts: ${err.message}`);
  }
} else {
  logWarn('src/tools/legacy/catalog.ts ne obstaja.');
}

// 3. Preverjanje Service Worker (sw.js)
const swPath = path.resolve(root, 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const cacheMatch = swContent.match(/CACHE_NAME\s*=\s*["']([^"']+)["']/);
  if (cacheMatch) {
    const cacheName = cacheMatch[1];
    logPass(`sw.js CACHE_NAME je nastavljen na "${cacheName}"`);
    if (!cacheName.startsWith('besedomat-v')) {
      logWarn(`CACHE_NAME "${cacheName}" ne sledi pričakovani obliki "besedomat-vX"`);
    }
  } else {
    logFail('sw.js ne vsebuje veljavne definicije CACHE_NAME');
  }
} else {
  logFail('sw.js ne obstaja');
}

// 4. Preverjanje manifest.json
const manifestPath = path.resolve(root, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.name && manifest.icons && manifest.start_url) {
      logPass(`manifest.json je veljaven (aplikacija: "${manifest.name}")`);
    } else {
      logWarn('manifest.json nima vseh priporočenih polj (name, icons, start_url)');
    }
  } catch (err) {
    logFail(`manifest.json ni veljaven JSON: ${err.message}`);
  }
} else {
  logFail('manifest.json ne obstaja');
}

// 5. Preverjanje duplikatov ID-jev v orodjih
if (htmlTools.length > 0) {
  const seenIds = new Set();
  const duplicates = [];
  for (const t of htmlTools) {
    if (seenIds.has(t.id)) duplicates.push(t.id);
    seenIds.add(t.id);
  }
  if (duplicates.length === 0) {
    logPass('Vsi ID-ji orodij so edinstveni');
  } else {
    logFail(`Najdeni podvojeni ID-ji orodij: ${duplicates.join(', ')}`);
  }
}

// 6. Preverjanje osnovnih elementov index.html
if (html.includes('id="install-app-btn"') && html.includes('id="drawer-install-app-btn"')) {
  logPass('Gumba za namestitev aplikacije (namizje in predal) sta prisotna');
} else {
  logWarn('Eden ali oba gumba za namestitev nista najdena v index.html');
}

console.log('\n------------------------------------------------------------');
if (errors === 0) {
  console.log(`✓ Vsi pregledi sinhronizacije so USPEŠNO opravljeni. (${warnings} opozoril)`);
  process.exit(0);
} else {
  console.error(`✗ Najdenih ${errors} napak in ${warnings} opozoril pri sinhronizaciji.`);
  process.exit(1);
}
