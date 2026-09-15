export type SupportedLang = 'sl' | 'en' | 'de';

export type ThemeName =
  | 'light'
  | 'dark'
  | 'mono-light'
  | 'mono-dark'
  | 'cyber'
  | 'ocean'
  | 'amber'
  | 'emerald'
  | 'synth'
  | 'espresso'
  | 'sakura'
  | 'midnight';

export interface I18nStrings {
  [key: string]: string;
}

export interface ToolName {
  sl: string;
  en: string;
  de?: string;
}

export interface ToolDesc {
  sl: string;
  en: string;
  de?: string;
}

export interface ToolLongDesc {
  sl: string;
  en: string;
  de?: string;
}

export type ToolType = 'text-transform' | 'text-stats' | 'custom';

export interface ToolBase {
  id: string;
  icon: string;
  category: string;
  featured?: boolean;
  tags: string[];
  name: ToolName;
  desc: ToolDesc;
  longDesc?: ToolLongDesc;
  type: ToolType;
}

export interface TextTransformTool extends ToolBase {
  type: 'text-transform';
  transform: (text: string, options?: Record<string, unknown>) => string;
}

export interface TextStatsTool extends ToolBase {
  type: 'text-stats';
  stats: (text: string, lang: SupportedLang) => Record<string, unknown>;
}

export interface CustomTool extends ToolBase {
  type: 'custom';
  render: (container: HTMLElement) => void;
}

export type Tool = TextTransformTool | TextStatsTool | CustomTool;

export interface CategoryDef {
  sl: string;
  en: string;
  de: string;
}

export interface Categories {
  [key: string]: CategoryDef;
}

export interface ThemeNames {
  [lang: string]: {
    [theme: string]: string;
  };
}

export interface CompactTags {
  [toolId: string]: string[];
}

export interface SVGIcons {
  [key: string]: string;
}

export interface AppState {
  currentLang: SupportedLang;
  currentTheme: ThemeName;
  activeView: 'home' | 'all' | 'favorites' | 'tool' | 'privacy' | 'terms' | 'about';
  activeToolId: string | null;
  favorites: string[];
  recents: string[];
  searchQuery: string;
  categoryFilter: string;
  sortMode: 'groups' | 'alpha' | 'fav';
}

export interface TextStatsResult {
  totalWords: number;
  wordsOnly: number;
  numbers: number;
  charsAll: number;
  charsNoSpace: number;
  spaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readMins: number;
  speakMins: number;
  uniqueWords: number;
  avgWordLen: number;
  lexDensity: number;
  longestWord: string;
  mixedWords: number;
}

export interface FrequencyResult {
  entries: [string, number][];
  total: number;
}

export interface FindReplaceResult {
  replaced: string;
  count: number;
  regex: RegExp | null;
}

export interface DiffLine {
  t: ' ' | '-' | '+';
  v: string;
}

export interface PasswordOptions {
  length?: number;
  lower?: boolean;
  upper?: boolean;
  digits?: boolean;
  symbols?: boolean;
  perType?: Record<string, number>;
  placement?: Record<string, string | string[]>;
  excludeChars?: string[];
  mode?: 'random' | 'passphrase';
  words?: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
  includeSymbol?: boolean;
  wordlist?: 'sl' | 'en';
}

export interface WorkerMessage {
  type: 'frequency' | 'markdown' | 'diff';
  data: unknown;
  id: string;
}

export interface WorkerResponse {
  id: string;
  result?: unknown;
  error?: string;
}
