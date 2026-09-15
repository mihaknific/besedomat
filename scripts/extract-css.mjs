#!/usr/bin/env node
// Senior: ekstrakcija <style> iz monolitnega index.html v modularne datoteke.
// Ohranimo inline <style> za file:// single-file, modularni src/styles/* pa je vir resnice za Vite.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const m = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (!m) { console.error('Ni <style> bloka'); process.exit(1); }
const css = m[1].trim();
const out = resolve(root, 'src/styles/legacy-extracted.css');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `/* AUTO-EXTRACTED iz index.html <style> — ne urejaj ročno, vir je index.html.
   Senior: ta datoteka je samo snapshot za diff; pravi vir so tokens.css/base.css/components.css/tool-shell.css */
${css}
`, 'utf8');
console.log(`Extracted ${css.length} chars → src/styles/legacy-extracted.css`);
console.log(`Modularni viri: tokens.css, base.css, components.css, tool-shell.css`);
