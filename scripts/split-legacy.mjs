#!/usr/bin/env node
/**
 * Senior: avtomatsko razbije src/tools/legacy/renderers.ts (71 funkcij, 701kb)
 * v src/tools/custom/by-category/*.ts — vsaka kategorija posebej, pripravljeno za ToolComponent migracijo.
 * Uporaba: node scripts/split-legacy.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = readFileSync(resolve(root, 'src/tools/legacy/renderers.ts'), 'utf8');
const catMap = new Map();

// regex za `function renderFoo(container) {`
const re = /function (render[A-Za-z0-9_]+)\(container\)/g;
let m, lastIdx = 0, lastName = null;
const entries = [];
while ((m = re.exec(src)) !== null) {
  if (lastName) entries.push({ name: lastName, code: src.slice(lastIdx, m.index).trim() });
  lastName = m[1]; lastIdx = m.index;
}
if (lastName) entries.push({ name: lastName, code: src.slice(lastIdx).trim() });

console.log(`Najdenih ${entries.length} render funkcij`);

// groba kategorizacija po imenu (za senior pregled, ne za runtime)
function catFor(name) {
  if (/^(renderReverse|renderSort|renderPad|renderDuplicate)/.test(name)) return 'editing';
  if (/^(renderCaesar|renderAtbash|renderRot|renderVigenere|renderPigpen|renderHash|renderHex)/.test(name)) return 'security';
  if (/^(renderLeet|renderEmoji|renderAscii|renderAcrostic|renderFake)/.test(name)) return 'textfun';
  if (/^(renderQR|renderLorem|renderPassword)/.test(name)) return 'generator';
  return 'other';
}

for (const { name, code } of entries) {
  const cat = catFor(name);
  if (!catMap.has(cat)) catMap.set(cat, []);
  catMap.get(cat).push({ name, code });
}

for (const [cat, list] of catMap) {
  const dir = resolve(root, `src/tools/custom/by-category`);
  mkdirSync(dir, { recursive: true });
  const out = resolve(dir, `${cat}.ts`);
  const header = `/** AUTO-SPLIT iz legacy/renderers.ts — kategorija ${cat} (${list.length} orodij). Migriraj vsak render v ToolComponent. */\n`;
  const body = list.map(e => e.code).join('\n\n');
  writeFileSync(out, header + body, 'utf8');
  console.log(`→ ${cat}.ts (${list.length})`);
}
console.log('Končano. Ročno premakni vsak `function renderFoo` v `src/tools/custom/foo.ts extends ToolComponent`.');
