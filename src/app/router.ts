/**
 * Senior: ločitev UI (router) od domene (registry). Prej 200 vrstic inline `handleRoute` v index.html.
 * Hash router deluje na file:// in GH Pages brez serverja.
 */
import { getTool } from '@/tools/registry';
import { store } from '@/store';

export type View = 'home' | 'all' | 'favorites' | 'tool' | 'privacy' | 'terms' | 'about';

const HASH: Record<string, View> = {
  '#/': 'home',
  '#/vsa': 'all',
  '#/priljubljena': 'favorites',
  '#/zasebnost': 'privacy',
  '#/pogoji': 'terms',
  '#/o-nas': 'about',
};

export function parseHash(hash: string): { view: View; toolId?: string } {
  if (hash.startsWith('#/orodje/')) return { view: 'tool', toolId: hash.slice(9) };
  return { view: HASH[hash] ?? 'home' };
}

export function navigate(view: View, toolId?: string): void {
  if (view === 'tool' && toolId) location.hash = `#/orodje/${toolId}`;
  else {
    const rev = Object.entries(HASH).find(([, v]) => v === view)?.[0];
    if (rev) location.hash = rev;
  }
}

export function initRouter(onChange: (view: View, toolId?: string) => void): () => void {
  const handler = () => {
    const { view, toolId } = parseHash(location.hash);
    if (toolId && !getTool(toolId)) {
      navigate('home');
      return;
    }
    store.set({ activeView: view, activeToolId: toolId ?? null });
    onChange(view, toolId);
  };
  window.addEventListener('hashchange', handler);
  handler();
  return () => window.removeEventListener('hashchange', handler);
}
