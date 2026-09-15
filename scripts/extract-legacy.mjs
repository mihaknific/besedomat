// One-off migration helper: extracts the TOOLS catalog and tool render functions
// from the legacy single-file index.html into ES modules under src/tools/legacy/.
// Run with: node scripts/extract-legacy.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

function extractBlock(startRe, endRe) {
  const start = html.search(startRe);
  if (start < 0) throw new Error(`start not found: ${startRe}`);
  const after = html.slice(start);
  const m = after.match(endRe);
  if (!m) throw new Error('end not found');
  const endIdx = start + m.index + m[0].length;
  return html.slice(start, endIdx);
}

// 1) TOOLS array
const toolsSrc = extractBlock(/const TOOLS = \[/, /^\s*\];/m);

// 2) Collect render function names referenced by TOOLS: `render: renderXxx`
const renderNames = new Set();
for (const m of toolsSrc.matchAll(/render:\s*(render[A-Za-z0-9_]+)/g)) {
  renderNames.add(m[1]);
}
console.log(`Found ${renderNames.size} tool render functions`);

// 3) Extract each function definition block (naive brace matcher)
function extractFunction(name) {
  const re = new RegExp(`(function\\s+${name}\\s*\\([^)]*\\)\\s*\\{)`, 'g');
  const m = re.exec(html);
  if (!m) return null;
  const open = m.index + m[1].length - 1; // index of first '{'
  let depth = 0;
  let i = open;
  for (; i < html.length; i++) {
    const c = html[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return html.slice(m.index, i + 1);
}

const renderBlocks = [];
for (const name of renderNames) {
  const fn = extractFunction(name);
  if (fn) renderBlocks.push(fn);
  else console.warn(`  ! could not extract ${name}`);
}

// 4) Write legacy modules
const outDir = resolve(root, 'src/tools/legacy');
mkdirSync(outDir, { recursive: true });

const catalogBody = toolsSrc
  .replace(/SVG_ICONS\./g, 'SVG_ICONS.') // keep as-is (imported)
  .replace(/^const TOOLS = /, 'export const TOOLS_LEGACY = ')
  // Quote bare `render: renderXxx` references so the registry can resolve them by name.
  .replace(/render:\s*(render[A-Za-z0-9_]+)/g, "render: '$1'");

writeFileSync(
  resolve(outDir, 'catalog.ts'),
  `// @ts-nocheck
// AUTO-MIGRATED from index.html (TOOLS array). Refactor tools incrementally
// into ToolComponent subclasses and remove from here.
import { SVG_ICONS } from '../icons';
import { PURE } from '../PURE';
// currentLang je potreben za transform() ki berejo currentLang (npr. slugify)
import { currentLang } from './globals';

${catalogBody}
`
);

const fnJoined = renderBlocks.join('\n\n');
writeFileSync(
  resolve(outDir, 'renderers.ts'),
  `// AUTO-MIGRATED tool render functions. These still rely on legacy globals.
// Incrementally refactor each into a ToolComponent subclass and drop it here.
import {
  SVG_ICONS,
  getI,
  escapeHtml,
  escapeRegExp,
  copyText,
  copyLegacy,
  showToast,
  flashCopied,
  secureRandomInt,
  randomFromString,
  showToolBusy,
  showToolErrorBanner,
  safeUpdate,
  debounce,
  HEAVY_LIMIT,
  totalTextLength,
  normalizeDiacritics,
  normalizeForSearch,
  levenshtein,
  SL_DIACRITICS_MAP,
  computeSearchScore,
  getSearchSuggestions,
  highlightMatch,
  CATEGORIES,
  TextUtils,
  expandTags,
  LONGDESC_DE,
  PURE,
  announceResult,
  announceInfo,
  qrcode,
  currentLang,
  createStandardTool
} from './globals';

export {
  SVG_ICONS, getI, escapeHtml, escapeRegExp, copyText, copyLegacy, showToast, flashCopied,
  secureRandomInt, randomFromString, showToolBusy, showToolErrorBanner, safeUpdate, debounce,
  HEAVY_LIMIT, totalTextLength, normalizeDiacritics, normalizeForSearch, levenshtein,
  SL_DIACRITICS_MAP, computeSearchScore, getSearchSuggestions, highlightMatch, CATEGORIES,
  TextUtils, expandTags, LONGDESC_DE, PURE, announceResult, announceInfo, qrcode, currentLang,
  createStandardTool
};

${fnJoined}
`
);

// 5) Map of name -> function reference for the registry
const nameList = [...renderNames].map(n => `  '${n}': ${n}`).join(',\n');
writeFileSync(
  resolve(outDir, 'index.ts'),
  `import { TOOLS_LEGACY } from './catalog';
import * as renderers from './renderers';

export const LEGACY_RENDERERS = {
${nameList}
};

export { TOOLS_LEGACY, renderers };
`
);

console.log('Legacy modules written to src/tools/legacy/');
