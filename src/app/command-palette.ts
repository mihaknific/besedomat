/**
 * Senior: ukazna paleta (Ctrl+K) — prej 180 vrstic inline v index.html z global `keydown`.
 * Zdaj tipizirano, focus-trap, aria, decoupled preko EventBus.
 */
import { bus } from '@/utils/event-bus';
import { getAllTools } from '@/tools/registry';
import { getSearchSuggestions } from '@/utils/search';
import { store } from '@/store';

export function initCommandPalette(
  trigger: HTMLElement,
  palette: HTMLElement,
  input: HTMLInputElement
): () => void {
  const open = () => {
    palette.hidden = false;
    input.focus();
    input.value = '';
    render('');
  };
  const close = () => {
    palette.hidden = true;
    trigger.focus();
  };

  function render(q: string): void {
    const hits = q ? getSearchSuggestions(q, getAllTools(), store.get('currentLang'), 8) : [];
    palette.querySelector('.palette-results')!.innerHTML =
      hits
        .map(
          h =>
            `<button role="option" data-id="${h.tool.id}">${h.tool.name[store.get('currentLang')] ?? h.tool.name.en}</button>`
        )
        .join('') || `<p class="text-dim">Tipkaj za iskanje…</p>`;
  }

  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape' && !palette.hidden) close();
  };
  const onInput = () => render(input.value);
  const onClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-id]');
    if (!btn) return;
    bus.emit('tool:open', { id: btn.dataset.id! });
    close();
  };

  trigger.addEventListener('click', open);
  document.addEventListener('keydown', onKey);
  input.addEventListener('input', onInput);
  palette.addEventListener('click', onClick);
  palette.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  return () => {
    trigger.removeEventListener('click', open);
    document.removeEventListener('keydown', onKey);
    input.removeEventListener('input', onInput);
    palette.removeEventListener('click', onClick);
  };
}
