/**
 * Senior: tema kot čista funkcija + en vir resnice. Prej 80 vrstic inline v index.html
 * z direktnim `localStorage` + `document.documentElement.setAttribute` razpršeno.
 */
import { store, setTheme } from '@/store';
import type { ThemeName } from '@/types';

export function applyTheme(theme: ThemeName): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme(): () => void {
  applyTheme(store.get('currentTheme'));
  return store.subscribeSelector(s => s.currentTheme, applyTheme);
}

export function bindThemeControls(root: ParentNode): void {
  root.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-theme]');
    if (!btn) return;
    const t = btn.dataset.theme as ThemeName | undefined;
    if (t) setTheme(t);
  });
}
