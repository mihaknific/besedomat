/**
 * Kriptografsko varni primitivi — en vir resnice za cel projekt.
 * Prej: `secureRandomInt` duplikat v `PURE.generatePassword`, `utils/dom`,
 * `src/tools/legacy` in `qrcode` helperjih (3× ista rejection-sampling logika).
 * Zdaj: centralno, tipizirano, testabilno, brez modulo biasa.
 */

/**
 * Vrne enakomerno porazdeljen int v [0, max). Uporabi `crypto.getRandomValues`
 * z rejection sampling (brez `rand % max` biasa). V brskalniku `crypto` vedno obstaja
 * (secure context); fallback na `Math.random` je samo za Node teste in opozori v konzolo
 * (nikoli za gesla v produkciji — gesla zahtevajo `isSecureContext`).
 */
export function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  if (max === 1) return 0;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // 32-bit rejection — natančnejši od 8-bit pri večjih max
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let v: number;
    do {
      crypto.getRandomValues(buf);
      v = (buf[0] ?? 0) >>> 0;
    } while (v >= limit);
    return v % max;
  }
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    return Math.floor(Math.random() * max); // samo testi
  }
  throw new Error('crypto.getRandomValues ni na voljo — gesla zahtevajo secure context (https)');
}

export function secureRandomFloat(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return ((b[0] ?? 0) >>> 0) / 0x100000000;
  }
  return Math.random();
}

export function pickRandom<T>(arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[secureRandomInt(arr.length)];
}

export function pickRandomChar(pool: string): string {
  if (!pool) return '';
  return pool.charAt(secureRandomInt(pool.length));
}

/**
 * Fisher–Yates z `secureRandomInt` — deterministično varno mešanje.
 * Mutira vhodni array in ga vrne (kot `Array.sort`), za immutable uporabi `[...arr]`.
 */
export function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}
