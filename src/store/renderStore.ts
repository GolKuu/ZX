import { create } from 'zustand';
import type {
  ZoroActionId,
  ZoroStance,
} from '@/src/stage/zoro/zoroActions';

type RenderState = {
  effectsEnabled: boolean;
  impactVersion: number;
  zoroAction: ZoroActionId;
  zoroActionVersion: number;
  zoroStance: ZoroStance;
  playZoroAction: (action: ZoroActionId) => void;
  toggleEffects: () => void;
  triggerImpact: () => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  effectsEnabled: true,
  impactVersion: 0,
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
  toggleEffects: () => set((state) => ({ effectsEnabled: !state.effectsEnabled })),
  triggerImpact: () => set((state) => ({ impactVersion: state.impactVersion + 1 })),
}));
