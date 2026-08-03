import { create } from 'zustand';
import {
  DEFAULT_CHARACTER_SELECTION,
  getCharacterDefinition,
  type CharacterSelection,
} from '@/src/data/characterRoster';
import type { AiDifficulty } from '@/src/ai';
import type { HudSnapshot } from '@/src/hud/types';
import { DEFAULT_ARENA, type ArenaId } from '@/src/data/arenas';
import {
  STORY_PLAYER_CHARACTER_ID,
  storyChapter,
  storySelection,
} from '@/src/story/campaign';
import {
  completeStoryBattle,
  migrateStorySave,
  newStorySave,
  STORY_SAVE_KEY,
  type StorySave,
} from '@/src/story/save';
import { gameplayEvent } from '@/src/progression/eventEngine';
import { useProgressionStore } from './progressionStore';

const AI_DIFFICULTY_ORDER: readonly AiDifficulty[] = [
  'easy',
  'normal',
  'hard',
  'impossible',
];
const initialAiDifficulty: AiDifficulty = 'normal';
export const TRAINING_CHARACTER_SELECTION: CharacterSelection = ['mim', 'titan'];

export type HudScreen =
  | 'mode'
  | 'difficulty'
  | 'character'
  | 'stage'
  | 'story'
  | 'story-scene'
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
  storySave: StorySave | null;
  storyLine: number;
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
  startStory: () => void;
  continueStory: () => void;
  setStoryLine: (index: number) => void;
  startStoryBattle: () => void;
  completeStoryChapter: () => void;
  setStorySubtitles: (language: 'en' | 'ru', autoAdvance: boolean) => void;
};

const readStorySave = (): StorySave | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORY_SAVE_KEY);
  if (raw === null) return null;
  try {
    return migrateStorySave(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

const writeStorySave = (save: StorySave): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORY_SAVE_KEY, JSON.stringify(save));
  }
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
      displayName: mode === 'training'
        ? 'МИШЕНЬ'
        : getCharacterDefinition(selection[1]).displayName,
      playerTag: mode === 'training'
        ? 'DUMMY'
        : mode === 'ai' ? 'GEMINI' : mode === 'story' ? 'CPU' : 'P2',
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
  storySave: null,
  storyLine: 0,
  publishSnapshot: (snapshot) => set({ snapshot }),
  resetMatchUi: () =>
    set((state) => ({
      snapshot: initialSnapshot(
        state.mode ?? 'local',
        state.mode === 'story'
          ? storySelection(state.storySave?.chapterIndex ?? 0)
          : state.fighterSelection,
      ),
      fighterSelection: state.mode === 'story'
        ? storySelection(state.storySave?.chapterIndex ?? 0)
        : state.fighterSelection,
      screen: state.screen === 'versus' ? 'versus' : 'fight',
      menuFocus: 0,
    })),
  openPause: () => set({ screen: 'pause', menuFocus: 0 }),
  resume: () => set({ screen: 'fight', menuFocus: 0 }),
  openControls: () => set({ screen: 'controls', menuFocus: 0 }),
  openResult: (result) => set({ screen: 'result', menuFocus: 0, result }),
  openModeMenu: () => set({ screen: 'mode', menuFocus: 0 }),
  openCharacterSelect: () => set((state) => {
    if (state.mode === 'training') {
      return { screen: 'fight', menuFocus: 0 };
    }
    if (state.mode === 'story') {
      return { screen: 'story', menuFocus: 0 };
    }
    if (state.mode === 'ai') {
      const menuFocus = AI_DIFFICULTY_ORDER.indexOf(state.aiDifficulty);
      return {
        screen: 'difficulty',
        menuFocus: menuFocus >= 0 ? menuFocus : 0,
      };
    }
    return { screen: 'character', menuFocus: 0 };
  }),
  returnToCharacterSelect: () => set((state) => state.mode === 'story'
    ? { screen: 'story', menuFocus: 0 }
    : { screen: 'character', menuFocus: 0 }),
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
    const selection = requestedMode === 'story'
      ? storySelection(readStorySave()?.chapterIndex ?? 0)
      : requestedMode === 'training'
        ? TRAINING_CHARACTER_SELECTION
        : DEFAULT_CHARACTER_SELECTION;
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
              : requestedMode === 'training'
                ? 'fight'
              : 'character',
      fighterSelection: selection,
      arenaId: requestedMode === 'training' ? DEFAULT_ARENA : state.arenaId,
      snapshot: initialSnapshot(requestedMode, selection),
      storySave: requestedMode === 'story' ? readStorySave() : state.storySave,
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
      fighterSelection: state.mode === 'story'
        ? storySelection(state.storySave?.chapterIndex ?? 0)
        : [...fighterSelection],
      screen: 'stage',
      snapshot: initialSnapshot(
        state.mode ?? 'local',
        state.mode === 'story'
          ? storySelection(state.storySave?.chapterIndex ?? 0)
          : fighterSelection,
      ),
      menuFocus: 0,
    })),
  selectArena: (arenaId) => set({ arenaId, screen: 'versus', menuFocus: 0 }),
  openStageSelect: () => set((state) => state.mode === 'story'
    ? { screen: 'story-scene', menuFocus: 0 }
    : { screen: 'stage', menuFocus: 0 }),
  enterFight: () => set({ screen: 'fight', menuFocus: 0 }),
  setMenuFocus: (menuFocus) => set({ menuFocus }),
  startStory: () => set(() => {
    const storySave = newStorySave();
    writeStorySave(storySave);
    const fighterSelection = storySelection(0);
    return {
      mode: 'story',
      screen: 'story-scene',
      storySave,
      storyLine: 0,
      fighterSelection,
      arenaId: storyChapter(0).arenaId,
      snapshot: initialSnapshot('story', fighterSelection),
      menuFocus: 0,
    };
  }),
  continueStory: () => set(() => {
    const storySave = readStorySave() ?? newStorySave();
    writeStorySave(storySave);
    const fighterSelection = storySelection(storySave.chapterIndex);
    return {
      mode: 'story',
      screen: 'story-scene',
      storySave,
      storyLine: 0,
      fighterSelection,
      arenaId: storyChapter(storySave.chapterIndex).arenaId,
      snapshot: initialSnapshot('story', fighterSelection),
      menuFocus: 0,
    };
  }),
  setStoryLine: (storyLine) => set({ storyLine: Math.max(0, storyLine) }),
  startStoryBattle: () => set((state) => {
    const chapterIndex = state.storySave?.chapterIndex ?? 0;
    const fighterSelection = storySelection(chapterIndex);
    return {
      mode: 'story',
      screen: 'versus',
      fighterSelection,
      arenaId: storyChapter(chapterIndex).arenaId,
      snapshot: initialSnapshot('story', fighterSelection),
      menuFocus: 0,
    };
  }),
  completeStoryChapter: () => set((state) => {
    const completedId = state.storySave === null ? 'prologue' : storyChapter(state.storySave.chapterIndex).id;
    useProgressionStore.getState().dispatch(gameplayEvent('StoryChapterCompleted', `story:${completedId}`, { metadata: { chapterId: completedId } }));
    useProgressionStore.getState().dispatch(gameplayEvent('StoryBattleCompleted', `story-battle:${completedId}`));
    const storyAchievementEvent: Readonly<Record<string, string>> = {
      prologue:'StoryPrologueCompleted','silent-wall':'StoryMimDefeated','winning-version':'StoryLuckyDefeated',
      'last-order':'StoryTitanDefeated','all-the-pain':'StoryVorghDefeated','the-fifth':'StoryFifthDefeated','zero-form':'StoryZeroDefeated',
    };
    const eventType = storyAchievementEvent[completedId];
    if (eventType !== undefined) useProgressionStore.getState().dispatch(gameplayEvent(eventType, `story-achievement:${completedId}`));
    const storySave = completeStoryBattle(state.storySave ?? newStorySave());
    writeStorySave(storySave);
    const fighterSelection = storySelection(storySave.chapterIndex);
    return {
      screen: 'story-scene',
      storySave,
      storyLine: 0,
      fighterSelection,
      arenaId: storyChapter(storySave.chapterIndex).arenaId,
      snapshot: initialSnapshot('story', fighterSelection),
      menuFocus: 0,
    };
  }),
  setStorySubtitles: (language, autoAdvance) => set((state) => {
    const storySave = migrateStorySave({
      ...(state.storySave ?? newStorySave()),
      playableCharacterId: STORY_PLAYER_CHARACTER_ID,
      subtitleSettings: { language, autoAdvance },
    });
    writeStorySave(storySave);
    return { storySave };
  }),
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
    storySave: null,
    storyLine: 0,
  });
}
