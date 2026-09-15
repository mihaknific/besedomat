import { readFileSync } from 'node:fs';
const legacy = readFileSync('src/tools/legacy/renderers.ts','utf8');
// išči innerHTML kjer se vstavlja `text`, `input`, `value`, `user`, `data` brez escapeHtml
const patterns = [
  /innerHTML\s*=\s*[^;]*\b(text|input\.value|value|userInput|data)\b[^;]*;/g,
  /innerHTML\s*\+=/g,
  /\.insertAdjacentHTML/g
];
console.log('--- Globoka XSS analiza (uporabniški vnos v innerHTML) ---');
for (const re of patterns) {
  const hits = [...legacy.matchAll(re)];
  console.log(`${re}: ${hits.length} zadetkov`);
  for (const h of hits.slice(0,2)) console.log('  ', h[0].slice(0,150).replace(/\n/g,' '));
}
// preveri ali novi ToolComponent uporablja escapeHtml
const tc = readFileSync('src/components/ToolComponent.ts','utf8');
console.log('\nToolComponent escapeHtml:', tc.includes('escapeHtml') ? 'OK' : 'MANJKA');
const grid = readFileSync('src/app/grid.ts','utf8');
console.log('grid.ts html tag:', grid.includes('html`') ? 'OK varno' : 'innerHTML brez tag');
const search = readFileSync('src/utils/search.ts','utf8');
console.log('highlightMatch varno:', search.includes('escapeHtml') ? 'OK' : 'MANJKA');
