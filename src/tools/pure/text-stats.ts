/**
 * @module pure/text-stats — statistika besedila.
 * Senior: dolga 38-vrstična funkcija razbita na 5 malih, poimenovanih, testabilnih helperjev.
 * Vsak helper je čist, tipiziran in ima en razlog za spremembo (SRP).
 */
import type { TextStatsResult } from '@/types';

const TOKEN_RE = /[\p{L}\p{N}]+(?:[.,'’\-–][\p{L}\p{N}]+)*/gu;
const TRIM_PUNCT_RE = /^[.,\-–]+|[.,\-–]+$/g;
const SENTENCE_RE = /[.!?]+(?:\s+|$)/g;
const PARAGRAPH_SPLIT = /\n\s*\n/;

type Classified = {
  alpha: number;
  numeric: number;
  mixed: number;
  words: string[];
  longest: string;
};

function tokenize(text: string): string[] {
  const t = text.trim();
  return t ? (t.match(TOKEN_RE) ?? []) : [];
}

function classify(tokens: string[]): Classified {
  let alpha = 0,
    numeric = 0,
    mixed = 0;
  const words: string[] = [];
  let longest = '';
  for (const raw of tokens) {
    const tok = raw.replace(TRIM_PUNCT_RE, '');
    if (!tok) continue;
    const hasL = /\p{L}/u.test(tok),
      hasN = /\p{N}/u.test(tok);
    if (hasL && !hasN) {
      alpha++;
      words.push(tok.toLowerCase());
      if (tok.length > longest.length) longest = tok;
    } else if (!hasL && hasN) numeric++;
    else {
      mixed++;
      words.push(tok.toLowerCase());
      if (tok.length > longest.length) longest = tok;
    }
  }
  return { alpha, numeric, mixed, words, longest };
}

function countSentences(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return (t.match(SENTENCE_RE) ?? (t ? ([1] as unknown as RegExpMatchArray) : [])).length;
}

function countParagraphs(text: string): number {
  const t = text.trim();
  return t ? text.split(PARAGRAPH_SPLIT).filter(p => p.trim() !== '').length : 0;
}

/** Senior: glavna funkcija zdaj samo orkestrira helperje — 8 vrstic logike namesto 38. */
export function computeTextStats(text: string, lang: 'sl' | 'en' | 'de'): TextStatsResult {
  const L = lang === 'sl';
  const t = (text ?? '').replace(/\r\n/g, '\n');
  const { alpha, numeric, mixed, words, longest } = classify(tokenize(t));
  const totalWords = alpha + numeric + mixed;
  const charsAll = [...t].length;
  const charsNoSpace = t.replace(/\s/g, '').length;
  return {
    totalWords,
    wordsOnly: alpha + mixed,
    numbers: numeric,
    charsAll,
    charsNoSpace,
    spaces: (t.match(/ /g) ?? []).length,
    sentences: countSentences(t),
    paragraphs: countParagraphs(t),
    lines: t.trim() ? t.split('\n').length : 0,
    readMins: Math.max(1, Math.ceil(totalWords / (L ? 200 : 238))),
    speakMins: Math.max(1, Math.ceil(totalWords / 150)),
    uniqueWords: new Set(words).size,
    avgWordLen: totalWords ? Number((charsNoSpace / totalWords).toFixed(1)) : 0,
    lexDensity:
      alpha + mixed ? Number(((new Set(words).size / (alpha + mixed)) * 100).toFixed(1)) : 0,
    longestWord: longest,
    mixedWords: mixed,
  } as unknown as TextStatsResult;
}
