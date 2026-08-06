import { create } from 'zustand';
import type { GlitchSuperKind } from '@/src/data/glitch-super-moves';
import type { MimSuperKind } from '@/src/data/mim-super-moves';
import type { LuckySuperKind } from '@/src/data/lucky/supers';

type RenderState = {
  theme: 'dark' | 'light';
  effectsEnabled: boolean;
  graphicsPreset: 'low' | 'medium' | 'high';
  screenShakeEnabled: boolean;
  glitchSuperFighterId: 'p1' | 'p2' | null;
  glitchSuperKind: GlitchSuperKind | null;
  glitchSuperVersion: number;
  impactVersion: number;
  mimSuperFighterId: 'p1' | 'p2' | null;
  mimSuperKind: MimSuperKind | null;
  mimSuperVersion: number;
  luckySuperFighterId: 'p1' | 'p2' | null;
  luckySuperKind: LuckySuperKind | null;
  luckySuperVersion: number;
  xrayFighterId: 'p1' | 'p2' | null;
  xrayVersion: number;
  hydratePreferences: () => void;
  setTheme: (theme: RenderState['theme']) => void;
  toggleEffects: () => void;
  setGraphicsPreset: (preset: RenderState['graphicsPreset']) => void;
  toggleScreenShake: () => void;
  triggerImpact: () => void;
  triggerGlitchSuper: (
    fighterId: 'p1' | 'p2',
    kind: GlitchSuperKind,
  ) => void;
  triggerMimSuper: (
    fighterId: 'p1' | 'p2',
    kind: MimSuperKind,
  ) => void;
  triggerLuckySuper: (
    fighterId: 'p1' | 'p2',
    kind: LuckySuperKind,
  ) => void;
  triggerXray: (fighterId: 'p1' | 'p2') => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  theme: 'dark',
  effectsEnabled: true,
  graphicsPreset: 'medium',
  screenShakeEnabled: true,
  glitchSuperFighterId: null,
  glitchSuperKind: null,
  glitchSuperVersion: 0,
  impactVersion: 0,
  mimSuperFighterId: null,
  mimSuperKind: null,
  mimSuperVersion: 0,
  luckySuperFighterId: null,
  luckySuperKind: null,
  luckySuperVersion: 0,
  xrayFighterId: null,
  xrayVersion: 0,
  hydratePreferences: () => {
    const theme = readTheme();
    const savedEffects = readSavedEffects();
    const graphicsPreset = readGraphicsPreset();
    const screenShakeEnabled = readBoolean(SHAKE_STORAGE_KEY);
    set({
      ...(theme === null ? {} : { theme }),
      ...(savedEffects === null ? {} : { effectsEnabled: savedEffects }),
      ...(graphicsPreset === null ? {} : { graphicsPreset }),
      ...(screenShakeEnabled === null ? {} : { screenShakeEnabled }),
    });
  },
  setTheme: (theme) => {
    saveValue(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
  toggleEffects: () =>
    set((state) => {
      const effectsEnabled = !state.effectsEnabled;
      saveEffects(effectsEnabled);
      return { effectsEnabled };
    }),
  setGraphicsPreset: (graphicsPreset) => {
    saveValue(GRAPHICS_STORAGE_KEY, graphicsPreset);
    set({ graphicsPreset });
  },
  toggleScreenShake: () => set((state) => {
    const screenShakeEnabled = !state.screenShakeEnabled;
    saveValue(SHAKE_STORAGE_KEY, String(screenShakeEnabled));
    return { screenShakeEnabled };
  }),
  triggerImpact: () =>
    set((state) => ({ impactVersion: state.impactVersion + 1 })),
  triggerGlitchSuper: (glitchSuperFighterId, glitchSuperKind) =>
    set((state) => ({
      glitchSuperFighterId,
      glitchSuperKind,
      glitchSuperVersion: state.glitchSuperVersion + 1,
    })),
  triggerMimSuper: (mimSuperFighterId, mimSuperKind) =>
    set((state) => ({
      mimSuperFighterId,
      mimSuperKind,
      mimSuperVersion: state.mimSuperVersion + 1,
    })),
  triggerLuckySuper: (luckySuperFighterId, luckySuperKind) =>
    set((state) => ({
      luckySuperFighterId,
      luckySuperKind,
      luckySuperVersion: state.luckySuperVersion + 1,
    })),
  triggerXray: (xrayFighterId) =>
    set((state) => ({
      xrayFighterId,
      xrayVersion: state.xrayVersion + 1,
    })),
}));

const EFFECTS_STORAGE_KEY = 'cc-effects-enabled-v1';
const GRAPHICS_STORAGE_KEY = 'cc-graphics-preset-v1';
const SHAKE_STORAGE_KEY = 'cc-screen-shake-v1';
const THEME_STORAGE_KEY = 'cc-theme-v1';

function saveEffects(effectsEnabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EFFECTS_STORAGE_KEY, String(effectsEnabled));
  } catch {
    // The setting still works for this session when storage is unavailable.
  }
}

function readSavedEffects(): boolean | null {
  return readBoolean(EFFECTS_STORAGE_KEY);
}

function saveValue(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, value); } catch { /* Session fallback. */ }
}

function readBoolean(key: string): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    return null;
  }
  return null;
}

function readGraphicsPreset(): RenderState['graphicsPreset'] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(GRAPHICS_STORAGE_KEY);
    return saved === 'low' || saved === 'medium' || saved === 'high' ? saved : null;
  } catch { return null; }
}

function readTheme(): RenderState['theme'] | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  } catch { return null; }
}
