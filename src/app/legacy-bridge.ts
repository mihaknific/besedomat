/**
 * Senior: most med monolitnim index.html (file://) in modularnim src/ (Vite).
 * Za file:// se naloži kar inline <script> v index.html (ni tega modula).
 * Za Vite `npm run dev` se ta modul naloži in re-exporta legacy za postopno migracijo.
 * Ko bo vsak `renderFoo` migriran v `custom/*`, se ta most izbriše.
 */
export { TOOLS_LEGACY } from '@/tools/legacy/catalog';
export * from '@/tools/legacy/renderers';
export { PURE } from '@/tools/PURE';
