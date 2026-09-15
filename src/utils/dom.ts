import { PURE } from '@/tools/PURE';
import { secureRandomInt as _secureRandomInt, pickRandomChar } from './crypto';

/**
 * SENIOR FIX: prvotno `s.replace(/&/g, "&")` je bil no-op in ni escapal `<>`.
 * Zdaj pravilno escapa vseh 5 kritičnih znakov (`& < > " '`) — prepreči XSS
 * ko `innerHTML` vsebuje uporabniški vnos (npr. `highlightMatch`).
 */
export function escapeHtml(s: unknown): string {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeRegExp(s: string): string {
  return PURE.escapeRegExp(s);
}

/**
 * Varna predloga: `html`<div>${userInput}</div>`` avtomatsko escapa interpolacije,
 * literali (`<div>`) ostanejo nedotaknjeni. Prepreči pozabljen `escapeHtml()`.
 * @example html`<span>${name}</span>` → `<span>&lt;script&gt;</span>` če je name=`<script>`
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) out += escapeHtml(String(values[i] ?? ''));
  }
  return out;
}

export const secureRandomInt = _secureRandomInt;
export function randomFromString(str: string): string {
  return pickRandomChar(str);
}
export { secureShuffle } from './crypto';

export function copyLegacy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed; top:-1000px; opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export async function copyText(
  text: string | null | undefined,
  btn?: HTMLElement | null
): Promise<boolean> {
  if (text === undefined || text === null) return false;
  let ok = false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(String(text));
      ok = true;
    }
  } catch {
    ok = false;
  }
  if (!ok) ok = copyLegacy(String(text));
  if (ok) flashCopied(btn);
  else {
    const lang = (document.documentElement.lang as 'sl' | 'en' | 'de') || 'en';
    showToast(
      lang === 'sl'
        ? 'Kopiranje v odložišče ni uspelo.'
        : lang === 'de'
          ? 'Kopieren fehlgeschlagen.'
          : 'Copy to clipboard failed.'
    );
  }
  return ok;
}

export function flashCopied(btn?: HTMLElement | null): void {
  if (!btn) return;
  const oldHtml = btn.innerHTML;
  const lang = (document.documentElement.lang as 'sl' | 'en' | 'de') || 'en';
  const label = lang === 'sl' ? 'Kopirano!' : lang === 'de' ? 'Kopiert!' : 'Copied!';
  btn.innerHTML = `<svg class="svg-stroke" width="14" height="14" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> <span>${label}</span>`;
  setTimeout(() => {
    btn.innerHTML = oldHtml;
  }, 1200);
}

let toastEl: HTMLElement | null = null;
export function showToast(msg: string): void {
  if (!toastEl) toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl?.classList.remove('show'), 2400);
}

export function showToolErrorBanner(container: HTMLElement | null, message: string): void {
  if (!container) return;
  let banner = container.querySelector(':scope > .tool-error-banner') as HTMLElement | null;
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'tool-error-banner';
    banner.setAttribute('role', 'alert');
    if (container.firstChild) container.insertBefore(banner, container.firstChild);
    else container.appendChild(banner);
  }
  const lang = (document.documentElement.lang as 'sl' | 'en' | 'de') || 'en';
  banner.textContent = (lang === 'sl' ? 'Napaka pri obdelavi: ' : 'Processing error: ') + message;
}

export function showToolBusy(container: HTMLElement | null, on: boolean): void {
  if (!container) return;
  let el = container.querySelector(':scope > .tool-busy') as HTMLElement | null;
  if (on) {
    if (!el) {
      el = document.createElement('div');
      el.className = 'tool-busy';
      el.setAttribute('aria-live', 'polite');
      if (container.firstChild) container.insertBefore(el, container.firstChild);
      else container.appendChild(el);
    }
    const lang = (document.documentElement.lang as 'sl' | 'en' | 'de') || 'en';
    el.textContent = lang === 'sl' ? 'Računam…' : 'Computing…';
  } else if (el) {
    el.remove();
  }
}

export function totalTextLength(root: ParentNode | null): number {
  let n = 0;
  if (root)
    root.querySelectorAll('textarea, input').forEach(el => {
      n += ((el as HTMLInputElement | HTMLTextAreaElement).value || '').length;
    });
  return n;
}

export const HEAVY_LIMIT = 200000;

export function safeUpdate(
  fn: () => void,
  container: HTMLElement,
  opts?: { heavy?: boolean }
): () => void {
  opts = opts || {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = () => {
    try {
      return fn();
    } catch (e) {
      showToolErrorBanner(container, e && (e as Error).message ? (e as Error).message : String(e));
    }
  };
  if (opts.heavy) {
    return () => {
      if (timer) clearTimeout(timer);
      showToolBusy(container, true);
      timer = setTimeout(() => {
        run();
        showToolBusy(container, false);
      }, 200);
    };
  }
  return run;
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms = 150): T {
  let t: ReturnType<typeof setTimeout> | null = null;
  return ((...args: never[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}
