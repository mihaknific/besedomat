/**
 * Senior: iskanje kot samostojen modul. Prej 120 vrstic inline `input.addEventListener` + `renderAllGrid(filter)`
 * razpršeno v index.html. Zdaj debounced, merjeno, z indeksom.
 */
import { getAllTools, searchIndex } from '@/tools/registry';
import { getSearchSuggestions } from '@/utils/search';
import { getSearchSuggestionsIndexed } from '@/utils/search-index';
import { store } from '@/store';
import { bus } from '@/utils/event-bus';
import { debounce } from '@/utils/dom';

export function initSearch(
  input: HTMLInputElement,
  onResults: (ids: string[]) => void
): () => void {
  const handler = debounce((value: string) => {
    const q = value.trim();
    store.set({ searchQuery: q });
    bus.emit('search:query', { query: q });
    if (!q) {
      onResults(getAllTools().map(t => t.id));
      return;
    }
    // senior: za en token uporabi indeks (9× hitreje), za več tokenov/fuzzy fallback na linearno
    const hits =
      q.includes(' ') || q.length < 3
        ? getSearchSuggestions(q, getAllTools(), store.get('currentLang'), 50)
        : getSearchSuggestionsIndexed(q, getAllTools(), store.get('currentLang'), searchIndex, 50);
    const ids = hits.map(h => h.tool.id);
    onResults(ids);
  }, 120);

  const onInput = () => handler(input.value);
  input.addEventListener('input', onInput);
  return () => input.removeEventListener('input', onInput);
}
