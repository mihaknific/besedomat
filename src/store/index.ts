import type { AppState, SupportedLang, ThemeName } from '@/types';

type Listener = (state: AppState) => void;
type Selector<T> = (s: AppState) => T;

const STORAGE_KEYS = {
  lang: 'besedomat-lang',
  theme: 'besedomat-theme',
  favorites: 'besedomat-favorites',
  recents: 'besedomat-recents',
} as const;

const VALID_LANGS = new Set<SupportedLang>(['sl', 'en', 'de']);
const VALID_THEMES = new Set<string>([
  'light',
  'dark',
  'mono-light',
  'mono-dark',
  'cyber',
  'ocean',
  'amber',
  'emerald',
  'synth',
  'espresso',
  'sakura',
  'midnight',
]);
const MAX_RECENTS = 12;

function safeLoad<T>(key: string, fallback: T, validate?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota/private */
  }
}

// senior: Store z batch + selector subscribe (manj re-renderjev) + validacija
class Store {
  private state: AppState;
  private listeners = new Set<Listener>();
  private batchDepth = 0;
  private pendingPatch: Partial<AppState> | null = null;

  constructor() {
    // validacija ob branju — prepreči corrupt localStorage
    const rawLang =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.lang) : null;
    const rawTheme =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.theme) : null;
    const lang =
      rawLang && VALID_LANGS.has(rawLang as SupportedLang) ? (rawLang as SupportedLang) : 'sl';
    const theme = rawTheme && VALID_THEMES.has(rawTheme) ? (rawTheme as ThemeName) : 'light';

    this.state = {
      currentLang: lang,
      currentTheme: theme,
      activeView: 'home',
      activeToolId: null,
      favorites: safeLoad(STORAGE_KEYS.favorites, [], isStringArray).filter(
        id => typeof id === 'string'
      ),
      recents: safeLoad(STORAGE_KEYS.recents, [], isStringArray).slice(0, MAX_RECENTS),
      searchQuery: '',
      categoryFilter: 'all',
      sortMode: 'groups',
    };
  }

  getState(): AppState {
    return this.state;
  }
  get<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  /** Nizko-nivojski patch; za večjo jasnost uporabljaj tipizirane akcije spodaj. */
  set(patch: Partial<AppState>): void {
    if (this.batchDepth > 0) {
      this.pendingPatch = { ...this.pendingPatch, ...patch };
      return;
    }
    this.state = { ...this.state, ...patch };
    this.persist(patch);
    this.emit();
  }

  /** Senior: batch več set klicev v en emit (npr. setActiveTool). */
  batch(fn: () => void): void {
    this.batchDepth++;
    try {
      fn();
    } finally {
      this.batchDepth--;
      if (this.batchDepth === 0 && this.pendingPatch) {
        const p = this.pendingPatch;
        this.pendingPatch = null;
        this.set(p);
      }
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Senior: poslušaj samo slice (npr. `s => s.currentLang`), emit samo ob spremembi. */
  subscribeSelector<T>(
    selector: Selector<T>,
    fn: (slice: T, state: AppState) => void,
    isEqual: (a: T, b: T) => boolean = Object.is
  ): () => void {
    let prev = selector(this.state);
    return this.subscribe(state => {
      const next = selector(state);
      if (!isEqual(prev, next)) {
        prev = next;
        fn(next, state);
      }
    });
  }

  private emit(): void {
    this.listeners.forEach(fn => fn(this.state));
  }

  private persist(patch: Partial<AppState>): void {
    if (patch.currentLang !== undefined && VALID_LANGS.has(patch.currentLang))
      save(STORAGE_KEYS.lang, patch.currentLang);
    if (patch.currentTheme !== undefined && VALID_THEMES.has(patch.currentTheme))
      save(STORAGE_KEYS.theme, patch.currentTheme);
    if (patch.favorites !== undefined) save(STORAGE_KEYS.favorites, patch.favorites);
    if (patch.recents !== undefined) save(STORAGE_KEYS.recents, patch.recents);
  }
}

export const store = new Store();

// ---- tipizirane akcije (senior: ena funkcija = en namen, brez generic `set({…})` po kodi) ----
export function setLang(lang: SupportedLang): void {
  if (!VALID_LANGS.has(lang)) return;
  store.set({ currentLang: lang });
}

export function setTheme(theme: ThemeName): void {
  if (!VALID_THEMES.has(theme)) return;
  store.set({ currentTheme: theme });
}

export function toggleFavorite(id: string): void {
  const favs = store.get('favorites');
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  store.set({ favorites: next });
}

export function isFavorite(id: string): boolean {
  return store.get('favorites').includes(id);
}

export function pushRecent(id: string): void {
  const recents = store.get('recents').filter(r => r !== id);
  recents.unshift(id);
  if (recents.length > MAX_RECENTS) recents.length = MAX_RECENTS;
  store.set({ recents });
}

export function setActiveTool(id: string | null): void {
  store.batch(() => {
    const patch: Partial<AppState> = { activeToolId: id };
    if (id) patch.activeView = 'tool';
    store.set(patch);
    if (id) pushRecent(id); // pushRecent že kliče set, bo batchan
  });
}

/** Za teste: ponastavi store brez reload-a. */
export function _resetStoreForTests(next: Partial<AppState>): void {
  (store as unknown as { state: AppState }).state = { ...store.getState(), ...next };
}
