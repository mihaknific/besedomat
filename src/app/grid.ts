/**
 * Senior: grid rendering — prevzema realne kartice orodij, ne le prazno komponento.
 * Uporablja isto vizualno obliko kot delujoča verzija: naslov, opis, ikona, zvezdica in
 * klikni / tipka dogodki za home/all/favorites prikaze.
 */
import type { Tool } from '@/types';
import { escapeHtml, html } from '@/utils/dom';

export type GridRenderOptions = {
  emptyMsg?: string;
  highlightedQuery?: string;
  isFavorite?: (toolId: string) => boolean;
  onOpen?: (toolId: string) => void;
  onToggleFavorite?: (toolId: string) => void;
};

function highlightMatch(text: string, query: string): string {
  const q = query.trim();
  if (!q) return escapeHtml(text);
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'ig'));
  return parts
    .map(part => {
      if (part.toLowerCase() === q.toLowerCase()) {
        return `<mark>${escapeHtml(part)}</mark>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCardTitle(tool: Tool, lang: 'sl' | 'en' | 'de' = 'sl'): string {
  return tool.name[lang] || tool.name.en || tool.name.sl || tool.id;
}

function getCardDesc(tool: Tool, lang: 'sl' | 'en' | 'de' = 'sl'): string {
  return tool.desc[lang] || tool.desc.en || tool.desc.sl || '';
}

export function renderGrid(
  container: HTMLElement,
  tools: Tool[],
  opts: GridRenderOptions = {}
): void {
  if (tools.length === 0) {
    container.innerHTML = `<p class="text-dim">${escapeHtml(opts.emptyMsg ?? 'Ni rezultatov')}</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  const lang = (document.documentElement.lang || 'sl') as 'sl' | 'en' | 'de';
  const query = opts.highlightedQuery ?? '';
  const isFavorite = opts.isFavorite ?? (() => false);

  for (const tool of tools) {
    const el = document.createElement('article');
    const isFav = isFavorite(tool.id);
    const title = getCardTitle(tool, lang);
    const desc = getCardDesc(tool, lang);
    const starSvg = `
      <svg class="svg-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z"/>
      </svg>`;

    el.className = 'card';
    el.dataset.id = tool.id;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', title);

    el.innerHTML = html`
      <div class="card-top">
        <div class="card-icon">${tool.icon || ''}</div>
        <button
          class="star-btn ${isFav ? 'active' : ''}"
          data-star="${tool.id}"
          type="button"
          aria-label="${isFav ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'}"
          aria-pressed="${isFav ? 'true' : 'false'}"
          title="${isFav ? 'Odstrani iz priljubljenih' : 'Dodaj med priljubljene'}"
        >
          ${starSvg}
        </button>
      </div>
      <h3>${query ? highlightMatch(title, query) : escapeHtml(title)}</h3>
      <p>${query ? highlightMatch(desc, query) : escapeHtml(desc)}</p>
    `;

    const open = () => opts.onOpen?.(tool.id);
    const toggleStar = (event: Event) => {
      event.stopPropagation();
      opts.onToggleFavorite?.(tool.id);
    };

    el.addEventListener('click', e => {
      if ((e.target as HTMLElement).closest('.star-btn')) return;
      open();
    });
    el.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.code !== 'Space') return;
      if ((e.target as HTMLElement).closest('.star-btn')) return;
      e.preventDefault();
      open();
    });

    el.querySelector('.star-btn')?.addEventListener('click', toggleStar);
    frag.appendChild(el);
  }

  container.replaceChildren(frag);
}
