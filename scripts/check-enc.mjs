import { readFileSync } from 'node:fs';
const s = readFileSync('src/tools/legacy/catalog.ts', 'utf8');
const idx = s.indexOf('tevec besed');
console.log('context around tags:', JSON.stringify(s.slice(idx - 30, idx + 30)));
console.log('has real s-caron:', s.includes('števec'));
console.log('has question-mark replacement:', s.includes('??tevec'));
