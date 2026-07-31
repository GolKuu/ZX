import { MIM_STORY_IDS } from './ids.js';

/** Story chapters that hand MIM new geometry to work with. */
export type MimStoryChapter = 'lucky' | 'titan' | 'glitch' | 'vorgh';

export const MIM_STORY_CHAPTERS: readonly MimStoryChapter[] = [
  'lucky',
  'titan',
  'glitch',
  'vorgh',
];

/**
 * Which technique each chapter opens. Two per chapter, so a win always changes
 * how MIM plays rather than only what she says.
 */
export const MIM_UNLOCKS: Readonly<Record<MimStoryChapter, readonly string[]>> = {
  lucky: [MIM_STORY_IDS.wallDive, MIM_STORY_IDS.rearWall],
  titan: [MIM_STORY_IDS.wallShield, MIM_STORY_IDS.tripleKick],
  glitch: [MIM_STORY_IDS.airVault, MIM_STORY_IDS.reverseButterfly],
  vorgh: [MIM_STORY_IDS.wallPrison, MIM_STORY_IDS.skyRunner],
};

export type MimUnlockState = Readonly<Record<MimStoryChapter, boolean>>;

/** Story start: the base kit only. */
export const MIM_STORY_START: MimUnlockState = {
  lucky: false,
  titan: false,
  glitch: false,
  vorgh: false,
};

/** Versus and training: the whole character is available. */
export const MIM_FULLY_UNLOCKED: MimUnlockState = {
  lucky: true,
  titan: true,
  glitch: true,
  vorgh: true,
};

const OWNER = new Map<string, MimStoryChapter>();
for (const chapter of MIM_STORY_CHAPTERS) {
  for (const moveId of MIM_UNLOCKS[chapter]) OWNER.set(moveId, chapter);
}

/** Base-kit moves are always allowed; story moves ask their chapter first. */
export function isMimMoveUnlocked(
  moveId: string,
  state: MimUnlockState = MIM_FULLY_UNLOCKED,
): boolean {
  const chapter = OWNER.get(moveId);
  return chapter === undefined || state[chapter];
}

export function unlockedMimMoves(state: MimUnlockState): readonly string[] {
  return MIM_STORY_CHAPTERS.filter((chapter) => state[chapter])
    .flatMap((chapter) => MIM_UNLOCKS[chapter]);
}
