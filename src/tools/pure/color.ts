/**
 * @module pure/color — HEX/RGB/HSL konverzije, brez DOM.
 */

/**
 * HEX → RGB. Podpira `#fff` in `#ffffff`, vrne `null` za neveljaven vnos.
 * @example hexToRgb("#ff0") → {r:255,g:255,b:0}
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = String(hex).trim().replace(/^#/, '');
  let normalized = h;
  if (/^[0-9a-f]{3}$/i.test(normalized))
    normalized = normalized
      .split('')
      .map(c => c + c)
      .join('');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Pretvori RGB vrednosti v šestmestni HEX zapis. */
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

/** Pretvori RGB vrednosti v HSL zapis. */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Pretvori HSL vrednosti v RGB zapis. */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/** Analizira HEX, RGB ali HSL vnos in vrne vse tri barvne zapise. */
export function colorInfo(input: string): {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
} | null {
  const s = String(input).trim();
  let rgb: { r: number; g: number; b: number } | null = null,
    m: RegExpMatchArray | null;
  if (/^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(s)) rgb = hexToRgb(s);
  else if ((m = s.match(/^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i))) {
    const [, r, g, b] = m;
    if (r && g && b) rgb = { r: +r, g: +g, b: +b };
  } else if ((m = s.match(/^hsla?\(\s*(\d+)\D+(\d+)\D+(\d+)/i))) {
    const [, h, s, l] = m;
    if (h && s && l) rgb = hslToRgb(+h, +s, +l);
  }
  if (!rgb) return null;
  return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b) };
}
