/**
 * Senior entry — Vite dev/build. Za `file://` ostaja monolitni index.html <script> (brez tega import-a).
 * Vite ga naloži samo ko `npm run dev` / `vite build` najde <script type="module" src="/src/main.ts">.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/tool-shell.css';
import { store } from './store';
import { getTool } from './tools/registry';

// global error boundary (senior: nikoli tiho spodleti)
window.addEventListener('error', e =>
  console.error('[Besedomat] unhandled:', e.error ?? e.message)
);
window.addEventListener('unhandledrejection', e => console.error('[Besedomat] promise:', e.reason));

// tema + jezik iz store → DOM
store.subscribeSelector(
  s => s.currentTheme,
  t => document.documentElement.setAttribute('data-theme', t)
);
store.subscribeSelector(
  s => s.currentLang,
  l => {
    document.documentElement.lang = l;
  }
);

// performance: označi težka orodja za lazy
export const HEAVY_TOOLS = new Set(['word-cloud', 'frequency', 'diff']);
export function shouldLazyLoad(id: string): boolean {
  return HEAVY_TOOLS.has(id);
}

// router helper (hash, deluje na file://)
export function openTool(id: string): void {
  const tool = getTool(id);
  if (!tool) {
    console.warn(`Tool ${id} ne obstaja`);
    return;
  }
  location.hash = `#/orodje/${id}`;
}
