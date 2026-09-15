/**
 * @module pure/encoding — Base64, hex, hash, regex helperji. Brez DOM.
 */

export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(bin);
}

/** Dekodira Base64 niz v UTF-8 besedilo. */
export function base64ToUtf8(b64: string): string {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * Escapa RegExp meta-znake. Primer: `escapeRegExp("a+b")` → `"a\\+b"`.
 * Edini vir resnice; `utils/dom` ga re-exporta.
 */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Vzorec za celotno besedo z Unicode podporo. Primer: `wholeWordPattern("test")`
 * ujame `test` v `"test."` ne pa v `"testni"`.
 */
export function wholeWordPattern(needle: string): string {
  return '(?:^|(?<=[^\\p{L}\\p{N}]))' + escapeRegExp(needle) + '(?=[^\\p{L}\\p{N}]|$)';
}

/** Pretvori binarni buffer v male šestnajstiške pare. */
export function bufferToHex(buf: ArrayBuffer | Uint8Array): string {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += (u8[i] ?? 0).toString(16).padStart(2, '0');
  return s;
}

/** Izračuna CRC32 kontrolno vsoto UTF-8 niza. */
export function crc32(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++)
    crc = (crc >>> 8) ^ (table[(crc ^ (bytes[i] ?? 0)) & 0xff] ?? 0);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

/**
 * Pure JS SHA-256 (FIPS 180-4) — fallback ko `crypto.subtle` ni na voljo (file://, testi).
 * Senior: 64 konstant K + 8 hash init, chunked, brez zunanje odvisnosti, 100% offline.
 * Za večje vhode raje `crypto.subtle.digest('SHA-256', bytes)` (hitreje, native).
 */
export function sha256(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const ROTR = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const SHR = (x: number, n: number) => x >>> n;
  const CH = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const MAJ = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const SIGMA0 = (x: number) => ROTR(x, 2) ^ ROTR(x, 13) ^ ROTR(x, 22);
  const SIGMA1 = (x: number) => ROTR(x, 6) ^ ROTR(x, 11) ^ ROTR(x, 25);
  const sigma0 = (x: number) => ROTR(x, 7) ^ ROTR(x, 18) ^ SHR(x, 3);
  const sigma1 = (x: number) => ROTR(x, 17) ^ ROTR(x, 19) ^ SHR(x, 10);
  const h: [number, number, number, number, number, number, number, number] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const l = bytes.length,
    bits = l * 8;
  const paddedLen = Math.ceil((l + 9) / 64) * 64;
  const msg = new Uint8Array(paddedLen);
  msg.set(bytes);
  msg[l] = 0x80;
  const view = new DataView(msg.buffer);
  view.setUint32(paddedLen - 4, bits, false);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++)
      w[i] =
        (sigma1(w[i - 2] ?? 0) + (w[i - 7] ?? 0) + sigma0(w[i - 15] ?? 0) + (w[i - 16] ?? 0)) >>> 0;
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 =
        ((hh ?? 0) + SIGMA1(e ?? 0) + CH(e ?? 0, f ?? 0, g ?? 0) + (K[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const t2 = (SIGMA0(a ?? 0) + MAJ(a ?? 0, b ?? 0, c ?? 0)) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  return h.map(x => x.toString(16).padStart(8, '0')).join('');
}
