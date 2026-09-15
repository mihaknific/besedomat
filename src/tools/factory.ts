/**
 * Senior: tovarna za DRY definicije 111 orodij.
 * Prej: vsako orodje ponavlja `name:{sl,en,de}`, `desc`, `icon`, `category`, `tags` boilerplate.
 * Zdaj: `defineTool()` validira, doda `longDesc` fallback, normalizira `tags` (lowercase, dedup).
 */
import type { Tool } from '@/types';

type LangStr = { sl: string; en: string; de?: string };

export function defineTool<T extends Tool>(t: T): T {
  // validacija (fail-fast, ne tiho pokvari iskanja)
  if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) throw new Error(`Tool id neveljaven: ${t.id}`);
  if (!t.name?.sl || !t.name?.en) throw new Error(`Tool ${t.id} manjka name.sl/en`);
  if (!t.desc?.sl || !t.desc?.en) throw new Error(`Tool ${t.id} manjka desc`);
  // normalizacija tagov: lowercase + dedup + brez praznih
  if (t.tags) {
    const s = new Set(t.tags.map(x => String(x).toLowerCase().trim()).filter(Boolean));
    (t as unknown as { tags: string[] }).tags = [...s];
  }
  // longDesc fallback
  if (!t.longDesc)
    (t as unknown as { longDesc: LangStr }).longDesc = { sl: t.desc.sl, en: t.desc.en };
  return t;
}

// helper za text-transform brez ponavljanja `type:"text-transform"`
export function textTransform(
  id: string,
  icon: string,
  category: Tool['category'],
  name: LangStr,
  desc: LangStr,
  transform: (s: string) => string,
  extra: Partial<Tool> = {}
): Tool {
  return defineTool({
    id,
    icon,
    category,
    name,
    desc,
    tags: [],
    type: 'text-transform',
    transform,
    ...extra,
  } as unknown as Tool & { transform: (s: string) => string } as Tool);
}
