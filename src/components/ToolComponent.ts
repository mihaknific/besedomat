import { store } from '@/store';
import type { SupportedLang } from '@/types';
import { copyText, escapeHtml } from '@/utils/dom';
import { SVG_ICONS } from '@/tools/icons';
import { getI } from '@/i18n';

export interface ScaffoldOptions {
  inputId?: string;
  outputId?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  inputValue?: string;
  settingsBarHtml?: string;
  panelLabels?: { input?: string; output?: string };
  extraPanelsHtml?: string;
}

/**
 * Base class for custom two-column tools. Provides the shared
 * input/output scaffold, copy & clear buttons, and event wiring so
 * individual tools only implement `compute()`.
 */
export abstract class ToolComponent {
  protected container: HTMLElement;
  protected lang: SupportedLang;
  protected inputEl?: HTMLTextAreaElement;
  protected outputEl?: HTMLTextAreaElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.lang = store.get('currentLang');
  }

  abstract get id(): string;

  protected scaffold(opts: ScaffoldOptions = {}): void {
    const inputId = opts.inputId || 'tool-input';
    const outputId = opts.outputId || 'tool-output';
    const L = this.lang;
    const settings = opts.settingsBarHtml
      ? `<div class="settings-bar">${opts.settingsBarHtml}</div>`
      : '';
    this.container.innerHTML = `
      ${settings}
      <div class="tool-workspace-2col">
        <div class="tool-panel">
          <label for="${inputId}">${opts.panelLabels?.input || getI('ui_input', L)}</label>
          <textarea id="${inputId}" placeholder="${escapeHtml(opts.inputPlaceholder || '')}">${escapeHtml(opts.inputValue || '')}</textarea>
          <div class="panel-actions">
            <button class="btn-sm" id="${inputId}-clear" title="${getI('ui_clear', L)}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear', L)}</span></button>
          </div>
        </div>
        <div class="tool-panel">
          <label for="${outputId}">${opts.panelLabels?.output || getI('ui_output', L)}</label>
          <textarea id="${outputId}" readonly placeholder="${escapeHtml(opts.outputPlaceholder || '')}"></textarea>
          <div class="panel-actions">
            <button class="btn-sm primary" id="${outputId}-copy">${SVG_ICONS.mi_copy} <span>${getI('ui_copy', L)}</span></button>
          </div>
          ${opts.extraPanelsHtml || ''}
        </div>
      </div>
    `;
    this.inputEl = this.container.querySelector(`#${inputId}`) as HTMLTextAreaElement;
    this.outputEl = this.container.querySelector(`#${outputId}`) as HTMLTextAreaElement;
    this.container.querySelector(`#${inputId}-clear`)?.addEventListener('click', () => {
      this.inputEl!.value = '';
      void this.update();
      this.inputEl!.focus();
    });
    this.container.querySelector(`#${outputId}-copy`)?.addEventListener('click', () => {
      void copyText(
        this.outputEl!.value,
        this.container.querySelector(`#${outputId}-copy`) as HTMLElement
      );
    });
  }

  protected update(): void {
    if (!this.inputEl || !this.outputEl) return;
    try {
      const result = this.compute(this.inputEl.value);
      if (result !== undefined) this.outputEl.value = result;
      this.container.querySelector('.tool-error-banner')?.remove();
      // a11y: oznani posodobitev (aria-live)
      const live = document.getElementById('a11y-result-status');
      if (live) live.textContent = `Posodobljeno, ${this.outputEl.value.length} znakov`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // senior: error boundary — ne sesuj app, pokaži banner
      let b = this.container.querySelector('.tool-error-banner') as HTMLElement | null;
      if (!b) {
        b = document.createElement('div');
        b.className = 'tool-error-banner';
        b.setAttribute('role', 'alert');
        this.container.prepend(b);
      }
      b.textContent = msg;
      console.error(`[Tool ${this.id}]`, e);
    }
  }

  protected abstract compute(input: string): string | void;

  /** Default render: scaffold + bind input. Override for custom layouts. */
  render(): void {
    this.mount();
    this.bind();
    this.inputEl?.addEventListener('input', () => this.update());
    this.update();
  }

  protected mount(): void {
    this.scaffold();
  }

  protected bind(): void {
    /* override if needed */
  }
}

export function announceResult(len: number): void {
  const el = document.getElementById('a11y-result-status');
  if (!el) return;
  const lang = store.get('currentLang');
  el.textContent =
    lang === 'sl'
      ? `Rezultat posodobljen, ${len} znakov.`
      : lang === 'de'
        ? `Ergebnis aktualisiert, ${len} Zeichen.`
        : `Result updated, ${len} characters.`;
}

export function announceInfo(msg: string): void {
  const el = document.getElementById('a11y-result-status');
  if (el) el.textContent = msg;
}
