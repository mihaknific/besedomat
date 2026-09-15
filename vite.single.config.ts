/**
 * Senior: single-file build za prenos kot ZIP na file:// brez strežnika.
 * `npm run build:single` → dist/index.html z inline JS/CSS (en datoteka = dvojni klik).
 * Vir resnice ostaja src/ + modularni CSS; index.html v korenu je zdaj build artefakt.
 */
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root: '.',
  base: './',
  publicDir: false,
  build: { outDir: 'dist-single', assetsInlineLimit: 100000000 },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  plugins: [viteSingleFile()]
});
