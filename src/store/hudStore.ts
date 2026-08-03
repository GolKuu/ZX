import { create } from 'zustand';
import {
  DEFAULT_CHARACTER_SELECTION,
  getCharacterDefinition,
  type CharacterSelection,
} from '@/src/data/characterRoster';
import type { AiDifficulty } from '@/src/ai';
import type { HudSnapshot } from '@/src/hud/types';
import { DEFAULT_ARENA, type ArenaId } from '@/src/data/arenas';

const AI_DIFFICULTY_ORDER: readonly AiDifficulty[] = [
  'easy',
  'normal',
  'hard',
  'impossible',
];
const initialAiDifficulty: AiDifficulty = 'normal';

export type HudScreen =
  | 'mode'
  | 'difficulty'
  | 'character'
  | 'stage'
  | 'story'
  | 'tutorial'
  | 'progression'
  | 'versus'
  | 'fight'
  | 'pause'
  | 'controls'
  | 'result'
  | 'online';

export type MatchMode = 'local' | 'ai' | 'training' | 'story' | 'tutorial' | 'online';

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
  mobileMode: boolean;
  mode: MatchMode | null;
  aiDifficulty: AiDifficulty;
  fighterSelection: CharacterSelection;
  arenaId: ArenaId;
  menuFocus: number;
  result: MatchResult;
  publishSnapshot: (snapshot: HudSnapshot) => void;
  resetMatchUi: () => void;
  openPause: () => void;
  resume: () => void;
  openControls: () => void;
  openResult: (result: MatchResult) => void;
  openModeMenu: () => void;
  openCharacterSelect: () => void;
  returnToCharacterSelect: () => void;
  openDifficultySelect: () => void;
  openProgression: () => void;
  selectMode: (mode: MatchMode) => void;
  selectAiDifficulty: (difficulty: AiDifficulty) => void;
  toggleMobileMode: () => void;
  startMatch: (selection: CharacterSelection) => void;
  selectArena: (arenaId: ArenaId) => void;
  openStageSelect: () => void;
  enterFight: () => void;
  setMenuFocus: (index: number) => void;
};

const initialSnapshot = (
  mode: MatchMode = 'local',
  selection: CharacterSelection = DEFAULT_CHARACTER_SELECTION,
): HudSnapshot => ({
  frame: 0,
  round: 1,
  timerFrames: 99 * 60,
  fighters: [
    {
      id: 'p1',
      displayName: getCharacterDefinition(selection[0]).displayName,
      playerTag: 'P1',
      side: 'left',
      health: 1000,
      maxHealth: 1000,
      superCharge: 0,
      ultimateReady: false,
      luck: 0,
      roundWins: 0,
    },
    {
      id: 'p2',
      displayName: getCharacterDefinition(selection[1]).displayName,
      playerTag: mode === 'ai' ? 'CPU' : 'P2',
      side: 'right',
      health: 1000,
      maxHealth: 1000,
      superCharge: 0,
      ultimateReady: false,
      luck: 0,
      roundWins: 0,
    },
  ],
  combo: null,
});

const initialResult: MatchResult = {
  winner: 'TBD',
  rounds: '0-0',
  maxCombo: 6,
  clashes: 2,
  duration: '02:14',
};

export const useHudStore = create<HudState>((set) => ({
  snapshot: initialSnapshot(),
  screen: 'mode',
  mobileMode: false,
  mode: null,
  aiDifficulty: initialAiDifficulty,
  fighterSelection: DEFAULT_CHARACTER_SELECTION,
  arenaId: DEFAULT_ARENA,
  menuFocus: 0,
  result: initialResult,
  publishSnapshot: (snapshot) => set({ snapshot }),
  resetMatchUi: () =>
    set((state) => ({
      snapshot: initialSnapshot(
        state.mode ?? 'local',
        state.fighterSelection,
      ),
      screen: state.screen === 'versus' ? 'versus' : 'fight',
      menuFocus: 0,
    })),
  openPause: () => set({ screen: 'pause', menuFocus: 0 }),
  resume: () => set({ screen: 'fight', menuFocus: 0 }),
  openControls: () => set({ screen: 'controls', menuFocus: 0 }),
  openResult: (result) => set({ screen: 'result', menuFocus: 0, result }),
  openModeMenu: () => set({ screen: 'mode', menuFocus: 0 }),
  openCharacterSelect: () => set((state) => {
    if (state.mode === 'ai') {
      const menuFocus = AI_DIFFICULTY_ORDER.indexOf(state.aiDifficulty);
      return {
        screen: 'difficulty',
        menuFocus: menuFocus >= 0 ? menuFocus : 0,
      };
    }
    return { screen: 'character', menuFocus: 0 };
  }),
  returnToCharacterSelect: () => set({ screen: 'character', menuFocus: 0 }),
  openDifficultySelect: () => set((state) => {
    const menuFocus = AI_DIFFICULTY_ORDER.indexOf(state.aiDifficulty);
    return {
      screen: 'difficulty',
      menuFocus: menuFocus >= 0 ? menuFocus : 0,
    };
  }),
  openProgression: () => set({ screen: 'progression', menuFocus: 0 }),
  selectMode: (mode) => set((state) => {
    const requestedMode = state.mobileMode && mode === 'local' ? 'ai' : mode;
    const requestedMenuFocus = requestedMode === 'ai'
      ? AI_DIFFICULTY_ORDER.indexOf(state.aiDifficulty)
      : 0;
    return {
      mode: requestedMode,
      screen: requestedMode === 'online'
        ? 'online'
        : requestedMode === 'ai'
          ? 'difficulty'
          : requestedMode === 'story'
            ? 'story'
            : requestedMode === 'tutorial'
              ? 'tutorial'
              : 'character',
      fighterSelection: DEFAULT_CHARACTER_SELECTION,
      snapshot: initialSnapshot(requestedMode, DEFAULT_CHARACTER_SELECTION),
      menuFocus: requestedMenuFocus >= 0 ? requestedMenuFocus : 0,
    };
  }),
  selectAiDifficulty: (difficulty) => set({
    aiDifficulty: difficulty,
    screen: 'character',
    menuFocus: 0,
  }),
  toggleMobileMode: () => set((state) => {
    const mobileMode = !state.mobileMode;
    if (!mobileMode || state.mode !== 'local') {
      return { mobileMode };
    }
    return {
      mobileMode,
      mode: 'ai',
      fighterSelection: state.fighterSelection,
      snapshot: initialSnapshot('ai', state.fighterSelection),
    };
  }),
  startMatch: (fighterSelection) =>
    set((state) => ({
      fighterSelection: [...fighterSelection],
      screen: 'stage',
      snapshot: initialSnapshot(state.mode ?? 'local', fighterSelection),
      menuFocus: 0,
    })),
  selectArena: (arenaId) => set({ arenaId, screen: 'versus', menuFocus: 0 }),
  openStageSelect: () => set({ screen: 'stage', menuFocus: 0 }),
  enterFight: () => set({ screen: 'fight', menuFocus: 0 }),
  setMenuFocus: (menuFocus) => set({ menuFocus }),
}));

export function resetHudStore(): void {
  useHudStore.setState({
    snapshot: initialSnapshot(),
    screen: 'mode',
    mode: null,
    aiDifficulty: initialAiDifficulty,
    fighterSelection: DEFAULT_CHARACTER_SELECTION,
    arenaId: DEFAULT_ARENA,
    menuFocus: 0,
    result: initialResult,
  });
}
