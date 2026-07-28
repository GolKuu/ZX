import {
  normalizeArenaId,
  type ArenaId,
} from '../game/data/arenas/arenaCatalog';

export type EffectLevel = 0 | 1 | 2 | 3;

export type GameSettings = {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  bloodLevel: EffectLevel;
  cameraShake: EffectLevel;
  uiScale: number;
  arenaId: ArenaId;
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
  cameraShake: 2,
  uiScale: 1,
  arenaId: 'quiet-canopy',
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
    bloodLevel: effectLevel(merged.bloodLevel),
    cameraShake: effectLevel(merged.cameraShake),
    uiScale: clampUiScale(merged.uiScale),
    arenaId: normalizeArenaId(merged.arenaId),
    graphicsQuality: ['low', 'medium', 'high'].includes(merged.graphicsQuality)
      ? merged.graphicsQuality
      : 'high',
  };
}

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1));
}

function clampUiScale(value: number) {
  const safe = Number.isFinite(value) ? value : 1;
  return Math.min(1.3, Math.max(0.85, Math.round(safe * 20) / 20));
}

function effectLevel(value: number): EffectLevel {
  return value === 0 || value === 2 || value === 3 ? value : 1;
}
