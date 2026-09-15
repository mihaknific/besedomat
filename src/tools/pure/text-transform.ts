/**
 * @module pure/text-transform — vse pretvorbe besedila, čisto.
 */
import type { DiffLine, FindReplaceResult } from '@/types';
import { escapeRegExp, wholeWordPattern } from './encoding';
import { Ok, Err, type Result } from '@/utils/result';

/** Šifrira ali dešifrira besedilo s Caesarjevim premikom. */
export function caesarCipher(
  text: string,
  shift: number,
  encode: boolean,
  keepCase: boolean
): string {
  const dir = encode ? 1 : -1;
  const s = parseInt(shift as unknown as string, 10) || 0;
  return (text || '').replace(/[A-Za-z]/g, c => {
    const isUpper = c === c.toUpperCase();
    const base = isUpper ? 65 : 97;
    let code = c.charCodeAt(0) - base;
    code = (code + dir * s + 26) % 26;
    const r = String.fromCharCode(base + code);
    return keepCase ? r : r.toLowerCase();
  });
}

/** Formatira JSON in po želji uredi ključe. */
export function formatJson(
  text: string,
  opts?: { indent?: number | 'tab'; sort?: boolean }
): string {
  const r = tryFormatJson(text, opts);
  if (!r.ok) throw new SyntaxError(r.error);
  return r.value;
}

/** Senior: eksplicitni Result namesto throw — klicatelj odloči (UI banner vs. throw). */
export function tryFormatJson(
  text: string,
  opts?: { indent?: number | 'tab'; sort?: boolean }
): Result<string, string> {
  try {
    const indent = opts?.indent ?? 2;
    const sort = !!opts?.sort;
    const sp =
      indent === 'tab' ? '\t' : indent === 0 ? 0 : parseInt(indent as unknown as string, 10) || 2;
    let parsed: unknown = JSON.parse(text);
    if (sort) {
      const sortObject = (o: unknown): unknown => {
        if (o === null || typeof o !== 'object') return o;
        if (Array.isArray(o)) return o.map(sortObject);
        return Object.keys(o as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((a, k) => {
            a[k] = sortObject((o as Record<string, unknown>)[k]);
            return a;
          }, {});
      };
      parsed = sortObject(parsed);
    }
    return Ok(JSON.stringify(parsed, null, sp as number | string));
  } catch (e) {
    return Err(e instanceof Error ? e.message : String(e));
  }
}

const parseWords = (val: string): string[] =>
  val
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.toLowerCase())
    .filter(Boolean) as string[];

type CaseMode =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'inverse'
  | 'sarcasm'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab';
const CASE_REGISTRY: Record<CaseMode, (s: string) => string> = {
  upper: s => s.toUpperCase(),
  lower: s => s.toLowerCase(),
  title: s =>
    s.replace(/[\p{L}\p{N}]+/gu, w => (w[0] ?? 'x').toUpperCase() + w.slice(1).toLowerCase()),
  sentence: s =>
    s.toLowerCase().replace(/(^\s*[\p{L}\p{N}]|[.!?]\s*[\p{L}\p{N}])/gu, c => c.toUpperCase()),
  inverse: s =>
    [...s].map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
  sarcasm: s => [...s].map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join(''),
  camel: s => {
    const w = parseWords(s);
    return w.map((x, i) => (i === 0 ? x : (x[0] ?? 'x').toUpperCase() + x.slice(1))).join('');
  },
  pascal: s =>
    parseWords(s)
      .map(x => (x[0] ?? 'x').toUpperCase() + x.slice(1))
      .join(''),
  snake: s => parseWords(s).join('_'),
  kebab: s => parseWords(s).join('-'),
};

/** Senior: strategija namesto switch — dodaj nov case brez spreminjanja funkcije (OCP). */
export function applyCase(text: string, mode: string): string {
  if (!text) return '';
  const fn = CASE_REGISTRY[mode as CaseMode];
  return fn ? fn(text) : text;
}

/** Oštevilči vrstice besedila. */
export function numberLines(text: string, opts?: { startZero?: boolean; pad?: boolean }): string {
  const lines = (text || '').split('\n');
  const startZero = !!opts?.startZero;
  const pad = !!opts?.pad;
  const width = pad ? String(lines.length + (startZero ? 0 : 1)).length : 0;
  return lines
    .map((line, i) => {
      const num = startZero ? i : i + 1;
      const label = pad ? String(num).padStart(width, '0') : String(num);
      return `${label} | ${line}`;
    })
    .join('\n');
}

/** Doda predpono in pripono vsaki vrstici. */
export function addPrefixLines(
  text: string,
  opts?: { prefix?: string; suffix?: string; skipEmpty?: boolean }
): string {
  const pfx = opts?.prefix ?? '';
  const sfx = opts?.suffix ?? '';
  const skip = !!opts?.skipEmpty;
  return (text || '')
    .split('\n')
    .map(l => (!l.trim() && skip ? l : pfx + l + sfx))
    .join('\n');
}

/** Filtrira vrstice glede na ključno besedo. */
export function filterLines(
  text: string,
  opts?: { keyword?: string; wholeWord?: boolean; invert?: boolean }
): string {
  const key = (opts?.keyword ?? '').trim();
  if (!key) return text;
  const pat = opts?.wholeWord ? wholeWordPattern(key) : escapeRegExp(key);
  // senior fix: brez `g` — `RegExp.test` z `g` je stateful (lastIndex) in preskoči vsako drugo vrstico v .filter
  const re = new RegExp(pat, 'iu');
  return text
    .split('\n')
    .filter(l => re.test(l) !== !!opts?.invert)
    .join('\n');
}

/** Izlušči e-pošto, URL-je, telefone ali druge vzorce. */
export function extractPatterns(
  text: string,
  opts?: {
    mode?: 'email' | 'url' | 'phone' | 'hashtag' | 'mention' | 'ip' | 'number' | 'pattern';
    unique?: boolean;
    sort?: boolean;
    pattern?: string;
  }
): string {
  const mode = opts?.mode ?? 'email';
  const map: Record<string, RegExp> = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    url: /https?:\/\/[^\s/$.?#].[^\s]*/gi,
    phone:
      /(?:\+|00)\d{1,3}[- .]?(?:\(\d{1,4}\)|\d{1,4})(?:[- .]?\d{2,4}){1,4}|\(0?\d{1,4}\)(?:[- .]?\d{2,4}){2,3}|0\d{1,3}(?:[- .]?\d{2,4}){2,3}/g,
    hashtag: /#[\p{L}\p{N}_]+/gu,
    mention: /@[\p{L}\p{N}_]+/gu,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    number: /-?\d+(?:[.,]\d+)?/g,
  };
  const re = map[mode] ?? (opts?.pattern ? new RegExp(opts.pattern, 'g') : null);
  if (!re) return '';
  let m: string[] = text.match(re) ?? [];
  if (opts?.unique) m = [...new Set(m)];
  if (opts?.sort) m.sort((a, b) => a.localeCompare(b));
  return m.join('\n');
}

/** Primerja dve besedili po vrsticah. */
export function diffLines(a: string, b: string): DiffLine[] {
  const A = (a || '').split('\n'),
    B = (b || '').split('\n');
  const n = A.length,
    m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = A[i] === B[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out: DiffLine[] = [];
  let i = 0,
    j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ t: ' ', v: A[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ t: '-', v: A[i]! });
      i++;
    } else {
      out.push({ t: '+', v: B[j]! });
      j++;
    }
  }
  while (i < n) out.push({ t: '-', v: A[i++]! });
  while (j < m) out.push({ t: '+', v: B[j++]! });
  return out;
}

/** Izvede iskanje in zamenjavo z izbranimi možnostmi. */
export function findReplace(text: string, opts?: Record<string, unknown>): FindReplaceResult {
  const ignoreCase = !!opts?.ignoreCase,
    wholeWord = !!opts?.wholeWord,
    isRegex = !!opts?.regex;
  const repl = (opts?.repl as string) ?? '';
  const query = opts?.query as string | undefined;
  if (!query) return { replaced: text, count: 0, regex: null };
  const flags = (ignoreCase ? 'gi' : 'g') + (isRegex ? '' : 'u');
  const pattern = isRegex ? query : wholeWord ? wholeWordPattern(query) : escapeRegExp(query);
  const regex = new RegExp(pattern, flags);
  return { replaced: text.replace(regex, repl), count: (text.match(regex) ?? []).length, regex };
}

/** Prešteje pojavitve vzorca v besedilu. */
export function countOccurrences(
  text: string,
  needle: string,
  opts?: { ignoreCase?: boolean; wholeWord?: boolean }
): number {
  if (!needle) return 0;
  const pat = opts?.wholeWord ? wholeWordPattern(needle) : escapeRegExp(needle);
  return (text.match(new RegExp(pat, (opts?.ignoreCase ? 'gi' : 'g') + 'u')) ?? []).length;
}

/** Kodira ali dekodira HTML entitete. */
export function htmlEntities(
  text: string,
  opts?: { mode?: 'encode' | 'decode'; encodeAll?: boolean }
): string {
  const mode = opts?.mode ?? 'encode',
    all = !!opts?.encodeAll;
  if (mode === 'encode') {
    if (all) return text.replace(/[\u00A0-\u9999<>&"']/g, c => '&#' + c.charCodeAt(0) + ';');
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  try {
    if (typeof DOMParser === 'function')
      return new DOMParser().parseFromString(text, 'text/html').documentElement.textContent || '';
  } catch {
    /* node */
  }
  return text;
}

/**
 * Minimal Markdown → HTML (h1-h3, blockquote, bold, italic, code, li).
 * Namerno brez zunanje knjižnice (offline, 2kb). Za GFM uporabi `marked` v workerju.
 */
export function parseMarkdown(md: string): string {
  const esc = String(md).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let h = esc;
  h = h
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
  h = h.replace(/^>\s(.*$)/gim, '<blockquote class="md-quote">$1</blockquote>');
  h = h
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/~~(.*?)~~/gim, '<del>$1</del>');
  h = h
    .replace(/```([\s\S]*?)```/gim, '<pre class="md-pre"><code>$1</code></pre>')
    .replace(/`([^`]+)`/gim, '<code class="md-code">$1</code>');
  h = h.replace(/^- (.*$)/gim, '<li>$1</li>').replace(/\n\n/gim, '<br><br>');
  return h;
}

/** Frekvenca besed/znakov — vrne sortirano `entries` + `total`, O(n). */
export function frequencyCounts(
  text: string,
  opts?: { mode?: 'words' | 'chars'; caseSensitive?: boolean; ignorePunct?: boolean }
): { entries: Array<[string, number]>; total: number } {
  const mode = opts?.mode ?? 'words',
    cs = !!opts?.caseSensitive,
    ip = !!opts?.ignorePunct;
  const counts: Record<string, number> = {};
  let total = 0;
  if (mode === 'words') {
    const cleaned = ip ? text.replace(/[^\p{L}\p{N}\s]/gu, ' ') : text;
    for (const w of cleaned.split(/\s+/).filter(Boolean)) {
      const k = cs ? w : w.toLowerCase();
      counts[k] = (counts[k] ?? 0) + 1;
      total++;
    }
  } else {
    for (const ch of text) {
      if (/\s/.test(ch)) continue;
      if (ip && /[^\p{L}\p{N}]/u.test(ch)) continue;
      const k = cs ? ch : ch.toLowerCase();
      counts[k] = (counts[k] ?? 0) + 1;
      total++;
    }
  }
  return { entries: Object.entries(counts).sort((a, b) => b[1] - a[1]), total };
}
