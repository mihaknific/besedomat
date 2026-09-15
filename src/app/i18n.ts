/**
 * Senior: i18n brez global `currentLang`. Prej `I18N[currentLang][key]` razpršeno + `innerHTML` XSS tveganje.
 * Zdaj: `t(key)` bere iz `store`, `applyI18n(root)` posodobi `[data-i18n]` varno (`textContent`).
 */
import { store } from '@/store';
import { I18N, getI } from '@/i18n';
import type { SupportedLang } from '@/types';

export function t(key: string, lang: SupportedLang = store.get('currentLang')): string {
  return getI(key, lang);
}

export function applyI18n(root: ParentNode = document): void {
  const lang = store.get('currentLang');
  const dict = I18N[lang] ?? I18N.sl;
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n!;
    const v = dict[k] ?? I18N.en[k] ?? k;
    // senior: textContent namesto innerHTML razen če je `grad` span namerno
    if (v.includes('<span')) el.innerHTML = v;
    else el.textContent = v;
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-ph]').forEach(el => {
    const k = (el as HTMLInputElement).dataset.i18nPh!;
    (el as HTMLInputElement).placeholder = dict[k] ?? I18N.en[k] ?? '';
  });
  document.documentElement.lang = lang;
}

export function initI18n(): () => void {
  applyI18n();
  return store.subscribeSelector(
    s => s.currentLang,
    () => applyI18n()
  );
}
