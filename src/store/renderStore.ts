import { create } from 'zustand';
import type {
  AangCombatElement,
  CombatFighterId,
} from '@/src/aang/combat/elements';
import type {
  ZoroActionId,
  ZoroStance,
} from '@/src/stage/zoro/zoroActions';

type RenderState = {
  aangElements: Readonly<Record<CombatFighterId, AangCombatElement>>;
  effectsEnabled: boolean;
  impactVersion: number;
  xrayFighterId: 'p1' | 'p2' | null;
  xrayVersion: number;
  zoroAction: ZoroActionId;
  zoroActionVersion: number;
  zoroStance: ZoroStance;
  playZoroAction: (action: ZoroActionId) => void;
  setAangElement: (
    fighterId: CombatFighterId,
    element: AangCombatElement,
  ) => void;
  toggleEffects: () => void;
  triggerImpact: () => void;
  triggerXray: (fighterId: 'p1' | 'p2') => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  aangElements: { p1: 'air', p2: 'air' },
  effectsEnabled: true,
  impactVersion: 0,
  xrayFighterId: null,
  xrayVersion: 0,
  zoroAction: 'lightPunch',
  zoroActionVersion: 0,
  zoroStance: 'three',
  playZoroAction: (action) =>
    set((state) => ({
      zoroAction: action,
      zoroActionVersion: state.zoroActionVersion + 1,
      zoroStance:
        action === 'swordStyles'
          ? state.zoroStance === 'three' ? 'one' : 'three'
          : state.zoroStance,
    })),
  setAangElement: (fighterId, element) =>
    set((state) => ({
      aangElements: { ...state.aangElements, [fighterId]: element },
    })),
  toggleEffects: () => set((state) => ({ effectsEnabled: !state.effectsEnabled })),
  triggerImpact: () => set((state) => ({ impactVersion: state.impactVersion + 1 })),
  triggerXray: (xrayFighterId) =>
    set((state) => ({
      xrayFighterId,
      xrayVersion: state.xrayVersion + 1,
    })),
}));
