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
  publishSnapshot: (snapshot: HudSnapshot) => void;
  resetMatchUi: () => void;
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
      roundWins: 0,
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
  publishSnapshot: (snapshot) => set({ snapshot }),
  resetMatchUi: () =>
    set((state) => ({
      snapshot: initialSnapshot(state.mode ?? 'local'),
      screen: 'fight',
      menuFocus: 0,
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
  });
}
