export type GameSettings = {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  bloodLevel: 0 | 1 | 2;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  showCombatHints: boolean;
};

const STORAGE_KEY = 'circle-clash-settings';
export const defaultGameSettings: GameSettings = {
  masterVolume: 1,
  musicVolume: 0.6,
  effectsVolume: 0.8,
  graphicsQuality: 'high',
  bloodLevel: 1,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  showCombatHints: true,
};

export const settingsStore = {
  load(): GameSettings {
    if (typeof localStorage === 'undefined') return defaultGameSettings;
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? ''));
    } catch {
      return defaultGameSettings;
    }
  },
  save(settings: GameSettings) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  },
};

function normalizeSettings(value: Partial<GameSettings>): GameSettings {
  const merged = { ...defaultGameSettings, ...value };
  return {
    ...merged,
    masterVolume: clampVolume(merged.masterVolume),
    musicVolume: clampVolume(merged.musicVolume),
    effectsVolume: clampVolume(merged.effectsVolume),
    bloodLevel: [0, 1, 2].includes(merged.bloodLevel) ? merged.bloodLevel : 1,
    graphicsQuality: ['low', 'medium', 'high'].includes(merged.graphicsQuality)
      ? merged.graphicsQuality
      : 'high',
  };
}

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1));
}
