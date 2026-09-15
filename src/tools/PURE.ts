/**
 * PURE — fasada za nazaj-združljivost. Senior: razbito na domenske module.
 * Uvozi: `import { PURE } from '@/tools/PURE'` še vedno deluje,
 * novi kodi naj uvozijo direktno iz `pure/*` za boljši tree-shaking.
 */
import * as encoding from './pure/encoding';
import * as color from './pure/color';
import * as textStats from './pure/text-stats';
import * as pass from './pure/password';
import * as tf from './pure/text-transform';

export const PURE = {
  // encoding
  utf8ToBase64: encoding.utf8ToBase64,
  base64ToUtf8: encoding.base64ToUtf8,
  escapeRegExp: encoding.escapeRegExp,
  wholeWordPattern: encoding.wholeWordPattern,
  bufferToHex: encoding.bufferToHex,
  crc32: encoding.crc32,
  sha256: encoding.sha256,
  // color
  hexToRgb: color.hexToRgb,
  rgbToHex: color.rgbToHex,
  rgbToHsl: color.rgbToHsl,
  hslToRgb: color.hslToRgb,
  colorInfo: color.colorInfo,
  // stats
  computeTextStats: textStats.computeTextStats,
  // password
  generateUUID: pass.generateUUID,
  generatePassword: pass.generatePassword,
  PASSPHRASE_WORDLISTS: pass.PASSPHRASE_WORDLISTS,
  generatePassphrase: pass.generatePassphrase,
  generatePasswordOptions: pass.generatePasswordOptions,
  // text-transform
  caesarCipher: tf.caesarCipher,
  formatJson: tf.formatJson,
  applyCase: tf.applyCase,
  numberLines: tf.numberLines,
  addPrefixLines: tf.addPrefixLines,
  filterLines: tf.filterLines,
  extractPatterns: tf.extractPatterns,
  diffLines: tf.diffLines,
  findReplace: tf.findReplace,
  countOccurrences: tf.countOccurrences,
  htmlEntities: tf.htmlEntities,
  parseMarkdown: tf.parseMarkdown,
  frequencyCounts: tf.frequencyCounts,
};

export default PURE;

// Re-export posamezno za tree-shaking
export * from './pure/encoding';
export * from './pure/color';
export * from './pure/text-stats';
export * from './pure/password';
export * from './pure/text-transform';
