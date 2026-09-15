/**
 * @module pure/password — generator gesel/passphrase.
 * Senior: 60-vrstična monolitna funkcija razbita na 4 čiste helperje (SRP, testabilno).
 * Vsak helper ima en razlog za spremembo in je neodvisno testabilen.
 */
import { secureRandomInt, secureShuffle } from '@/utils/crypto';
import type { PasswordOptions } from '@/types';

type CharType = 'lower' | 'upper' | 'digits' | 'symbols';
const TYPES: readonly CharType[] = ['lower', 'upper', 'digits', 'symbols'] as const;
const POSITIONS = ['start', 'middle', 'end'] as const;
const BASE_POOLS: Record<CharType, string> = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
};

// ---- helper 1: zgradi filtre poolov ----
function buildPools(excluded: Set<string>): Record<CharType, string> {
  const out = {} as Record<CharType, string>;
  for (const k of TYPES)
    out[k] = BASE_POOLS[k]
      .split('')
      .filter(c => !excluded.has(c))
      .join('');
  return out;
}

// ---- helper 2: razčleni placement (start/middle/end → Map) ----
function parsePlacement(
  placement: Record<string, unknown> | undefined
): Record<CharType, string[]> {
  const placeOf = {} as Record<CharType, string[]>;
  for (const k of TYPES) {
    const raw = placement?.[k];
    const arr = Array.isArray(raw) ? (raw as string[]) : raw ? [raw as string] : [];
    const wanted = new Set(arr.filter(p => (POSITIONS as readonly string[]).includes(p)));
    placeOf[k] = (POSITIONS as readonly string[]).filter(p => wanted.has(p));
  }
  return placeOf;
}

// ---- helper 3: izračunaj zahtevano število znakov po tipu ----
function calcRequirements(
  opts: PasswordOptions | undefined,
  length: number,
  pools: Record<CharType, string>
): Record<CharType, number> {
  const req: Record<CharType, number> = { lower: 0, upper: 0, digits: 0, symbols: 0 };
  const anyFlag = !!(opts && (opts.lower || opts.upper || opts.digits || opts.symbols));
  const flagOf = (k: CharType) => (anyFlag ? !!(opts as Record<string, unknown>)[k] : true);

  if (opts?.perType) {
    for (const k of TYPES) req[k] = Math.max(0, Math.floor(Number(opts.perType[k]) || 0));
    const sum = TYPES.reduce((s, k) => s + req[k], 0);
    if (sum > length) {
      const scale = length / sum;
      req.lower = Math.round(req.lower * scale);
      req.upper = Math.round(req.upper * scale);
      req.digits = Math.round(req.digits * scale);
      req.symbols = Math.max(0, length - req.lower - req.upper - req.digits);
    }
    return req;
  }

  const placeOf = parsePlacement(opts?.placement as Record<string, unknown> | undefined);
  const structured = TYPES.some(k => placeOf[k].length > 0);
  if (structured) {
    const enabled = TYPES.filter(k => flagOf(k) && pools[k].length > 0);
    if (enabled.length) {
      const base = Math.floor(length / enabled.length);
      let rem = length - base * enabled.length;
      for (const k of enabled) req[k] = base + (rem-- > 0 ? 1 : 0);
    }
  }
  return req;
}

// ---- helper 4: razporedi znake v segmente ----
function distribute(
  pools: Record<CharType, string>,
  req: Record<CharType, number>,
  placeOf: Record<CharType, string[]>
): Record<string, string[]> {
  const segs: Record<string, string[]> = { start: [], middle: [], end: [], any: [] };
  const pick = (pool: string) => pool[secureRandomInt(pool.length)] ?? '';
  for (const k of TYPES) {
    const regions = placeOf[k];
    if (!regions.length) {
      for (let i = 0; i < req[k]; i++) segs.any!.push(pick(pools[k]));
      continue;
    }
    const base = Math.floor(req[k] / regions.length);
    let rem = req[k] - base * regions.length;
    for (const r of regions) {
      let c = base + (rem-- > 0 ? 1 : 0);
      while (c-- > 0) segs[r]!.push(pick(pools[k]));
    }
  }
  return segs;
}

/** Ustvari UUID v4 z Web Crypto API in varnim fallbackom. */
export function generateUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6]! & 0x0f) | 0x40;
      b[8] = (b[8]! & 0x3f) | 0x80;
      const h = Array.from(b, x => x.toString(16).padStart(2, '0'));
      return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`;
    }
  } catch {
    /* fallback */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Glavna funkcija zdaj samo orkestrira 4 helperje — 12 vrstic namesto 60, berljivo. */
export function generatePassword(opts?: PasswordOptions): string {
  const length = Math.max(1, Math.min(256, opts?.length ?? 16));
  const pools = buildPools(new Set(opts?.excludeChars ?? []));
  const req = calcRequirements(opts, length, pools);
  const placeOf = parsePlacement(opts?.placement as Record<string, unknown> | undefined);
  const segs = distribute(pools, req, placeOf);

  const anyFlag = !!(opts && (opts.lower || opts.upper || opts.digits || opts.symbols));
  const flagOf = (k: CharType) => (anyFlag ? !!(opts as Record<string, unknown>)[k] : true);
  const unionPool = TYPES.filter(k => flagOf(k))
    .map(k => pools[k])
    .join('');
  if (!unionPool)
    return (
      (segs.start ?? []).join('') +
      (segs.middle ?? []).join('') +
      (segs.end ?? []).join('') +
      (segs.any ?? []).join('')
    );

  const used =
    (segs.start ?? []).length +
    (segs.middle ?? []).length +
    (segs.end ?? []).length +
    (segs.any ?? []).length;
  const pickUnion = (pool: string) => pool[secureRandomInt(pool.length)] ?? '';
  for (let i = 0; i < Math.max(0, length - used); i++) (segs.any ?? []).push(pickUnion(unionPool));

  for (const s of [
    segs.start ?? [],
    segs.middle ?? [],
    segs.end ?? [],
    segs.any ?? [],
  ] as string[][])
    secureShuffle(s);

  const out: string[] = [...(segs.start ?? [])];
  if ((segs.middle ?? []).length) {
    const pre = Math.ceil((segs.any ?? []).length / 2);
    out.push(
      ...(segs.any ?? []).slice(0, pre),
      ...(segs.middle ?? []),
      ...(segs.any ?? []).slice(pre)
    );
  } else out.push(...(segs.any ?? []));
  out.push(...(segs.end ?? []));
  return out.slice(0, length).join('');
}

export const PASSPHRASE_WORDLISTS = {
  en: [
    'apple',
    'mountain',
    'river',
    'sunset',
    'forest',
    'ocean',
    'meadow',
    'thunder',
    'whisper',
    'crystal',
    'velvet',
    'ember',
    'frost',
    'glacier',
    'horizon',
    'jasmine',
    'kelp',
    'lagoon',
    'mirage',
    'nebula',
    'opal',
    'prism',
    'quartz',
    'ripple',
    'sapphire',
    'tumble',
    'umbra',
    'vortex',
    'willow',
    'zephyr',
    'anchor',
    'breeze',
    'canyon',
    'drift',
    'echo',
    'flint',
    'geyser',
    'haven',
    'ivy',
    'jewel',
    'knoll',
    'lunar',
    'mist',
    'nomad',
    'orbit',
    'pebble',
    'quill',
    'ridge',
    'summit',
    'tide',
    'unity',
    'valley',
    'wander',
    'xenon',
    'yonder',
    'zenith',
  ],
  sl: [
    'veter',
    'gora',
    'reka',
    'sonce',
    'gozd',
    'morje',
    'trava',
    'grom',
    'megla',
    'kristal',
    'žamet',
    'žarek',
    'slana',
    'ledenik',
    'obzorje',
    'jasmin',
    'alga',
    'laguna',
    'opal',
    'prizma',
    'kremen',
    'val',
    'safir',
    'vrba',
    'hrast',
    'breza',
    'lipa',
    'smreka',
    'javor',
    'jelka',
    'roža',
    'list',
    'korenina',
    'seme',
    'plod',
    'jagoda',
    'malina',
    'borovnica',
    'hruška',
    'jabolko',
    'češnja',
    'sliva',
    'breskev',
    'grozdje',
    'med',
    'čebela',
    'metulj',
    'vrabec',
    'lastovka',
    'sova',
    'zajec',
    'srna',
    'jelen',
    'lisica',
    'volk',
    'medved',
    'jezero',
    'potok',
    'slap',
    'hrib',
    'dolina',
    'planina',
    'koča',
    'pečina',
  ],
} as const;

/** Ustvari naključno geselno frazo iz lokalnega slovarja. */
export function generatePassphrase(opts?: PasswordOptions): string {
  const n = Math.max(1, Math.min(20, opts?.words ?? 4));
  const sep = opts?.separator ?? '-';
  const cap = !!opts?.capitalize;
  const list =
    PASSPHRASE_WORDLISTS[(opts?.wordlist as 'sl' | 'en') ?? 'en'] ?? PASSPHRASE_WORDLISTS.en;
  const words: string[] = [];
  for (let i = 0; i < n; i++) {
    const selected = list[secureRandomInt(list.length)] ?? '';
    const word = cap ? selected.charAt(0).toUpperCase() + selected.slice(1) : selected;
    words.push(word);
  }
  let phrase = words.join(sep);
  if (opts?.includeNumber) phrase += sep + String(secureRandomInt(10000)).padStart(4, '0');
  if (opts?.includeSymbol) phrase += sep + '!@#$%^&*'[secureRandomInt(8)];
  return phrase;
}

/** Izbere generator gesla glede na nastavljeni način. */
export function generatePasswordOptions(_text: string, opts?: PasswordOptions): string {
  return opts?.mode === 'passphrase' ? generatePassphrase(opts) : generatePassword(opts);
}
