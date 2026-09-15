/**
 * Senior: skupni UI gradniki za orodja.
 * Namesto 71× kopije iste 2-col strukture → en vir resnice.
 */
import { getI } from '@/i18n';
import type { SupportedLang } from '@/types';

export function settingsBar(inner: string): string {
  return `<div class="settings-bar">${inner}</div>`;
}

export function selectHtml(
  id: string,
  label: string,
  options: Array<{ value: string; label: string; selected?: boolean }>
): string {
  const opts = options
    .map(o => `<option value="${o.value}"${o.selected ? ' selected' : ''}>${o.label}</option>`)
    .join('');
  return `<label>${label} <select id="${id}">${opts}</select></label>`;
}

export function checkboxHtml(id: string, label: string, checked = false): string {
  return `<label><input type="checkbox" id="${id}"${checked ? ' checked' : ''}> ${label}</label>`;
}

export function numberHtml(
  id: string,
  label: string,
  value: number,
  min: number,
  max: number
): string {
  return `<label>${label} <input type="number" id="${id}" value="${value}" min="${min}" max="${max}"></label>`;
}

export function i18nLabel(key: string, lang: SupportedLang): string {
  return getI(key, lang);
}
