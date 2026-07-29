import { create } from 'zustand';

type RenderState = {
  effectsEnabled: boolean;
  impactVersion: number;
  toggleEffects: () => void;
  triggerImpact: () => void;
};

export const useRenderStore = create<RenderState>((set) => ({
  effectsEnabled: true,
  impactVersion: 0,
  toggleEffects: () => set((state) => ({ effectsEnabled: !state.effectsEnabled })),
  triggerImpact: () => set((state) => ({ impactVersion: state.impactVersion + 1 })),
}));
