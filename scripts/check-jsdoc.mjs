#!/usr/bin/env node
// Senior: preveri da ima vsak `export function` v pure/* JSDoc `/**` v prejšnjih 5 vrsticah.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, '../src/tools/pure');
let missing = 0;
for (const f of readdirSync(dir).filter(x => x.endsWith('.ts'))) {
  const c = readFileSync(resolve(dir, f), 'utf8');
  const re = /export function (\w+)/g; let m;
  while ((m = re.exec(c))) {
    const idx = m.index;
    const prev = c.slice(Math.max(0, idx - 500), idx);
    const lines = prev.split('\n').slice(-6).join('\n');
    if (!lines.includes('/**')) { console.log(`${f}: ${m[1]} manjka JSDoc`); missing++; }
  }
}
if (missing === 0) console.log('JSDoc OK — vse pure funkcije dokumentirane');
else console.log(`Opozorilo: manjka ${missing} JSDoc — dodaj /** @example */ pred export function (CI warning, ne fail)`);
process.exit(0);
