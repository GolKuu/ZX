import { create } from 'zustand';
import type { HudSnapshot } from '@/src/hud/types';

export type HudScreen =
  | 'mode'
  | 'fight'
  | 'pause'
  | 'controls'
  | 'result'
  | 'online';

export type MatchMode = 'local' | 'ai' | 'online';

export interface MatchResult {
  readonly winner: string;
  readonly rounds: string;
  readonly maxCombo: number;
  readonly clashes: number;
  readonly duration: string;
}

type HudState = {
  snapshot: HudSnapshot;
  screen: HudScreen;
  mode: MatchMode | null;
  menuFocus: number;
  touchControlsForced: boolean;
  result: MatchResult;
  previewComboFrames: number;
  publishSnapshot: (snapshot: HudSnapshot) => void;
  advancePreview: (frames: number) => void;
  registerPreviewHit: () => void;
  resetPreview: () => void;
  openPause: () => void;
  resume: () => void;
  openControls: () => void;
  openResult: (result: MatchResult) => void;
  openModeMenu: () => void;
  selectMode: (mode: MatchMode) => void;
  setMenuFocus: (index: number) => void;
  toggleTouchControls: () => void;
};

const initialSnapshot = (mode: MatchMode = 'local'): HudSnapshot => ({
  frame: 0,
  round: 1,
  timerFrames: 99 * 60,
  fighters: [
    {
      id: 'p1',
      displayName: 'Roronoa Zoro',
      playerTag: 'P1',
      side: 'left',
      health: 1000,
      maxHealth: 1000,
      superCharge: 0,
      roundWins: 1,
    },
    {
      id: 'p2',
      displayName: 'Roronoa Zoro',
      playerTag: mode === 'ai' ? 'CPU' : 'P2',
      side: 'right',
      health: 1000,
      maxHealth: 1000,
      superCharge: 0,
      roundWins: 0,
    },
  ],
  combo: null,
});

const initialResult: MatchResult = {
  winner: 'Roronoa Zoro',
  rounds: '2–1',
  maxCombo: 6,
  clashes: 2,
  duration: '02:14',
};

export const useHudStore = create<HudState>((set) => ({
  snapshot: initialSnapshot(),
  screen: 'mode',
  mode: null,
  menuFocus: 0,
  touchControlsForced: false,
  result: initialResult,
  previewComboFrames: 0,
  publishSnapshot: (snapshot) => set({ snapshot }),
  advancePreview: (frames) =>
    set((state) => {
      if (
        state.screen !== 'fight'
        || !Number.isInteger(frames)
        || frames <= 0
      ) {
        return state;
      }
      const comboFrames = Math.max(0, state.previewComboFrames - frames);
      return {
        snapshot: {
          ...state.snapshot,
          frame: state.snapshot.frame + frames,
          timerFrames: Math.max(0, state.snapshot.timerFrames - frames),
          combo: comboFrames === 0 ? null : state.snapshot.combo,
        },
        previewComboFrames: comboFrames,
      };
    }),
  registerPreviewHit: () =>
    set((state) => {
      const [left, right] = state.snapshot.fighters;
      const damage = 74;
      const nextHealth = Math.max(0, right.health - damage);
      const previousCombo =
        state.previewComboFrames > 0
        && state.snapshot.combo?.attackerId === left.id
          ? state.snapshot.combo
          : null;
      return {
        snapshot: {
          ...state.snapshot,
          fighters: [
            left,
            {
              ...right,
              health: nextHealth,
              superCharge: Math.round((1 - nextHealth / right.maxHealth) * 100),
            },
          ],
          combo: {
            attackerId: left.id,
            hits: (previousCombo?.hits ?? 0) + 1,
            damage: (previousCombo?.damage ?? 0) + damage,
          },
        },
        previewComboFrames: 90,
      };
    }),
  resetPreview: () =>
    set((state) => ({
      snapshot: initialSnapshot(state.mode ?? 'local'),
      screen: 'fight',
      menuFocus: 0,
      previewComboFrames: 0,
    })),
  openPause: () => set({ screen: 'pause', menuFocus: 0 }),
  resume: () => set({ screen: 'fight', menuFocus: 0 }),
  openControls: () => set({ screen: 'controls', menuFocus: 0 }),
  openResult: (result) => set({ screen: 'result', menuFocus: 0, result }),
  openModeMenu: () => set({ screen: 'mode', menuFocus: 0 }),
  selectMode: (mode) =>
    set({
      mode,
      screen: mode === 'online' ? 'online' : 'fight',
      snapshot: initialSnapshot(mode),
      menuFocus: 0,
      previewComboFrames: 0,
    }),
  setMenuFocus: (menuFocus) => set({ menuFocus }),
  toggleTouchControls: () =>
    set((state) => ({ touchControlsForced: !state.touchControlsForced })),
}));

export function resetHudStore(): void {
  useHudStore.setState({
    snapshot: initialSnapshot(),
    screen: 'mode',
    mode: null,
    menuFocus: 0,
    touchControlsForced: false,
    result: initialResult,
    previewComboFrames: 0,
  });
}
