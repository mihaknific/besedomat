/**
 * Senior: centralni registry — validacija + indeks za hitro iskanje.
 * Prej: `TOOLS` global, `expandTags` mutacija, iskanje O(n) z regex na vsak keystroke.
 * Zdaj: indeks `Map<id, Tool>`, validiran ob zagonu, `getExpandedTags` čisto.
 */
import type { Tool } from '@/types';
import { TOOLS_LEGACY } from './legacy/catalog';
import { getExpandedTags } from '@/utils/text';

type Registry = {
  all: Tool[];
  byId: Map<string, Tool>;
  featured: Tool[];
};

function build(): Registry {
  const all: Tool[] = [];
  const byId = new Map<string, Tool>();
  for (const raw of TOOLS_LEGACY as unknown as Tool[]) {
    // senior: validacija + čista ekspanzija (ne mutira original)
    if (!raw.id || byId.has(raw.id)) throw new Error(`Duplicate/invalid id: ${raw.id}`);
    const tags = getExpandedTags(raw, 'sl'); // generiraj enkrat ob buildu, ne ob vsakem iskanju
    const tool = { ...raw, tags } as Tool;
    all.push(tool);
    byId.set(tool.id, tool);
  }
  return {
    all,
    byId,
    featured: all.filter(t => (t as unknown as { featured?: boolean }).featured),
  };
}

export const registry: Registry = build();
export const getTool = (id: string): Tool | undefined => registry.byId.get(id);
export const getAllTools = (): Tool[] => registry.all;
export const getFeaturedTools = (): Tool[] => registry.featured;

// senior: invertiran indeks zgrajen enkrat, deljen za vsa iskanja (O(1) lookup)
import { buildSearchIndex } from '@/utils/search-index';
export const searchIndex = buildSearchIndex(registry.all);
