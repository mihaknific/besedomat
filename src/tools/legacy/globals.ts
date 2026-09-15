// @ts-nocheck
// Central import point for legacy tool renderers. Re-exports every helper the
// migrated render functions reference (they were previously globals).
import { SVG_ICONS } from '../icons';
import { getI } from '@/i18n';
import {
  escapeHtml,
  escapeRegExp,
  copyText,
  copyLegacy,
  showToast,
  flashCopied,
  secureRandomInt,
  randomFromString,
  showToolBusy,
  showToolErrorBanner,
  safeUpdate,
  debounce,
  HEAVY_LIMIT,
  totalTextLength,
} from '@/utils/dom';
import {
  normalizeDiacritics,
  normalizeForSearch,
  levenshtein,
  SL_DIACRITICS_MAP,
  computeSearchScore,
  getSearchSuggestions,
  highlightMatch,
} from '@/utils/search';
import { CATEGORIES, TextUtils, expandTags, LONGDESC_DE } from '@/utils/text';
import { PURE } from '../PURE';
import { store } from '@/store';
import { announceResult, announceInfo } from '@/components/ToolComponent';

// qrcode library: loaded as a global from index.html (qrcode.min.js) to avoid
// a hard npm dependency during the incremental migration.
const qrcode = (globalThis as unknown as { qrcode?: unknown }).qrcode;

export {
  SVG_ICONS,
  getI,
  escapeHtml,
  escapeRegExp,
  copyText,
  copyLegacy,
  showToast,
  flashCopied,
  secureRandomInt,
  randomFromString,
  showToolBusy,
  showToolErrorBanner,
  safeUpdate,
  debounce,
  HEAVY_LIMIT,
  totalTextLength,
  normalizeDiacritics,
  normalizeForSearch,
  levenshtein,
  SL_DIACRITICS_MAP,
  computeSearchScore,
  getSearchSuggestions,
  highlightMatch,
  CATEGORIES,
  TextUtils,
  expandTags,
  LONGDESC_DE,
  PURE,
  store,
  announceResult,
  announceInfo,
  qrcode,
  createStandardTool,
};

export function createStandardTool(container: HTMLElement, options: any) {
  options = options || {};
  const L = currentLang === 'sl';
  const id = options.idPrefix || 'st';
  const settingsHtml = options.settingsHtml || '';
  const inputPlaceholder = options.inputPlaceholder || (L ? 'Vnesite besedilo...' : 'Enter text...');
  const outputPlaceholder = options.outputPlaceholder || (L ? 'Rezultat bo tukaj...' : 'Result will appear here...');
  const isReadOnly = options.readOnly !== false;

  container.innerHTML = `
    ${settingsHtml ? `<div class="settings-bar" style="margin-bottom:14px;">${settingsHtml}</div>` : ''}
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="${id}-input">${getI('ui_input')}</label>
        <textarea id="${id}-input" placeholder="${escapeHtml(inputPlaceholder)}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="${id}-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">
            ${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span>
          </button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="${id}-output">${getI('ui_output')}</label>
        <textarea id="${id}-output" ${isReadOnly ? 'readonly' : ''} placeholder="${escapeHtml(outputPlaceholder)}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="${id}-copy" style="display:inline-flex; align-items:center; gap:5px;">
            ${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector(`#${id}-input`) as HTMLTextAreaElement;
  const output = container.querySelector(`#${id}-output`) as HTMLTextAreaElement;
  const clearBtn = container.querySelector(`#${id}-clear`) as HTMLButtonElement;
  const copyBtn = container.querySelector(`#${id}-copy`) as HTMLButtonElement;

  const onUpdate = options.onUpdate;
  const safe = onUpdate ? safeUpdate(onUpdate, container) : null;

  clearBtn.addEventListener('click', () => {
    input.value = '';
    if (safe) safe();
    else if (onUpdate) onUpdate();
    input.focus();
  });

  copyBtn.addEventListener('click', () => {
    copyText(output.value, copyBtn);
  });

  if (safe) {
    input.addEventListener('input', safe);
  }

  return { input, output, clearBtn, copyBtn, safe, update: onUpdate };
}

export let currentLang: 'sl' | 'en' | 'de' = store.get('currentLang');
store.subscribe(s => {
  currentLang = s.currentLang;
});
