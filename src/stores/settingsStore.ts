export type GameSettings = {
  musicVolume: number;
  effectsVolume: number;
  reducedMotion: boolean;
};

const STORAGE_KEY = 'circle-clash-settings';
const defaults: GameSettings = {
  musicVolume: 0.6,
  effectsVolume: 0.8,
  reducedMotion: false,
};

export const settingsStore = {
  load(): GameSettings {
    if (typeof localStorage === 'undefined') return defaults;
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') };
    } catch {
      return defaults;
    }
  },
  save(settings: GameSettings) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  },
};
