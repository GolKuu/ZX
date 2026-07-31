import { create } from 'zustand';
import type { GlitchSuperKind } from '@/src/data/glitch-super-moves';
import type { MimSuperKind } from '@/src/data/mim-super-moves';
import type { LuckySuperKind } from '@/src/data/lucky/supers';

type RenderState = {
  effectsEnabled: boolean;
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
  toggleEffects: () => void;
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
  effectsEnabled: true,
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
    const savedEffects = readSavedEffects();
    if (savedEffects !== null) set({ effectsEnabled: savedEffects });
  },
  toggleEffects: () =>
    set((state) => {
      const effectsEnabled = !state.effectsEnabled;
      saveEffects(effectsEnabled);
      return { effectsEnabled };
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

function saveEffects(effectsEnabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EFFECTS_STORAGE_KEY, String(effectsEnabled));
  } catch {
    // The setting still works for this session when storage is unavailable.
  }
}

function readSavedEffects(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(EFFECTS_STORAGE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    return null;
  }
  return null;
}
