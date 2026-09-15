import type { ThemeName, ThemeNames } from '@/types';

export const THEME_NAMES: ThemeNames = {
  sl: {
    light: 'Svetla',
    dark: 'Temna',
    'mono-light': 'Belo-črna',
    'mono-dark': 'Črno-bela',
    cyber: 'Kibernetsko vijolična',
    ocean: 'Oceansko turkizna',
    amber: 'Jantarni sončni zahod',
    emerald: 'Gozdna smaragdna',
    synth: 'Neonska plazma',
    espresso: 'Kavna toplina',
    sakura: 'Cvetoča češnja',
    midnight: 'Polnočna vijolična',
  },
  en: {
    light: 'Light',
    dark: 'Dark',
    'mono-light': 'Monochrome Light',
    'mono-dark': 'Monochrome Dark',
    cyber: 'Cyber Violet',
    ocean: 'Ocean Teal',
    amber: 'Sunset Amber',
    emerald: 'Emerald Forest',
    synth: 'Neon Synth',
    espresso: 'Warm Espresso',
    sakura: 'Sakura Blossom',
    midnight: 'Midnight Purple',
  },
  de: {
    light: 'Hell',
    dark: 'Dunkel',
    'mono-light': 'Monochrom Hell',
    'mono-dark': 'Monochrom Dunkel',
    cyber: 'Cyber-Violett',
    ocean: 'Ozean-Türkis',
    amber: 'Bernstein-Sonnenuntergang',
    emerald: 'Smaragd-Wald',
    synth: 'Neon-Synth',
    espresso: 'Espresso-Wärme',
    sakura: 'Sakura-Blüte',
    midnight: 'Mitternacht',
  },
};

export const THEME_ORDER: ThemeName[] = [
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
];

export const FALLBACK_LANG = 'sl' as const;

export function themeLabel(theme: ThemeName, lang: keyof ThemeNames): string {
  const nameMap = THEME_NAMES[lang] ?? THEME_NAMES[FALLBACK_LANG]!;
  return nameMap[theme] || theme;
}
