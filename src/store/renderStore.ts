import { create } from 'zustand';
import type { ChronoSuperKind } from '@/src/data/chrono-super-moves';
import type { EchoSuperKind } from '@/src/data/echo-super-moves';
import type { IdolCinematicMoveId } from '@/src/data/idol-move-ids';
import type { MimSuperKind } from '@/src/data/mim-super-moves';

type RenderState = {
  chronoSuperFighterId: 'p1' | 'p2' | null;
  chronoSuperKind: ChronoSuperKind | null;
  chronoSuperVersion: number;
  echoSuperFighterId: 'p1' | 'p2' | null;
  echoSuperKind: EchoSuperKind | null;
  echoSuperVersion: number;
  effectsEnabled: boolean;
  impactVersion: number;
  idolSuperFighterId: 'p1' | 'p2' | null;
  idolSuperMoveId: IdolCinematicMoveId | null;
  idolSuperVersion: number;
  mimSuperFighterId: 'p1' | 'p2' | null;
  mimSuperKind: MimSuperKind | null;
  mimSuperVersion: number;
  xrayFighterId: 'p1' | 'p2' | null;
  xrayVersion: number;
  hydratePreferences: () => void;
  toggleEffects: () => void;
  triggerImpact: () => void;
  triggerChronoSuper: (
    fighterId: 'p1' | 'p2',
    kind: ChronoSuperKind,
  ) => void;
  triggerIdolSuper: (
    fighterId: 'p1' | 'p2',
    moveId: IdolCinematicMoveId,
  ) => void;
  triggerEchoSuper: (
    fighterId: 'p1' | 'p2',
    kind: EchoSuperKind,
  ) => void;
  triggerMimSuper: (
    fighterId: 'p1' | 'p2',
    kind: MimSuperKind,
  ) => void;
  triggerXray: (fighterId: 'p1' | 'p2') => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  chronoSuperFighterId: null,
  chronoSuperKind: null,
  chronoSuperVersion: 0,
  echoSuperFighterId: null,
  echoSuperKind: null,
  echoSuperVersion: 0,
  effectsEnabled: true,
  impactVersion: 0,
  idolSuperFighterId: null,
  idolSuperMoveId: null,
  idolSuperVersion: 0,
  mimSuperFighterId: null,
  mimSuperKind: null,
  mimSuperVersion: 0,
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
  triggerChronoSuper: (chronoSuperFighterId, chronoSuperKind) =>
    set((state) => ({
      chronoSuperFighterId,
      chronoSuperKind,
      chronoSuperVersion: state.chronoSuperVersion + 1,
    })),
  triggerIdolSuper: (idolSuperFighterId, idolSuperMoveId) =>
    set((state) => ({
      idolSuperFighterId,
      idolSuperMoveId,
      idolSuperVersion: state.idolSuperVersion + 1,
    })),
  triggerEchoSuper: (echoSuperFighterId, echoSuperKind) =>
    set((state) => ({
      echoSuperFighterId,
      echoSuperKind,
      echoSuperVersion: state.echoSuperVersion + 1,
    })),
  triggerMimSuper: (mimSuperFighterId, mimSuperKind) =>
    set((state) => ({
      mimSuperFighterId,
      mimSuperKind,
      mimSuperVersion: state.mimSuperVersion + 1,
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
